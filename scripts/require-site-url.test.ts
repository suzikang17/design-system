import { spawnSync } from "node:child_process"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const script = join(import.meta.dirname, "require-site-url.mjs")
const run = (env: Record<string, string>) =>
  spawnSync(process.execPath, [script], { env: { PATH: process.env.PATH ?? "", ...env }, encoding: "utf8" })

describe("require-site-url (deploy:preview guard)", () => {
  it("passes with an https SITE_URL and an account id", () => {
    expect(run({ SITE_URL: "https://design-system.example.workers.dev", CLOUDFLARE_ACCOUNT_ID: "abc" }).status).toBe(0)
  })

  it.each([
    ["no SITE_URL", {}],
    ["a localhost SITE_URL", { SITE_URL: "http://localhost:4173" }],
    ["an http SITE_URL", { SITE_URL: "http://design.example.com" }],
    ["a bare https scheme", { SITE_URL: "https://" }],
  ])("stops on %s, with one line naming SITE_URL", (_name, env) => {
    const result = run({ CLOUDFLARE_ACCOUNT_ID: "abc", ...env })
    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/SITE_URL/)
    expect(result.stderr.trim().split("\n")).toHaveLength(1)
  })

  it("stops without CLOUDFLARE_ACCOUNT_ID and says to use the owner's own account", () => {
    const result = run({ SITE_URL: "https://design.example.com" })
    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/CLOUDFLARE_ACCOUNT_ID.*owner's own/)
    expect(result.stderr.trim().split("\n")).toHaveLength(1)
  })
})
