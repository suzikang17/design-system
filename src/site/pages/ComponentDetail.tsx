import { Component, type ReactNode } from "react"
import { Link, useParams } from "react-router-dom"

import { getEntry, type CatalogEntry, type PublishedDependencies, type Showcase } from "@/catalog"
import { CodeBlock } from "../CodeBlock"
import { CopyButton } from "../CopyButton"
import { Dependencies, Section } from "../DetailSections"
import { safeHref } from "../safeHref"
import { useLoaded } from "../useLoaded"
import { useTitle } from "../useTitle"
import NotFound from "./NotFound"

export default function ComponentDetail() {
  const { name } = useParams()
  const entry = getEntry(name)
  if (!entry) return <NotFound what="component" />
  return <Detail key={entry.name} entry={entry} />
}

function Detail({ entry }: { entry: CatalogEntry }) {
  useTitle(entry.title)
  const source = useLoaded(entry.loadSource, "")
  const data = useLoaded(entry.loadData, "")
  const showcase = useLoaded<Showcase | null>(entry.loadShowcase, null)
  const dependencies = useLoaded<PublishedDependencies | null>(entry.loadDependencies, null)
  const ready = [source, data, showcase, dependencies].every((loaded) => loaded.state !== "loading")
  const sourceHref = entry.source && safeHref(entry.source.url)
  const command = `pnpm dlx shadcn@latest add ${window.location.origin}/r/${entry.name}.json`

  return (
    <article data-ready={ready ? "" : undefined} className="max-w-4xl">
      <Link to={`/components?group=${entry.group}`} className="text-sm text-muted-foreground hover:text-foreground">
        {entry.group}
      </Link>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{entry.title}</h1>
      {entry.description && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{entry.description}</p>}
      {entry.source && (
        <p className="mt-3 text-sm text-muted-foreground">
          Adapted from{" "}
          {sourceHref ? (
            <a href={sourceHref} className="font-medium text-primary underline-offset-4 hover:underline">
              {entry.source.name}
            </a>
          ) : (
            <span className="font-medium text-foreground">{entry.source.name}</span>
          )}
          {entry.license ? `, used under the ${entry.license} license.` : "."}
        </p>
      )}

      <Section id="install" title="Install">
        <div className="flex items-center gap-2 rounded-lg border bg-card py-1 pl-4 pr-1">
          <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-2 font-mono text-[13px]">{command}</code>
          <CopyButton value={command} label="Copy install command" />
        </div>
      </Section>

      <Section id="examples" title="Examples">
        {showcase.state === "ready" && showcase.value ? (
          <div className="space-y-8">
            {Object.entries(showcase.value.examples).map(([label, Example]) => (
              <figure key={label}>
                <figcaption className="mb-2 text-sm font-medium">{label}</figcaption>
                <div className="stage">
                  <ExampleBoundary>
                    <Example />
                  </ExampleBoundary>
                </div>
              </figure>
            ))}
          </div>
        ) : showcase.state === "loading" ? (
          <div className="stage animate-pulse" aria-busy="true" />
        ) : showcase.state === "failed" ? (
          <p className="text-muted-foreground">The examples did not load. Reload the page to try again.</p>
        ) : (
          <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No examples yet. Add <code className="font-mono text-foreground">{entry.name}.showcase.tsx</code> next to the
            component to show it here.
          </p>
        )}
      </Section>

      {source.state === "ready" && data.state !== "loading" && (
        <>
          {dependencies.state === "ready" && dependencies.value && <Dependencies {...dependencies.value} />}
          <Section id="source" title="Source">
            <div className="space-y-4">
              <CodeBlock code={source.value} filename={`components/ui/${entry.name}.tsx`} />
              {data.state === "ready" && data.value && (
                <CodeBlock code={data.value} filename={`components/ui/${entry.name}.data.ts`} />
              )}
            </div>
          </Section>
        </>
      )}
      {source.state === "failed" && <p className="mt-12 text-muted-foreground">The source did not load. Reload the page to try again.</p>}
    </article>
  )
}

class ExampleBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {}
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return <p className="text-sm text-destructive">This example failed to render: {this.state.error.message}</p>
    }
    return this.props.children
  }
}
