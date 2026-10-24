/**
 * Discovery: every `src/components/ui/<name>.tsx` is a catalog entry, and an
 * optional `<name>.showcase.tsx` beside it adds a title, a group and live
 * examples. Dropping a file in is the whole registration.
 */
import { dependencies as packageVersions } from "../../package.json"
import { classifyImports, importSpecifiers, parseShowcaseMeta, titleFromName } from "./parse"
import { GROUPS, type Group, type Showcase } from "./types"

export { GROUPS, type Group, type Showcase }

const sources = import.meta.glob<string>(
  ["../components/ui/*.tsx", "!../components/ui/*.showcase.tsx"],
  { query: "?raw", import: "default" },
)
const showcaseText = import.meta.glob<string>("../components/ui/*.showcase.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})
const showcaseModules = import.meta.glob<Showcase>("../components/ui/*.showcase.tsx", {
  import: "default",
})

/** Shown in the nav for components that have no showcase file yet. */
export const UNGROUPED = "Ungrouped"

export interface CatalogEntry {
  name: string
  title: string
  group: Group | typeof UNGROUPED
  description: string
  source?: { name: string; url: string }
  license?: string
  hasShowcase: boolean
  /** The component's own source text. */
  loadSource: () => Promise<string>
  /** The showcase module, when there is one. */
  loadShowcase?: () => Promise<Showcase>
}

const nameOf = (path: string) => path.split("/").pop()!.replace(/(\.showcase)?\.tsx$/, "")
const showcasePath = (name: string) => `../components/ui/${name}.showcase.tsx`

export const entries: CatalogEntry[] = Object.keys(sources)
  .map((path): CatalogEntry => {
    const name = nameOf(path)
    const text = showcaseText[showcasePath(name)]
    const meta = text ? parseShowcaseMeta(text) : {}
    return {
      name,
      title: meta.title ?? titleFromName(name),
      group: (meta.group as Group | undefined) ?? UNGROUPED,
      description: meta.description ?? "",
      source: meta.source,
      license: meta.license,
      hasShowcase: Boolean(text),
      loadSource: sources[path],
      loadShowcase: showcaseModules[showcasePath(name)],
    }
  })
  .sort((a, b) => a.title.localeCompare(b.title))

export function getEntry(name: string | undefined): CatalogEntry | undefined {
  return entries.find((entry) => entry.name === name)
}

/** Entries by group, in nav order; empty groups are left out. */
export function entriesByGroup(list: CatalogEntry[] = entries) {
  return [...GROUPS, UNGROUPED]
    .map((group) => ({ group, entries: list.filter((entry) => entry.group === group) }))
    .filter((section) => section.entries.length > 0)
}

export interface Dependency {
  name: string
  /** The version range from package.json, for npm packages. */
  version?: string
  /** True when the dependency is another component in this catalog. */
  isComponent: boolean
}

/** What installing a component pulls in, read from its imports. */
export function dependenciesOf(name: string, source: string) {
  const { packages, items } = classifyImports(importSpecifiers(source), name)
  const versions: Record<string, string> = packageVersions
  return {
    packages: packages.map((pkg): Dependency => ({ name: pkg, version: versions[pkg], isComponent: false })),
    items: items.map((item): Dependency => ({ name: item, isComponent: Boolean(getEntry(item)) })),
  }
}
