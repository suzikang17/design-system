import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Check, Link2, Plus, RotateCcw, Trash2 } from "lucide-react"

import { GROUPS } from "@/client/catalog/registry"
import { THEMES } from "@/client/tokens/contract"
import { PillButton } from "@/components/ui/pill"
import { useTitle } from "../useTitle"
import { useClientChoice } from "./clientChoice"
import { Controls } from "./parts/Controls"
import { PreviewFrame } from "./parts/PreviewFrame"
import { SizeSwitch, type PreviewSize } from "./parts/SizeSwitch"
import {
  DEFAULT_LOOK,
  DRAG_TYPE,
  MAX_ITEMS,
  cleanItems,
  decodePage,
  encodeItems,
  encodePage,
  insertAt,
  isPageReport,
  itemProps,
  metaOf,
  starterPage,
  trayPieces,
  withProps,
  type PageItem,
} from "./playground/model"

/** Quiet time after the last change before the address is written (see ClientPiece). */
const ADDRESS_DELAY = 300
const FRAME_TITLE = "Your page"

/**
 * A page to arrange: pieces are dragged from the tray onto a page drawn inside a monitor, tablet or phone, moved
 * up and down, and edited. The page is drawn in the look of the client picked in the side nav. The arrangement
 * lives in the address, so a link to it can be sent to someone.
 */
export default function ClientPlayground() {
  useTitle("Playground · Client work")
  const location = useLocation()
  const navigate = useNavigate()
  const { choice } = useClientChoice()
  const look = choice === "all" ? DEFAULT_LOOK : choice

  // A link that carries a page opens it; otherwise the visitor starts from a whole small site.
  const [items, setItems] = useState<PageItem[]>(() => decodePage(location.search).items ?? starterPage(look))
  const [selected, setSelected] = useState<number | null>(null)
  const [size, setSize] = useState<PreviewSize>("desktop")
  const [copied, setCopied] = useState(false)
  const search = encodePage({ look, items, selected })

  // An untouched starter page follows the picked client: each site lays its sections out its own way.
  const lastLook = useRef(look)
  useEffect(() => {
    const before = lastLook.current
    lastLook.current = look
    if (before !== look && encodeItems(items) === encodeItems(starterPage(before))) setItems(starterPage(look))
    // Only a new look can swap the starter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [look])

  // The page inside the frame reports what the visitor did there. Only this page's own frame is believed.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const frame = document.querySelector<HTMLIFrameElement>(`iframe[title="${FRAME_TITLE}"]`)
      if (!frame || event.source !== frame.contentWindow || event.origin !== window.location.origin) return
      if (!isPageReport(event.data)) return
      const next = cleanItems(event.data.items)
      setItems(next)
      setSelected(event.data.selected !== null && event.data.selected >= 0 && event.data.selected < next.length ? event.data.selected : null)
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  // The address mirrors the page and the look, written once things have been quiet for a moment.
  const share = `look=${look}&page=${encodeItems(items)}`
  const here = useRef({ pathname: location.pathname, search: location.search, navigate })
  here.current = { pathname: location.pathname, search: location.search, navigate }
  useEffect(() => {
    const timer = setTimeout(() => {
      const now = here.current
      if (now.search.replace(/^\?/, "") !== share) now.navigate({ pathname: now.pathname, search: `?${share}` }, { replace: true })
    }, ADDRESS_DELAY)
    return () => clearTimeout(timer)
  }, [share])

  const add = (id: string) => {
    if (items.length >= MAX_ITEMS) return
    setItems(insertAt(items, items.length, { id }))
    setSelected(items.length)
  }

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?${share}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt("Copy this link", url)
    }
  }

  const tray = useMemo(() => trayPieces(), [])
  const current = selected !== null ? items[selected] : undefined
  const currentMeta = current ? metaOf(current) : undefined
  const lookLabel = THEMES.find((theme) => theme.id === look)?.label
  const full = items.length >= MAX_ITEMS

  return (
    <div data-ready="">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Playground</h1>
        <div className="flex flex-wrap items-center gap-2">
          <PillButton
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              setItems(starterPage(look))
              setSelected(null)
            }}
          >
            <RotateCcw aria-hidden="true" />
            Start over
          </PillButton>
          <PillButton
            variant="outline"
            className="gap-1.5"
            disabled={items.length === 0}
            onClick={() => {
              setItems([])
              setSelected(null)
            }}
          >
            <Trash2 aria-hidden="true" />
            Clear page
          </PillButton>
          <PillButton className="gap-1.5" onClick={copyLink}>
            {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
            <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
          </PillButton>
        </div>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Drag pieces onto the page and move them around to try a layout.
        {choice === "all" && <> Shown in the {lookLabel} look: pick a client on the left to change it.</>}
      </p>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <section aria-labelledby="tray" className="min-w-0">
          <h2 id="tray" className="mb-2 text-xs font-semibold text-foreground">
            Pieces
          </h2>
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[46rem] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0 lg:pr-1">
            {tray.map((meta) => (
              <li key={meta.id} className="shrink-0">
                <button
                  type="button"
                  draggable
                  disabled={full}
                  onDragStart={(event) => {
                    event.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ id: meta.id }))
                    event.dataTransfer.effectAllowed = "move"
                  }}
                  onClick={() => add(meta.id)}
                  aria-label={`Add ${meta.name}`}
                  className="group flex w-full cursor-grab items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-left text-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>
                    <span className="block font-medium">{meta.name}</span>
                    <span className="block text-xs text-muted-foreground">{GROUPS.find((group) => group.id === meta.group)?.label}</span>
                  </span>
                  <Plus aria-hidden="true" className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">{full ? `A page holds up to ${MAX_ITEMS} pieces.` : "Drag onto the page, or tap to add at the end."}</p>
        </section>

        <section aria-labelledby="page" className="min-w-0">
          <h2 id="page" className="sr-only">
            Your page
          </h2>
          <PreviewFrame page={{ path: "/client/preview/playground", title: FRAME_TITLE }} search={search} size={size}>
            <SizeSwitch value={size} onChange={setSize} />
          </PreviewFrame>
        </section>
      </div>

      <section aria-labelledby="piece-options" className="mt-10">
        <h2 id="piece-options" className="text-xl font-semibold tracking-tight">
          {currentMeta ? `${currentMeta.name} options` : "Options"}
        </h2>
        <div className="mt-4">
          {current && currentMeta ? (
            <Controls
              // A new selection starts its fields from that piece's values.
              key={`${selected}:${current.id}`}
              meta={currentMeta}
              props={itemProps(current)}
              onChange={(props) => setItems(items.map((item, index) => (index === selected ? withProps(item, props) : item)))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Click a piece on the page to change its words and options.</p>
          )}
        </div>
      </section>
    </div>
  )
}
