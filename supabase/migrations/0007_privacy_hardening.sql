-- =====================================================================
-- 0007_privacy_hardening.sql  (security review, 2026-07-05)
--
-- Fixes two findings from the public-deployment security review:
--
-- 1. contact_ok was enforced only in the app UI — any signed-in user could
--    SELECT submitter_name/submitter_email directly via PostgREST. Now the
--    contact columns are removed from the authenticated role's base-table
--    SELECT and exposed only through masked catalog views (visible when the
--    submitter opted in, or to admins).
--
-- 2. solutions INSERT did not verify initiative ownership — a hostile client
--    could attach a solution to someone else's initiative (content spoofing
--    on their catalog card). The insert policy now requires the target
--    initiative to belong to the inserting user.
--
-- After applying, reload the PostgREST schema cache (Supabase does this
-- automatically within seconds; or run: NOTIFY pgrst, 'reload schema').
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1a. Masked catalog views (owner = postgres, bypasses base RLS; access
--     controlled by the grants below — authenticated only, never anon).
-- ---------------------------------------------------------------------
create or replace view public.catalog_initiatives as
select
    id, owner_id, author, title, description, itil_category, category,
    problem_statement, use_case, expected_use, error_conditions, assumptions,
    out_of_scope, no_move_forward, no_move_forward_reasons,
    workflow_description, workflow_steps, my_role, stakeholders,
    dependencies, dependencies_narrative, timeline, summary,
    case when contact_ok or public.is_admin() then submitter_name  end as submitter_name,
    case when contact_ok or public.is_admin() then submitter_email end as submitter_email,
    contact_ok, content_hash, created_at, updated_at
from public.initiatives;

create or replace view public.catalog_solutions as
select
    id, initiative_id, owner_id, name, status,
    deployment_strategy, deployment_strategy_description, version, payload,
    summary,
    case when contact_ok or public.is_admin() then submitter_name  end as submitter_name,
    case when contact_ok or public.is_admin() then submitter_email end as submitter_email,
    contact_ok, content_hash, created_at, updated_at
from public.solutions;

revoke all on public.catalog_initiatives from anon, authenticated;
revoke all on public.catalog_solutions   from anon, authenticated;
grant select on public.catalog_initiatives to authenticated;
grant select on public.catalog_solutions   to authenticated;

-- ---------------------------------------------------------------------
-- 1b. Column-level SELECT on the base tables: authenticated keeps every
--     column EXCEPT the raw contact columns (reads go through the views).
--     Writes (insert/update/delete, incl. contact columns) are unchanged
--     and still guarded by the existing RLS policies.
-- ---------------------------------------------------------------------
revoke select on public.initiatives from authenticated;
grant select (
    id, owner_id, author, title, description, itil_category, category,
    problem_statement, use_case, expected_use, error_conditions, assumptions,
    out_of_scope, no_move_forward, no_move_forward_reasons,
    workflow_description, workflow_steps, my_role, stakeholders,
    dependencies, dependencies_narrative, timeline, summary,
    contact_ok, content_hash, created_at, updated_at
) on public.initiatives to authenticated;

revoke select on public.solutions from authenticated;
grant select (
    id, initiative_id, owner_id, name, status,
    deployment_strategy, deployment_strategy_description, version, payload,
    summary, contact_ok, content_hash, created_at, updated_at
) on public.solutions to authenticated;

-- anon has no row-level policies on these tables (sees zero rows), so its
-- table grants are inert; left untouched.

-- ---------------------------------------------------------------------
-- 2. Tighten solutions INSERT: the target initiative must be yours.
-- ---------------------------------------------------------------------
drop policy if exists solutions_insert on public.solutions;
create policy solutions_insert on public.solutions
    for insert to authenticated
    with check (
        owner_id = auth.uid()
        and exists (
            select 1 from public.initiatives i
            where i.id = initiative_id and i.owner_id = auth.uid()
        )
    );
