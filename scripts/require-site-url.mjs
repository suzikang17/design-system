// Run first by `pnpm deploy:preview`: a local deploy must not publish a registry whose dependency URLs point at
// localhost, or into whichever Cloudflare account a login happens to reach.
const { SITE_URL, CLOUDFLARE_ACCOUNT_ID } = process.env

let problem
if (!/^https:\/\/[^/\s]+/.test(SITE_URL ?? '')) {
  problem = `SITE_URL must be the https:// address the preview will have, for example https://design-system.<subdomain>.workers.dev (got ${SITE_URL ? JSON.stringify(SITE_URL) : 'nothing'}).`
} else if (!CLOUDFLARE_ACCOUNT_ID?.trim()) {
  problem = "CLOUDFLARE_ACCOUNT_ID is not set: set it to the owner's own Cloudflare account, so a login that reaches several accounts cannot deploy to the wrong one."
}

if (problem) {
  console.error(`deploy:preview stopped. ${problem}`)
  process.exit(1)
}
