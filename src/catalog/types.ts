import type { JSX } from "react"

/** Nav order of the catalog's groups. */
export const GROUPS = [
  "Inputs",
  "Controls",
  "Navigation",
  "Overlays",
  "Feedback",
  "Data",
  "Layout",
  "Adopted",
] as const

export type Group = (typeof GROUPS)[number]

/**
 * The default export of `src/components/ui/<name>.showcase.tsx`.
 *
 * Write `title`, `group`, `description`, `source` and `license` as plain
 * double-quoted strings before `examples`: the catalog index and the registry
 * read them from the file's text without running it.
 */
export interface Showcase {
  title: string
  group: Group
  description: string
  /** Where an adopted component came from. */
  source?: { name: string; url: string }
  license?: string
  examples: Record<string, () => JSX.Element>
}
