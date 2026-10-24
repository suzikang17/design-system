import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { entries, entriesByGroup, type CatalogEntry } from "@/catalog"
import { filterPillClass } from "@/components/ui/filter-pill"
import { PillInput } from "@/components/ui/pill-input"
import { useTitle } from "../useTitle"

/** Filter pills step up to a 40px touch target below `md`, like the rest of the pill scale. */
const PILL_HEIGHT = "h-10 md:h-8"

const matches = (entry: CatalogEntry, query: string) => {
  const q = query.trim().toLowerCase()
  return !q || [entry.name, entry.title, entry.description].some((text) => text.toLowerCase().includes(q))
}

export default function ComponentsIndex() {
  useTitle("Components")
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState("")
  const sections = useMemo(() => entriesByGroup(), [])
  const group = sections.some((s) => s.group === params.get("group")) ? params.get("group") : null

  const visible = entries.filter((entry) => (!group || entry.group === group) && matches(entry, query))
  const pickGroup = (next: string | null) => setParams(next ? { group: next } : {}, { replace: true })

  return (
    <div data-ready="">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Components</h1>
        <p className="mt-3 text-muted-foreground">
          {entries.length} components. Each page has live examples, the source, and the command that installs it.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
        <PillInput
          aria-label="Search components"
          placeholder="Search components"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
          containerClassName="lg:w-64 lg:shrink-0"
        />
        <div role="group" aria-label="Filter by group" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          <button type="button" aria-pressed={!group} onClick={() => pickGroup(null)} className={filterPillClass(!group, PILL_HEIGHT)}>
            All
          </button>
          {sections.map((section) => (
            <button
              key={section.group}
              type="button"
              aria-pressed={group === section.group}
              onClick={() => pickGroup(group === section.group ? null : section.group)}
              className={filterPillClass(group === section.group, PILL_HEIGHT)}
            >
              {section.group}
              <span className="tabular-nums text-muted-foreground">{section.entries.length}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length > 0 ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((entry) => (
            <li key={entry.name}>
              <ComponentCard entry={entry} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-muted-foreground">
          Nothing matches “{query}”{group ? ` in ${group}` : ""}.{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setQuery("")
              pickGroup(null)
            }}
          >
            Show all components
          </button>
        </p>
      )}
    </div>
  )
}

function ComponentCard({ entry }: { entry: CatalogEntry }) {
  return (
    <Link
      to={`/components/${entry.name}`}
      className="flex h-full flex-col rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:border-primary/50"
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-medium">{entry.title}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{entry.group}</span>
      </span>
      {entry.description && <span className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{entry.description}</span>}
      {!entry.hasShowcase && (
        <span className="mt-3 w-fit rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
          No examples yet
        </span>
      )}
    </Link>
  )
}
