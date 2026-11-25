import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const root = join(import.meta.dirname, "..")

/** The `_headers` rules as { pattern: { header: value } }, in Cloudflare's block syntax. */
function parse(text: string): Record<string, Record<string, string>> {
  const rules: Record<string, Record<string, string>> = {}
  let current: Record<string, string> | undefined
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue
    if (!/^\s/.test(line)) current = rules[line.trim()] = {}
    else {
      const at = line.indexOf(":")
      if (!current || at < 0) throw new Error(`bad line: ${line}`)
      current[line.slice(0, at).trim()] = line.slice(at + 1).trim()
    }
  }
  return rules
}

describe("public/_headers", () => {
  const rules = parse(readFileSync(join(root, "public/_headers"), "utf8"))

  it("caches Vite's hashed files for a year, immutable", () => {
    expect(rules["/assets/*"]).toEqual({ "Cache-Control": "public, max-age=31536000, immutable" })
  })

  it("sets nosniff everywhere and lets only the site itself frame it", () => {
    expect(rules["/*"]).toEqual({
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "frame-ancestors 'self'",
    })
  })

  it("has one splat per pattern and stays inside Cloudflare's limits", () => {
    expect(Object.keys(rules).length).toBeLessThanOrEqual(100)
    for (const pattern of Object.keys(rules)) expect(pattern.split("*").length - 1).toBeLessThanOrEqual(1)
  })

  it("is in public/, which Vite copies to the root of dist/ (where wrangler serves it from)", () => {
    expect(existsSync(join(root, "public/_headers"))).toBe(true)
    expect(JSON.parse(readFileSync(join(root, "wrangler.jsonc"), "utf8").replace(/\/\/.*$/gm, "")).assets.directory).toMatch(/dist/)
  })
})
