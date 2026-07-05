# contract/ — canonical payload contract (Python)

Consolidated here from the retired Streamlit repo (2026-07-05). This is the
**source of truth** for the wizard payload shape:

- `wizard_models.py` — canonical Pydantic v2 models (validation philosophy:
  ingestion-tolerant, save-strict)
- `field_registry.py` — field-importance tiers (required/recommended/optional)
- `gen_schema.py` — regenerates `schemas/wizard_payload.schema.json`

## Changing the contract

1. Edit `wizard_models.py` (and `field_registry.py` if tiers change).
2. `pip install pydantic` (once), then `python3 contract/gen_schema.py`
3. `cp contract/schemas/wizard_payload.schema.json src/types/`
4. `npm run gen:types` (rebuilds the Zod schema for the frontend)
5. Mirror any tier change in `src/lib/fieldRegistry.ts`, and DB column
   changes as a new migration in `supabase/migrations/`.

`python3 contract/gen_schema.py --check` fails if the committed schema is
stale (useful in CI).
