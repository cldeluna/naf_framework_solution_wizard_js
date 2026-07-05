-- =====================================================================
-- 0001_solutions.sql
-- NAF Solution Wizard — primary persistence table.
--
-- Apply in the Supabase SQL editor (or `supabase db push`). Storage is
-- JSONB-centric: the full validated WizardPayload lives in `payload`, with a
-- few columns promoted for listing/filtering. There are no normalized child
-- tables (avoids duplication — the payload is the authoritative record).
-- =====================================================================

create extension if not exists "pgcrypto";  -- for gen_random_uuid()

create table if not exists public.solutions (
    id          uuid primary key default gen_random_uuid(),
    owner_id    uuid references auth.users (id) on delete set null,
    author      text,
    title       text not null,
    category    text,
    status      text not null default 'draft',
    version     integer not null default 1,
    payload     jsonb not null,               -- full validated WizardPayload
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

comment on table public.solutions is
    'NAF Solution Wizard submissions. `payload` is the authoritative JSONB '
    'record; title/category/author/owner_id are promoted for querying.';

-- --------------------------------------------------------------------
-- Indexes for common access patterns
-- --------------------------------------------------------------------
create index if not exists idx_solutions_owner_id   on public.solutions (owner_id);
create index if not exists idx_solutions_category    on public.solutions (category);
create index if not exists idx_solutions_created_at  on public.solutions (created_at desc);
create index if not exists idx_solutions_payload_gin on public.solutions using gin (payload);

-- --------------------------------------------------------------------
-- Keep updated_at fresh on every row update
-- --------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_solutions_updated_at on public.solutions;
create trigger trg_solutions_updated_at
    before update on public.solutions
    for each row
    execute function public.set_updated_at();

-- --------------------------------------------------------------------
-- Row Level Security — owner-scoped access.
--
-- Policies reference auth.uid(). Rows with a NULL owner_id (created before
-- auth is wired up, e.g. via the anon key) are readable/writable by anyone so
-- the app is usable pre-auth; tighten this once Supabase Auth is enabled.
-- --------------------------------------------------------------------
alter table public.solutions enable row level security;

drop policy if exists solutions_select on public.solutions;
create policy solutions_select on public.solutions
    for select
    using (owner_id is null or owner_id = auth.uid());

drop policy if exists solutions_insert on public.solutions;
create policy solutions_insert on public.solutions
    for insert
    with check (owner_id is null or owner_id = auth.uid());

drop policy if exists solutions_update on public.solutions;
create policy solutions_update on public.solutions
    for update
    using (owner_id is null or owner_id = auth.uid())
    with check (owner_id is null or owner_id = auth.uid());

drop policy if exists solutions_delete on public.solutions;
create policy solutions_delete on public.solutions
    for delete
    using (owner_id is null or owner_id = auth.uid());
