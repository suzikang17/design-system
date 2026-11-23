import "@/client/tokens/all.css"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useLocation, useParams } from "react-router-dom"

import type { ComponentMeta } from "@/client/catalog/meta"
import { getMeta } from "@/client/catalog/registry"
import { decodeState, type PreviewState } from "@/client/catalog/state"
import { cn } from "@/lib/utils"
import ClientNotFound from "./ClientNotFound"
import type { PreviewReport } from "./parts/frameHeight"
import type { PreviewMessage } from "./parts/PreviewFrame"
import { PreviewFit } from "./parts/PreviewFit"

/** The page inside a piece's preview frame: the piece alone, in its look, on its look's paper. */
export default function ClientPreview() {
  const { id } = useParams()
  const meta = id ? getMeta(id) : undefined
  if (!meta) return <ClientNotFound bare />
  return <PreviewBody key={meta.id} meta={meta} />
}

function isPreviewMessage(data: unknown): data is PreviewMessage {
  if (typeof data !== "object" || data === null) return false
  const message = data as { type?: unknown; search?: unknown }
  return message.type === "ds:replay" || (message.type === "ds:state" && typeof message.search === "string")
}

const LAYOUT_CLASS = {
  centered: "grid place-items-center p-8",
  full: "",
  scroll: "min-h-[300vh]",
} as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- a meta of any piece, as in the registry
function PreviewBody({ meta }: { meta: ComponentMeta<any> }) {
  const { search } = useLocation()
  const [state, setState] = useState<PreviewState>(() => decodeState(meta, search))
  const [replays, setReplays] = useState(0)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Only the site's own page, framing this one, may drive the preview.
      if (event.source !== window.parent || event.origin !== window.location.origin) return
      if (!isPreviewMessage(event.data)) return
      if (event.data.type === "ds:replay") setReplays((n) => n + 1)
      else setState(decodeState(meta, event.data.search))
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [meta])

  // The look lives on the piece's root, not on <html>. The page behind it (overscroll, a short layout) takes
  // the same paper colour, read from the root once the look applies, and gives it back on the way out.
  useLayoutEffect(() => {
    const body = document.body
    const paper = root.current ? getComputedStyle(root.current).backgroundColor : ""
    body.style.backgroundColor = paper
    return () => {
      body.style.backgroundColor = ""
    }
  }, [state.theme])

  // Tell the page framing this one how tall the piece is (with the root's padding), so the frame can show it whole.
  // Not for `scroll`, whose height is the frame's own. A page opened on its own has no one to tell.
  useEffect(() => {
    const element = root.current
    if (!element || meta.layout === "scroll" || window.parent === window || typeof ResizeObserver === "undefined") return
    const report = () => {
      const piece = element.firstElementChild
      if (!piece) return
      const style = getComputedStyle(element)
      const height = piece.getBoundingClientRect().height + (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
      window.parent.postMessage({ type: "ds:height", height } satisfies PreviewReport, window.location.origin)
    }
    const observer = new ResizeObserver(report)
    if (element.firstElementChild) observer.observe(element.firstElementChild)
    report()
    return () => observer.disconnect()
  }, [meta.layout, replays])

  const Piece = meta.demo ?? meta.component
  return (
    <div ref={root} className={cn("ds-root min-h-screen", LAYOUT_CLASS[meta.layout])} data-theme={state.theme} data-layout={meta.layout}>
      <PreviewFit width={meta.previewWidth}>
        <Piece {...state.props} key={replays} />
      </PreviewFit>
    </div>
  )
}
