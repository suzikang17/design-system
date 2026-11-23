import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { useHref } from "react-router-dom"
import { RotateCcw } from "lucide-react"

import type { ComponentMeta } from "@/client/catalog/meta"
import { PillButton } from "@/components/ui/pill"
import type { PreviewSize } from "./SizeSwitch"

const SIZE_WIDTH: Record<PreviewSize, string> = { desktop: "100%", tablet: "768px", phone: "390px" }
const SIZE_PX: Record<PreviewSize, number | null> = { desktop: null, tablet: 768, phone: 390 }

/** Visible frame height per layout. */
const LAYOUT_HEIGHT = { centered: 420, full: 560, scroll: 640 } as const

export type PreviewMessage = { type: "ds:state"; search: string } | { type: "ds:replay" }

interface PreviewFrameProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- a meta of any piece, as in the registry
  meta: ComponentMeta<any>
  /** Encoded state. Only the first value becomes the frame's src; later values are posted to it. */
  search: string
  size: PreviewSize
  /** Toolbar content shown before Replay. */
  children?: ReactNode
}

/**
 * The live preview iframe. Its src is fixed at mount (key the frame on the piece to switch pieces); state
 * changes travel by postMessage, so the frame never reloads while someone edits. A fixed width wider than the
 * space available is drawn scaled down, so the piece still lays out at its true width, and the toolbar says so.
 */
export function PreviewFrame({ meta, search, size, children }: PreviewFrameProps) {
  const [initialSearch] = useState(search)
  const src = useHref(`/client/preview/${meta.id}?${initialSearch}`)
  const frame = useRef<HTMLIFrameElement>(null)
  const latest = useRef(search)
  latest.current = search

  const post = (message: PreviewMessage) => frame.current?.contentWindow?.postMessage(message, window.location.origin)

  // Posting the mount-time state too is harmless: the frame already shows it, or has not loaded yet.
  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: "ds:state", search } satisfies PreviewMessage, window.location.origin)
  }, [search])

  const viewport = useRef<HTMLDivElement>(null)
  const [available, setAvailable] = useState<number | null>(null)
  useLayoutEffect(() => {
    const element = viewport.current
    if (!element || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => entry && setAvailable(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const height = LAYOUT_HEIGHT[meta.layout]
  const px = SIZE_PX[size]
  const scale = px && available && available < px ? available / px : 1

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="bg-muted/40 bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] p-2 [background-size:16px_16px] sm:p-4">
        <div ref={viewport} className="flex justify-center overflow-hidden" style={{ height }}>
          <iframe
            ref={frame}
            title={`${meta.name} preview`}
            src={src}
            className="block max-w-none flex-none origin-top rounded-md shadow-sm ring-1 ring-foreground/10 motion-safe:transition-[width] motion-safe:duration-300"
            style={{
              width: SIZE_WIDTH[size],
              height: height / scale,
              transform: scale < 1 ? `scale(${scale})` : undefined,
            }}
            // Catch up on anything changed while the frame was still loading.
            onLoad={() => post({ type: "ds:state", search: latest.current })}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t px-3 py-2">
        {children}
        <PillButton variant="outline" className="gap-1.5" onClick={() => post({ type: "ds:replay" })}>
          <RotateCcw aria-hidden="true" />
          Replay
        </PillButton>
        {scale < 1 && (
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">
            {px}px wide, shown at {Math.round(scale * 100)}%
          </span>
        )}
      </div>
    </div>
  )
}
