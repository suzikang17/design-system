import "@/client/tokens/all.css"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent, type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react"

import { Container } from "@/client/components/container/Container"
import { cn } from "@/lib/utils"
import type { PreviewMessage } from "./parts/PreviewFrame"
import { PreviewFit } from "./parts/PreviewFit"
import { fontStyle } from "./playground/fonts"
import {
  DEFAULT_LOOK,
  DRAG_TYPE,
  countItems,
  decodePage,
  insertAt,
  itemProps,
  metaOf,
  moveTo,
  readDrag,
  removeAt,
  slotsOf,
  toEntries,
  type PageItem,
  type PageReport,
  type PageState,
  type Path,
} from "./playground/model"

function isPreviewMessage(data: unknown): data is PreviewMessage {
  if (typeof data !== "object" || data === null) return false
  const message = data as { type?: unknown; search?: unknown }
  return message.type === "ds:replay" || (message.type === "ds:state" && typeof message.search === "string")
}

const read = (search: string): PageState => {
  const page = decodePage(search)
  return { look: page.look ?? DEFAULT_LOOK, items: page.items ?? [], selected: page.selected, font: page.font }
}

const keyOf = (path: Path) => path.join(".")
const pathOf = (key: string | undefined): number[] => (key ? key.split(".").map(Number) : [])

/** Which way a list of pieces runs: down the page, or along a line that wraps (Row and Grid). */
type Flow = "column" | "row"
const FLOW: Record<string, Flow> = { row: "row", grid: "row" }

/** The editing chrome. Plain CSS, because which tools show depends on what is hovered inside what: only the
 *  innermost piece under the pointer shows its tools, so a layout piece's do not cover those of what it holds. */
const CHROME = `
[data-item] { position: relative; }
[data-item][data-selected] { outline: 2px solid #0ea5e9; outline-offset: -2px; }
[data-item-tools] { opacity: 0; transition: opacity .15s; }
[data-item]:hover:not(:has([data-item]:hover)) > [data-tools-row] > [data-item-tools],
[data-item][data-selected] > [data-tools-row] > [data-item-tools],
[data-item-tools]:focus-within { opacity: 1; }
[data-item][data-drop="before"] { box-shadow: 0 -4px 0 0 #0ea5e9; }
[data-item][data-drop="after"] { box-shadow: 0 4px 0 0 #0ea5e9; }
[data-flow="row"] > [data-item][data-drop="before"] { box-shadow: -4px 0 0 0 #0ea5e9; }
[data-flow="row"] > [data-item][data-drop="after"] { box-shadow: 4px 0 0 0 #0ea5e9; }
[data-slot] { min-height: 72px; }
[data-slot][data-slot-column] { display: flex; flex-direction: column; gap: 16px; align-self: stretch; }
[data-slot-add] { all: unset; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; border: 1px dashed currentColor; border-radius: 8px; font: 500 13px/1.3 system-ui, sans-serif; opacity: .5; transition: opacity .15s; }
[data-slot-add]:hover, [data-slot-add]:focus-visible { opacity: 1; color: #0284c7; }
[data-slot-add]:focus-visible { outline: 2px solid #0ea5e9; outline-offset: 2px; }
/* an empty slot is all invitation; a slot with pieces keeps a small one at its end, shown while its structure is in use */
[data-slot-add][data-empty] { flex: 1 1 auto; min-height: 96px; min-width: 140px; padding: 12px; }
[data-slot-add]:not([data-empty]) { min-height: 36px; min-width: 36px; padding: 4px 10px; opacity: 0; }
[data-slot-add]:not([data-empty]) > span { display: none; }
[data-item]:hover [data-slot-add]:not([data-empty]), [data-item][data-selected] [data-slot-add]:not([data-empty]), [data-slot][data-slot-selected] > [data-slot-add], [data-slot-add]:not([data-empty]):focus-visible { opacity: .6; }
[data-slot][data-slot-selected] > [data-slot-add], [data-slot][data-slot-drop] > [data-slot-add] { opacity: 1; border: 2px solid #0ea5e9; color: #0284c7; }
[data-slot][data-slot-selected] { outline: 2px solid #0ea5e9; outline-offset: 4px; border-radius: 8px; }
`

/**
 * The page inside the playground's frame: the chosen pieces, stacked top to bottom in one look, like a web page.
 * Pieces can be dragged here from the playground's tray, dragged to another place, and dropped into a layout piece
 * (Columns, Row, Grid, Stack, Container) to sit inside it; each also has buttons to move and remove it, for touch
 * screens and keyboards. The playground that frames this page holds the state: every change is reported to it, and
 * it answers with the page to show.
 */
