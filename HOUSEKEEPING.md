# Housekeeping

Manual cleanup/config items for Claudia — mostly things Claude cannot do from
its side (no file deletion in this folder; no access to Supabase/Dropbox
settings). Check items off as done.

## Where to review & update option catalogs and content

All curated lists live in a handful of files. Edit → `npx tsc -b` (or just let
the dev server reload) → commit → push (auto-deploys). None of these require a
schema or DB change unless noted.

| What | Where | Notes |
|---|---|---|
| **ITIL practices** (top-level categories) | `src/data/options.ts` → `CATEGORY_TREE` keys + `CATEGORY_METADATA` | Adding/renaming a practice: also update `ITIL_CATEGORY_OPTIONS` in `contract/wizard_models.py` (soft-validator), add a `PRACTICE_DEFINITIONS` entry in `src/data/terms.ts`, a shade in `ITIL_COLORS` (greys only — color is reserved for framework blocks), and a `LEGACY_ITIL_ALIASES` entry if renaming |
| **Common categories** (subcategories) | `src/data/options.ts` → `CATEGORY_TREE` leaf arrays | If removing/renaming a leaf, add it to `LEGACY_LEAF_PARENT` so old records still derive their practice. Pair each new leaf with an example (next row) |
| **Category examples & definitions** (Terms page tables) | `src/data/terms.ts` → `CATEGORY_EXAMPLES` (one line per leaf) and `CATEGORY_DEFINITIONS` (optional longer text) | ⚠️ The current examples + the two newest practice definitions are Claude drafts — review pass pending |
| **Tool catalog** (Terms page + future FR-19 typeahead) | `src/data/tools.json` | Converted from the old repo's `tools.yml` (which has YAML syntax errors — treat `tools.json` as the source now). Each entry: `name`, `url`, `notes`, `framework_functions` (must use the six block names exactly), `source`. Becomes a DB table when FR-19 lands (SPEC §5b) |
| **Section form options** (checkbox lists per puzzle piece) | `src/data/options.ts` → `PRESENTATION_*`, `INTENT_*`, `OBSERVABILITY_*`, `ORCHESTRATION_CHOICES`, `COLLECTOR_*`, `EXECUTOR_METHODS`, `MY_ROLE_*`, `STAKEHOLDER_CATALOG`, `DEPENDENCY_DEFS`, `STANDARD_RISK_REASONS` | Keep option strings stable — they're stored verbatim in saved payloads; renames orphan old data (old values still load, shown as custom) |
| **Deployment strategies** | `src/data/options.ts` → `DEPLOYMENT_STRATEGIES` + matching definition in `src/data/terms.ts` → `DEPLOYMENT_DEFINITIONS` | Keep the two in sync (a tsx one-liner check exists in git history; mismatch shows as a strategy without a Terms definition) |
| **Timeline defaults** | `src/data/options.ts` → `DEFAULT_MILESTONES`, `HOLIDAY_REGIONS`, `BUILD_BUY_OPTIONS` | Changing default milestone *names*: also update `DEFAULT_MILESTONE_NAMES` (used by the piece-completion check) |
| **Framework block colors** | `src/data/sections.ts` → `INNER_SECTIONS` | Single source: puzzle, Gantt, tool chips all read from here. Reserved palette — don't reuse these hues elsewhere |
| **Required-field tiers** | `src/lib/fieldRegistry.ts` (app) + `contract/field_registry.py` (contract) | Keep both in sync; changes affect save-blocking, compact view, and puzzle completion |
| **Field tooltips** (the `?` help text on each form field) | `src/components/forms.tsx` → find the relevant `<Form>` function (e.g. `ProblemStatementForm`, `CollectorForm`, `TimelineForm`, …) and edit the `tooltip="…"` prop on the `<Field>` that needs updating | Tooltip text is a plain string — no rebuild needed beyond a dev-server reload. All puzzle-piece and frame-piece forms now have tooltips on every field. |
| **Guided mode step order** (the sequence sections are numbered in Guided experience) | `src/data/guidedOrder.ts` → edit the `GUIDED_ORDER` array. It's a plain list of `SectionKey` strings — reorder, but keep all 10 keys present. The border pieces are `problem_statement`, `stakeholders`, `staffing_timeline`, `dependencies`; the inner NAF components are `presentation`, `intent`, `orchestration`, `observability`, `collector`, `executor`. Step numbers on puzzle pieces, section buttons, panel headers, and Next → buttons all update automatically. | Do not add or remove keys — the array must contain all 10 section keys or the step count ("Step N of 10") will be wrong. |
| **Sidebar UX descriptions** (the contextual hint under Experience and Field View toggles) | `src/App.tsx` → find the two `<p className="sidebar-ux-hint">` blocks inside the `App` component. Each is a ternary: `{experienceMode === "freeform" ? "…freeform text…" : "…guided text…"}` and `{fieldView === "all" ? "…detailed text…" : "…compact text…"}` — edit the quoted strings directly. | Four strings total: Free Form, Guided, Detailed, Compact. Plain text only — no JSX or Markdown. The description updates live as the user toggles, so write it as if explaining the *currently active* choice. |
| **Sign-in hint text** (the small paragraph below the "🔐 Sign in with Google" button in the sidebar) | `src/App.tsx` → `AuthBadge` function → find the `<span className="sidebar-ux-hint">` inside the signed-out branch (the `: (` arm of the auth.user ternary). Edit the text directly. | Only shown when the user is not signed in. Plain text only. Disappears automatically once the user signs in. |
| **Home page FAQ expanders** ("❓ Why do I need this?" / "📄 What do I get?" near the top of the home page) | `src/pages/HomePage.tsx` → the two `<details>` blocks right after the `<h2>`. Edit the `<summary>` text (icon + question) and the `<p>` body directly. | Plain-triangle `<details>` style, no custom CSS — keep new entries consistent with the other expanders below (`What does the wizard cover?`, `Saving and loading your work`, etc.) on the same page. |
| **Payload shape** (add/remove fields) | `contract/wizard_models.py` → follow `contract/README.md` workflow (regen schema → copy → `npm run gen:types`) + DB migration if a column is involved | The heavyweight path — everything else above is data-only |

