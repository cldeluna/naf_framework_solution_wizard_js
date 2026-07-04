# NAF Solution Wizard — React Rebuild

Rebuild of the [NAF Framework Solution Wizard](https://naf-framework-solution-wizard.streamlit.app/) as a Vite + React + TypeScript SPA backed by Supabase, per [SPEC.md](./SPEC.md).

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
