# Security Review — Public Cloudflare Deployment

**Date:** 2026-07-05 · **Scope:** the deployed SPA (public repo, public URL),
its Supabase project, and the payload contract. **Threat model:** the anon
key and all frontend code are public; any signed-in Google account is a
potential hostile client; RLS + DB grants are the only enforcement boundary
(client-side checks are UX, not security).

## Findings & resolutions

| # | Severity | Finding | Resolution |
|---|---|---|---|
| 1 | **Medium** | `contact_ok` (submitter email/name opt-in) was enforced only in app code — any signed-in user could `select submitter_email from initiatives` directly via PostgREST | **Fixed — migration 0007**: contact columns removed from the authenticated role's base-table SELECT grant; reads now go through `catalog_initiatives` / `catalog_solutions` views that null the contact fields unless `contact_ok` or `is_admin()` |
| 2 | **Low-Med** | `solutions` INSERT policy checked only `owner_id = auth.uid()` — a hostile client could attach a solution to *someone else's* initiative (content spoofing on their catalog card) | **Fixed — migration 0007**: insert policy now also requires the target initiative to belong to the inserter |
| 3 | **Low** | No security headers on the Pages deployment | **Fixed**: `public/_headers` adds CSP (script-src 'self'; connect-src self + supabase; frame-ancestors 'none'), X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy |
| 4 | Info | XSS surfaces reviewed: the two `dangerouslySetInnerHTML` uses are (a) the self-generated Gantt SVG — all user strings pass `escapeXml`; (b) the report preview — rendered by markdown-it with `html: false`, so user content cannot inject markup. All other user data renders through React (auto-escaped). Defense in depth: HTML tags stripped at load-normalize and again by DB triggers (0005/0006) | No action needed |
| 5 | Info | Secrets hygiene: `.env.local` git-ignored and never in git history; no service-role key or private keys anywhere in the repo; `npm audit` clean (0 vulnerabilities) | No action needed |
| 6 | Info | Public-by-design values: Supabase URL + publishable/anon key appear in DEPLOYMENT.md and the built JS. This is the intended Supabase model — the anon key only grants what RLS allows | Accepted |
| 7 | Info | Supabase auth session lives in localStorage (supabase-js default). Acceptable given the XSS posture above; the alternative (cookies) would require a server | Accepted |
| 8 | Info | DoS/abuse: text fields capped per-field + 100k hard cap client-side and by DB triggers; JSONB capped 1–2 MB; Supabase free-tier rate limits apply. Catalog queries capped (limit 200/500) | Accepted for community scale |

## Access-control matrix (post-0007)

| Actor | initiatives/solutions | contact columns | user_roles | tools (future) |
|---|---|---|---|---|
| Anonymous | nothing (no RLS policy) | nothing | nothing | — |
| Signed-in | read all (via views), write own | only where `contact_ok` | own row | — |
| Owner | + update/delete own | own values | own row | — |
| Admin | + update/delete anything | always visible | read/write all | — |

## Action items for Claudia

1. **Apply `supabase/migrations/0007_privacy_hardening.sql`** in the SQL
   editor (idempotent; PostgREST reloads its schema automatically).
2. **Redeploy** (push to `main`) so `_headers` and the view-based reads ship.
3. **Verify from outside** (any machine, no login):

   ```bash
   # anon must get an empty list / 401-style response, never rows:
   curl -s "https://pdsatjuqflznaidcqmgg.supabase.co/rest/v1/initiatives?select=title" \
        -H "apikey: <anon key>" | head -c 300
   # base-table contact read as a signed-in NON-admin should fail (permission denied):
   #   run in the browser console while signed in:
   #   await supabase.from("initiatives").select("submitter_email")
   ```

4. Google OAuth: confirm Supabase → Auth → Redirect URLs contains **only**
   `http://localhost:5173` and the pages.dev URL (remove the old Streamlit
   entry per the decommission checklist).

## Review cadence

Re-run this review when: adding the tools table (FR-19 — new RLS surface),
adding any Edge Function/RPC, enabling a new auth provider, or introducing a
dependency that renders user content.
