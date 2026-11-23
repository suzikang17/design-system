import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, normalize } from "node:path"
import { afterAll, describe, expect, it } from "vitest"

import { needsClient } from "./needs-client"
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

describe("client items", () => {
  const root = mkdtempSync(join(tmpdir(), "registry-client-"))
  const write = (path: string, text: string) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  const meta = (id: string, extra = "", files = `['src/client/components/${id}/${id}.css', 'src/client/components/${id}/${id}.meta.ts', 'src/client/components/${id}/${id}.test.tsx', 'src/client/components/${id}/${id}.tsx']`) =>
    `import { defineMeta } from '@/client/catalog/meta'\nexport default defineMeta({ id: '${id}', summary: 'The ${id}.', files: ${files}, ${extra} })\n`
  write("package.json", JSON.stringify({ dependencies: { clsx: "^2.1.1", "@fontsource/poppins": "^5", "@fontsource/tangerine": "^5" } }))
  write("src/lib/utils.ts", "export const cn = () => ''\n")
  write("src/components/ui/button.tsx", "export const Button = () => <button />\n")
  write("src/client/components/button/button.tsx", "import './button.css'\nexport const Button = () => <button />\n")
  write("src/client/components/button/button.css", ".x{}\n")
  write("src/client/components/button/button.test.tsx", "x\n")
  write("src/client/components/button/button.meta.ts", meta("button", "dependencies: ['clsx'],"))
  write("src/client/components/modal/modal.tsx", "import clsx from 'clsx'\nexport const Modal = () => null\n")
  write("src/client/components/modal/modal.css", ".x{}\n")
  write("src/client/components/modal/modal.test.tsx", "x\n")
  write("src/client/components/modal/modal.meta.ts", meta("modal", "registryDependencies: ['button', 'base', 'button'],"))
  write("src/client/tokens/contract.ts", "export const TOKENS = []\n")
  write("src/client/tokens/lint.ts", "export {}\n")
  write("src/client/tokens/all.css", "x\n")
  write("src/client/tokens/base.css", ".ds-root{}\n")
  write("src/client/hooks/useThing.ts", "export const useThing = () => 1\n")
  write("src/client/hooks/useThing.test.ts", "x\n")
  write("src/client/tokens/themes/wecuratelife.css", '@import "@fontsource/poppins/400.css";\n@font-face{src:url("../../../../node_modules/@fontsource/tangerine/files/t.woff2")}\n')
  write("src/client/tokens/themes/neutral.css", ".ds-root{}\n")
  afterAll(() => rmSync(root, { recursive: true, force: true }))

  const build = () => buildRegistry(SITE, root).items
  const find = (name: string) => build().find((i) => i.name === name)

  it("publishes client-<id> next to a ui item of the same name", () => {
    const names = build().map((i) => i.name)
    expect(names).toContain("button")
    expect(names).toContain("client-button")
  })

  it("lists the meta's files minus the meta and tests, keeping repo paths as targets", () => {
    const button = find("client-button")
    expect(button?.type).toBe("registry:component")
    expect(button?.files).toEqual([
      { path: "src/client/components/button/button.css", type: "registry:file", target: "~/src/client/components/button/button.css" },
      { path: "src/client/components/button/button.tsx", type: "registry:component", target: "~/src/client/components/button/button.tsx" },
    ])
    expect(button?.description).toBe("The button.")
  })

  it("puts client-base first, maps plain ids to client-<id>, and de-duplicates", () => {
    expect(find("client-button")?.registryDependencies).toEqual([`${SITE}/r/client-base.json`])
    expect(find("client-modal")?.registryDependencies).toEqual([`${SITE}/r/client-base.json`, `${SITE}/r/client-button.json`])
  })

  it("adds npm packages from the meta and from bare imports in shipped files, other than react", () => {
    expect(find("client-button")?.dependencies).toEqual(["clsx"])
  })

  it("ships the contract, base.css and the hooks in client-base, and nothing else", () => {
    expect(find("client-base")?.files?.map((f) => f.path)).toEqual([
      "src/client/tokens/contract.ts",
      "src/client/tokens/base.css",
      "src/client/hooks/useThing.ts",
    ])
    expect(find("client-base")?.files?.map((f) => f.type)).toEqual(["registry:lib", "registry:file", "registry:hook"])
  })

  it("makes a look per theme CSS file with the font packages it imports or links to", () => {
    const look = find("client-look-wecuratelife")
    expect(look?.dependencies).toEqual(["@fontsource/poppins", "@fontsource/tangerine"])
    expect(look?.files?.map((f) => f.path)).toEqual(["src/client/tokens/themes/wecuratelife.css"])
    expect(look?.registryDependencies).toEqual([`${SITE}/r/client-base.json`])
    expect(find("client-look-neutral")?.dependencies).toBeUndefined()
  })

  it("refuses an import a client item cannot carry", () => {
    write("src/client/components/bad/bad.tsx", "import { cn } from '@/lib/utils'\n")
    write("src/client/components/bad/bad.meta.ts", meta("bad", "", "['src/client/components/bad/bad.tsx']"))
    expect(() => build()).toThrow(/bad\.tsx.*@\/lib\/utils/)
    rmSync(join(root, "src/client/components/bad"), { recursive: true })
  })

  it("refuses a bare package missing from package.json, and a computed files field", () => {
    write("src/client/components/bad/bad.tsx", "import 'left-pad'\n")
    write("src/client/components/bad/bad.meta.ts", meta("bad", "", "['src/client/components/bad/bad.tsx']"))
    expect(() => build()).toThrow(/"left-pad", which is not in package.json/)
    write("src/client/components/bad/bad.meta.ts", meta("bad", "", "FILES"))
    expect(() => build()).toThrow(/bad\.meta\.ts: "files"/)
    rmSync(join(root, "src/client/components/bad"), { recursive: true })
  })

  it("still refuses two items with one name", () => {
    write("src/client/components/base/base.tsx", "export {}\n")
    write("src/client/components/base/base.meta.ts", meta("base", "", "['src/client/components/base/base.tsx']"))
    // client-base is generated, a client component named "base" collides with it
    expect(() => build()).toThrow(/Two registry items are named "client-base"/)
    rmSync(join(root, "src/client/components/base"), { recursive: true })
  })
})

