import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { ExternalLink } from "lucide-react"

import { publishedDependencies } from "@/catalog"
import type { ComponentMeta } from "@/client/catalog/meta"
import { GROUPS, getMeta } from "@/client/catalog/registry"
import { decodeState, encodeState, type PreviewState } from "@/client/catalog/state"
import { CodeBlock } from "../CodeBlock"
import { CopyButton } from "../CopyButton"
import { Dependencies, Section } from "../DetailSections"
import { useLoaded } from "../useLoaded"
import { useTitle } from "../useTitle"
import ClientNotFound from "./ClientNotFound"
import { clientItemPage, installCommand, pieceTitle } from "./model"
import { Controls } from "./parts/Controls"
import { LookSwitch } from "./parts/LookSwitch"
import { PreviewFrame } from "./parts/PreviewFrame"
import { SizeSwitch, type PreviewSize } from "./parts/SizeSwitch"

/** Every shipped source file of a piece, as text, loaded when its page shows it. */
const sources = import.meta.glob<string>(
  ["/src/client/components/**/*.{tsx,css}", "!/src/client/components/**/*.test.tsx"],
  { query: "?raw", import: "default" },
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- a meta of any piece, as in the registry
type AnyMeta = ComponentMeta<any>

export default function ClientPiece() {
  const { id } = useParams()
  const meta = id ? getMeta(id) : undefined
  if (!meta) return <ClientNotFound />
  // Keyed, so moving to another piece starts from that piece's address and mounts a new frame.
  return <Piece key={meta.id} meta={meta} />
}

/** The `.tsx` and `.css` files a piece ships, with a loader for each. */
function shippedFiles(meta: AnyMeta) {
  return meta.files
    .filter((file: string) => /\.(tsx|css)$/.test(file))
    .map((file: string) => ({ file, lang: file.endsWith(".css") ? ("css" as const) : ("tsx" as const), load: sources[`/${file}`] }))
    .filter((entry: { load?: () => Promise<string> }) => entry.load !== undefined)
}

function Piece({ meta }: { meta: AnyMeta }) {
  useTitle(pieceTitle(meta.name))
  const location = useLocation()
  const navigate = useNavigate()
  // Local state drives the fields (no lag while typing); the address mirrors it, for sharing and reloads.
  const [state, setState] = useState<PreviewState>(() => decodeState(meta, location.search))
  const [size, setSize] = useState<PreviewSize>("desktop")
  const search = encodeState(meta, state)

  const update = (next: PreviewState) => {
    setState(next)
    navigate({ pathname: location.pathname, search: `?${encodeState(meta, next)}` }, { replace: true })
  }

  // On every new location, a search that differs from the encoded local state came from a navigation (a nav
  // link, Back or Forward) rather than from `update`, and wins. The re-derived state re-encodes into `search`,
  // which the frame is sent. Comparing searches, rather than marking history entries, keeps the fields and the
  // address in agreement whichever entry Back lands on.
  useEffect(() => {
    if (location.search.replace(/^\?/, "") !== search) setState(decodeState(meta, location.search))
    // Only a new location may reset the state; `search` changes with every edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const group = GROUPS.find((g) => g.id === meta.group)
  const loadDependencies = useMemo(() => () => publishedDependencies(`client-${meta.id}`), [meta.id])
  const dependencies = useLoaded(loadDependencies, null)
  const files = useMemo(() => shippedFiles(meta), [meta])
  const command = installCommand(`client-${meta.id}`)

  return (
    <article data-ready={dependencies.state !== "loading" ? "" : undefined}>
      <div className="max-w-3xl">
        {group && (
          <Link to={`/client?group=${group.id}`} className="text-sm text-muted-foreground hover:text-foreground">
            {group.label}
          </Link>
        )}
        <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{meta.name}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{meta.summary}</p>
        {meta.seenOn && <SeenOn url={meta.seenOn} />}
      </div>

      <section aria-labelledby="preview" className="mt-10">
        <h2 id="preview" className="sr-only">
          Preview
        </h2>
        <div className="mb-3">
          <LookSwitch value={state.theme} onChange={(theme) => update({ ...state, theme })} />
        </div>
        <PreviewFrame meta={meta} search={search} size={size}>
          <SizeSwitch value={size} onChange={setSize} />
        </PreviewFrame>
      </section>

      <Section id="options" title="Options">
        <Controls meta={meta} props={state.props} onChange={(props) => update({ ...state, props })} />
      </Section>

      <div className="max-w-4xl">
        <Section id="install" title="Install">
          <div className="flex items-center gap-2 rounded-lg border bg-card py-1 pl-4 pr-1">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-2 font-mono text-[13px]">{command}</code>
            <CopyButton value={command} label="Copy install command" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            The first time, a project also needs the base and a look.{" "}
            <Link to="/client/using" className="font-medium text-primary underline-offset-4 hover:underline">
              Setting up a project
            </Link>
          </p>
          <div className="mt-6">
            <CodeBlock code={meta.usage} filename="Usage" />
          </div>
        </Section>

        {dependencies.state === "ready" && dependencies.value && <Dependencies {...dependencies.value} pageOf={clientItemPage} />}

        <Section id="source" title="Source">
          <div className="space-y-4">
            {files.map(({ file, lang, load }: ReturnType<typeof shippedFiles>[number]) => (
              <SourceFile key={file} file={file} lang={lang} load={load!} />
            ))}
          </div>
        </Section>
      </div>
    </article>
  )
}

const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, "")
  } catch {
    return url
  }
}

function SeenOn({ url }: { url: string }) {
  return (
    <p className="mt-3 text-sm text-muted-foreground">
      Seen on{" "}
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline">
        {hostOf(url)}
        <ExternalLink aria-hidden="true" className="size-3.5" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </p>
  )
}

function SourceFile({ file, lang, load }: { file: string; lang: "tsx" | "css"; load: () => Promise<string> }) {
  const source = useLoaded(load, "")
  const filename = file.replace(/^src\//, "")
  if (source.state === "loading") return <div aria-busy="true" className="h-24 animate-pulse rounded-lg border bg-card" />
  if (source.state === "failed") return <p className="text-muted-foreground">{filename} did not load. Reload the page to try again.</p>
  return <CodeBlock code={source.value} filename={filename} lang={lang} />
}
