# Resume

**State (2026-11-25):** `feat/client-work` is pushed and open as PR #2 (not merged). It holds the Client work section:
22 pieces in `src/client/` (five are layout pieces: Container, Stack, Row, Columns, Grid), the `/client` pages with a
client dropdown, device frames and `/client/playground`, where a visitor picks a structure, adds pieces into
it and picks the fonts (tray on the right).
A preview is deployed at the Worker's `workers.dev` address; no custom domain. `docs/CONVENTIONS.md` has the rules.

**Next steps:**
1. Review and merge PR #2 (disconnect Vercel first if still connected), then attach the custom domain once its zone
   is on Cloudflare (`routes` with `custom_domain: true`, `SITE_URL=https://<domain> pnpm deploy:preview`).
2. Measure the six sections against the live client sites (built from source only) and move them onto Container.
3. More sections: testimonials, offerings, newsletter. Touch dragging in the playground (phones use the buttons).

**Gotchas:**
- `pnpm deploy:preview` needs `SITE_URL` (https) and `CLOUDFLARE_ACCOUNT_ID`; the login reaches more than one
  account, so pick it by name with `pnpm exec wrangler whoami`. Browser checks need
  `pnpm exec playwright install --with-deps chromium`. On a busy machine run the checks with `--maxWorkers=3`.