export default function ClientPlaygroundPage() {
  const { search } = useLocation()
  const [state, setState] = useState<PageState>(() => read(search))
  const [replays, setReplays] = useState(0)
  /** Where a dragged piece would land: before the item at this path (whose last index may be one past the end). */
  const [dropAt, setDropAt] = useState<Path | null>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Only the site's own page, framing this one, may drive it.
      if (event.source !== window.parent || event.origin !== window.location.origin) return
      if (!isPreviewMessage(event.data)) return
      if (event.data.type === "ds:replay") setReplays((n) => n + 1)
      else setState(read(event.data.search))
    }
    window.addEventListener("message", onMessage)
    // Now listening: ask the framing page for its current state, in case it changed while this page was starting.
    if (window.parent !== window) window.parent.postMessage({ type: "ds:ready" }, window.location.origin)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  // The page behind the pieces takes the look's paper, as in a piece's preview.
  useLayoutEffect(() => {
    const body = document.body
    body.style.backgroundColor = root.current ? getComputedStyle(root.current).backgroundColor : ""
    return () => {
      body.style.backgroundColor = ""
    }
  }, [state.look])

  /** Shows the change at once, and tells the playground, which owns the page. */
  const change = useCallback((items: PageItem[], selected: Path | null) => {
    setState((now) => ({ ...now, items, selected }))
    if (window.parent !== window) {
      window.parent.postMessage({ type: "ds:page", items: toEntries(items), selected } satisfies PageReport, window.location.origin)
    }
  }, [])

  const { items, selected } = state
  const selectedKey = selected ? keyOf(selected) : null
  const dropKey = dropAt ? keyOf(dropAt) : null

  // What is selected is brought into view: a structure added from the tray may land below the screen.
  useEffect(() => {
    if (!selectedKey) return
    const target = root.current?.querySelector(`[data-slot="${selectedKey}"], [data-item="${selectedKey}"]`)
    target?.scrollIntoView?.({ block: "nearest", behavior: "smooth" })
  }, [selectedKey])

  /** Where a drop at this point would land: in the innermost slot under the pointer, else on the page itself;
   *  before the first piece there whose middle the pointer has not passed. */
  const targetAt = (event: DragEvent): Path => {
    const slot = (event.target as HTMLElement).closest<HTMLElement>("[data-slot]")
    const holder = slot ?? root.current
    const list = pathOf(slot?.dataset.slot)
    const rows = Array.from(holder?.children ?? []).filter((child) => child.matches("[data-item]"))
    const along = slot?.dataset.flow === "row"
    const index = rows.findIndex((row) => {
      const box = row.getBoundingClientRect()
      if (!along) return event.clientY < box.top + box.height / 2
      return event.clientY < box.top || (event.clientY <= box.bottom && event.clientX < box.left + box.width / 2)
    })
    return [...list, index === -1 ? rows.length : index]
  }

  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes(DRAG_TYPE)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    const at = targetAt(event)
    if (keyOf(at) !== dropKey) setDropAt(at)
  }

  const onDrop = (event: DragEvent) => {
    const payload = readDrag(event.dataTransfer.getData(DRAG_TYPE))
    const at = targetAt(event)
    setDropAt(null)
    if (!payload) return
    event.preventDefault()
    if ("id" in payload) {
      const next = insertAt(items, at, payload.p ? { id: payload.id, p: payload.p } : { id: payload.id })
      if (countItems(next) > countItems(items)) change(next, at)
    } else {
      const moved = moveTo(items, payload.from, at)
      change(moved.items, moved.at)
    }
  }

  // A link inside a piece must not take the page away, and a click on a piece selects it (the innermost one).
  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.closest("[data-item-tools]")) return
    // "Add a piece" picks its slot: the playground's tray then adds into it.
    const add = target.closest<HTMLElement>("[data-slot-add]")
    if (add) {
      const slot = add.closest<HTMLElement>("[data-slot]")?.dataset.slot
      if (slot && slot !== selectedKey) change(items, pathOf(slot))
      return
    }
    if (target.closest("a")) event.preventDefault()
    const key = target.closest<HTMLElement>("[data-item]")?.dataset.item
    if (key && key !== selectedKey) change(items, pathOf(key))
  }

  const renderList = (list: readonly PageItem[], listPath: Path, flow: Flow): ReactNode =>
    list.map((item, index) => renderItem(item, [...listPath, index], flow, list.length))

  /** What a slot holds: its pieces, then a button that picks the slot as where the tray adds to. */
  const slotBody = (list: readonly PageItem[], listPath: Path, flow: Flow): ReactNode => (
    <>
      {renderList(list, listPath, flow)}
      <button type="button" data-slot-add="" data-empty={list.length === 0 ? "" : undefined} aria-label="Add a piece here" aria-pressed={selectedKey === keyOf(listPath)}>
        <Plus aria-hidden="true" className="size-4" />
        <span>Add a piece</span>
      </button>
    </>
  )

  const slotProps = (list: readonly PageItem[], listPath: Path, flow: Flow) => ({
    "data-slot": keyOf(listPath),
    "data-flow": flow,
    "data-slot-drop": list.length === 0 && dropKey === keyOf([...listPath, 0]) ? "" : undefined,
    "data-slot-selected": selectedKey === keyOf(listPath) ? "" : undefined,
  })

  const renderItem = (item: PageItem, path: Path, flow: Flow, siblings: number): ReactNode => {
    const meta = metaOf(item)
    if (!meta) return null
    const Piece = meta.component
    const index = path.at(-1)!
    const listPath = path.slice(0, -1)
    const key = keyOf(path)
    const nested = path.length > 1
    const layout = meta.group === "layout"
    const section = meta.group === "sections"
    const props = itemProps(item)

    let body: ReactNode
    if (layout) {
      const slots = slotsOf(item)
      const inner =
        item.id === "columns" ? (
          <Piece {...props} key={replays}>
            {slots.map((slot, s) => (
              <div key={s} data-slot-column="" {...slotProps(slot, [...path, s], "column")}>
                {slotBody(slot, [...path, s], "column")}
              </div>
            ))}
          </Piece>
        ) : (
          <Piece {...props} key={replays} {...slotProps(slots[0] ?? [], [...path, 0], FLOW[item.id] ?? "column")}>
            {slotBody(slots[0] ?? [], [...path, 0], FLOW[item.id] ?? "column")}
          </Piece>
        )
      // On the page itself a layout piece gets the page's gutters and some air; a Container brings its own.
      body = nested || item.id === "container" ? inner : <Container className="py-8">{inner}</Container>
    } else if (nested) {
      body = (
        <PreviewFit width={meta.previewWidth}>
          <Piece {...props} key={replays} />
        </PreviewFit>
      )
    } else {
      // Page sections run edge to edge; a small piece sits centred with room around it.
      body = (
        <div className={section ? undefined : "grid place-items-center px-6 py-10"} data-layout={meta.layout}>
          <PreviewFit width={section ? undefined : meta.previewWidth}>
            <Piece {...props} key={replays} />
          </PreviewFit>
        </div>
      )
    }

    // In a line, a piece is as wide as its content; one with no width of its own is given a share of the line.
    const wide = layout || section || meta.layout !== "centered"
    const style: CSSProperties | undefined = flow !== "row" || !nested ? undefined : meta.previewWidth ? { flex: `0 1 ${meta.previewWidth}px` } : wide ? { flex: "1 1 240px" } : undefined

    return (
      <div
        // An item keeps its place in the tree while its neighbours move, so only what moved is drawn again.
        key={`${index}:${item.id}`}
        data-item={key}
        data-selected={selectedKey === key ? "" : undefined}
        data-drop={dropKey === key ? "before" : index === siblings - 1 && dropKey === keyOf([...listPath, siblings]) ? "after" : undefined}
        style={style}
      >
        {/* The tools ride along at the top of the screen while a tall piece scrolls under them. A layout piece's
            sit on the left, out of the way of the tools of what it holds. */}
        <div data-tools-row="" className={cn("pointer-events-none sticky top-0 z-50 flex h-0 pt-2", layout ? "justify-start pl-2" : "justify-end pr-2")}>
          <div data-item-tools="" className="pointer-events-auto flex h-9 items-center gap-0.5 rounded-full bg-white p-1 font-sans text-zinc-700 shadow-md ring-1 ring-zinc-200">
            <span
              draggable
              title="Drag to move"
              className="grid size-7 cursor-grab place-items-center rounded-full hover:bg-zinc-100 active:cursor-grabbing"
              onDragStart={(event) => {
                event.stopPropagation()
                event.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ from: path }))
                event.dataTransfer.effectAllowed = "move"
                const row = event.currentTarget.closest<HTMLElement>("[data-item]")
                if (row) event.dataTransfer.setDragImage(row, 20, 20)
              }}
              onDragEnd={() => setDropAt(null)}
            >
              <GripVertical aria-hidden="true" className="size-4" />
            </span>
            {layout && <span className="px-1 text-xs font-medium">{meta.name}</span>}
            <ToolButton label={`Move ${meta.name} up`} disabled={index === 0} onClick={() => moved(moveTo(items, path, [...listPath, index - 1]))}>
              <ArrowUp aria-hidden="true" className="size-4" />
            </ToolButton>
            <ToolButton label={`Move ${meta.name} down`} disabled={index === siblings - 1} onClick={() => moved(moveTo(items, path, [...listPath, index + 2]))}>
              <ArrowDown aria-hidden="true" className="size-4" />
            </ToolButton>
            <ToolButton label={`Remove ${meta.name}`} onClick={() => change(removeAt(items, path), null)}>
              <Trash2 aria-hidden="true" className="size-4" />
            </ToolButton>
          </div>
        </div>
        {body}
      </div>
    )
  }

  const moved = (result: { items: PageItem[]; at: Path }) => change(result.items, result.at)

  return (
    <div
      ref={root}
      className="ds-root min-h-screen"
      data-theme={state.look}
      style={fontStyle(state.font)}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropAt(null)
      }}
      onClickCapture={onClick}
    >
      <style>{CHROME}</style>
      {items.length === 0 && (
        <p className="grid min-h-screen place-items-center px-6 text-center font-sans text-base opacity-60" data-empty="">
          Pick a structure to start your page.
        </p>
      )}
      {renderList(items, [], "column")}
    </div>
  )
}

function ToolButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-full hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 disabled:opacity-30"
    >
      {children}
    </button>
  )
}
