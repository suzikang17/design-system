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
 * Imports become dependencies: npm packages (with the version range from
 * package.json) and registry items (as URLs on this site, because the shadcn
 * CLI resolves a bare name such as `button` against ui.shadcn.com).
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { classifyImports, importSpecifiers, parseShowcaseMeta, titleFromName } from "../src/catalog/parse"
import { themes } from "../src/themes"

const UI = "src/components/ui"
const HOOKS = "src/hooks"
const THEMES = "src/styles/themes"

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
const PLACEHOLDER = "https://design-system.vercel.app"
const homepage = (process.env.SITE_URL || (vercelUrl ? `https://${vercelUrl}` : PLACEHOLDER)).replace(/\/+$/, "")
if (homepage === PLACEHOLDER) {
  console.warn(
    `registry.json: SITE_URL is not set, so item dependencies point at the placeholder ${PLACEHOLDER}. ` +
      "Set SITE_URL to this site's address before you publish the registry.",
  )
}

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { dependencies: Record<string, string> }
const read = (path: string) => readFileSync(path, "utf8")
const itemUrl = (name: string) => `${homepage}/r/${name}.json`

type FileType = "registry:ui" | "registry:lib" | "registry:hook"

interface RegistryItem {
  name: string
  type: FileType | "registry:theme"
  title?: string
  description?: string
  categories?: string[]
  meta?: Record<string, unknown>
  dependencies?: string[]
  registryDependencies?: string[]
  files?: { path: string; type: FileType }[]
  cssVars?: { light?: Record<string, string>; dark?: Record<string, string> }
}

type Meta = Pick<RegistryItem, "title" | "description" | "categories" | "meta">

function codeItem(name: string, type: FileType, paths: string[], meta: Meta = {}): RegistryItem {
  const deps = paths.map((path) => {
    try {
      return classifyImports(importSpecifiers(read(path)), name)
    } catch (error) {
      throw new Error(`${path}: ${(error as Error).message}`)
    }
  })
  const packages = [...new Set(deps.flatMap((d) => d.packages))].sort()
  const items = [...new Set(deps.flatMap((d) => d.items))].sort()
  const item: RegistryItem = { name, type, ...meta }
  if (packages.length) {
    item.dependencies = packages.map((dep) => {
      const range = pkg.dependencies[dep]
      if (!range) throw new Error(`${paths[0]} imports "${dep}", which is not in package.json dependencies.`)
      return `${dep}@${range}`
    })
  }
  if (items.length) item.registryDependencies = items.map(itemUrl)
  item.files = paths.map((path) => ({ path, type }))
  return item
}

const stem = (file: string) => file.replace(/\.(tsx?|css)$/, "")

const libItems = [codeItem("utils", "registry:lib", ["src/lib/utils.ts"], { title: "utils", description: "The cn() class-name helper." })]

const hookItems = readdirSync(HOOKS)
  .filter((file) => /\.tsx?$/.test(file))
  .sort()
  .map((file) => codeItem(stem(file), "registry:hook", [`${HOOKS}/${file}`], { title: stem(file) }))

const uiItems = readdirSync(UI)
  .filter((file) => file.endsWith(".tsx") && !file.endsWith(".showcase.tsx"))
  .sort()
  .map((file) => {
    const name = stem(file)
    const paths = [`${UI}/${file}`]
    if (existsSync(`${UI}/${name}.data.ts`)) paths.push(`${UI}/${name}.data.ts`)
    const showcase = `${UI}/${name}.showcase.tsx`
    const meta = existsSync(showcase) ? parseShowcaseMeta(read(showcase)) : {}
    return codeItem(name, "registry:ui", paths, {
      title: meta.title ?? titleFromName(name),
      ...(meta.description && { description: meta.description }),
      ...(meta.group && { categories: [meta.group.toLowerCase()] }),
      ...((meta.source || meta.license) && { meta: { source: meta.source, license: meta.license } }),
    })
  })

const themeItems = readdirSync(THEMES)
  .filter((file) => file.endsWith(".css"))
  .sort()
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

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "design-system",
  homepage,
  items,
}
writeFileSync("registry.json", `${JSON.stringify(registry, null, 2)}\n`)
console.log(`registry.json: ${items.length} items (${uiItems.length} components, ${themeItems.length} themes) for ${homepage}`)
