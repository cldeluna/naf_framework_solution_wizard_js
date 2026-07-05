-- =====================================================================
-- 0002_initiative_border_pieces.sql
-- Phase 2c: the initiative becomes the rich record. Add the "border piece"
-- columns to initiatives (use case, workflow, my_role, stakeholders,
-- dependencies, timeline). The solution keeps only the six NAF components in
-- its payload.
--
-- Additive and non-destructive (ADD COLUMN IF NOT EXISTS). Existing rows get
-- the defaults. Apply in the Supabase SQL editor, or:
--   uv run python supabase/apply_migration.py \
--       supabase/migrations/0002_initiative_border_pieces.sql
-- =====================================================================

alter table public.initiatives
    add column if not exists use_case             text,
    add column if not exists workflow_description  text,
    add column if not exists workflow_steps        jsonb not null default '[]'::jsonb,
    add column if not exists my_role               jsonb not null default '{}'::jsonb,
    add column if not exists stakeholders          jsonb not null default '{}'::jsonb,
    add column if not exists dependencies          jsonb not null default '[]'::jsonb,
    add column if not exists timeline              jsonb not null default '{}'::jsonb;
