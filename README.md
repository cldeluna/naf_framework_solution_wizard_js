# NAF Design Solution Wizard — React Rebuild

Rebuild of the [NAF Framework Design Solution Wizard](https://naf-framework-solution-wizard.streamlit.app/) as a Vite + React + TypeScript SPA backed by Supabase, per [SPEC.md](./SPEC.md).

## Documentation

| | |
|---|---|
| [Quick Start Guide](./QUICK_START_GUIDE.md) | 5-minute walkthrough — sign-in options, the puzzle, experience modes, tooltips, download choices |
| [User Guide](./USER_GUIDE.md) | Full reference: every page, nav settings, guided/free-form modes, field view, troubleshooting |

The User Guide is also displayed inside the app on the Home page. Live site: **https://naf-solution-wizard.ing/**

## Tech Stack

This is a **static single-page app (SPA)**: everything runs in the visitor's browser as plain files (HTML/CSS/JS) served from a CDN. There's no Python/Node server running in production — the browser talks directly to Supabase for auth and the database. That's what makes it free to host and fast to load.

| Piece | What it is | Why it's here |
|---|---|---|
| **TypeScript** | JavaScript with optional type annotations, checked at compile time (`npm run build` runs `tsc`, the TypeScript compiler). Comparable to adding type hints in Python, but the compiler actually enforces them and refuses to build if they don't line up. | Catches a whole class of bugs (wrong field name, wrong shape of data) before the code ever runs, which matters a lot with an ~11-section payload object. |
| **Vite** | The build tool and dev server (`npm run dev`, `npm run build`). It bundles all the source files into the optimized static files that actually get deployed, and during development it serves your code with near-instant reload on save (Hot Module Replacement) instead of a slow full-page refresh. Think of it as the JS equivalent of a combination of a task runner and a local web server — there's no direct Python equivalent, but it plays a role a bit like `uvicorn --reload` does for a Python dev server. | Modern, fast, minimal-config alternative to older bundlers like Webpack; it's the standard starting point for a new React project today. |
| **React** | A UI library for building interfaces out of reusable, stateful components (a `<PuzzleBoard>`, a `<SectionPanel>`, etc.) that automatically re-render when their data changes. | The interactive puzzle board (click a piece → panel opens → typing updates state → piece animates) maps naturally onto React's component + state model. It also has the largest ecosystem and community of any JS UI framework, which matters while learning. |
| **Zustand** | A small state-management library — one global "store" object (`src/state/store.ts`) that holds the entire wizard payload and notifies components when it changes. | Replaces what the original Streamlit app did with ~150 individually-managed `session_state` keys with a single typed object; much less to keep track of, and it's what drives autosave (every change is written straight to the store, then debounced to `localStorage`). |
| **Zod** | A schema-validation library that checks data shapes at runtime and reports exactly what's wrong. Plays the same role TypeScript's types do, but at runtime — e.g. validating a JSON file someone uploads, which the compiler can't check ahead of time. If you know Pydantic from Python, Zod is the closest JS equivalent. | Guarantees imported/exported JSON actually matches the expected wizard structure, and generates the TypeScript types automatically so the two never drift apart. |
| **Supabase** | A hosted backend built on Postgres: a real SQL database plus built-in user authentication and **Row Level Security (RLS)** — database-enforced rules about who can read/write which rows. | Gives the app a real shared database and login system without writing or hosting a custom backend server. Because the browser holds only a public "anon" key, RLS (not application code) is what actually keeps one user's data safe from another's. |
| **Google OAuth (via Supabase Auth)** | "Sign in with Google" — the app redirects to Google, Google confirms your identity, and Supabase turns that into a session token stored in your browser. | Familiar one-click sign-in with no passwords for this app to manage or leak; Supabase handles the token exchange and refresh automatically. |
| **Cloudflare Pages** | Free static-site hosting with a global CDN. Watches the GitHub repo and automatically rebuilds/redeploys on every push to `main`. | Zero-cost, zero-maintenance hosting for a client-only SPA — no server to patch or pay for, and no cold starts (a real problem with the old Streamlit Cloud deployment). |
| **markdown-it** | Renders the generated Markdown solution report as HTML for the in-app live preview, and powers the User Guide expander on the Home page. | Lightweight, well-established Markdown renderer; used with HTML rendering disabled so pasted/typed content can't inject markup. |
| **oxlint** | A fast linter (`npm run lint`) that flags common JS/TS mistakes. | Rust-based and much faster than the traditional ESLint on a project this size. |



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

## License

[MIT](./LICENSE). The NAF and EIA logos under `images/` are the trademarks of their respective organizations and aren't covered by this license.
