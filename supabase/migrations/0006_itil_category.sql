-- =====================================================================
-- 0006_itil_category.sql
-- Two-level category (2026-07-05): initiatives gain itil_category (the
-- ITIL 4/5 practice); the existing `category` column becomes the common
-- category beneath it (or free text via Other).
--
-- Additive and idempotent. Existing rows keep itil_category NULL; loaders
-- derive it from the category-tree mapping until re-saved.
-- =====================================================================

alter table public.initiatives
    add column if not exists itil_category text;

create index if not exists idx_initiatives_itil on public.initiatives(itil_category);

-- include the new column in the sanitize trigger
create or replace function public.sanitize_initiative()
returns trigger language plpgsql as $$
begin
    new.author                 := public.clean_text(new.author);
    new.title                  := public.clean_text(new.title);
    new.description            := public.clean_text(new.description);
    new.itil_category          := public.clean_text(new.itil_category);
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
    if pg_column_size(new.timeline) > 1048576
       or pg_column_size(new.stakeholders) > 1048576
       or pg_column_size(new.dependencies) > 1048576
       or pg_column_size(new.workflow_steps) > 1048576 then
        raise exception 'JSONB field exceeds 1MB cap';
    end if;
    return new;
end;
$$;
