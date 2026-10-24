/**
 * Reads showcase files as text. Shared by the site (through the `?meta`
 * plugin in vite.config.ts) and by `scripts/gen-registry.ts`, so the catalog
 * and the registry agree.
 */

/** A component, hook or data file: not a showcase and not a test. */
export function isSourceFile(file: string): boolean {
  return /\.tsx?$/.test(file) && !/\.(showcase|test|spec)\.tsx?$/.test(file)
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
