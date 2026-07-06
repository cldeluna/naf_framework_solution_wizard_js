# Housekeeping

Manual cleanup/config items for Claudia — mostly things Claude cannot do from
its side (no file deletion in this folder; no access to Supabase/Dropbox
settings). Check items off as done.

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
