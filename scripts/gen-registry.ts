/**
 * Writes registry.json from the files on disk. Never edit registry.json by
 * hand; run `pnpm gen:registry` (the build runs it first).
 *
 * - src/lib/utils.ts            → the `utils` item (registry:lib)
 * - src/hooks/<name>.ts(x)      → one registry:hook item each
 * - src/components/ui/<name>.tsx → one registry:ui item each, with
 *   `<name>.data.ts` attached when it exists, and its title and description
 *   from `<name>.showcase.tsx`
 * - src/styles/themes/<id>.css  → one registry:theme item each
 *
 * Showcases and tests are not items. Imports become dependencies: npm
 * packages and the peers they need, as bare names unless PINNED lists them,
 * and registry items, as URLs on this site, because the shadcn CLI resolves
 * a bare name such as `button` against ui.shadcn.com. Tailwind theme keys
 * an item uses, beyond what `shadcn init` writes, ship with that item.
 *
 * `--port <n>` names the local port the site is served on when no public
 * address is set (default 4173, the port of `vite preview`).
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import ts from "typescript"

import { isSourceFile, parseShowcaseMeta, titleFromName } from "../src/catalog/parse"
import { themes } from "../src/themes"
import tailwindConfig from "../tailwind.config"

/**
 * Packages whose major version the component code depends on. They are
 * published with this repo's range from package.json, so the CLI installs
 * that major. Every other package is published as a bare name, which the
 * CLI skips when the project already has it, instead of reinstalling it at
 * this repo's version.
 */
export const PINNED: Record<string, string> = {
  "react-day-picker": "calendar.tsx uses the v8 classNames keys and IconLeft/IconRight components; v9 replaced both.",
  recharts: "chart.tsx reads payload and label from the v2 Tooltip and Legend props; v3 removed them.",
  "@tanstack/react-table": "the data-table files use the v8 useReactTable and get*RowModel API; v9 replaced it.",
  "react-resizable-panels": "resizable.tsx uses PanelGroup and PanelResizeHandle; v4 renamed them.",
}

/** Colors that `shadcn init` writes into a Tailwind 3 config. Items carry any other color they use. */
const INIT_COLORS = new Set([
  "background", "foreground", "card", "popover", "primary", "secondary", "muted",
  "accent", "destructive", "border", "input", "ring", "chart",
])

const REACT = new Set(["react", "react-dom", "@types/react", "@types/react-dom"])

/**
 * Every module a source file imports or re-exports, in first-seen order,
 * read from its syntax tree: imports and exports with `from`, side-effect
 * imports, `import()` and `import("x").Type`. Text in comments and strings
 * is not an import.
 */
