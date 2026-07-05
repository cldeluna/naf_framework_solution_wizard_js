# NAF Solution Wizard — React Rebuild

Rebuild of the [NAF Framework Solution Wizard](https://naf-framework-solution-wizard.streamlit.app/) as a Vite + React + TypeScript SPA backed by Supabase, per [SPEC.md](./SPEC.md).

## How to Use the Wizard

Live site: **https://naf-solution-wizard.ing/**

The wizard works fully signed out — sign-in is only needed to save to or load from the shared community catalog.

### Home page

- Framework overview and a **🚀 Start Building Your Solution** button that opens the Wizard.
- **Sign in with Google** here if you want catalog access. Signing in never clears a wizard you've already started — your draft is saved in the browser regardless of auth state.
- **If you plan to save to the catalog, sign in early.** The "🗄 Save to catalog" button on the Wizard page is grayed out and not clickable until you're signed in — it does not prompt you to sign in when clicked. You can still fill in puzzle pieces while signed out; just come back to the Home page and sign in with Google before (or any time before) you're ready to save. Signing in mid-wizard is safe either way: the sign-in redirect reloads the page, but your entries were already autosaved to the browser's local storage and are restored automatically on load.
- Expandable sections cover what the wizard collects and how saving/loading works.

### The Wizard page

**The puzzle.** Ten pieces: 4 border pieces (project context) around 6 inner pieces (the NAF framework components).

| Piece | Required fields (block saving to the catalog) | All fields |
|---|---|---|
| Problem Statement & Use Case (border, top) | Author, title, description, ITIL category, category, problem statement, use case, workflow description | + Workflow steps (structured name/description rows), error conditions, assumptions, deployment strategy + description, out of scope, risk of not moving forward (standard reasons + free text) |
| Stakeholders & My Role (border, left) | My Role: who you are, your technical skills, who will develop the solution | + Stakeholder categories affected (checkboxes by category), other stakeholders (free text) |
| Staffing & Timeline (border, right) | Development approach (build vs. buy), staffing plan | + Direct staff count, professional-services staff count, holiday calendar region, project start date, milestones (name/duration in business days/notes) — generates a projected completion date and Gantt chart |
| Dependencies (border, bottom) | Dependencies & external interfaces narrative | + External systems/interfaces checkboxes with per-item details |
| Presentation | *(none)* | Intended users, interaction modes (CLI/Web GUI/API/etc.), tools, authentication method — each with a Custom/Other option |
| Intent | *(none)* | Development approach, how intent is consumed/provided |
| Observability | *(none)* | How solution state is determined, go/no-go logic, optional additional gating logic, observability tools |
| Orchestration | *(none)* | Orchestration approach (or explicitly "no orchestration layer") + details |
| Collector | *(none)* | Collection methods, authentication, traffic handling, normalization, scale (devices, metrics/sec, cadence), collection tools |
| Executor | *(none)* | Execution methods |

The 6 inner NAF-component pieces have no save-blocking fields — anything you fill in there is optional, though the more detail the better for the generated report.

Click any piece (or the matching button below the puzzle) to open its form in a side panel. A piece turns ✅ once its required fields are filled in with meaningful content — this is calculated automatically, there's no separate "submit" step. Progress is shown as **n/10**.

Every form has a **Custom / Other** option with a free-text field for anything not covered by the preset checkboxes. If you can't answer a question technically, note that the function is needed and describe it in the Custom field.

**Required Only vs. All Fields.** The toggle at the top of the Wizard page controls every section form:
- **🔎 Required Only** shows just the fields needed before you can save to the shared catalog.
- **🗂️ All Fields** shows the full, detailed form.

**Autosave.** Every keystroke writes to your browser's local storage — closing a panel, refreshing, or signing in mid-wizard never discards what you've entered. The toolbar badge shows when the draft was last autosaved, or that a prior draft was restored.

### Saving and sharing your work

Below the puzzle:

- **📂 Open → Load naf_report_*.json** — re-load a previously exported file to keep editing it.
- **💾 Download → 📦 Bundle (JSON + MD + Gantt)** — a ZIP containing the JSON payload, a rendered Markdown solution design report, and a Gantt chart image. Best for sharing with a team or stakeholders.
- **💾 Download → JSON only** — just the data file, useful for re-importing later or handing to someone else running the same app.
- **🗄 Shared Catalog → Save to catalog** (requires sign-in and all required fields complete) — publishes your initiative and solution to the shared Supabase-backed catalog. If you loaded a design you own, you'll be offered **Update** (overwrite it) or **Save as new**. Loading and saving *someone else's* design always creates your own fork — it never overwrites theirs.
- **⚠️ Danger Zone → Reset wizard** — clears everything after a confirmation prompt.

A live preview ("📄 Detailed solution description") shows the rendered report and Gantt chart as you build, once any section has content.

### Solutions page (shared catalog)

Available to signed-in users. The catalog is a **card grid** — one summary card per initiative, everything visible without expanding anything:

- Each card shows the **title**, **ITIL practice + category chips** (the card's top edge is color-coded by ITIL practice, matching the puzzle palette), a short **problem-statement snippet**, the submitter/date/solution-count line, and every **solution inline** with its deployment-strategy chip.
- **🔎 Search box** filters live across title, problem statement, use case, category, and author; an **ITIL category dropdown** beside it narrows the grid to one practice — it always lists all eight practices with a count of how many initiatives each holds.
- **📥 Load** on any solution row pulls that design into the Wizard in one click. Saving afterward forks it under your account unless it's yours and you choose Update.
- **🗑 Delete** — on solution rows you own (and, for admins, on anything); owners/admins also get a card-footer delete for the whole initiative + its solutions.
- Submitter contact (name/email) is shown only if the submitter opted in when saving; a **mine** tag marks your own records.

If no database is configured for a given deployment, this page falls back to a message pointing you at file-based Download/Load instead.

### Admin page

Restricted to accounts with the `admin` role. Lets an admin grant/change roles (`viewer`/`editor`/`admin`) by user UID. Catalog moderation — deleting any solution or initiative regardless of owner — happens on the Solutions page, where admins see delete controls on every record.

### Terms & Definitions page

Reference glossary: use-case categories, deployment strategies, and the curated automation tool catalog, each with definitions/links.

### Troubleshooting

- **Lost your place after closing the browser?** Reopen the site — it offers to restore your last autosaved draft.
- **Filled in pieces while signed out, then signed in to save — did it keep your work?** Yes, that's expected. Sign-in redirects to Google and back, but the draft was already autosaved locally before the redirect and is restored automatically.
- **Can't save to the catalog?** The Save button stays grayed out until you're signed in — it won't prompt a sign-in for you, so go sign in via the Home page first. It also requires every *required* field to be filled in; hover the button to see how many are still missing.
- **Importing an old JSON file that came from the original Streamlit app?** It should still load — legacy fields are tolerated on import.

## Setup

Requires Node 20+.

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + publishable/anon key
npm run dev                  # http://localhost:5173
```

Leave `.env.local` empty (or absent) to run in **JSON-only mode** — full wizard and file export, no sign-in or database features (SPEC §3.6).

For Google sign-in to work, add your dev/prod URLs (e.g. `http://localhost:5173`) to Supabase → Authentication → URL Configuration → Redirect URLs.

### ⚠️ node_modules is machine-specific

The build toolchain (rolldown/esbuild) ships **per-platform native binaries**. `node_modules` installed on one OS/CPU (e.g. Linux, or a CI/agent sandbox) will fail on another (e.g. macOS arm64) with:

```
Error: Cannot find native binding. ... Cannot find module '@rolldown/binding-darwin-arm64'
```

Fix — reinstall natively on your machine (npm's [optional-deps bug](https://github.com/npm/cli/issues/4828) means the lockfile must go too):

```bash
rm -rf node_modules package-lock.json
npm install
```

Never sync or commit `node_modules` (it's git-ignored; if this folder lives in Dropbox, consider excluding `node_modules` from sync).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run gen:types` | Regenerate `src/types/wizardPayload.ts` (Zod) from `src/types/wizard_payload.schema.json`. The schema itself is generated from the Pydantic models in the original repo (`scripts/gen_schema.py`) — copy a fresh one here after model changes |
| `npm run validate:export <file.json>` | Validate a `naf_report_*.json` export against the payload contract (normalize → Zod parse) |

## Payload contract

- `src/types/wizard_payload.schema.json` — JSON Schema, source-of-truth copy from the Python repo
- `src/types/wizardPayload.ts` — generated Zod schema + `WizardPayload` type (do not edit; regenerate)
- `src/types/normalize.ts` — ingestion-tolerant pre-normalizer mirroring the Python lenient-load rules (nulls → defaults, legacy stakeholder shapes, HTML/control-char stripping, `expected_use` → `use_case` fallback). Loading = normalize then parse; saving stays strict (SPEC §2.5)

## Deployment

Cloudflare Pages: build command `npm run build`, output directory `dist`, set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as build environment variables. See SPEC §3.6 for the hosted vs self-hosted model.
