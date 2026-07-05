"""
gen_schema.py
=============
Regenerate ``schemas/wizard_payload.schema.json`` from the canonical Pydantic
models in ``wizard_models.py``.

The JSON Schema is a *build artifact* of the models — never hand-edit it. Run
this whenever the models change::

    python3 contract/gen_schema.py

Exit code 1 (with ``--check``) if the committed schema is out of date.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# Consolidated repo layout: this script lives in contract/ next to
# wizard_models.py; the schema is written to contract/schemas/ and mirrored
# into src/types/ for the frontend (npm run gen:types rebuilds the Zod schema).
_CONTRACT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_CONTRACT_DIR))

from wizard_models import WizardPayload  # noqa: E402

_REPO_ROOT = _CONTRACT_DIR
SCHEMA_PATH = _CONTRACT_DIR / "schemas" / "wizard_payload.schema.json"

_META = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": (
        "https://github.com/eianow-automation/naf_framework_solution_wizard/"
        "schemas/wizard_payload.schema.json"
    ),
    "title": "NAF Solution Wizard Payload",
    "description": (
        "Schema for the NAF Solution Wizard payload. GENERATED from "
        "wizard_models.WizardPayload by scripts/gen_schema.py — do not edit "
        "by hand."
    ),
}


def build_schema() -> dict:
    schema = WizardPayload.model_json_schema()
    # Prepend stable metadata (model_json_schema does not emit $schema/$id).
    return {**_META, **schema}


def main() -> int:
    schema = build_schema()
    rendered = json.dumps(schema, indent=2) + "\n"

    if "--check" in sys.argv:
        current = SCHEMA_PATH.read_text() if SCHEMA_PATH.exists() else ""
        if current != rendered:
            print(
                f"{SCHEMA_PATH.name} is out of date — run "
                "`python3 contract/gen_schema.py`",
                file=sys.stderr,
            )
            return 1
        print(f"{SCHEMA_PATH.name} is up to date.")
        return 0

    SCHEMA_PATH.write_text(rendered)
    print(f"Wrote {SCHEMA_PATH.relative_to(_REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
