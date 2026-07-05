# NAF Framework Solution Wizard — Rebuild Specification

| | |
|---|---|
| **Status** | Draft v0.1 |
| **Author** | Claudia de Luna (with Claude) |
| **Date** | 2026-07-04 |
| **Current app** | Streamlit multipage app (`naf_framework_solution_wizard` repo), hosted on Streamlit Community Cloud |
| **Target** | Vite + React + TypeScript SPA, Supabase (unchanged), Cloudflare Pages |

---

## 1. Background & Motivation

The Solution Wizard helps the network automation community describe a proposed automation solution using the NAF Network Automation Framework. Users click puzzle pieces — a four-piece **frame** (project context: problem statement/use case, stakeholders, staffing & timeline, dependencies) around six **inner pieces** (the NAF components: Presentation, Intent, Observability, Orchestration, Collector, Executor) — filling in a section form per piece. Output is a shareable solution design document (JSON + Markdown + Gantt) and, optionally, a record in a shared Supabase catalog.

### Why rebuild

Streamlit reruns the entire script on every widget interaction over a websocket. This architecture causes the three observed problems:

1. **Data loss.** Section forms live in `st.dialog` popups. An external rerun (stray interaction, auth refresh) closes the dialog and discards unsent widget state. The current code mitigates this with a `dlg_*` → real-key mirror pattern copied on Submit, plus `@st.fragment` isolation for the puzzle — but the failure mode is architectural.
2. **Slow rendering.** Full-script re-execution per interaction, plus Streamlit Cloud cold starts.
3. **Cumbersome state.** ~150+ `session_state` keys managed by hand; import/export requires manually clearing and rehydrating each key; the puzzle click-through works via a same-origin iframe hack (`components.html` + `window.parent.document`) that is already deprecated upstream.

### Decision

Rebuild the UI as a static single-page app (React) talking directly to the existing Supabase project via `supabase-js`. No Python server in production. State lives in the browser; every change autosaves. Hosted free on Cloudflare Pages (unlimited bandwidth, no cold starts). Target scale: ≤25 concurrent users.

---

## 2. Current Functionality Inventory

Documented from source. This is the feature contract for the rebuild — anything listed here must exist in the new app or be explicitly descoped in §7.

### 2.1 Pages

