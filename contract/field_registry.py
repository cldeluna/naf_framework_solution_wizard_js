"""
field_registry.py
=================
Single source of truth for **field importance** across the wizard's section
dialogs. Every consumer reads from here so the rules never drift:

- ``wizard_models.WizardPayload.validate_for_save`` — enforces the ``required``
  tier (save-strict).
- ``pages/20_...._missing_required`` — the UI pre-check (same rule, keyed by
  session_state).
- The section dialogs — decide which fields to show in the compact
  ("Required only") vs full ("All fields") view.

Three tiers:

- ``required``    — shown in the compact view **and** blocks save.
- ``recommended`` — shown in the compact view, does **not** block save.
- ``optional``    — only in the full view.

The compact view = ``required`` + ``recommended``. Today nothing is
``recommended`` yet (we start conservative); promoting a field is a one-line
tier change here, no code change elsewhere.

This module is intentionally dependency-light (no Streamlit, no Pydantic) so it
can be imported from the canonical models and unit-tested offline.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Mapping, Optional

TIERS = ("required", "recommended", "optional")
# Tiers that appear in the compact ("Required only") view.
COMPACT_TIERS = ("required", "recommended")


@dataclass(frozen=True)
class FieldSpec:
    """One field's importance, bridging the two namespaces it lives in.

    ``ss_key`` is the Streamlit ``session_state`` key the wizard uses; the
    ``dlg_`` widget mirror syncs into it. ``model_path`` is the dotted path from
    the ``WizardPayload`` root that ``validate_for_save`` checks.
    """

    id: str
    label: str
    ss_key: str
    model_path: str
    tier: str = "optional"
    # Optional resolver for the "effective" session_state value, for fields whose
    # value is split across widgets (e.g. category vs a custom "Other" text box).
    effective_ss: Optional[Callable[[Mapping[str, Any]], str]] = None

    def is_compact(self) -> bool:
        return self.tier in COMPACT_TIERS

    def is_required(self) -> bool:
        return self.tier == "required"


# ---------------------------------------------------------------------------
# Effective-value resolvers (session_state)
# ---------------------------------------------------------------------------
def _effective_category(ss: Mapping[str, Any]) -> str:
    """Category is 'Other' + a free-text box, or a picked value."""
    cat = (ss.get("_wizard_category") or "").strip()
    other = (ss.get("_wizard_category_other") or "").strip()
    return other if cat == "Other" else cat


_ROLE_SENTINEL = "— Select one —"
_ROLE_OTHER = "Other (fill in)"


def _role_resolver(choice_key: str, other_key: str) -> Callable[[Mapping[str, Any]], str]:
    """Resolver mirroring payload_builder._norm_role_choice: the sentinel means
    unanswered (empty); 'Other (fill in)' defers to the free-text box."""

    def _resolve(ss: Mapping[str, Any]) -> str:
        choice = (ss.get(choice_key) or "").strip()
        if choice == _ROLE_OTHER:
            return (ss.get(other_key) or "").strip()
        if choice == _ROLE_SENTINEL:
            return ""
        return choice

    return _resolve


# ---------------------------------------------------------------------------
# The registry — section key -> ordered field specs.
# (Step 1 seeds only the Problem Statement & Use Case section; other sections
# are curated in the rollout.)
# ---------------------------------------------------------------------------
REGISTRY: Dict[str, List[FieldSpec]] = {
    "problem_statement": [
        FieldSpec("author", "Author", "_wizard_author",
                  "initiative.author", "required"),
        FieldSpec("title", "Title", "_wizard_automation_title",
                  "initiative.title", "required"),
        FieldSpec("description", "Description", "_wizard_automation_description",
                  "initiative.description", "required"),
        FieldSpec("itil_category", "ITIL Category", "_wizard_itil_category",
                  "initiative.itil_category", "required"),
        FieldSpec("category", "Category", "_wizard_category",
                  "initiative.category", "required", effective_ss=_effective_category),
        FieldSpec("problem_statement", "Problem Statement", "_wizard_problem_statement",
                  "initiative.problem_statement", "required"),
        FieldSpec("use_case", "Use Case", "_wizard_use_case",
                  "initiative.use_case", "required"),
        FieldSpec("workflow_description", "Workflow description",
                  "_wizard_workflow_description", "initiative.workflow_description",
                  "required"),
    ],
    "stakeholders": [
        FieldSpec("my_role_who", "My Role — who you are", "my_role_who",
                  "my_role.who", "required",
                  effective_ss=_role_resolver("my_role_who", "my_role_who_other")),
        FieldSpec("my_role_skills", "My Role — your skills", "my_role_skills",
                  "my_role.skills", "required",
                  effective_ss=_role_resolver("my_role_skills", "my_role_skills_other")),
        FieldSpec("my_role_developer", "My Role — who will develop", "my_role_dev",
                  "my_role.developer", "required",
                  effective_ss=_role_resolver("my_role_dev", "my_role_dev_other")),
    ],
    "staffing_timeline": [
        FieldSpec("build_buy", "Development approach", "timeline_build_buy",
                  "timeline.build_buy", "required"),
        FieldSpec("staffing_plan", "Staffing plan", "timeline_staffing_plan",
                  "timeline.staffing_plan_md", "required"),
    ],
    "dependencies": [
        FieldSpec("dependencies_narrative", "Dependencies & external interfaces",
                  "dep_narrative", "dependencies_narrative", "required"),
    ],
}


# ---------------------------------------------------------------------------
# Accessors
# ---------------------------------------------------------------------------
def specs_for(section: str) -> List[FieldSpec]:
    return REGISTRY.get(section, [])


def all_specs() -> List[FieldSpec]:
    return [s for specs in REGISTRY.values() for s in specs]


def required_specs() -> List[FieldSpec]:
    """All save-blocking fields, in registry order."""
    return [s for s in all_specs() if s.is_required()]


def required_specs_for(section: str) -> List[FieldSpec]:
    """Save-blocking fields for a single section (for per-dialog validation)."""
    return [s for s in specs_for(section) if s.is_required()]


def section_has_compact(section: str) -> bool:
    """True if a section has any field shown in the compact view (so the
    Required-only toggle is meaningful there)."""
    return any(s.is_compact() for s in specs_for(section))


def resolve_model_value(root: Any, path: str) -> Any:
    """Follow a dotted ``model_path`` from a model root; None on any gap."""
    obj = root
    for part in path.split("."):
        obj = getattr(obj, part, None)
        if obj is None:
            return None
    return obj
