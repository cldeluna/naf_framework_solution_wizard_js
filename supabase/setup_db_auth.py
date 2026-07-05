"""
setup_db_auth.py
================
Phase 2 schema — REVIEW FIRST.

Captures the normalized, access-controlled schema so it can be read and
discussed before anything is applied:

    initiatives  (the problem / use-case)  1 ── * solutions  (the design)
    user_roles   (viewer | editor | admin)

Highlights:
  - One initiative has many solutions (FK).
  - Per-owner de-duplication via unique(owner_id, content_hash) on each table.
  - Role-based access enforced by Row Level Security (RLS):
      viewer (any authenticated) -> read all
      owner                      -> update/delete own
      admin                      -> full CRUD
      anonymous                  -> no DB access (JSON-export tier)

Usage (from the project root):
    uv run python supabase/setup_db_auth.py            # PRINT the SQL (no DB touched)
    uv run python supabase/setup_db_auth.py --apply    # execute it  (see WARNING)
    uv run python supabase/setup_db_auth.py --apply --verify

WARNING: --apply DROPS the phase-1 single-table ``solutions`` (it is empty /
unused). Connection config is reused from setup_db.py (SUPABASE_DB_URL, or
SUPABASE_URL + SUPABASE-PWD).

NOTE: this is a review artifact. Once approved, the SQL below becomes the
phase-2 migration (revising supabase/migrations/0001 in place).
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from setup_db import _connection, _load_env, _redacted  # noqa: E402


SCHEMA_SQL = r"""
-- =====================================================================
-- NAF Solution Wizard — Phase 2 schema (normalized entities + RBAC)
--
--   initiatives (problem / use-case)  1 ── *  solutions (design)
--   user_roles  (viewer | editor | admin)
--
-- Per-owner dedup via unique(owner_id, content_hash). Access enforced by RLS.
-- WARNING: this DROPS the phase-1 single-table `solutions` (empty/unused).
-- =====================================================================

create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- updated_at helper (idempotent)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Remove the phase-1 single-payload table. Safe: empty / never shipped.
drop table if exists public.solutions cascade;

-- ---------------------------------------------------------------------
-- initiatives — the problem / use-case ("what & why")
-- Scalar fields are promoted to columns (this entity is browsed/filtered);
-- list-shaped fields (e.g. no_move_forward_reasons) stay JSONB.
-- ---------------------------------------------------------------------
create table if not exists public.initiatives (
    id                uuid primary key default gen_random_uuid(),
    owner_id          uuid references auth.users(id) on delete set null,
    author            text,
    title             text not null,
    description       text,
    category          text,
    problem_statement text,
    use_case          text,                                 -- single high-level use case
    expected_use      text,                                 -- legacy free text (backward compat)
    workflow_description text,
    workflow_steps    jsonb not null default '[]'::jsonb,   -- [{name, description}]
    -- border pieces (owned by the initiative, shared across its solutions)
    my_role           jsonb not null default '{}'::jsonb,
    stakeholders      jsonb not null default '{}'::jsonb,
    dependencies      jsonb not null default '[]'::jsonb,
    dependencies_narrative text,
    timeline          jsonb not null default '{}'::jsonb,
    error_conditions  text,
    assumptions       text,
    out_of_scope      text,
    no_move_forward         text,
    no_move_forward_reasons jsonb not null default '[]'::jsonb,
    -- Note: deployment_strategy lives on `solutions` (it describes a rollout).
    summary           text,                                 -- short catalog / AI abstract
    -- Denormalized submitter contact. The app shows name/email ONLY when
    -- contact_ok is true (application rule, not a DB constraint).
    submitter_name    text,
    submitter_email   text,
    contact_ok        boolean not null default false,
    content_hash      text not null,                        -- per-owner dedup
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now(),
    unique (owner_id, content_hash)
);

create index if not exists idx_initiatives_owner    on public.initiatives(owner_id);
create index if not exists idx_initiatives_category on public.initiatives(category);
create index if not exists idx_initiatives_created  on public.initiatives(created_at desc);

drop trigger if exists trg_initiatives_updated on public.initiatives;
create trigger trg_initiatives_updated
    before update on public.initiatives
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- solutions — the NAF design ("how"); many per initiative.
-- The design stays in `payload` (JSONB): the six NAF framework components —
-- presentation, intent, observability, orchestration, collector, executor
-- (+ naf_report_md). Border pieces (my_role, stakeholders, dependencies,
-- timeline) live on the initiative.
-- ---------------------------------------------------------------------
create table if not exists public.solutions (
    id            uuid primary key default gen_random_uuid(),
    -- RESTRICT: an initiative with solutions cannot be deleted until they are
    -- removed/reassigned first (protects solutions from accidental mass-delete).
    initiative_id uuid not null references public.initiatives(id) on delete restrict,
    owner_id      uuid references auth.users(id) on delete set null,
    name          text,                       -- e.g. "Ansible approach", "Buy option"
    status        text not null default 'draft',
    deployment_strategy             text,     -- how this solution rolls out (Canary, BlueGreen, …)
    deployment_strategy_description text,
    version       integer not null default 1,
    payload       jsonb not null,
    summary         text,                       -- short catalog / AI abstract
    -- Denormalized submitter contact; app shows name/email ONLY when contact_ok.
    submitter_name  text,
    submitter_email text,
    contact_ok      boolean not null default false,
    content_hash  text not null,               -- per-owner dedup
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    unique (owner_id, content_hash)
);

