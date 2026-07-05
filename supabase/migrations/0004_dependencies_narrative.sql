-- =====================================================================
-- 0004_dependencies_narrative.sql
-- Add a free-text "dependencies & external interfaces" narrative to the
-- initiative (a border piece alongside the itemized `dependencies` list).
--
-- Additive and non-destructive (ADD COLUMN IF NOT EXISTS). Apply in the
-- Supabase SQL editor, or:
--   uv run python supabase/apply_migration.py \
--       supabase/migrations/0004_dependencies_narrative.sql
-- =====================================================================

alter table public.initiatives
    add column if not exists dependencies_narrative text;
