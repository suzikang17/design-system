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
    expect(resolveHomepage({ SITE_URL: "https://ds.example.com/", CI: "true" })).toBe("https://ds.example.com")
  })

  it("fails a CI or Cloudflare Workers Builds build that has no address", () => {
    expect(() => resolveHomepage({ CI: "true" })).toThrow(/SITE_URL/)
    expect(() => resolveHomepage({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "main" })).toThrow(/SITE_URL/)
  })

  it("ignores the old Vercel variables", () => {
    expect(resolveHomepage({ VERCEL: "1", VERCEL_URL: "x.vercel.app" })).toBe("http://localhost:4173")
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
    `import { defineMeta } from '@/client/catalog/meta'\nexport default defineMeta({ id: '${id}', name: 'The ${id} piece', summary: 'The ${id}.', files: ${files}, ${extra} })\n`
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
  write("src/client/tokens/contract.ts", "export const THEMES = [\n  { id: 'wecuratelife', label: 'We Curate Life' },\n]\n")
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
    expect(button?.title).toBe("The button piece")
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
    expect(look?.title).toBe("We Curate Life look")
    expect(find("client-look-neutral")?.title).toBe("Neutral look")
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

  it("refuses to ship tests, metas, dev-only token files and files outside the component's folder", () => {
    const withFiles = (files: string) => {
      write("src/client/components/bad/bad.tsx", "export {}\n")
      write("src/client/components/bad/bad.meta.ts", meta("bad", "", files))
      return () => build()
    }
    expect(withFiles("['src/client/tokens/lint.ts']")).toThrow(/bad.*lint\.ts.*cannot be shipped/)
    expect(withFiles("['src/client/tokens/all.css']")).toThrow(/all\.css.*cannot be shipped/)
    expect(withFiles("['src/client/tokens/base.css']")).toThrow(/outside src\/client\/components\/bad\//)
    expect(withFiles("['src/client/components/button/button.tsx']")).toThrow(/outside src\/client\/components\/bad\//)
    expect(withFiles("['src/client/components/bad/bad.tsx']")).not.toThrow()
    rmSync(join(root, "src/client/components/bad"), { recursive: true })
  })

  it("names the file that imports a missing package in client-base", () => {
    write("src/client/hooks/useBad.ts", "import 'left-pad'\nexport {}\n")
    expect(() => build()).toThrow(/src\/client\/hooks\/useBad\.ts imports "left-pad"/)
    rmSync(join(root, "src/client/hooks/useBad.ts"))
  })

  it("still refuses two items with one name", () => {
    write("src/client/components/base/base.tsx", "export {}\n")
    write("src/client/components/base/base.meta.ts", meta("base", "", "['src/client/components/base/base.tsx']"))
    // client-base is generated, a client component named "base" collides with it
    expect(() => build()).toThrow(/Two registry items are named "client-base"/)
    rmSync(join(root, "src/client/components/base"), { recursive: true })
  })
})

/**
 * Every relative specifier in the items' shipped files (imports in .ts/.tsx; `@import` and `url(...)` in CSS, other
 * than the node_modules font urls) and the ones that no file of the item or its dependencies satisfies.
 */
function unresolvedReferences(items: RegistryItem[], readFile: (path: string) => string) {
  const byName = new Map(items.map((i) => [i.name, i]))
  const closure = (name: string, seen = new Set<string>()): Set<string> => {
    const files = new Set<string>()
    if (seen.has(name)) return files
    seen.add(name)
    const found = byName.get(name)
    if (!found) throw new Error(`unknown registry item ${name}`)
    for (const f of found.files ?? []) files.add(f.path)
    for (const dep of found.registryDependencies ?? []) for (const f of closure(dep.replace(/^.*\//, "").replace(/\.json$/, ""), seen)) files.add(f)
    return files
  }
  const checked: { from: string; spec: string }[] = []
  const problems: string[] = []
  for (const item of items) {
    const available = closure(item.name)
    for (const { path } of item.files ?? []) {
      const text = readFile(path)
      const specs = /\.tsx?$/.test(path)
        ? importSpecifiers(text, path)
        : [...text.matchAll(/@import\s+(?:url\()?\s*["']([^"']+)["']|url\(\s*["']?([^"')]+?)["']?\s*\)/g)].map((m) => m[1] ?? m[2])
      for (const spec of specs.filter((s) => s.startsWith(".") && !s.includes("node_modules/"))) {
        checked.push({ from: path, spec })
        const base = normalize(join(dirname(path), spec))
        const found = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"].map((e) => base + e).find((p) => available.has(p))
        if (!found) problems.push(`${path} imports ${spec}, which ${item.name} does not ship`)
      }
    }
  }
  return { checked, problems }
}

describe("the real client items", () => {
  const repo = join(import.meta.dirname, "..")
  const real = buildRegistry(SITE).items
  const clientItems = real.filter((i) => i.name.startsWith("client-"))
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
    const { checked, problems } = unresolvedReferences(clientItems, (p) => readFileSync(join(repo, p), "utf8"))
    expect(problems).toEqual([])
    // Guard against a vacuous pass: specifiers were found, among them CSS imported from a component.
    expect(checked.length).toBeGreaterThan(0)
    expect(checked.some((c) => c.from.endsWith(".tsx") && c.spec.endsWith(".css"))).toBe(true)
  })

  // These font URLs reach `node_modules` by a relative path, so after copy-out they resolve only when node_modules
  // sits at the consuming project's root (documented on the Using page).
  it("points every look's font url(...) at a file that exists, in a package the look lists", () => {
    const looks = clientItems.filter((i) => i.name.startsWith("client-look-"))
    let urls = 0
    for (const look of looks) {
      for (const f of look.files ?? []) {
        for (const [, pkg, rest] of readFileSync(join(repo, f.path), "utf8").matchAll(/url\(\s*["']?[^"')]*node_modules\/(@fontsource\/[^/"')]+)\/([^"')]+)["']?\s*\)/g)) {
          urls++
          expect(existsSync(join(repo, "node_modules", pkg!, rest!)), `${f.path}: ${pkg}/${rest}`).toBe(true)
          expect(look.dependencies, `${f.path} uses ${pkg}`).toContain(pkg)
        }
      }
    }
    expect(urls).toBeGreaterThan(0)
  })

  it("flags a relative CSS import or url(...) that the item does not ship", () => {
    const root = mkdtempSync(join(tmpdir(), "registry-css-"))
    const put = (path: string, text: string) => {
      mkdirSync(dirname(join(root, path)), { recursive: true })
      writeFileSync(join(root, path), text)
    }
    const dir = "src/client/components/box"
    put("package.json", JSON.stringify({ dependencies: {} }))
    put("src/lib/utils.ts", "export {}\n")
    put(`${dir}/box.tsx`, "import './box.css'\n")
    put(`${dir}/box.css`, '@import "./part.css";\n.a{background:url(./icon.svg)}\n.b{background:url("./gone.svg")}\n@import url("./missing.css");\n')
    put(`${dir}/part.css`, ".p{}\n")
    put(`${dir}/icon.svg`, "<svg/>")
    put(`${dir}/box.meta.ts`, `export default defineMeta({ id: 'box', name: 'Box', summary: 's', files: ['${dir}/box.tsx', '${dir}/box.css', '${dir}/part.css', '${dir}/icon.svg'] })`)
    put("src/client/tokens/base.css", ".ds-root{}\n")
    put("src/client/tokens/contract.ts", "export {}\n")
    const items = buildRegistry(SITE, root).items.filter((i) => i.name.startsWith("client-"))
    const { checked, problems } = unresolvedReferences(items, (p) => readFileSync(join(root, p), "utf8"))
    rmSync(root, { recursive: true, force: true })
    expect(checked.map((c) => c.spec).sort()).toEqual(["./box.css", "./gone.svg", "./icon.svg", "./missing.css", "./part.css"])
    expect(problems.map((p) => p.replace(/^.*imports /, "")).sort()).toEqual(["./gone.svg, which client-box does not ship", "./missing.css, which client-box does not ship"])
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
