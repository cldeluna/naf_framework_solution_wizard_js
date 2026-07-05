"""
wizard_models.py
================
Canonical Pydantic v2 data models for the NAF Solution Wizard payload.

This module is the **single source of truth** for the shape and validation of a
wizard "payload" — the nested document produced by
``payload_builder.build_payload_from_state``. The JSON Schema
(``schemas/wizard_payload.schema.json``) is *generated* from these models
(see ``scripts/gen_schema.py``) and the FastAPI backend (``api/main.py``)
imports them, so the model definitions here should never be duplicated
elsewhere.

Validation philosophy — **ingestion-tolerant, save-strict**:

* Loading (``WizardPayload.model_validate``) is lenient. Every section is
  optional with a default, so older/partial exports (e.g. missing
  ``stakeholders`` or ``category``) still parse. Controlled-vocabulary fields
  (category, deployment strategy, roles, …) are validated *soft* — an
  unrecognized value emits a warning rather than raising, so we never fail to
  load real historical data whose option lists have since drifted.
* Saving (:meth:`WizardPayload.validate_for_save`) is strict. It enforces the
  genuinely required fields (initiative title, description, category,
  problem_statement, use_case, workflow_description) before a record is written
  to the database.

All free-form text / Markdown fields pass through :func:`clean_text`, which
strips control characters and raw HTML tags (Markdown syntax is preserved) and
rejects absurdly large blobs. Per-field length limits are enforced as real
constraints (they also flow into the generated JSON Schema).
"""

from __future__ import annotations

import re
import warnings
from typing import Any, Dict, List, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)

__all__ = [
    "clean_text",
    "WorkflowStep",
    "Initiative",
    "MyRole",
    "Stakeholders",
    "Presentation",
    "Intent",
    "Observability",
    "Orchestration",
    "Collector",
    "Executor",
    "Dependency",
    "TimelineItem",
    "Timeline",
    "WizardPayload",
]


# ---------------------------------------------------------------------------
# Text sanitization
# ---------------------------------------------------------------------------

# Raw HTML tags — stripped so stored/rendered text cannot inject markup.
# Markdown syntax (which does not rely on angle-bracket tags) is preserved.
_HTML_TAG_RE = re.compile(r"<[^>]+>")
# Control characters except tab (\x09), newline (\x0a) and carriage return (\x0d).
_CONTROL_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")

# Absolute ceiling on any single text field — blocks binary / runaway blobs
# regardless of the per-field recommended limit.
HARD_TEXT_CAP = 100_000


def clean_text(value: Any) -> Any:
    """Sanitize a free-form text / Markdown value.

    * Strips raw HTML tags (Markdown is preserved).
    * Removes control characters (keeps tab / newline / carriage return).
    * Trims surrounding whitespace.
    * Raises ``ValueError`` if the value exceeds :data:`HARD_TEXT_CAP`.

    Non-string / ``None`` values are returned unchanged so this can be used as
    a broad ``mode="before"`` validator across mixed-type models.
    """
    if not isinstance(value, str):
        return value
    value = _HTML_TAG_RE.sub("", value)
    value = _CONTROL_RE.sub("", value)
    value = value.strip()
    if len(value) > HARD_TEXT_CAP:
        raise ValueError(
            f"Text field exceeds hard cap of {HARD_TEXT_CAP} characters"
        )
    return value


class _SanitizedModel(BaseModel):
    """Base model: ignores unknown keys and sanitizes every string input."""

    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    @model_validator(mode="before")
    @classmethod
    def _drop_none_values(cls, data: Any) -> Any:
        """Treat an explicit JSON ``null`` like a missing field so the field's
        default is used. Keeps older exports (e.g. ``deployment_strategy: null``)
        loading cleanly instead of failing non-optional string fields."""
        if isinstance(data, dict):
            return {k: v for k, v in data.items() if v is not None}
        return data

    @field_validator("*", mode="before")
    @classmethod
    def _sanitize_strings(cls, v: Any) -> Any:
        return clean_text(v)


