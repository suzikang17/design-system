import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Link, UNSAFE_NavigationContext, useLocation, useNavigate, useParams } from "react-router-dom"
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
import { isThemeId } from "@/client/tokens/contract"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClientChoice } from "./clientChoice"
import ClientNotFound from "./ClientNotFound"
import { clientItemPage, installCommand, pieceTitle } from "./model"
import { Controls } from "./parts/Controls"
import { PreviewFrame } from "./parts/PreviewFrame"
import { SizeSwitch, type PreviewSize } from "./parts/SizeSwitch"

/** Every shipped source file of a piece, as text, loaded when its page shows it. */
const sources = import.meta.glob<string>(
  ["/src/client/components/**/*.{tsx,css}", "!/src/client/components/**/*.test.tsx"],
  { query: "?raw", import: "default" },
)

/** Quiet time after the last edit before the address is written. */
const ADDRESS_DELAY = 200

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
  // The look is the client picked in the side nav, unless the address names one (a shared link), which then
  // becomes the pick. "All clients" shows the piece in the look of the site it came from.
  const { choice, setChoice } = useClientChoice()
  const namedLook = (search: string) => {
    const look = new URLSearchParams(search).get("look")
    return isThemeId(look) ? look : undefined
  }
  const [state, setState] = useState<PreviewState>(() => {
    const decoded = decodeState(meta, location.search)
    return namedLook(location.search) || choice === "all" ? decoded : { ...decoded, theme: choice }
  })
  const [size, setSize] = useState<PreviewSize>("desktop")
  const [tab, setTab] = useState("preview")
  const search = encodeState(meta, state)

  // The address mirrors the state, but is written at most once per ADDRESS_DELAY after the last edit: Safari throws
  // after 100 replaceState calls in 10 seconds, and a slider or a keystroke makes more. State and the message to the
  // frame are not delayed. `pending` holds the search to write; `written` is the last search this page wrote.
  const { navigator } = useContext(UNSAFE_NavigationContext)
  const here = useRef({ pathname: location.pathname, search: location.search, navigate, navigator })
  here.current = { pathname: location.pathname, search: location.search, navigate, navigator }
  const pending = useRef<{ search: string; timer: ReturnType<typeof setTimeout> } | null>(null)
  const written = useRef(location.search.replace(/^\?/, ""))

  const flush = useCallback(() => {
    const entry = pending.current
    if (!entry) return
    clearTimeout(entry.timer)
    pending.current = null
    const now = here.current
    // Only while this page is still the current address: a Back, Forward or link that already moved on wins.
    const live = (now.navigator as { location?: { pathname: string; search: string } }).location
    if (live && (live.pathname !== now.pathname || live.search !== now.search)) return
    if (entry.search === now.search.replace(/^\?/, "")) return
    written.current = entry.search
    now.navigate({ pathname: now.pathname, search: `?${entry.search}` }, { replace: true })
  }, [])

  const update = (next: PreviewState) => {
    setState(next)
    const nextSearch = encodeState(meta, next)
    if (pending.current) clearTimeout(pending.current.timer)
    pending.current = { search: nextSearch, timer: setTimeout(flush, ADDRESS_DELAY) }
  }

  // While a write waits, any click (a nav link, the header) and leaving the page write it first, so the history entry
  // being left carries the final state; an unmount does the same when the address has not moved on.
  useEffect(() => {
    const onClick = () => flush()
    document.addEventListener("click", onClick, true)
    window.addEventListener("pagehide", flush)
    return () => {
      document.removeEventListener("click", onClick, true)
      window.removeEventListener("pagehide", flush)
      flush()
    }
  }, [flush])

  // On every new location, a search that differs from the encoded local state came from a navigation (a nav
  // link, Back or Forward) rather than from `update`, and wins. The re-derived state re-encodes into `search`,
  // which the frame is sent. Comparing searches, rather than marking history entries, keeps the fields and the
  // address in agreement whichever entry Back lands on. A write still waiting is dropped: the navigation is newer.
  useEffect(() => {
    const now = location.search.replace(/^\?/, "")
    if (now === written.current || now === search) return
    if (pending.current) clearTimeout(pending.current.timer)
    pending.current = null
    written.current = now
    const decoded = decodeState(meta, location.search)
    const named = namedLook(location.search)
    if (named && named !== choice) setChoice(named)
    setState(named || choice === "all" ? decoded : { ...decoded, theme: choice })
    // Only a new location may reset the state; `search` changes with every edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  // A look named in the address this page opened at becomes the pick (a shared link). The page's own address
  // writes do not: editing an option under "All clients" must not turn the pick into one client.
  useEffect(() => {
    const named = namedLook(location.search)
    if (named && named !== choice) setChoice(named)
    // Once, for the address the page opened at; later navigations are handled above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const lastChoice = useRef(choice)
  useEffect(() => {
    if (lastChoice.current === choice) return
    lastChoice.current = choice
    const theme = choice === "all" ? meta.homeTheme : choice
    if (theme !== state.theme) update({ ...state, theme })
    // Only a new pick moves the look.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choice])

  const group = GROUPS.find((g) => g.id === meta.group)
  const loadDependencies = useMemo(() => () => publishedDependencies(`client-${meta.id}`), [meta.id])
  const dependencies = useLoaded(loadDependencies, null)
  const files = useMemo(() => shippedFiles(meta), [meta])
  const command = installCommand(`client-${meta.id}`)

  return (
    <article data-ready={dependencies.state !== "loading" ? "" : undefined}>
      {/* The piece comes first: one line holds its name and the tabs, and the words about it follow the preview.
          The preview tab stays mounted while hidden, so its frame and the options keep their state. Most visitors
          are not developers: how to install a piece, and its code, sit on the Usage tab. */}
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{meta.name}</h1>
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="preview" forceMount hidden={tab !== "preview"} className="mt-0">
      <section aria-labelledby="preview" className="mt-4">
        <h2 id="preview" className="sr-only">
          Preview
        </h2>
        <PreviewFrame meta={meta} search={search} size={size}>
          <SizeSwitch value={size} onChange={setSize} />
        </PreviewFrame>
        <div className="mt-4 max-w-2xl">
          <p className="text-muted-foreground">{meta.summary}</p>
          {(group || meta.seenOn) && (
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {group && (
                <Link to={`/client?group=${group.id}`} className="hover:text-foreground">
                  {group.label}
                </Link>
              )}
              {meta.seenOn && <SeenOn url={meta.seenOn} />}
            </p>
          )}
        </div>
      </section>

      <Section id="options" title="Options">
        <Controls meta={meta} props={state.props} onChange={(props) => update({ ...state, props })} />
      </Section>

        </TabsContent>
        <TabsContent value="usage" className="mt-0 max-w-4xl">
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
        </TabsContent>
      </Tabs>
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
    <span>
      Seen on{" "}
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline">
        {hostOf(url)}
        <ExternalLink aria-hidden="true" className="size-3.5" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </span>
  )
}

function SourceFile({ file, lang, load }: { file: string; lang: "tsx" | "css"; load: () => Promise<string> }) {
  const source = useLoaded(load, "")
  const filename = file.replace(/^src\//, "")
  if (source.state === "loading") return <div aria-busy="true" className="h-24 animate-pulse rounded-lg border bg-card" />
  if (source.state === "failed") return <p className="text-muted-foreground">{filename} did not load. Reload the page to try again.</p>
  return <CodeBlock code={source.value} filename={filename} lang={lang} />
}
