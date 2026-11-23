import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { useHref } from "react-router-dom"
import { BatteryFull, RotateCcw, Signal, Wifi } from "lucide-react"

import type { ComponentMeta } from "@/client/catalog/meta"
import { PillButton } from "@/components/ui/pill"
import { cn } from "@/lib/utils"
import { frameHeight, isPreviewReport } from "./frameHeight"
import type { PreviewSize } from "./SizeSwitch"

const SIZE_WIDTH: Record<PreviewSize, string> = { desktop: "100%", tablet: "768px", phone: "390px" }
const SIZE_PX: Record<PreviewSize, number | null> = { desktop: null, tablet: 768, phone: 390 }

/** The thickness of each device's frame around its screen, in px. */
const BEZEL: Record<PreviewSize, number> = { desktop: 10, tablet: 16, phone: 12 }
/** A device is at least this tall, so a phone looks like a phone even around a small piece. */
const DEVICE_MIN_HEIGHT: Record<PreviewSize, number> = { desktop: 0, tablet: 560, phone: 700 }
const SCREEN_SHAPE: Record<PreviewSize, string> = { desktop: "rounded-b-[12px]", tablet: "rounded-[20px]", phone: "" }
/** The device itself: a soft white body, the same in every site theme (it is an object, not a surface). */
const DEVICE_BODY = "bg-white shadow-xl shadow-zinc-900/10 ring-1 ring-zinc-200"

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
 * The frame is shown inside a drawing of the device it is sized for: a monitor, a tablet or a phone.
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

  // The piece reports its height, so a tall one (a photo) is shown whole. Only the frame this page made, from this
  // origin, is believed, exactly as the preview believes only its parent.
  const [reported, setReported] = useState<number | null>(null)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.origin !== window.location.origin) return
      if (isPreviewReport(event.data)) setReported(event.data.height)
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  const viewport = useRef<HTMLDivElement>(null)
  const [available, setAvailable] = useState<number | null>(null)
  useLayoutEffect(() => {
    const element = viewport.current
    if (!element || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => entry && setAvailable(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const px = SIZE_PX[size]
  // The device's own frame takes room too: the screen gets what is left.
  const room = available === null ? null : available - 2 * BEZEL[size]
  const scale = px && room && room < px ? room / px : 1
  const height = frameHeight(Math.max(LAYOUT_HEIGHT[meta.layout], DEVICE_MIN_HEIGHT[size]), scale, meta.layout === "scroll" ? null : reported)
  const look = new URLSearchParams(search).get("look") ?? meta.homeTheme

  const screen = (
    <div
      data-screen=""
      className={cn("relative overflow-hidden motion-safe:transition-[width] motion-safe:duration-300", SCREEN_SHAPE[size])}
      style={{ width: px ? px * scale : "100%", height: height * scale }}
    >
      <iframe
        ref={frame}
        title={`${meta.name} preview`}
        src={src}
        className="absolute left-0 top-0 block max-w-none origin-top-left motion-safe:transition-[width] motion-safe:duration-300"
        style={{
          width: SIZE_WIDTH[size],
          height,
          transform: scale < 1 ? `scale(${scale})` : undefined,
        }}
        // Catch up on anything changed while the frame was still loading.
        onLoad={() => post({ type: "ds:state", search: latest.current })}
      />
    </div>
  )

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="bg-muted/40 bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] px-2 py-6 [background-size:16px_16px] sm:px-4 sm:py-8">
        {/* The piece sits in a drawing of the device it is sized for. The drawing is decoration only. */}
        <div ref={viewport} data-device={size} className="flex flex-col items-center">
          {size === "desktop" && (
            <>
              <div className={cn("w-full", DEVICE_BODY)} style={{ padding: BEZEL.desktop, borderRadius: 22 }}>
                <div aria-hidden="true" className="flex h-7 items-center gap-1.5 rounded-t-[12px] bg-zinc-100 px-3">
                  <span className="size-2.5 rounded-full bg-rose-300" />
                  <span className="size-2.5 rounded-full bg-amber-300" />
                  <span className="size-2.5 rounded-full bg-emerald-300" />
                  <span className="ml-3 h-3.5 max-w-64 flex-1 rounded-full bg-white" />
                </div>
                {screen}
              </div>
              <div aria-hidden="true" className="h-9 w-24 bg-gradient-to-b from-zinc-200 to-zinc-100 [clip-path:polygon(12%_0,88%_0,100%_100%,0_100%)]" />
              <div aria-hidden="true" className="h-2.5 w-44 rounded-full bg-zinc-200 shadow-sm" />
            </>
          )}
          {size === "tablet" && (
            <div className={cn("relative", DEVICE_BODY)} style={{ padding: BEZEL.tablet, borderRadius: 34 }}>
              <span aria-hidden="true" className="absolute left-1/2 top-1.5 size-1.5 -translate-x-1/2 rounded-full bg-zinc-300" />
              {screen}
            </div>
          )}
          {size === "phone" && (
            <div className={cn("relative", DEVICE_BODY)} style={{ padding: BEZEL.phone, borderRadius: 52 }}>
              <span aria-hidden="true" className="absolute -left-[3px] top-28 h-8 w-[3px] rounded-l bg-zinc-300" />
              <span aria-hidden="true" className="absolute -left-[3px] top-40 h-12 w-[3px] rounded-l bg-zinc-300" />
              <span aria-hidden="true" className="absolute -right-[3px] top-36 h-16 w-[3px] rounded-r bg-zinc-300" />
              <div className="overflow-hidden rounded-[40px]">
                {/* the status bar takes the look's paper, so the screen reads as one surface */}
                <div aria-hidden="true" className="ds-root relative flex h-9 items-center justify-between px-7 font-sans text-[11px] font-semibold" data-theme={look} data-status-bar="">
                  <span>9:41</span>
                  <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-zinc-900" />
                  <span className="flex items-center gap-1">
                    <Signal className="size-3" />
                    <Wifi className="size-3" />
                    <BatteryFull className="size-4" />
                  </span>
                </div>
                {screen}
              </div>
              <span aria-hidden="true" className="pointer-events-none absolute bottom-[18px] left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-zinc-900/30" />
            </div>
          )}
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