# ---------------------------------------------------------------------------
# Controlled-vocabulary option lists (soft-validated: warn, never reject)
#
# Sourced from the real values emitted by payload_builder.py / the wizard UI —
# intentionally a superset of the (stale) JSON Schema enums so that historical
# exports validate. Unknown non-empty values warn but are preserved.
# ---------------------------------------------------------------------------

CATEGORY_OPTIONS = [
    "Configuration Management",
    "Device Onboarding",
    "Software Upgrades",
    "State Verification and Compliance",
    "Self-Service Tools",
    "Network Inventory and Discovery",
    "Monitoring and Troubleshooting",
    "Policy and Security Management",
    "Orchestration and Workflow Automation",
    "Cloud and Hybrid Network Integration",
    "Intent-Based Automation",
    "Application Connectivity",
    "Peer Validation",
    "End User Testing",
    "Text Summary",
    "Observability",
    "Incident Response",
    "Security Policy Management",
]

# ITIL 4/5 practice categories — the required first level of the two-level
# category selection (2026-07-05). The `category` field holds the second-level
# common category (or free text via Other), grouped under these in the UI.
ITIL_CATEGORY_OPTIONS = [
    "Service Configuration Management",
    "Change Enablement",
    "Incident Management",
    "Problem Management",
    "Monitoring and Event Management",
    "Capacity and Performance Management",
    "Information Security Management",
    "Service Validation and Testing",
]

BUILD_BUY_OPTIONS = ["Build In-House", "Buy", "Build"]

HOLIDAY_REGION_OPTIONS = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "India",
    "Australia",
    "None",
]


def _warn_if_unknown(field: str, value: Any, allowed: List[str]) -> Any:
    """Emit a warning when a non-empty ``value`` is not in ``allowed``."""
    if isinstance(value, str) and value and value not in allowed:
        warnings.warn(
            f"{field}: unrecognized value {value!r} (not in canonical options)",
            stacklevel=2,
        )
    return value


# ---------------------------------------------------------------------------
# Selection sub-objects (structured record of what the user actually picked)
# ---------------------------------------------------------------------------


class PresentationSelections(_SanitizedModel):
    users: List[str] = Field(default_factory=list)
    interactions: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)
    auth: List[str] = Field(default_factory=list)


class IntentSelections(_SanitizedModel):
    development: List[str] = Field(default_factory=list)
    provided: List[str] = Field(default_factory=list)


class ObservabilitySelections(_SanitizedModel):
    methods: List[str] = Field(default_factory=list)
    go_no_go_text: str = ""
    additional_logic_enabled: bool = False
    additional_logic_text: str = ""
    tools: List[str] = Field(default_factory=list)


class OrchestrationSelections(_SanitizedModel):
    choice: str = ""
    details: str = Field(default="", max_length=1000)


class CollectorSelections(_SanitizedModel):
    methods: List[str] = Field(default_factory=list)
    auth: List[str] = Field(default_factory=list)
    handling: List[str] = Field(default_factory=list)
    normalization: List[str] = Field(default_factory=list)
    devices: str = Field(default="", max_length=100)
    metrics_per_sec: str = Field(default="", max_length=100)
    cadence: str = Field(default="", max_length=100)
    tools: List[str] = Field(default_factory=list)


class ExecutorSelections(_SanitizedModel):
    methods: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Sections
# ---------------------------------------------------------------------------


class WorkflowStep(_SanitizedModel):
    """One step in the initiative's workflow (edited as a table, like milestones)."""

    name: str = Field(default="", max_length=200)
    description: str = Field(default="", max_length=2000)