create index if not exists idx_solutions_initiative on public.solutions(initiative_id);
create index if not exists idx_solutions_owner       on public.solutions(owner_id);
create index if not exists idx_solutions_status      on public.solutions(status);
create index if not exists idx_solutions_deploy      on public.solutions(deployment_strategy);
create index if not exists idx_solutions_payload_gin on public.solutions using gin(payload);

drop trigger if exists trg_solutions_updated on public.solutions;
create trigger trg_solutions_updated
    before update on public.solutions
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- user_roles — role-based access control
-- ---------------------------------------------------------------------
create table if not exists public.user_roles (
    user_id    uuid primary key references auth.users(id) on delete cascade,
    role       text not null default 'viewer'
                 check (role in ('viewer', 'editor', 'admin')),
    created_at timestamptz not null default now()
);

-- Admin check. SECURITY DEFINER so it can read user_roles without tripping
-- that table's own RLS (avoids infinite recursion in policies).
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = public as $$
    select exists (
        select 1 from public.user_roles where user_id = uid and role = 'admin'
    );
$$;

-- ---------------------------------------------------------------------
-- Row Level Security
--   SELECT : any authenticated user reads ALL rows (shared catalog)
--   INSERT : authenticated, must own the new row
--   UPDATE : admin OR owner
--   DELETE : admin OR owner
--   anonymous (anon role, no login) : no policy -> no access
-- ---------------------------------------------------------------------
alter table public.initiatives enable row level security;
alter table public.solutions   enable row level security;
alter table public.user_roles  enable row level security;

-- initiatives
drop policy if exists initiatives_select on public.initiatives;
create policy initiatives_select on public.initiatives
    for select to authenticated using (true);

drop policy if exists initiatives_insert on public.initiatives;
create policy initiatives_insert on public.initiatives
    for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists initiatives_update on public.initiatives;
create policy initiatives_update on public.initiatives
    for update to authenticated
    using (public.is_admin() or owner_id = auth.uid())
    with check (public.is_admin() or owner_id = auth.uid());

drop policy if exists initiatives_delete on public.initiatives;
create policy initiatives_delete on public.initiatives
    for delete to authenticated
    using (public.is_admin() or owner_id = auth.uid());

-- solutions (same policy shape)
drop policy if exists solutions_select on public.solutions;
create policy solutions_select on public.solutions
    for select to authenticated using (true);

drop policy if exists solutions_insert on public.solutions;
create policy solutions_insert on public.solutions
    for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists solutions_update on public.solutions;
create policy solutions_update on public.solutions
    for update to authenticated
    using (public.is_admin() or owner_id = auth.uid())
    with check (public.is_admin() or owner_id = auth.uid());

drop policy if exists solutions_delete on public.solutions;
create policy solutions_delete on public.solutions
    for delete to authenticated
    using (public.is_admin() or owner_id = auth.uid());

-- user_roles: a user sees their own role; only admins manage roles.
drop policy if exists user_roles_select on public.user_roles;
create policy user_roles_select on public.user_roles
    for select to authenticated
    using (user_id = auth.uid() or public.is_admin());

drop policy if exists user_roles_write on public.user_roles;
create policy user_roles_write on public.user_roles
    for all to authenticated
    using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Bootstrapping the first admin (chicken-and-egg): no admin exists yet, so the
-- app can't grant the first one. Do it out-of-band via the SQL editor or the
-- service-role key:
--
--   insert into public.user_roles (user_id, role)
--   values ('<your-auth-user-uuid>', 'admin')
--   on conflict (user_id) do update set role = 'admin';
--
-- Find your uuid in the dashboard: Authentication -> Users.
-- ---------------------------------------------------------------------
"""


def main() -> None:
    apply = "--apply" in sys.argv
    verify = "--verify" in sys.argv

    if not apply:
        print(SCHEMA_SQL)
        print(
            "-- Review only — nothing was applied. Re-run with --apply to "
            "execute\n-- (this DROPS the phase-1 `solutions` table)."
        )
        return

    _load_env()
    conn_kwargs, source = _connection()
    print(f"Config source : {source}")
    print(f"Connection    : {_redacted(conn_kwargs)}")
    print("\n⚠️  Applying phase-2 schema — this DROPS the existing `solutions` table.")

    try:
        import psycopg2
    except ImportError:
        sys.exit("psycopg2 is not installed. Run: uv sync")

    if "dsn" in conn_kwargs:
        conn = psycopg2.connect(conn_kwargs["dsn"])
    else:
        conn = psycopg2.connect(**conn_kwargs)
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(SCHEMA_SQL)
        print("Applied ✅  (initiatives, solutions, user_roles, is_admin, RLS)")
        if verify:
            with conn.cursor() as cur:
                cur.execute(
                    "select table_name from information_schema.tables "
                    "where table_schema='public' order by table_name;"
                )
                names = [r[0] for r in cur.fetchall()]
            print(f"Public tables: {names}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
