# Deploying to Cloudflare Pages

Deploys are driven by the public GitHub repo: Cloudflare Pages watches `main`
and auto-deploys every push. First-time setup below; after that, deployment is
just `git push`.

## 0. Prerequisites

- Code committed and pushed to GitHub (`main` branch)
- A Cloudflare account — sign up free at https://dash.cloudflare.com (no
  credit card required)

## 1. Create the Pages project

1. Cloudflare dashboard → **Workers & Pages** (left sidebar) →
   **Create application** → **Pages** tab → **Import an existing Git repository**.
2. **Connect GitHub** — in the GitHub authorization window, choose
   *Only select repositories* and grant access to just this repo.
3. Select the repo → **Begin setup**.

## 2. Build settings

| Setting | Value |
|---|---|
| Project name | e.g. `naf-solution-wizard` (becomes `naf-solution-wizard.pages.dev`) |
| Production branch | `main` |
| Framework preset | **Vite** |
| Build command | `npm run build` |
| Build output directory | `dist` |

## 3. Environment variables (do not skip)

`.env.local` is git-ignored, so Cloudflare's build machine doesn't have the
Supabase config. On the same setup screen, expand **Environment variables**
and add:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://pdsatjuqflznaidcqmgg.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | the `sb_publishable_…` key (Supabase → Project Settings → API) |

Both values are safe to expose in a public build — the publishable key is
designed for browsers; Row Level Security is the enforcement boundary.
If these are missing the app still deploys, but in JSON-only mode (no
sign-in/catalog).

## 4. Deploy

Click **Save and Deploy**. First build takes a few minutes. The app comes up
at `https://<project-name>.pages.dev`.

## 5. Supabase redirect URL (or Google sign-in will bounce)

Supabase dashboard → **Authentication → URL Configuration → Redirect URLs** →
add `https://<project-name>.pages.dev`.

## 6. Verify

1. Open the pages.dev URL → Home page loads.
2. Sign in with Google → lands back signed-in (redirect URL working).
3. Solutions page lists the catalog.
4. Wizard: fill a piece, download the bundle, save to catalog.

## Ongoing

- **Deploy** = `git push` to `main`.
- Pushes to any other branch create a **preview deployment** with its own URL.
- Changing env vars later: project → **Settings → Environment variables**
  (requires a re-deploy: **Deployments → Retry** or push a commit).
- Custom domain (optional): project → **Custom domains** → follow the DNS
  prompts (free, includes TLS).
- Hash routing (`#/wizard`) means no SPA redirect rules are needed — all
  routes are served by `index.html` automatically.

## After first successful deploy

Run the **Streamlit decommission** checklist in `HOUSEKEEPING.md`.
