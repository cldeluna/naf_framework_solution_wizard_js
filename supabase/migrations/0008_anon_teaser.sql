-- =====================================================================
-- 0008_anon_teaser.sql  (community browse feature, 2026-07-06)
--
-- Adds read-only teaser views for anonymous (unauthenticated) users so
-- the Community Design Solutions page is publicly browsable without
-- requiring sign-in.
--
-- Anonymous users see a teaser card only:
--   initiatives : id, title, description (abstract), itil_category,
--                 category, created_at
--   solutions   : id, initiative_id, name, deployment_strategy, created_at
--
-- Crucially excluded: payload (full design JSON), contact fields
-- (submitter_name, submitter_email), and owner_id.
--
-- Authenticated users continue to use the catalog_* views from 0007.
-- The Load action (fork into wizard) remains sign-in required.
--
-- Views are owned by postgres (a superuser) so they bypass base-table RLS;
-- access for the anon role is controlled solely by the GRANTs below.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Teaser views — safe column subset, no payload, no contact info.
-- ---------------------------------------------------------------------
create or replace view public.teaser_initiatives as
select
    id,
    title,
    description,     -- the Abstract field
    itil_category,
    category,
    created_at
from public.initiatives;

create or replace view public.teaser_solutions as
select
    id,
    initiative_id,
    name,
    deployment_strategy,
    created_at
from public.solutions;

-- ---------------------------------------------------------------------
-- 2. Grant SELECT on teaser views to anon only.
--    authenticated reads through catalog_* views (migration 0007).
-- ---------------------------------------------------------------------
revoke all on public.teaser_initiatives from anon, authenticated;
revoke all on public.teaser_solutions   from anon, authenticated;
grant select on public.teaser_initiatives to anon;
grant select on public.teaser_solutions   to anon;
