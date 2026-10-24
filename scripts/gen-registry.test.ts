import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, describe, expect, it } from "vitest"

import { PINNED, buildRegistry, classifyImports, importSpecifiers, resolveHomepage, type RegistryItem } from "./gen-registry"

const SITE = "https://design.example.com"
const registry = buildRegistry(SITE)
const item = (name: string): RegistryItem => {
  const found = registry.items.find((i) => i.name === name)
  if (!found) throw new Error(`no item named ${name}`)
  return found
}

describe("buildRegistry", () => {
  it("publishes bare package names, except the pinned majors", () => {
    for (const { name, dependencies = [] } of registry.items) {
      for (const dep of dependencies) {
        const at = dep.indexOf("@", 1)
        const pkg = at > 0 ? dep.slice(0, at) : dep
        expect(Boolean(PINNED[pkg]), `${name}: ${dep}`).toBe(at > 0)
      }
    }
    expect(item("sidebar").dependencies).toContain("lucide-react")
    expect(item("calendar").dependencies).toContain("react-day-picker@^8.10.1")
  })

  it("adds the peers a package needs: react-day-picker v8 needs date-fns", () => {
    expect(item("calendar").dependencies).toContain("date-fns")
  })

  it("ships the Tailwind theme keys an item uses that shadcn init does not write", () => {
    const extend = (name: string) => item(name).tailwind?.config.theme.extend
    expect(Object.keys(extend("sidebar")?.colors ?? {})).toEqual(["sidebar"])
    expect(Object.keys(extend("accordion")?.keyframes ?? {}).sort()).toEqual(["accordion-down", "accordion-up"])
    expect(Object.keys(extend("accordion")?.animation ?? {}).sort()).toEqual(["accordion-down", "accordion-up"])
    expect(Object.keys(extend("input-otp")?.keyframes ?? {})).toEqual(["caret-blink"])
    expect(item("button").tailwind).toBeUndefined()
  })

  it("points registry dependencies at the homepage", () => {
    expect(item("sidebar").registryDependencies).toContain(`${SITE}/r/button.json`)
  })
})

describe("buildRegistry on a project with tests and comments", () => {
  const root = mkdtempSync(join(tmpdir(), "registry-"))
  const write = (path: string, text: string) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  write("package.json", JSON.stringify({ dependencies: { clsx: "^2.1.1" } }))
  write("src/lib/utils.ts", 'import { clsx } from "clsx"\nexport const cn = clsx\n')
  write("src/hooks/use-thing.ts", "export const useThing = () => 1\n")
  write("src/hooks/use-thing.test.ts", 'import { it } from "vitest"\nit("works", () => {})\n')
  write(
    "src/components/ui/thing.tsx",
    [
      "// Adapted from the one that imported from \"left-pad\".",
      'import { cn } from "@/lib/utils"',
      "/* import { Old } from '@/lib/legacy' */",
      'const note = "import { Gone } from \'@/lib/gone\'"',
      "export const Thing = () => <p className={cn(note)}>from \"jsx-text\"</p>",
      "",
    ].join("\n"),
  )
  write("src/components/ui/thing.test.tsx", 'import { render } from "@testing-library/react"\n')
  afterAll(() => rmSync(root, { recursive: true, force: true }))

  it("leaves test files out and does not read imports from comments, strings or JSX text", () => {
    const { items } = buildRegistry(SITE, root)
    expect(items.map((i) => i.name)).toEqual(["utils", "use-thing", "thing"])
    expect(items.find((i) => i.name === "thing")?.registryDependencies).toEqual([`${SITE}/r/utils.json`])
    expect(items.find((i) => i.name === "thing")?.dependencies).toBeUndefined()
  })
})

describe("importSpecifiers", () => {
  it("finds every kind of import and nothing in comments or strings", () => {
    const source = `
      import * as React from "react"
      import type { Column } from "@tanstack/react-table"
      import "./side-effect.css"
      export { Button } from "@/components/ui/button"
      export * from "./other"
      // import { NotThis } from "in-a-comment"
      /* export * from "nor-this" */
      const text = 'import x from "in-a-string"'
      const template = \`import y from "in-a-template"\`
      const lazy = () => import("@/components/ui/dialog")
      type T = import("@/hooks/use-mobile").Thing
    `
    expect(importSpecifiers(source)).toEqual([
      "react",
      "@tanstack/react-table",
      "./side-effect.css",
      "@/components/ui/button",
      "./other",
      "@/components/ui/dialog",
      "@/hooks/use-mobile",
    ])
  })
})

describe("classifyImports", () => {
  it("sorts imports into packages and registry items", () => {
    const source = `
      import * as React from "react"
      import { Slot } from "@radix-ui/react-slot"
      import { format } from "date-fns/format"
      import { cn } from "@/lib/utils"
      import { useIsMobile } from "@/hooks/use-mobile"
      import { Button } from "@/components/ui/button"
      import { US_STATE_OPTIONS } from "@/components/ui/state-picker.data"
      import type { Column } from "@tanstack/react-table"
    `
    expect(classifyImports(importSpecifiers(source), "state-picker")).toEqual({
      packages: ["@radix-ui/react-slot", "@tanstack/react-table", "date-fns"],
      items: ["button", "use-mobile", "utils"],
    })
  })

  it("refuses an import a registry item cannot carry", () => {
    expect(() => classifyImports(["@/lib/payments"])).toThrow(/Unsupported import "@\/lib\/payments"/)
    expect(() => classifyImports(["../utils"])).toThrow(/Unsupported import/)
  })
})

describe("resolveHomepage", () => {
  it("prefers SITE_URL and drops a trailing slash", () => {
    expect(resolveHomepage({ SITE_URL: "https://ds.example.com/", VERCEL: "1", VERCEL_URL: "x.vercel.app" })).toBe("https://ds.example.com")
  })

  it("uses the production domain for a production build on Vercel", () => {
    const env = { VERCEL: "1", VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "ds.example.com", VERCEL_URL: "ds-abc123.vercel.app" }
    expect(resolveHomepage(env)).toBe("https://ds.example.com")
  })

  it("uses the deployment's own URL for a preview, so its items come from that preview", () => {
    const env = { VERCEL: "1", VERCEL_ENV: "preview", VERCEL_PROJECT_PRODUCTION_URL: "ds.example.com", VERCEL_URL: "ds-abc123.vercel.app" }
    expect(resolveHomepage(env)).toBe("https://ds-abc123.vercel.app")
  })

  it("fails a CI or Vercel build that has no address", () => {
    expect(() => resolveHomepage({ CI: "true" })).toThrow(/SITE_URL/)
    expect(() => resolveHomepage({ VERCEL: "1", VERCEL_ENV: "production" })).toThrow(/SITE_URL/)
  })

  it("falls back to localhost on the script's port", () => {
    expect(resolveHomepage({}, 5173)).toBe("http://localhost:5173")
    expect(resolveHomepage({})).toBe("http://localhost:4173")
  })
})
