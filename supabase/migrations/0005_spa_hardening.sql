-- =====================================================================
-- 0005_spa_hardening.sql  (NEW — for the React SPA deployment)
--
-- With the SPA, the browser talks to PostgREST directly and RLS is the ONLY
-- enforcement boundary (SPEC §3.3 / NFR-2). The existing policies from
-- setup_db_auth.py already cover access control (owner CRUD + admin).
-- This migration adds the server-side input sanitization that previously
-- ran in the Streamlit process (wizard_models.clean_text):
--
--   * strip raw HTML tags from all text columns (Markdown unaffected)
--   * strip control characters (except \t \n \r)
--   * reject absurdly large values (100k hard cap per text field)
--
-- Apply in the Supabase SQL editor (or supabase/apply_migration.py from the
-- original repo). Additive and idempotent.
-- =====================================================================

create or replace function public.clean_text(v text)
returns text
language sql immutable as $$
    select left(
        regexp_replace(
            regexp_replace(v, '<[^>]+>', '', 'g'),          -- raw HTML tags
            '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g'     -- control chars
        ),
        100000                                               -- hard cap
    );
$$;

-- ---------------------------------------------------------------------
-- initiatives: sanitize text columns on insert/update
-- ---------------------------------------------------------------------
create or replace function public.sanitize_initiative()
returns trigger language plpgsql as $$
begin
    new.author                 := public.clean_text(new.author);
    new.title                  := public.clean_text(new.title);
    new.description            := public.clean_text(new.description);
    new.category               := public.clean_text(new.category);
    new.problem_statement      := public.clean_text(new.problem_statement);
    new.use_case               := public.clean_text(new.use_case);
    new.expected_use           := public.clean_text(new.expected_use);
    new.workflow_description   := public.clean_text(new.workflow_description);
    new.dependencies_narrative := public.clean_text(new.dependencies_narrative);
    new.error_conditions       := public.clean_text(new.error_conditions);
    new.assumptions            := public.clean_text(new.assumptions);
    new.out_of_scope           := public.clean_text(new.out_of_scope);
    new.no_move_forward        := public.clean_text(new.no_move_forward);
    new.summary                := public.clean_text(new.summary);
    new.submitter_name         := public.clean_text(new.submitter_name);
    new.submitter_email        := public.clean_text(new.submitter_email);
    -- guard against runaway JSONB blobs (whole-column cap: 1 MB)
    if pg_column_size(new.timeline) > 1048576
       or pg_column_size(new.stakeholders) > 1048576
       or pg_column_size(new.dependencies) > 1048576
       or pg_column_size(new.workflow_steps) > 1048576 then
        raise exception 'JSONB field exceeds 1MB cap';
    end if;
    return new;
end;
$$;

drop trigger if exists trg_initiatives_sanitize on public.initiatives;
create trigger trg_initiatives_sanitize
    before insert or update on public.initiatives
    for each row execute function public.sanitize_initiative();

-- ---------------------------------------------------------------------
-- solutions: sanitize text columns + cap payload size (2 MB)
-- ---------------------------------------------------------------------
create or replace function public.sanitize_solution()
returns trigger language plpgsql as $$
begin
    new.name                            := public.clean_text(new.name);
    new.status                          := public.clean_text(new.status);
    new.deployment_strategy             := public.clean_text(new.deployment_strategy);
    new.deployment_strategy_description := public.clean_text(new.deployment_strategy_description);
    new.summary                         := public.clean_text(new.summary);
    new.submitter_name                  := public.clean_text(new.submitter_name);
    new.submitter_email                 := public.clean_text(new.submitter_email);
    if pg_column_size(new.payload) > 2097152 then
        raise exception 'solution payload exceeds 2MB cap';
    end if;
    return new;
end;
$$;

drop trigger if exists trg_solutions_sanitize on public.solutions;
create trigger trg_solutions_sanitize
    before insert or update on public.solutions
    for each row execute function public.sanitize_solution();