describe("the real client items", () => {
  const repo = join(import.meta.dirname, "..")
  const real = buildRegistry(SITE).items
  const clientItems = real.filter((i) => i.name.startsWith("client-"))
  const byName = new Map(clientItems.map((i) => [i.name, i]))
  const nameOf = (url: string) => url.replace(/^.*\//, "").replace(/\.json$/, "")

  const closure = (name: string, seen = new Set<string>()): Set<string> => {
    const files = new Set<string>()
    if (seen.has(name)) return files
    seen.add(name)
    const found = byName.get(name)
    if (!found) throw new Error(`unknown registry item ${name}`)
    for (const f of found.files ?? []) files.add(f.path)
    for (const dep of found.registryDependencies ?? []) for (const f of closure(nameOf(dep), seen)) files.add(f)
    return files
  }
  const shipped = clientItems.flatMap((i) => (i.files ?? []).map((f) => ({ item: i.name, path: f.path })))

  it("has an item per meta, a base, and a look per theme file", () => {
    const ids = readdirSync(join(repo, "src/client/components"))
    const looks = readdirSync(join(repo, "src/client/tokens/themes")).map((f) => f.replace(/\.css$/, ""))
    expect(clientItems.map((i) => i.name).sort()).toEqual(
      ["client-base", ...ids.map((id) => `client-${id}`), ...looks.map((id) => `client-look-${id}`)].sort(),
    )
  })

  it("ships files that exist, never tests, metas, lint helpers or all.css", () => {
    for (const { path } of shipped) {
      expect(existsSync(join(repo, path)), path).toBe(true)
      expect(path).not.toMatch(/\.(test|meta)\.tsx?$|tokens\/lint\.ts$|tokens\/all\.css$/)
    }
  })

  it("ships no file imported with @/ or from the lint helpers", () => {
    for (const { path } of shipped.filter((s) => /\.tsx?$/.test(s.path))) {
      for (const spec of importSpecifiers(readFileSync(join(repo, path), "utf8"), path)) {
        expect(spec, path).not.toMatch(/^@\/|tokens\/lint/)
      }
    }
  })

  it("resolves every relative import and CSS import inside the item and its dependencies", () => {
    for (const item of clientItems) {
      const available = closure(item.name)
      for (const { path } of (item.files ?? []).map((f) => ({ path: f.path }))) {
        const text = readFileSync(join(repo, path), "utf8")
        const specs = /\.tsx?$/.test(path)
          ? importSpecifiers(text, path)
          : [...text.matchAll(/@import\s+(?:url\()?["']([^"']+)["']/g)].map((m) => m[1])
        for (const spec of specs.filter((s) => s.startsWith("."))) {
          const base = normalize(join(dirname(path), spec))
          const found = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"].map((e) => base + e).find((p) => available.has(p))
          expect(found, `${path} imports ${spec}, which ${item.name} does not ship`).toBeDefined()
        }
      }
    }
  })

  it("starts every shipped client component that needs it with 'use client'", () => {
    const tsx = shipped.filter((s) => s.path.endsWith(".tsx"))
    expect(tsx.length).toBeGreaterThan(5)
    for (const { path } of tsx) {
      const text = readFileSync(join(repo, path), "utf8")
      if (needsClient(text)) expect(text.split("\n")[0]?.trim(), path).toMatch(/^['"]use client['"];?$/)
    }
  })
})