| Page | File | Function |
|---|---|---|
| Landing | `NAF_Framework_Solution_Wizard.py` | Branding, framework intro, **auth gate** (sign in before starting so the OAuth redirect doesn't wipe a half-filled wizard), CTA → wizard, disclaimer, EIA sponsor footer |
| Solution Wizard | `pages/20_NAF_Solution_Wizard.py` (~4,500 lines) | The puzzle + section dialogs + preview + export/save (detailed below) |
| Public Solutions | `pages/70_Public_Solutions.py` | Read-only shared catalog; signed-in users browse all initiatives/solutions grouped by initiative; **Load** forks any design into the wizard under their own user id; submitter contact shown only if `contact_ok` |
| Admin | `pages/80_Admin.py` | Admin-gated: browse catalog with contact always visible, delete solution or whole initiative (cascade), manage user roles (`viewer`/`editor`/`admin`) by UID |
| Terms & Definitions | `pages/90_Terms_and_Definitions.py` | Reference glossary rendered from `tools.yml`, `use_case_categories.yml`, `deployment_strategies.yml` |

Global sidebar on every page: EIA + NAF branding/links, **Field view** toggle (see 2.4), compact auth status with sign-in/out.

### 2.2 The Puzzle (`puzzle_progress.py`)

- Rendered as inline SVG inside a same-origin iframe (`components.html`); clicks forward to hidden Streamlit buttons in the parent DOM.
- **Inner pieces** (2 rows × 3 cols): Presentation `#E8B817`, Observability `#2ECC40`, Orchestration `#00BCD4`, Intent `#FF6B35`, Collector `#E91E63`, Executor `#7B52E0`.
- **Frame pieces**: Problem Statement & Use Case (top, `#A8B8C8`), Stakeholders (left, `#708898`), Staffing & Timeline (right, `#B0A090`), Dependencies (bottom, `#607888`).
- Incomplete pieces are **scattered** (small per-piece x/y/rotation offsets); completing a section animates the piece snapping into place. Progress count `n/10`; celebration state when all 10 done.
- Completion is derived from state, not a flag: each piece has a predicate over its section's fields (e.g. Presentation = any user/tool checkbox checked; Orchestration = a non-sentinel choice; Problem Statement = non-default title or non-empty problem statement; Staffing & Timeline = edited milestones or staff counts > 0 or staffing plan text). A parallel `_demo_completed` flag set on dialog Submit is OR-ed in.
- Redundant **section buttons** below the puzzle (with ✅/icon per state) open the same dialogs, plus two card groups: "Project Context" (recommended, with ⚠️ missing-required badges) and planning.

### 2.3 Section Forms (modal dialogs)

Ten dialogs, one per piece. Common pattern: explanatory intro text, checkbox grids of curated options with "Custom/Other (fill in)" enable + text, free-text areas, single Submit button that commits to canonical state and marks the piece complete.

| Section | Key inputs |
|---|---|
| **Problem Statement & Use Cases** | Author, title, description, category (from `use_case_categories.yml` + Other), problem statement, use case, workflow description + structured workflow steps (name/description table editor), error conditions, assumptions, deployment strategy (from `deployment_strategies.yml` + Other) + description, out of scope, risk-of-not-moving-forward (standard reasons multiselect + free text), legacy "Expected Use" (back-compat) |
| **Stakeholders** | Category → stakeholder multiselects (catalog in `stakeholders.json`), Other text; **My Role** radios: who is filling this out, technical skills, who will develop (each with sentinel "— Select one —" and "Other (fill in)") |
| **Presentation** | Intended users (8 options + custom), interaction modes (CLI/Web GUI/API/products + custom), tools (Python/frameworks/APIs + custom), authentication (4 options + other) |
| **Intent** | Development approaches (+ custom), provided formats (+ custom) |
| **Observability** | State-representation methods, go/no-go criteria text, additional gating logic (choice + text), observability tools (+ other) |
| **Orchestration** | Choice radio (incl. explicit "No orchestration layer") + details text (≤1000 chars) |
| **Collector** | Collection methods, auth, data handling, normalization (each + custom), scale (devices, metrics/sec, cadence), collection tools (+ custom) |
| **Executor** | Execution methods checkboxes |
| **Dependencies & External Interfaces** | Dependency checkboxes + per-dependency details (defaults: Network Infrastructure, Revision Control), overall narrative (≤4000 chars) |
| **Staffing, Timeline & Milestones** | Build/Buy radio, direct + professional-services staff counts, staffing plan (Markdown), holiday calendar region (US/CA/UK/DE/IN/AU/None), start date, editable milestone rows (name, duration in business days, notes) with default template (Planning, Design, Development & Testing, …); business-day scheduling skipping weekends and regional holidays (`python-holidays`); Plotly Gantt; success/info callouts for projected completion and approximate duration |

### 2.4 Field-importance tiers (`field_registry.py`)

Single source of truth mapping fields → tier (`required` / `recommended` / `optional`), the session key, and the model path. Drives three things: the sidebar **"Required only / All fields"** view toggle, per-dialog ⚠️ badges, and save-blocking validation. Currently required: initiative author, title, description, category, problem statement, use case, workflow description; my-role who/skills/developer; timeline build-buy + staffing plan; dependencies narrative.

### 2.5 Data model & validation (`wizard_models.py`, `payload_builder.py`)

- Canonical **Pydantic v2** models for the `WizardPayload`: 11 sections (initiative, my_role, stakeholders, presentation, intent, observability, orchestration, collector, executor, dependencies[] + dependencies_narrative, timeline) plus optional rendered `naf_report_md`. Each NAF component carries both narrative strings and a structured `selections` sub-object.
- **JSON Schema generated** from the models (`schemas/wizard_payload.schema.json`, `scripts/gen_schema.py --check` in CI). ⭐ *Directly reusable by the new frontend.*
- Validation philosophy: **ingestion-tolerant, save-strict.** Loading tolerates missing/null/legacy fields and unknown vocabulary values (warn, don't reject). Saving enforces the `required` tier.
- Sanitization on every string: strip raw HTML tags (Markdown preserved), strip control chars, trim, per-field max lengths, 100k hard cap.
- `payload_builder.py` reconstructs the full payload from session state, composing narrative sentences from selections (`join_human`, placeholder suppression via `is_meaningful`).

### 2.6 Persistence

**File-based (works signed-out, always available):**
- Export: single **ZIP** — `naf_report_<title>_<ts>.json` (payload incl. `naf_report_md`), rendered `naf_report_*.md`, `images/Gantt.png` (Plotly+kaleido; `Gantt.html` fallback), branding icon. Export gated on "meaningful content" heuristics (non-default title/desc, any selections, non-sentinel orchestration…).
- Import: upload `naf_report_*.json` (filename validated) → full state overwrite (explicit clearing of every key family, custom-vs-standard resolution for category/deployment strategy, legacy field fallbacks).

**Database (Supabase, appears only when configured):**
- Normalized schema: **`initiatives`** (problem + border pieces: use_case, workflow, my_role/stakeholders/dependencies/timeline as JSONB, title/category/author, owner_id, submitter contact + `contact_ok`, `content_hash`) → **`solutions`** (six NAF components as JSONB payload, deployment_strategy, name, status, version, FK to initiative). One initiative → many solutions. Plus **`user_roles`**.
- De-dup: find-or-create by `content_hash`, **unique per owner** `(owner_id, content_hash)` — re-saving identical content never duplicates; loading someone else's design and saving forks it under your id.
- Loading your own initiative offers **Update vs Save-as-new**; save dialog collects solution name and contact opt-in; "Save diagnostics" expander shows the content fingerprint.
- Two deployment modes: JSON-only (no DB configured — DB controls hidden) and DB-backed.

### 2.7 Auth & RBAC

- **Supabase Auth, Google OAuth, PKCE redirect flow** (`db/auth.py`): login URL → Google → Supabase → back with `?code=` → exchange for session stored in `session_state`; `get_user_client()` yields a PostgREST client running as the user so **RLS applies**.
- Known wart: the auth client is a server-global `st.cache_resource` singleton so the PKCE verifier survives the redirect — noted in code as unsuitable for busy multi-user deployments.
- Known wart: sign-in reloads the app and **wipes an in-progress wizard**; mitigated by warnings and the landing-page auth gate.
- **Local admin mode**: service-role key configured → full access, no sign-in, admin implicitly true.
- Roles: `user_roles` table (`viewer`/`editor`/`admin`), `is_current_user_admin()` gates the Admin page.
- Secrets: only URL + anon/publishable key ship with the app; validated Pydantic models before any write.

### 2.8 Report generation

Jinja2 template `templates/Solution_Design_Report.j2` → Markdown solution design document; live "Detailed solution description" preview expander; "Solution Highlights" summary on the main page; Gantt chart built from milestone schedule.

### 2.9 Secondary REST API (`api/main.py`)

FastAPI app exposing the same `WizardPayload` models (generate report, in-memory store, bearer-token placeholder auth). Dev/demo status — not deployed with the Streamlit app.

---

## 3. Target Architecture

### 3.1 Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | **React 18 + TypeScript + Vite** | Interactive SVG puzzle is natural in React; TS catches payload-shape errors; largest ecosystem for the JS learning investment |
| State | React context/reducer or **Zustand** store, one store per wizard document | Replaces ~150 session keys with one typed object mirroring `WizardPayload` |
| Validation | **Zod** schemas generated from `schemas/wizard_payload.schema.json` (e.g. `json-schema-to-zod`) | Keeps Pydantic models the source of truth; the generated JSON Schema becomes the cross-language contract |
| Backend | **Supabase only** — existing project, same tables, auth, RLS | No server to host; anon key + RLS is the security boundary |
| Animation | CSS transitions or Framer Motion | Piece scatter → snap, completion celebration |
| Gantt | Frappe Gantt / Recharts / vis-timeline (choose during build) | Replaces Plotly+kaleido |
| Export ZIP | JSZip + client-side Markdown render (template ported from Jinja2 to a TS template function) | Same artifact bundle, generated in-browser |
| Hosting | **Cloudflare Pages** (free) | Unlimited bandwidth, global CDN, no cold starts, no non-commercial-use ambiguity |

**No Python in production.** Python stays for: the canonical Pydantic models + schema generation (CI contract check), Supabase migrations, and any future batch/report tooling. If genuinely Python-only logic emerges later, add a Supabase Edge Function or a small FastAPI service then — not preemptively.

### 3.2 What carries over unchanged

- Supabase project: `initiatives`, `solutions`, `user_roles`, per-owner content-hash dedup, Google OAuth config (add the new domain to redirect URLs).
- `schemas/wizard_payload.schema.json` as the payload contract (file exports remain interchangeable between old and new app).
- All curated option lists and reference YAML/JSON (`tools.yml`, `use_case_categories.yml`, `deployment_strategies.yml`, `stakeholders.json`) — converted to typed TS modules or fetched as static JSON at build time.
- The Jinja2 report template's structure and wording (ported to TS).

### 3.3 What must be added on the Supabase side

- **RLS policy audit** — the anon key is fully exposed in a SPA; every table needs explicit policies: initiatives/solutions `SELECT` for authenticated users (public catalog), `INSERT/UPDATE/DELETE` only where `owner_id = auth.uid()`, admin operations via `is_admin()` helper; `user_roles` self-read + admin-write. (The Streamlit app already runs user-scoped clients, so policies exist — they must be re-verified as the *only* line of defense.)
- **Sanitization moves server-side**: replicate `clean_text` (HTML-tag strip, control chars, length caps) as Postgres triggers or check constraints, since client-side validation is advisory only.
- Optional: a `drafts` table (`owner_id`, JSONB payload, `updated_at`) for cross-device autosave of in-progress work.

### 3.4 State & autosave (fixes the data-loss problem)

- One `WizardPayload`-shaped object in the store; every form input writes to it immediately (controlled components). **No Submit-to-commit step; closing a panel never discards input.**
- **Local draft**: persist the store to `localStorage` on every change (debounced ~500ms). Reopening the app offers to restore the draft — survives refreshes, crashes, and the OAuth redirect (eliminating the "sign in first" warning entirely).
- **Cloud draft (signed-in)**: debounced upsert to `drafts` (~2–3s), enabling cross-device resume.
- Explicit **Save to catalog** remains a deliberate action (validate required tier → decompose → initiative + solution rows), same Update / Save-as-new / fork semantics.
- Piece completion stays **derived** from payload state (port the predicates), not stored flags.

### 3.5 Routing & pages

SPA routes mirroring current pages: `/` landing, `/wizard`, `/solutions` (public catalog), `/admin`, `/terms`. Auth via `supabase.auth.signInWithOAuth({provider:'google'})` — session persisted by supabase-js in localStorage; **signing in mid-wizard no longer loses work** (draft restore on return).

### 3.6 Deployment environments

The current app supports two environments (hosted Streamlit app → master DB; forked repo run locally → own Supabase). The rebuild keeps both, but the split becomes configuration, not code:

| | Hosted (primary) | Self-hosted (supported, basic) |
|---|---|---|
| App | Cloudflare Pages deployment maintained by NAF/Claudia | Fork → `npm run dev` or own (free) Pages deployment |
| Database | Master Supabase project (shared catalog) | Own Supabase project — set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, run `supabase/migrations/` |
| Auth | Google OAuth (configured once, centrally) | Google OAuth in own project, **or email magic-link** (no OAuth setup needed — enable both providers in the app) |
| Admin | `admin` role in `user_roles` | Seed script grants own user the admin role; Supabase Studio for raw access |
| No DB configured | n/a | App runs in **JSON-only mode**: DB/auth features hidden, full wizard + file export still work (parity with today's zero-dependency mode) |

**Deliberately dropped: the service-role "local admin" mode.** A service-role key must never ship in browser code. Self-hosters get admin via the role seed + Studio instead — safer and simpler. Signed-in/signed-out functional tiers are otherwise unchanged: signed-out = full wizard + JSON/ZIP; signed-in = save/load catalog; hosted catalog remains viewable per FR-10.

### 3.7 The puzzle component

Pure React SVG (`<PuzzleBoard>`): pieces are components with click handlers — no iframe, no DOM-bridge hack. Hover states, keyboard/tap accessible, scatter/snap via CSS transform transitions, confetti/celebration on 10/10. Clicking a piece opens the section form as a routed side panel or modal (input preserved regardless).

---

## 4. Functional Requirements

FRs marked **[P1]** are launch-blocking; **[P2]** fast-follow; **[P3]** nice-to-have.

- **FR-1 [P1]** Puzzle board with 4 frame + 6 inner pieces, exact current sections/colors, derived completion, scatter/snap animation, click-to-open forms, n/10 progress. *Deliberate change (decided 2026-07-04): a piece snaps home only when the section's required-tier fields are all complete AND it has meaningful content — the Streamlit app snapped on any meaningful data.*
- **FR-2 [P1]** All ten section forms with the full field inventory of §2.3, including custom/Other patterns, sentinel-free selects, and Markdown-supported text areas.
- **FR-3 [P1]** Field-importance tiers: Required-only vs All-fields view toggle; required-field badges; save blocked until required tier satisfied.
- **FR-4 [P1]** Continuous local autosave + draft restore; no user action can silently discard entered data.
- **FR-5 [P1]** JSON export/import interchangeable with existing `naf_report_*.json` files (schema-validated, ingestion-tolerant incl. legacy fields `expected_use`, bare-string stakeholders).
- **FR-6 [P1]** ZIP export: JSON + rendered Markdown report + Gantt image + branding.
- **FR-7 [P1]** Google sign-in (Supabase); signed-out users retain full wizard + file export.
- **FR-8 [P1]** Save to catalog: validate → initiative+solution decomposition, per-owner content-hash dedup, Update vs Save-as-new, fork-on-edit of others' designs, solution name + contact opt-in.
- **FR-9 [P1]** Load from catalog: list own + browse all; rehydrate wizard from any solution.
- **FR-10 [P2]** Solutions catalog page: card-grid browse for signed-in users (*redesigned 2026-07-05 from grouped expanders to zero-click summary cards*): one card per initiative with ITIL-practice color accent, category chips, problem snippet, submitter/date meta, and solutions inline with one-click Load; live search (title/problem/use case/category/author) + ITIL-practice dropdown filter (all practices listed with per-practice initiative counts; legacy rows without a stored `itil_category` derive their practice from the category tree); `contact_ok` privacy rule; load-into-wizard (fork). *Decided 2026-07-04 — upgrade over the original's read-only page: owners get full CRUD on their own initiatives/solutions directly from this page (edit via load-into-wizard → Update; delete own records), enforced by RLS (`owner_id = auth.uid()`). Admins retain delete-anything.*
- **FR-11 [P2]** Admin page: contact always visible, delete solution/initiative (cascade), role management.
- **FR-12 [P2]** Timeline engine: business-day scheduling with regional holiday calendars (JS lib e.g. `date-holidays`), default milestone template, projected-completion callouts, Gantt render.
- **FR-13 [P2]** Live report preview + Solution Highlights summary.
- **FR-14 [P2]** Terms & Definitions page from the reference YAML content.
- **FR-15 [P3]** Cloud draft sync across devices.
- **FR-16 [P3]** Landing page parity (framework intro, disclaimer, sponsor footer).
- **FR-17 [P2]** Self-hosting path: environment-variable configuration, migration scripts, admin-role seed script, JSON-only degradation when no DB is configured, setup README.
- **FR-18 [P2]** Email magic-link as an additional sign-in provider (removes OAuth setup burden for self-hosters).
- **FR-19 [P2, designed — not yet implemented]** Structured tool capture: tool questions (Presentation, Observability, Collector, Executor) offer a typeahead over the tool catalog, storing selected tool names in the existing `selections` string arrays (no payload-contract change). Backed by the `tools` table and curation flow specified in §5b.

## 5. Non-Functional Requirements

- **NFR-1 Performance**: first load < 2s on broadband (static CDN); interaction feedback < 100ms; no cold starts.
- **NFR-2 Security**: RLS as sole enforcement boundary (assume hostile client); no service-role key anywhere in frontend; server-side sanitization (§3.3); content-hash dedup preserved.
- **NFR-3 Cost**: $0/month at target scale (Cloudflare Pages free + Supabase free tier).
- **NFR-4 Compatibility**: JSON exports round-trip between old and new app for the transition period.
- **NFR-5 Accessibility**: puzzle actions reachable by keyboard; section buttons remain as alternative navigation.
- **NFR-6 Maintainability**: payload contract enforced by generated schema check in CI on both sides.

## 5a. Analytics, API & MCP Surface

**Storage decision (affirmed 2026-07-05).** The hybrid schema stays: browse/filter fields as real columns, document-shaped content (six NAF components, border pieces) as JSONB validated by the shared payload contract and sanitized by DB triggers. JSONB in Postgres is queryable/indexable (GIN on `solutions.payload`); at catalog scale (hundreds of rows) full normalization would add join complexity without enabling any new query.

**Analytics escape hatches (add when a real need appears, all non-breaking):**

- SQL **views** that unnest `selections` arrays into flat rows — e.g. `solution_tools(solution_id, section, tool)` — making BI/CSV queries trivial.
- **Generated columns** promoting hot JSONB fields to indexed columns.
- Postgres FTS (`tsvector`) over narrative fields for keyword search.

**Worked example — "which solutions use SuzieQ for observability or collection?"**
Answerable today with a section-scoped `ilike` over the JSONB (precision is fine); but **recall is limited by capture, not storage**: the tool questions record *categories* ("Open Source Software"), so a product name appears only if typed into a custom field. Planned fix (**FR-19 [P2]**): tool questions gain a typeahead over the curated tool catalog (`tools.json`, 97 tools with framework-function tags), storing chosen tools as structured entries alongside the category checkboxes. Then per-tool queries and "top tools" community analytics become exact lookups. A normalized schema would have had the same capture gap — this is a data-modeling issue, not a storage-format issue.

**API surface.** Supabase's PostgREST *is* the API (the SPA already consumes it): external clients authenticate with a Supabase JWT and get the same RLS-enforced access. For a curated surface, add Postgres `rpc` functions or Supabase Edge Functions (e.g. `search_solutions(query)`, `get_solution_payload(id)`); the FastAPI in `api/` can also be revived against the same DB since it shares the Pydantic models.

**MCP server (candidate Phase 5).** A community MCP server exposing tools like `search_solutions`, `get_solution_design`, `list_categories` — the JSONB payload is returned as-is (zero assembly) and the generated JSON Schema doubles as the tool output contract. Lets community members query the NAF catalog from Claude or other MCP clients. Auth: Supabase JWT per user; RLS remains the boundary.

## 5b. Tool Catalog Design (FR-19 — designed 2026-07-05, not yet implemented)

Making tools searchable turns the tool list from a static file into a first-class entity with its own lifecycle. Full design, to be implemented as its own milestone:

**`tools` table (new migration when implemented):**

```sql
create table public.tools (
    id                  uuid primary key default gen_random_uuid(),
    name                text not null,
    url                 text,
    notes               text,
    framework_functions text[] not null default '{}',   -- Presentation…Executor
    category            text,                           -- e.g. "BGP – Daemons"
    status              text not null default 'approved'
                          check (status in ('proposed', 'approved', 'deprecated')),
    source              jsonb not null default '[]'::jsonb,
    created_by          uuid references auth.users(id) on delete set null,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),
    unique (lower(name))
);
```

**RLS / curation model — the `editor` role gets its purpose:**

| Action | Who |
|---|---|
| SELECT | any authenticated user (typeahead reads) |
| INSERT (`status='proposed'`) | any authenticated user — community can suggest tools |
| INSERT/UPDATE approved rows, approve proposals, deprecate | `editor` or `admin` |
| DELETE | `admin` |

**Seeding — Python stays the data-ops layer:** a load script in the Python repo (alongside the existing `supabase/` scripts) parses `tools.yml` and upserts the 97 seed tools. The Python repo's ongoing role after Streamlit decommissioning (§6): canonical Pydantic models + schema generation, SQL migrations, and seed/load scripts. `tools.yml` remains the seed source of truth until the table exists, then the table takes over and `tools.json` in this repo becomes a build-time snapshot for JSON-only mode.

**CRUD UI:** a "Tool Catalog" section on the Admin page (and editor-visible variant): list/filter, add, edit, approve proposals, deprecate. Wizard users see a "suggest a tool" affordance inside the typeahead when no match exists (inserts `proposed`; excluded from typeahead until approved).

**Wizard integration (no contract change):** typeahead reads approved tools filtered by the section's framework function; the selected tool *name* is appended to the existing `selections` string arrays — old exports, the Python models, and content hashing are untouched. JSON-only mode falls back to the bundled `tools.json` snapshot.

**Analytics:** with names structured, add the `solution_tools` unnest view (§5a) — per-tool queries ("who uses SuzieQ for collection?") and "top tools by framework function" become exact lookups.

## 6. Migration Plan

1. **Phase 0 — Contract.** Freeze `wizard_payload.schema.json`; generate Zod types; scaffold Vite+React+TS project (in this mockup folder); wire Supabase client + Google auth against the existing project (new redirect URL).
2. **Phase 1 — Wizard core.** Store + autosave, puzzle board, all ten forms, tier system, JSON import/export. *Milestone: file-mode feature parity; old and new app exchange JSON.*
3. **Phase 2 — Catalog.** RLS audit/hardening, save/load/dedup/fork, Public Solutions, Admin.
4. **Phase 3 — Documents.** Report template port, Gantt, ZIP bundle, preview/highlights, Terms page, landing polish.
5. **Phase 4 — Cutover.** *(Revised — decided 2026-07-05: skip the extended parallel run; the Streamlit app will be decommissioned.)* Deploy to Cloudflare Pages; add the production URL to Supabase redirect URLs; convert the Streamlit Cloud deployment to a short retirement notice pointing at the new URL, then remove it. The **Python repo is retained** with a narrowed mission: canonical Pydantic models + `gen_schema.py` (payload contract source of truth), Supabase SQL migrations, and seed/load scripts (e.g. the future tools loader). Its Streamlit UI code is frozen — no further maintenance.
6. **Phase 5 — Candidates (unscheduled).** FR-19 tool catalog (§5b); community MCP server (§5a); Gantt/report polish beyond Phase 3.

## 7. Out of Scope / Open Questions

- FastAPI REST API (`api/`): not migrated at launch; revisit if programmatic submission is requested (could become Supabase Edge Functions).
- ~~The `editor` role currently has no distinct behavior~~ — **resolved 2026-07-05**: editors become tool-catalog curators (§5b) — approve/edit/deprecate tools; solution moderation stays admin-only.
- ~~Service-role local admin mode~~ — **decided 2026-07-04: dropped** (see §3.6). Admin access = `admin` role in `user_roles` (seed script for self-hosters) + Supabase Studio for raw DB work.
- Legacy fields (`expected_use`) accepted on import but not shown as editable fields (matches current direction).
- Exact Gantt library, and whether Gantt exports as PNG (canvas render) or SVG/HTML in the ZIP — decide in Phase 3.
- Draft table retention policy (e.g. purge drafts > 90 days old).
- Should the new app support anonymous *browse* of the public catalog (current app requires sign-in)? RLS decision in Phase 2.
