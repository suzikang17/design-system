import "@/client/tokens/all.css"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type DragEvent, type MouseEvent } from "react"
import { useLocation } from "react-router-dom"
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import type { PreviewMessage } from "./parts/PreviewFrame"
import { PreviewFit } from "./parts/PreviewFit"
import {
  DEFAULT_LOOK,
  DRAG_TYPE,
  decodePage,
  insertAt,
  itemProps,
  metaOf,
  moveTo,
  readDrag,
  removeAt,
  type PageItem,
  type PageReport,
  type PageState,
} from "./playground/model"

function isPreviewMessage(data: unknown): data is PreviewMessage {
  if (typeof data !== "object" || data === null) return false
  const message = data as { type?: unknown; search?: unknown }
  return message.type === "ds:replay" || (message.type === "ds:state" && typeof message.search === "string")
}

const read = (search: string): PageState => {
  const page = decodePage(search)
  return { look: page.look ?? DEFAULT_LOOK, items: page.items ?? [], selected: page.selected }
}

/**
 * The page inside the playground's frame: the chosen pieces, stacked top to bottom in one look, like a web page.
 * Pieces can be dragged here from the playground's tray and dragged up and down; each also has buttons to move and
 * remove it, for touch screens and keyboards. The playground that frames this page holds the state: every change
 * is reported to it, and it answers with the page to show.
 */
export default function ClientPlaygroundPage() {
  const { search } = useLocation()
  const [state, setState] = useState<PageState>(() => read(search))
  const [replays, setReplays] = useState(0)
  /** Where a dragged piece would land: before the item at this index (or at the end). */
  const [dropAt, setDropAt] = useState<number | null>(null)
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
  const change = useCallback((items: PageItem[], selected: number | null) => {
    setState((now) => ({ ...now, items, selected }))
    if (window.parent !== window) {
      window.parent.postMessage({ type: "ds:page", items: items.map((item) => (item.p ? [item.id, item.p] : [item.id])), selected } satisfies PageReport, window.location.origin)
    }
  }, [])

  const { items, selected } = state

  const indexAt = (clientY: number) => {
    const rows = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-item]") ?? [])
    const index = rows.findIndex((row) => {
      const box = row.getBoundingClientRect()
      return clientY < box.top + box.height / 2
    })
    return index === -1 ? rows.length : index
  }

  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes(DRAG_TYPE)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    setDropAt(indexAt(event.clientY))
  }

  const onDrop = (event: DragEvent) => {
    const payload = readDrag(event.dataTransfer.getData(DRAG_TYPE))
    const at = indexAt(event.clientY)
    setDropAt(null)
    if (!payload) return
    event.preventDefault()
    if ("id" in payload) {
      const next = insertAt(items, at, { id: payload.id })
      if (next.length > items.length) change(next, at)
    } else if (payload.from < items.length) {
      change(moveTo(items, payload.from, at), at > payload.from ? at - 1 : at)
    }
  }

  // A link inside a piece must not take the page away, and a click on a piece selects it.
  const onClick = (event: MouseEvent, index: number) => {
    const target = event.target as HTMLElement
    if (target.closest("[data-item-tools]")) return
    if (target.closest("a")) event.preventDefault()
    if (selected !== index) change(items, index)
  }

  return (
    <div
      ref={root}
      className="ds-root min-h-screen"
      data-theme={state.look}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropAt(null)
      }}
    >
      {items.length === 0 && (
        <p className="grid min-h-screen place-items-center px-6 text-center font-sans text-base opacity-60" data-empty="">
          Drag a piece here to start your page.
        </p>
      )}
      {items.map((item, index) => {
        const meta = metaOf(item)
        if (!meta) return null
        const Piece = meta.component
        const section = meta.group === "sections"
        return (
          <div
            // An item keeps its place in the tree while its neighbours move, so only what moved is drawn again.
            key={`${index}:${item.id}`}
            data-item={index}
            data-selected={selected === index ? "" : undefined}
            className={cn(
              "group/item relative outline-offset-[-2px]",
              selected === index && "outline outline-2 outline-sky-500",
              dropAt === index && "shadow-[0_-4px_0_0_theme(colors.sky.500)]",
              dropAt === items.length && index === items.length - 1 && "shadow-[0_4px_0_0_theme(colors.sky.500)]",
            )}
            onClickCapture={(event) => onClick(event, index)}
          >
            {/* The tools ride along at the top of the screen while a tall piece scrolls under them. */}
            <div className="pointer-events-none sticky top-0 z-50 flex h-0 justify-end pr-2 pt-2">
            <div
              data-item-tools=""
              className={cn(
                "pointer-events-auto flex h-9 items-center gap-0.5 rounded-full bg-white p-1 font-sans text-zinc-700 shadow-md ring-1 ring-zinc-200",
                "opacity-0 transition-opacity focus-within:opacity-100 group-hover/item:opacity-100",
                selected === index && "opacity-100",
              )}
            >
              <span
                draggable
                title="Drag to move"
                className="grid size-7 cursor-grab place-items-center rounded-full hover:bg-zinc-100 active:cursor-grabbing"
                onDragStart={(event) => {
                  event.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ from: index }))
                  event.dataTransfer.effectAllowed = "move"
                  const row = event.currentTarget.closest<HTMLElement>("[data-item]")
                  if (row) event.dataTransfer.setDragImage(row, 20, 20)
                }}
                onDragEnd={() => setDropAt(null)}
              >
                <GripVertical aria-hidden="true" className="size-4" />
              </span>
              <ToolButton label={`Move ${meta.name} up`} disabled={index === 0} onClick={() => change(moveTo(items, index, index - 1), index - 1)}>
                <ArrowUp aria-hidden="true" className="size-4" />
              </ToolButton>
              <ToolButton label={`Move ${meta.name} down`} disabled={index === items.length - 1} onClick={() => change(moveTo(items, index, index + 2), index + 1)}>
                <ArrowDown aria-hidden="true" className="size-4" />
              </ToolButton>
              <ToolButton label={`Remove ${meta.name}`} onClick={() => change(removeAt(items, index), null)}>
                <Trash2 aria-hidden="true" className="size-4" />
              </ToolButton>
            </div>
            </div>
            {/* Page sections run edge to edge; a small piece sits centred with room around it. */}
            <div className={section ? undefined : "grid place-items-center px-6 py-10"} data-layout={meta.layout}>
              <PreviewFit width={section ? undefined : meta.previewWidth}>
                <Piece {...itemProps(item)} key={replays} />
              </PreviewFit>
            </div>
          </div>
        )
      })}
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