class Initiative(_SanitizedModel):
    author: str = Field(default="", max_length=100)
    title: str = Field(default="", max_length=200)
    description: str = Field(default="", max_length=1000)
    # Two-level category (2026-07-05): itil_category is the ITIL 4/5 practice;
    # category is the common category beneath it (or free text via Other).
    # Older exports carry only `category`; loaders derive itil_category from
    # the category tree mapping when absent.
    itil_category: str = Field(default="", max_length=100)
    category: str = Field(default="", max_length=100)
    problem_statement: str = Field(default="", max_length=2000)
    # High-level description of how the solution is used (single field). Newer
    # data uses `use_case`; `expected_use` is retained for backward compat.
    use_case: str = Field(default="", max_length=2000)
    expected_use: str = Field(default="", max_length=1000)
    # Workflow narrative + optional structured steps.
    workflow_description: str = Field(default="", max_length=4000)
    workflow_steps: List[WorkflowStep] = Field(default_factory=list)
    error_conditions: str = Field(default="", max_length=1000)
    assumptions: str = Field(default="", max_length=1000)
    deployment_strategy: str = Field(default="", max_length=100)
    deployment_strategy_description: str = Field(default="", max_length=1000)
    out_of_scope: str = Field(default="", max_length=1000)
    # Historically a "Yes"/"No" flag, but real exports also carry long
    # free-text rationale here, so it is treated as free text.
    no_move_forward: str = Field(default="", max_length=2000)
    no_move_forward_reasons: List[str] = Field(default_factory=list)

    @field_validator("category")
    @classmethod
    def _check_category(cls, v: str) -> str:
        # "Other" free-text categories are common; only warn on truly novel
        # values so historical exports never fail to load.
        return _warn_if_unknown("initiative.category", v, CATEGORY_OPTIONS)

    @field_validator("itil_category")
    @classmethod
    def _check_itil_category(cls, v: str) -> str:
        return _warn_if_unknown(
            "initiative.itil_category", v, ITIL_CATEGORY_OPTIONS
        )


class MyRole(_SanitizedModel):
    who: str = Field(default="", max_length=200)
    skills: str = Field(default="", max_length=300)
    developer: str = Field(default="", max_length=200)


class Stakeholders(_SanitizedModel):
    # Maps a stakeholder category label -> list of selected stakeholders.
    choices: Dict[str, List[str]] = Field(default_factory=dict)
    other: str = Field(default="", max_length=500)

    @field_validator("choices", mode="before")
    @classmethod
    def _coerce_choices(cls, v: Any) -> Any:
        """Tolerate legacy shapes where a category maps to a bare string."""
        if not isinstance(v, dict):
            return {}
        coerced: Dict[str, Any] = {}
        for key, val in v.items():
            if isinstance(val, str):
                coerced[key] = [val] if val else []
            elif isinstance(val, list):
                coerced[key] = val
            elif val is None:
                coerced[key] = []
            else:
                coerced[key] = val
        return coerced


class Presentation(_SanitizedModel):
    users: str = Field(default="", max_length=1000)
    interaction: str = Field(default="", max_length=1000)
    tools: str = Field(default="", max_length=1000)
    auth: str = Field(default="", max_length=1000)
    selections: PresentationSelections = Field(default_factory=PresentationSelections)


class Intent(_SanitizedModel):
    development: str = Field(default="", max_length=1000)
    provided: str = Field(default="", max_length=1000)
    selections: IntentSelections = Field(default_factory=IntentSelections)


class Observability(_SanitizedModel):
    methods: str = Field(default="", max_length=1000)
    go_no_go: str = Field(default="", max_length=1000)
    additional_logic: str = Field(default="", max_length=1000)
    tools: str = Field(default="", max_length=1000)
    selections: ObservabilitySelections = Field(default_factory=ObservabilitySelections)


class Orchestration(_SanitizedModel):
    summary: str = Field(default="", max_length=1000)
    selections: OrchestrationSelections = Field(default_factory=OrchestrationSelections)


