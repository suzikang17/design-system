/**
 * Reads component and showcase files as text. Shared by the site and by
 * `scripts/gen-registry.ts`, so the catalog and the registry agree.
 */

/** A component, hook or data file: not a showcase and not a test. */
export function isSourceFile(file: string): boolean {
  return /\.tsx?$/.test(file) && !/\.(showcase|test|spec)\.tsx?$/.test(file)
}

/** Every module a source file imports or re-exports, in first-seen order. */
export function importSpecifiers(source: string): string[] {
  const found = new Set<string>()
  const pattern = /\bfrom\s*["']([^"']+)["']|\bimport\s*\(?\s*["']([^"']+)["']/g
  for (const match of source.matchAll(pattern)) found.add(match[1] ?? match[2])
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
      if (name !== "react" && name !== "react-dom") packages.add(name)
    }
  }
  return { packages: [...packages].sort(), items: [...items].sort() }
}

export interface ShowcaseMeta {
  title?: string
  group?: string
  description?: string
  source?: { name: string; url: string }
  license?: string
}

/**
 * The literal fields of a showcase file's default export, read from its text.
 * Only the part before `examples:` is read, and only double-quoted strings.
 */
export function parseShowcaseMeta(source: string): ShowcaseMeta {
  const start = source.indexOf("export default")
  if (start < 0) return {}
  const rest = source.slice(start)
  const end = rest.search(/\bexamples\s*:/)
  const head = end < 0 ? rest : rest.slice(0, end)

  const string = (text: string, key: string): string | undefined => {
    const match = text.match(new RegExp(`\\b${key}\\s*:\\s*("(?:[^"\\\\\\n]|\\\\.)*")`))
    return match ? (JSON.parse(match[1]) as string) : undefined
  }

  const sourceBlock = head.match(/\bsource\s*:\s*\{([^}]*)\}/)
  const outside = sourceBlock ? head.replace(sourceBlock[0], "") : head
  const meta: ShowcaseMeta = {}
  for (const key of ["title", "group", "description", "license"] as const) {
    const value = string(outside, key)
    if (value !== undefined) meta[key] = value
  }
  if (sourceBlock) {
    const name = string(sourceBlock[1], "name")
    const url = string(sourceBlock[1], "url")
    if (name && url) meta.source = { name, url }
  }
  return meta
}

/** "date-range-sheet" → "Date Range Sheet". */
export function titleFromName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
