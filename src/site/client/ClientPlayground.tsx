import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Check, Link2, Plus, RotateCcw, Trash2 } from "lucide-react"

import { GROUPS } from "@/client/catalog/registry"
import { THEMES } from "@/client/tokens/contract"
import { PillButton } from "@/components/ui/pill"
import { cn } from "@/lib/utils"
import { useTitle } from "../useTitle"
import { useClientChoice } from "./clientChoice"
import { Controls } from "./parts/Controls"
import { PreviewFrame } from "./parts/PreviewFrame"
import { SizeSwitch, type PreviewSize } from "./parts/SizeSwitch"
import {
  DEFAULT_LOOK,
  DRAG_TYPE,
  MAX_ITEMS,
  STRUCTURES,
  addPath,
  addStructurePath,
  cleanItems,
  countItems,
  decodePage,
  encodeItems,
  encodePage,
  getAt,
  insertAt,
  isSlotPath,
  isPageReport,
  itemProps,
  metaOf,
  replaceAt,
  starterPage,
  structureItem,
  validSelection,
  trayPieces,
  withProps,
  type PageItem,
  type Path,
  type Structure,
} from "./playground/model"

/** Quiet time after the last change before the address is written (see ClientPiece). */
const ADDRESS_DELAY = 300
const FRAME_TITLE = "Your page"

/**
 * A page to arrange: pieces are dragged from the tray onto a page drawn inside a monitor, tablet or phone, moved
 * up and down, dropped into layout pieces (columns, rows, grids) to sit side by side, and edited. The page is drawn in the look of the client picked in the side nav. The arrangement
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
  const [selected, setSelected] = useState<Path | null>(null)
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
      setSelected(validSelection(next, event.data.selected))
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

  /** A component from the tray goes where the selection points: a picked slot, a picked structure, else the page. */
  const add = (id: string) => {
    const at = addPath(items, selected)
    const next = insertAt(items, at, { id })
    if (countItems(next) === countItems(items)) return
    setItems(next)
    // A picked slot or structure stays picked, to take the next piece too; otherwise the new piece is selected.
    const keep = selected && (isSlotPath(selected) || at.length > selected.length)
    if (!keep) setSelected(at)
  }

  /** A structure goes onto the page itself, and its first slot is picked, ready for pieces. */
  const addStructure = (structure: Structure) => {
    const item = structureItem(structure)
    if (!item) return
    const at = addStructurePath(items, selected)
    const next = insertAt(items, at, item)
    if (countItems(next) === countItems(items)) return
    setItems(next)
    setSelected([...at, 0])
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
  const slotPicked = selected !== null && isSlotPath(selected)
  const current = selected !== null && !slotPicked ? getAt(items, selected) : undefined
  const currentMeta = current ? metaOf(current) : undefined
  const lookLabel = THEMES.find((theme) => theme.id === look)?.label
  const full = countItems(items) >= MAX_ITEMS

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
        Pick a structure, then add pieces into it.
        {choice === "all" && <> Shown in the {lookLabel} look: pick a client on the left to change it.</>}
      </p>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5 lg:max-h-[50rem] lg:overflow-y-auto lg:pr-1">
          <section aria-labelledby="structures" className="min-w-0">
            <h2 id="structures" className="mb-2 text-xs font-semibold text-foreground">
              1. Structure
            </h2>
            <ul className="flex gap-2 overflow-x-auto pb-2 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
              {STRUCTURES.map((structure) => (
                <li key={structure.key} className="shrink-0">
                  <button
                    type="button"
                    draggable
                    disabled={full}
                    onDragStart={(event) => {
                      const item = structureItem(structure)
                      if (!item) return
                      event.dataTransfer.setData(DRAG_TYPE, JSON.stringify(item.p ? { id: item.id, p: item.p } : { id: item.id }))
                      event.dataTransfer.effectAllowed = "move"
                    }}
                    onClick={() => addStructure(structure)}
                    aria-label={`Add structure: ${structure.label}`}
                    title={structure.label}
                    className="group block w-24 cursor-grab rounded-lg border bg-card p-2 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50 lg:w-full"
                  >
                    <Wireframe structure={structure} />
                    <span className="mt-1.5 block truncate text-[0.6875rem] text-muted-foreground group-hover:text-foreground">{structure.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="tray" className="min-w-0">
            <h2 id="tray" className="mb-2 text-xs font-semibold text-foreground">
              2. Pieces
            </h2>
            <p className="mb-2 text-xs text-muted-foreground" aria-live="polite">
              {full ? `A page holds up to ${MAX_ITEMS} pieces.` : slotPicked ? "Tap a piece to add it to the picked space." : "Tap “Add a piece” on the page, then a piece here. Or drag one over."}
            </p>
            <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-x-visible lg:pb-0">
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
                    className={cn(
                      "group flex w-full cursor-grab items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-left text-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50",
                      slotPicked && "border-primary/40",
                    )}
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
          </section>
        </div>

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
          {currentMeta ? `${currentMeta.group === "layout" ? "Structure" : currentMeta.name} options` : "Options"}
        </h2>
        <div className="mt-4">
          {current && currentMeta ? (
            <Controls
              // A new selection starts its fields from that piece's values.
              key={`${selected?.join(".")}:${current.id}`}
              meta={currentMeta}
              props={itemProps(current)}
              onChange={(props) => selected && setItems(replaceAt(items, selected, withProps(current, props)))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {slotPicked ? "Adding to the picked space: tap a piece in the list." : "Click a piece on the page to change its words and options."}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

/** A structure as a small picture: its slots as blocks, in their shares of the width. */
function Wireframe({ structure }: { structure: Structure }) {
  return (
    <span aria-hidden="true" className="flex h-9 flex-col gap-1">
      {Array.from({ length: structure.rows ?? 1 }, (_, row) => (
        <span key={row} className={cn("flex min-h-0 flex-1 gap-1", structure.loose && "items-center justify-start")}>
          {structure.cells.map((share, index) => (
            <span
              key={index}
              className={cn("rounded-sm bg-muted-foreground/25 group-hover:bg-primary/40", structure.loose ? "h-1/2 rounded-full" : "h-full")}
              style={structure.loose ? { width: `${share * 12}%` } : { flex: `${share} 1 0` }}
            />
          ))}
        </span>
      ))}
    </span>
  )
}
