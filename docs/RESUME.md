# Resume

**State (2026-11-23):** `feat/client-work` is pushed and open as PR #2 (not merged). It adds the Client work section
(`src/client/`, `/client` pages, `client-*` registry items), Playwright checks and Cloudflare hosting. `pnpm verify`
passes. A preview of this branch is deployed at the Worker's `workers.dev` address; no custom domain is attached.

**Next steps:**
1. Review and merge PR #2. If the repo is still connected to Vercel, disconnect it first (`vercel.json` is gone).
2. Attach the custom domain once its zone is on Cloudflare: add `routes` with `custom_domain: true` to
   `wrangler.jsonc`, then `SITE_URL=https://<domain> pnpm deploy:preview`.
3. Next client pieces, built straight into `src/client/components/` per `docs/CONVENTIONS.md`: motion, then
   sections, galleries and scroll set pieces. Decide one API for form fields before the forms.

**Gotchas:**
- `pnpm deploy:preview` needs `SITE_URL` (https) and `CLOUDFLARE_ACCOUNT_ID` in the shell; the login can reach more
  than one account, so pick it by name with `pnpm exec wrangler whoami`.
- Browser checks need Chromium's system libraries: `pnpm exec playwright install --with-deps chromium`.
- Open decisions: a licence (none yet) and the site name in `src/site.config.ts`.