## File cleanup

- [x] Delete `scripts/validate-export.mjs` — stale; replaced by
      `scripts/validate-export.mts` (`npm run validate:export -- <file>` points
      to the new one).
- [x] Delete `src/App.css` — leftover from the Vite template; no longer
      imported anywhere.
- [x] Optional: delete `dist/` — contains output from a sandbox build; your own
      `npm run build` regenerates it (it's git-ignored anyway).

## Git

- [x] **Delete stale git lock/temp files** left by the sandbox commit (Claude
      can create but not delete files here). Until removed, git commands will
      fail with "…lock exists". From the mockup folder run:

      ```bash
      rm -f .git/HEAD.lock .git/index.lock .git/objects/maintenance.lock
      find .git/objects -name 'tmp_obj_*' -delete
      git status   # should be clean apart from scripts/validate-export.mjs
      ```

- [x] Optional: create the GitHub repo and push (`git remote add origin … &&
      git push -u origin main`). Initial commit `a5bd33c` is already made with
      your name/email as author.

## Phase 2 (catalog) — apply before testing save/load

- [x] **Apply migration `supabase/migrations/0005_spa_hardening.sql`** in the
      Supabase SQL editor (adds server-side text sanitization + size caps —
      required now that the browser talks to the DB directly). The access
      policies from `setup_db_auth.py` are already correct and unchanged.
- [x] **Confirm your user has the admin role** (needed for the Admin page):

      ```sql
      insert into public.user_roles (user_id, role)
      values ('<your-auth-user-uuid>', 'admin')
      on conflict (user_id) do update set role = 'admin';
      ```
      4250ec17-27d1-4ce9-ba8c-03f4c533ccf5
      
      (Find your UUID: Supabase → Authentication → Users. Skip if already
      granted for the Streamlit app.)

## ITIL category split (before next catalog save)

- [x] **Apply migration `supabase/migrations/0006_itil_category.sql`** in the
      Supabase SQL editor (adds the `itil_category` column + updates the
      sanitize trigger). Existing rows keep it NULL; loaders derive it.
- [ ] **Review the draft CATEGORY_TREE mapping** in `src/data/options.ts` —
      the grouping of common categories under ITIL practices is my draft and
      needs your curation (Capacity Management is currently empty; the two
      security options sit under the new Information Security Management).

## Security review follow-ups (see SECURITY_REVIEW.md)

- [ ] **Apply migration `supabase/migrations/0007_privacy_hardening.sql`**
      (contact_ok enforced server-side via masked views; solutions INSERT
      ownership check). App reads now expect the views — apply before the
      next deploy/pull of the catalog page.
- [ ] Push/redeploy so `public/_headers` (CSP + security headers) ships.
- [ ] Run the two verification checks in SECURITY_REVIEW.md §Action items.

## Streamlit decommission (decided 2026-07-05; execute when the new app deploys)

- [ ] Replace the Streamlit Cloud app with a short retirement notice + link to
      the new URL, then delete the deployment.
- [x] Remove the Streamlit app's `APP_URL` entry from Supabase → Authentication
      → URL Configuration (keep localhost + the Cloudflare Pages URL).
- [ ] Update the Python repo README: the repo's mission is now the canonical
      Pydantic models + schema generation, SQL migrations, and seed/load
      scripts. Streamlit UI code is frozen, not maintained.

## Environment / settings

- [x] Reinstall `node_modules` natively after the Linux-sandbox install
      (done 2026-07-04; see README "node_modules is machine-specific").
- [ ] Exclude `node_modules/` from Dropbox sync (right-click → Don't sync to
      dropbox.com) — avoids sync churn and cross-machine binary corruption.
- [x] Supabase → Authentication → URL Configuration: add
      `http://localhost:5173` to Redirect URLs (done — sign-in verified).
- [ ] Later, at deploy time: add the Cloudflare Pages URL to the same
      Redirect URLs list.

## Process notes

- Claude runs installs/builds in a Linux sandbox; **`npm install` and
  `npm run build` should be run on your Mac**, not by Claude. Claude verifies
  with `tsc` (pure JS, platform-safe) instead.
- **Git commits should also be run on your Mac** — commits from Claude's side
  leave undeletable lock files behind (see Git section above). Claude will
  stage nothing and instead suggest commit messages.
- New manual items get appended here as they come up.
