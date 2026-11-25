import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { getEntry, type PublishedDependencies } from "@/catalog"

/** A titled section of a detail page; its heading labels it. */
export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-12">
      <h2 id={id} className="mb-4 text-xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}

const componentPage = (name: string) => (getEntry(name) ? `/components/${name}` : undefined)

interface DependenciesProps extends PublishedDependencies {
  /** The site page of a registry item, when it has one. Defaults to the component pages. */
  pageOf?: (name: string) => string | undefined
}

export function Dependencies({ packages, items, pageOf = componentPage }: DependenciesProps) {
  return (
    <Section id="dependencies" title="Dependencies">
      {packages.length + items.length === 0 ? (
        <p className="text-muted-foreground">None beyond React.</p>
      ) : (
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          {packages.length > 0 && (
            <div>
              <dt className="font-medium">Packages</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {packages.map((dep) => (
                  <span key={dep.name} className="rounded-full border bg-card px-2.5 py-0.5 font-mono text-xs">
                    {dep.name}
                    {dep.version && <span className="text-muted-foreground"> {dep.version}</span>}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {items.length > 0 && (
            <div>
              <dt className="font-medium">From this registry</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {items.map((name) => {
                  const page = pageOf(name)
                  return page ? (
                    <Link key={name} to={page} className="rounded-full border bg-card px-2.5 py-0.5 font-mono text-xs text-primary hover:border-primary/50">
                      {name}
                    </Link>
                  ) : (
                    <span key={name} className="rounded-full border bg-card px-2.5 py-0.5 font-mono text-xs">
                      {name}
                    </span>
                  )
                })}
              </dd>
            </div>
          )}
        </dl>
      )}
    </Section>
  )
}
