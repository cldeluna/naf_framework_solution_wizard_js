-- =====================================================================
-- 0003_per_owner_unique.sql
-- Phase 2c: initiatives (and solutions) are per-owner records. Replace the
-- GLOBAL unique(content_hash) with a per-owner unique(owner_id, content_hash),
-- so two users can each own a copy of the same problem (fork), while a single
-- user still can't duplicate their own upload.
--
-- Safe on a near-empty DB. Apply in the Supabase SQL editor, or:
--   uv run python supabase/apply_migration.py \
--       supabase/migrations/0003_per_owner_unique.sql
-- =====================================================================

-- initiatives
alter table public.initiatives drop constraint if exists initiatives_content_hash_key;
alter table public.initiatives
    add constraint uq_initiatives_owner_hash unique (owner_id, content_hash);

-- solutions
alter table public.solutions drop constraint if exists solutions_content_hash_key;
alter table public.solutions
    add constraint uq_solutions_owner_hash unique (owner_id, content_hash);
