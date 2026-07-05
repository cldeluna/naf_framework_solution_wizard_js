# Housekeeping

Manual cleanup/config items for Claudia — mostly things Claude cannot do from
its side (no file deletion in this folder; no access to Supabase/Dropbox
settings). Check items off as done.

## File cleanup

- [ ] Delete `scripts/validate-export.mjs` — stale; replaced by
      `scripts/validate-export.mts` (`npm run validate:export -- <file>` points
      to the new one).
- [ ] Delete `src/App.css` — leftover from the Vite template; no longer
      imported anywhere.
- [ ] Optional: delete `dist/` — contains output from a sandbox build; your own
      `npm run build` regenerates it (it's git-ignored anyway).

## Git

- [ ] **Delete stale git lock/temp files** left by the sandbox commit (Claude
      can create but not delete files here). Until removed, git commands will
      fail with "…lock exists". From the mockup folder run:

      ```bash
      rm -f .git/HEAD.lock .git/index.lock .git/objects/maintenance.lock
      find .git/objects -name 'tmp_obj_*' -delete
      git status   # should be clean apart from scripts/validate-export.mjs
      ```

- [ ] Optional: create the GitHub repo and push (`git remote add origin … &&
      git push -u origin main`). Initial commit `a5bd33c` is already made with
      your name/email as author.

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