class Collector(_SanitizedModel):
    methods: str = Field(default="", max_length=1000)
    auth: str = Field(default="", max_length=1000)
    handling: str = Field(default="", max_length=1000)
    normalization: str = Field(default="", max_length=1000)
    scale: str = Field(default="", max_length=1000)
    tools: str = Field(default="", max_length=1000)
    selections: CollectorSelections = Field(default_factory=CollectorSelections)


class Executor(_SanitizedModel):
    methods: str = Field(default="", max_length=1000)
    selections: ExecutorSelections = Field(default_factory=ExecutorSelections)


class Dependency(_SanitizedModel):
    name: str = Field(default="", max_length=100)
    details: str = Field(default="", max_length=500)


class TimelineItem(_SanitizedModel):
    name: str = Field(default="", max_length=100)
    duration_bd: int = Field(default=0, ge=0)
    start: str = Field(default="", max_length=10)
    end: str = Field(default="", max_length=10)
    notes: str = Field(default="", max_length=500)


class Timeline(_SanitizedModel):
    start_date: str = Field(default="", max_length=10)
    total_business_days: int = Field(default=0, ge=0)
    projected_completion: Optional[str] = Field(default=None, max_length=10)
    build_buy: str = Field(default="", max_length=50)
    staff_count: int = Field(default=0, ge=0)
    external_staff_count: int = Field(default=0, ge=0)
    staffing_plan_md: str = Field(default="", max_length=HARD_TEXT_CAP)
    holiday_region: str = Field(default="", max_length=50)
    items: List[TimelineItem] = Field(default_factory=list)

    @field_validator("build_buy")
    @classmethod
    def _check_build_buy(cls, v: str) -> str:
        return _warn_if_unknown("timeline.build_buy", v, BUILD_BUY_OPTIONS)

    @field_validator("holiday_region")
    @classmethod
    def _check_holiday_region(cls, v: str) -> str:
        return _warn_if_unknown(
            "timeline.holiday_region", v, HOLIDAY_REGION_OPTIONS
        )


# ---------------------------------------------------------------------------
# Root payload
# ---------------------------------------------------------------------------


class WizardPayload(_SanitizedModel):
    """The complete NAF Solution Wizard payload.

    Every section is optional with a default so partial / legacy exports load
    cleanly. Use :meth:`validate_for_save` to enforce the fields that are
    genuinely required before persisting.
    """

    initiative: Initiative = Field(default_factory=Initiative)
    my_role: MyRole = Field(default_factory=MyRole)
    stakeholders: Stakeholders = Field(default_factory=Stakeholders)
    presentation: Presentation = Field(default_factory=Presentation)
    intent: Intent = Field(default_factory=Intent)
    observability: Observability = Field(default_factory=Observability)
    orchestration: Orchestration = Field(default_factory=Orchestration)
    collector: Collector = Field(default_factory=Collector)
    executor: Executor = Field(default_factory=Executor)
    dependencies: List[Dependency] = Field(default_factory=list)
    # Narrative describing dependencies & external interfaces overall (a border
    # piece on the initiative; the `dependencies` list holds the itemized picks).
    dependencies_narrative: str = Field(default="", max_length=4000)
    timeline: Timeline = Field(default_factory=Timeline)
    # Rendered Markdown report, appended to exports; not part of the input form.
    naf_report_md: Optional[str] = Field(default=None, max_length=HARD_TEXT_CAP)

    def validate_for_save(self) -> "WizardPayload":
        """Enforce save-time required fields (the ``required`` tier of
        ``field_registry``). Raises ``ValueError`` if any are missing/empty;
        returns ``self`` for chaining."""
        from field_registry import required_specs, resolve_model_value

        missing = [
            spec.model_path
            for spec in required_specs()
            if not str(resolve_model_value(self, spec.model_path) or "").strip()
        ]
        if missing:
            raise ValueError(
                "Cannot save solution — required field(s) missing or empty: "
                + ", ".join(missing)
            )
        return self