export function importSpecifiers(source: string, fileName = "file.tsx"): string[] {
  const found = new Set<string>()
  const kind = fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, false, kind)
  const visit = (node: ts.Node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      found.add(node.moduleSpecifier.text)
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const [arg] = node.arguments
      if (arg && ts.isStringLiteralLike(arg)) found.add(arg.text)
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
      found.add(node.argument.literal.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  return [...found]
}

export interface ImportDeps {
  /** npm package names. */
  packages: string[]
  /** Other items of this registry: components, hooks and `utils`. */
  items: string[]
}

/** The package an import specifier belongs to: `@scope/pkg/sub` → `@scope/pkg`. */
function packageName(specifier: string): string {
  const parts = specifier.split("/")
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

/**
 * Sorts a file's imports into npm packages and registry items. `self` is the
 * file's own item name. Any other `@/` path or a parent-relative import
 * throws, because a registry item cannot carry it.
 */
export function classifyImports(specifiers: string[], self?: string): ImportDeps {
  const packages = new Set<string>()
  const items = new Set<string>()
  for (const spec of specifiers) {
    const local = spec.match(/^(?:@\/components\/ui\/|\.\/)([\w.-]+)$/)
    if (local) {
      const name = local[1]
      // `<name>.data` files ship inside their component's item.
      if (!name.endsWith(".data") && name !== self) items.add(name)
    } else if (spec === "@/lib/utils") {
      items.add("utils")
    } else if (spec.startsWith("@/hooks/")) {
      items.add(spec.slice("@/hooks/".length))
    } else if (spec.startsWith("@/") || spec.startsWith(".")) {
      throw new Error(`Unsupported import "${spec}": a registry item can import @/lib/utils, @/hooks/*, @/components/ui/* and npm packages.`)
    } else {
      const name = packageName(spec)
      if (!REACT.has(name)) packages.add(name)
    }
  }
  return { packages: [...packages].sort(), items: [...items].sort() }
}

/**
 * The site's public address, which item dependencies point at: SITE_URL;
 * on Vercel the production domain for production builds and the
 * deployment's own URL for previews, so a preview's items come from that
 * preview; locally http://localhost:<port>. A CI or Vercel build with no
 * address fails, rather than publish items that point somewhere else.
 */
export function resolveHomepage(env: Record<string, string | undefined>, localPort = 4173): string {
  let url = env.SITE_URL
  if (!url && env.VERCEL) {
    const host = env.VERCEL_ENV === "production" ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL
    if (host) url = `https://${host}`
  }
  if (url) return url.replace(/\/+$/, "")
  if (env.CI || env.VERCEL) {
    throw new Error(
      "registry.json: no public address for the registry. Set SITE_URL to the site's address, for example https://design.example.com.",
    )
  }
  return `http://localhost:${localPort}`
}

type FileType = "registry:ui" | "registry:lib" | "registry:hook"

interface TailwindExtend {
  colors?: Record<string, unknown>
  keyframes?: Record<string, unknown>
  animation?: Record<string, string>
}

export interface RegistryItem {
  name: string
  type: FileType | "registry:theme"
  title?: string
  description?: string
  categories?: string[]
  meta?: Record<string, unknown>
  dependencies?: string[]
  registryDependencies?: string[]
  files?: { path: string; type: FileType }[]
  tailwind?: { config: { theme: { extend: TailwindExtend } } }
  cssVars?: { light?: Record<string, string>; dark?: Record<string, string> }
}

const extend = tailwindConfig.theme.extend as Required<TailwindExtend>

/** The Tailwind theme keys `source` uses that `shadcn init` does not write. */
function tailwindFor(source: string): RegistryItem["tailwind"] {
  const out: TailwindExtend = {}
  for (const [name, value] of Object.entries(extend.colors)) {
    const used = new RegExp(`\\b(?:bg|text|border|ring|ring-offset|outline|fill|stroke|from|via|to|divide|shadow|accent|caret|decoration|placeholder)-${name}\\b`)
    if (!INIT_COLORS.has(name) && used.test(source)) out.colors = { ...out.colors, [name]: value }
  }
  for (const [name, value] of Object.entries(extend.animation)) {
    if (!source.includes(`animate-${name}`)) continue
    const keyframe = value.split(" ")[0]
    out.animation = { ...out.animation, [name]: value }
    out.keyframes = { ...out.keyframes, [keyframe]: extend.keyframes[keyframe] }
  }
  return Object.keys(out).length ? { config: { theme: { extend: out } } } : undefined
}

type Meta = Pick<RegistryItem, "title" | "description" | "categories" | "meta">

/** Builds the registry from the files under `root`, with dependency URLs on `homepage`. */
export function buildRegistry(homepage: string, root = ".") {
  const at = (path: string) => join(root, path)
  const read = (path: string) => readFileSync(at(path), "utf8")
  const pkg = JSON.parse(read("package.json")) as { dependencies?: Record<string, string> }
  const itemUrl = (name: string) => `${homepage}/r/${name}.json`

  /** A package as the registry publishes it: bare, or with this repo's range when pinned. */
  const published = (dep: string, importedBy: string) => {
    if (!PINNED[dep]) return dep
    const range = pkg.dependencies?.[dep]
    if (!range) throw new Error(`${importedBy} imports "${dep}", which is not in package.json dependencies.`)
    return `${dep}@${range}`
  }

  /** Peers a package needs installed beside it, other than React and optional ones. */
  const peersOf = (dep: string): string[] => {
    const manifest = at(`node_modules/${dep}/package.json`)
    if (!existsSync(manifest)) return []
    const { peerDependencies = {}, peerDependenciesMeta = {} } = JSON.parse(readFileSync(manifest, "utf8")) as {
      peerDependencies?: Record<string, string>
      peerDependenciesMeta?: Record<string, { optional?: boolean }>
    }
    return Object.keys(peerDependencies).filter((peer) => !REACT.has(peer) && !peerDependenciesMeta[peer]?.optional)
  }

  function codeItem(name: string, type: FileType, paths: string[], meta: Meta = {}): RegistryItem {
    const deps = paths.map((path) => {
      try {
        return classifyImports(importSpecifiers(read(path), path), name)
      } catch (error) {
        throw new Error(`${path}: ${(error as Error).message}`)
      }
    })
    for (const dep of deps.flatMap((d) => d.packages)) {
      if (!pkg.dependencies?.[dep]) throw new Error(`${paths[0]} imports "${dep}", which is not in package.json dependencies.`)
    }
    const direct = deps.flatMap((d) => d.packages)
    const packages = [...new Set([...direct, ...direct.flatMap(peersOf)])].sort()
    const items = [...new Set(deps.flatMap((d) => d.items))].sort()
    const item: RegistryItem = { name, type, ...meta }
    if (packages.length) item.dependencies = packages.map((dep) => published(dep, paths[0]))
    if (items.length) item.registryDependencies = items.map(itemUrl)
    item.files = paths.map((path) => ({ path, type }))
    const tailwind = tailwindFor(paths.map(read).join("\n"))
    if (tailwind) item.tailwind = tailwind
    return item
  }

  const stem = (file: string) => file.replace(/\.(tsx?|css)$/, "")
  const UI = "src/components/ui"
  const HOOKS = "src/hooks"
  const THEMES = "src/styles/themes"
  const list = (dir: string) => (existsSync(at(dir)) ? readdirSync(at(dir)).sort() : [])

  const libItems = [codeItem("utils", "registry:lib", ["src/lib/utils.ts"], { title: "utils", description: "The cn() class-name helper." })]

  const hookItems = list(HOOKS)
    .filter(isSourceFile)
    .map((file) => codeItem(stem(file), "registry:hook", [`${HOOKS}/${file}`], { title: stem(file) }))

  const uiItems = list(UI)
    .filter((file) => file.endsWith(".tsx") && isSourceFile(file))
    .map((file) => {
      const name = stem(file)
      const paths = [`${UI}/${file}`]
      if (existsSync(at(`${UI}/${name}.data.ts`))) paths.push(`${UI}/${name}.data.ts`)
      const showcase = `${UI}/${name}.showcase.tsx`
      const meta = existsSync(at(showcase)) ? parseShowcaseMeta(read(showcase)) : {}
      return codeItem(name, "registry:ui", paths, {
        title: meta.title ?? titleFromName(name),
        ...(meta.description && { description: meta.description }),
        ...(meta.group && { categories: [meta.group.toLowerCase()] }),
        ...((meta.source || meta.license) && { meta: { source: meta.source, license: meta.license } }),
      })
    })

  const themeItems = list(THEMES)
    .filter((file) => file.endsWith(".css"))
    .map((file): RegistryItem => {
      const id = stem(file)
      const theme = themes.find((t) => t.id === id)
      if (!theme) throw new Error(`${THEMES}/${file} has no entry in src/themes.ts.`)
      const vars = Object.fromEntries(
        [...read(`${THEMES}/${file}`).matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
      )
      return {
        name: id,
        type: "registry:theme",
        title: theme.label,
        description: `The ${theme.label} ${theme.dark ? "dark" : "light"} theme's color tokens and radius.`,
        cssVars: theme.dark ? { dark: vars } : { light: vars },
      }
    })

  const items = [...libItems, ...hookItems, ...uiItems, ...themeItems]
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.name)) throw new Error(`Two registry items are named "${item.name}".`)
    seen.add(item.name)
  }

  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "design-system",
    homepage,
    items,
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const portFlag = process.argv.indexOf("--port")
  const port = portFlag > 0 ? Number(process.argv[portFlag + 1]) : 4173
  const homepage = resolveHomepage(process.env, port)
  const registry = buildRegistry(homepage)
  writeFileSync("registry.json", `${JSON.stringify(registry, null, 2)}\n`)
  const count = (type: string) => registry.items.filter((item) => item.type === type).length
  console.log(`registry.json: ${registry.items.length} items (${count("registry:ui")} components, ${count("registry:theme")} themes) for ${homepage}`)
}
