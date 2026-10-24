/**
 * Discovery: every `src/components/ui/<name>.tsx` is a catalog entry, and an
 * optional `<name>.showcase.tsx` beside it adds a title, a group and live
 * examples. Dropping a file in is the whole registration.
 *
 * Every page loads only each showcase's title, group and description, through
 * the `?meta` import that vite.config.ts serves. Source text, examples and
 * dependencies load on the component's own page.
 */
import { titleFromName, type ShowcaseMeta } from "./parse"
import { GROUPS, type Group, type Showcase } from "./types"

export { GROUPS, type Group, type Showcase }

const sources = import.meta.glob<string>(
  ["../components/ui/*.tsx", "!../components/ui/*.showcase.tsx", "!../components/ui/*.test.tsx", "!../components/ui/*.spec.tsx"],
  { query: "?raw", import: "default" },
)
const showcaseMeta = import.meta.glob<ShowcaseMeta>("../components/ui/*.showcase.tsx", {
  query: "?meta",
  import: "default",
  eager: true,
})
const showcaseModules = import.meta.glob<Showcase>("../components/ui/*.showcase.tsx", {
  import: "default",
})
const dataFiles = import.meta.glob<string>("../components/ui/*.data.ts", { query: "?raw", import: "default" })

/** Shown in the nav for components that have no showcase file yet. */
export const UNGROUPED = "Ungrouped"

export interface PublishedDependencies {
  /** npm packages, with the version range only where the registry pins one. */
  packages: { name: string; version?: string }[]
  /** Other items of this registry. */
  items: string[]
}

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
  /** The text of `<name>.data.ts`, which ships in the same registry item. */
  loadData?: () => Promise<string>
  /** What installing the component pulls in, read from its published registry item. */
  loadDependencies: () => Promise<PublishedDependencies>
}

/** The dependencies of `/r/<name>.json`, as the shadcn CLI will install them. */
async function publishedDependencies(name: string): Promise<PublishedDependencies> {
  const response = await fetch(`/r/${name}.json`)
  if (!response.ok) throw new Error(`/r/${name}.json answered ${response.status}`)
  const item = (await response.json()) as { dependencies?: string[]; registryDependencies?: string[] }
  return {
    packages: (item.dependencies ?? []).map((dep) => {
      const at = dep.indexOf("@", 1)
      return at > 0 ? { name: dep.slice(0, at), version: dep.slice(at + 1) } : { name: dep }
    }),
    items: (item.registryDependencies ?? []).map((url) => url.replace(/^.*\/r\//, "").replace(/\.json$/, "")),
  }
}

const nameOf = (path: string) => path.split("/").pop()!.replace(/(\.showcase)?\.tsx$/, "")
const showcasePath = (name: string) => `../components/ui/${name}.showcase.tsx`

export const entries: CatalogEntry[] = Object.keys(sources)
  .map((path): CatalogEntry => {
    const name = nameOf(path)
    const meta = showcaseMeta[showcasePath(name)]
    return {
      name,
      title: meta?.title ?? titleFromName(name),
      group: (meta?.group as Group | undefined) ?? UNGROUPED,
      description: meta?.description ?? "",
      source: meta?.source,
      license: meta?.license,
      hasShowcase: Boolean(meta),
      loadSource: sources[path],
      loadShowcase: showcaseModules[showcasePath(name)],
      loadData: dataFiles[`../components/ui/${name}.data.ts`],
      loadDependencies: () => publishedDependencies(name),
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
