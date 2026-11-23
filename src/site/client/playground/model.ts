import type { ComponentMeta } from "@/client/catalog/meta"
import { allMeta, getMeta } from "@/client/catalog/registry"
import { decodeState, encodeState } from "@/client/catalog/state"
import { isThemeId, type ThemeId } from "@/client/tokens/contract"

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- a meta of any piece, as in the registry
type AnyMeta = ComponentMeta<any>

/** One piece on the playground's page: which piece, and its options as that piece's own link encodes them (`p`). */
export type PageItem = { id: string; p?: string }

export type PageState = { look: ThemeId; items: PageItem[]; selected: number | null }

/** A page holds at most this many pieces, whatever a link says. */
export const MAX_ITEMS = 24
const MAX_PAGE_LENGTH = 60000
const MAX_ITEM_P = 20000

/** The look the page is drawn in when no client is picked. */
export const DEFAULT_LOOK: ThemeId = "wecuratelife"

/** The page a visitor starts from: a whole small site, top to bottom, with each section in the layout of the
 *  site whose look the page is drawn in. Ids with no piece are skipped. */
const STARTER_IDS = ["nav-bar", "hero", "steps", "gallery", "faq", "cta-band", "footer"]
const STARTER_VARIANTS: Record<ThemeId, Record<string, string>> = {
  wecuratelife: { "nav-bar": "bar", hero: "wordmark", "cta-band": "mark", footer: "minimal" },
  urlovematters: { "nav-bar": "menu", hero: "split", "cta-band": "band", footer: "row" },
  neutral: { "nav-bar": "menu", hero: "split", "cta-band": "band", footer: "row" },
}
export function starterPage(look: ThemeId = DEFAULT_LOOK): PageItem[] {
  return STARTER_IDS.flatMap((id) => {
    const meta = getMeta(id)
    if (!meta) return []
    const variant = STARTER_VARIANTS[look][id]
    return [variant ? withProps({ id }, { ...meta.defaults, variant }) : { id }]
  })
}

const toBase64Url = (text: string) => {
  const bytes = new TextEncoder().encode(text)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}
const fromBase64Url = (text: string) => {
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"))
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)))
}

/** Keeps what is usable from untrusted input: known pieces only, options as short strings, at most MAX_ITEMS. */
export function cleanItems(input: unknown): PageItem[] {
  if (!Array.isArray(input)) return []
  const items: PageItem[] = []
  for (const entry of input) {
    if (items.length >= MAX_ITEMS) break
    const [id, p] = Array.isArray(entry) ? entry : typeof entry === "object" && entry !== null ? [(entry as PageItem).id, (entry as PageItem).p] : []
    if (typeof id !== "string" || !getMeta(id)) continue
    items.push(typeof p === "string" && p.length > 0 && p.length <= MAX_ITEM_P ? { id, p } : { id })
  }
  return items
}

export const encodeItems = (items: readonly PageItem[]) => toBase64Url(JSON.stringify(items.map((item) => (item.p ? [item.id, item.p] : [item.id]))))

/** Never throws: an unusable value is an empty page. */
export function decodeItems(raw: string | null): PageItem[] {
  if (!raw || raw.length > MAX_PAGE_LENGTH) return []
  try {
    return cleanItems(JSON.parse(fromBase64Url(raw)))
  } catch {
    return []
  }
}

/** The search the page inside the frame is given: the look, the pieces, and which one is selected. */
export function encodePage(state: PageState): string {
  const params = new URLSearchParams({ look: state.look, page: encodeItems(state.items) })
  if (state.selected !== null) params.set("sel", String(state.selected))
  return params.toString()
}

/** Never throws. `page` absent means "no page given" (null items), which the playground answers with the starter. */
export function decodePage(search: string): { look: ThemeId | null; items: PageItem[] | null; selected: number | null } {
  const params = new URLSearchParams(search)
  const look = params.get("look")
  const items = params.has("page") ? decodeItems(params.get("page")) : null
  const sel = Number(params.get("sel") ?? Number.NaN)
  const selected = items && Number.isInteger(sel) && sel >= 0 && sel < items.length ? sel : null
  return { look: isThemeId(look) ? look : null, items, selected }
}

export const metaOf = (item: PageItem): AnyMeta | undefined => getMeta(item.id)

/** The props an item's piece is rendered with: its defaults, with the item's own options laid over them. Only
 *  what the piece's controls allow is taken, exactly as on the piece's own page. */
export function itemProps(item: PageItem): Record<string, unknown> {
  const meta = getMeta(item.id)
  if (!meta) return {}
  return decodeState(meta, item.p ? `p=${item.p}` : "").props
}

/** The item with new options. */
export function withProps(item: PageItem, props: Record<string, unknown>): PageItem {
  const meta = getMeta(item.id)
  if (!meta) return item
  const p = new URLSearchParams(encodeState(meta, { theme: meta.homeTheme, props })).get("p")
  return p ? { id: item.id, p } : { id: item.id }
}

export const insertAt = (items: readonly PageItem[], index: number, item: PageItem): PageItem[] =>
  items.length >= MAX_ITEMS ? [...items] : [...items.slice(0, index), item, ...items.slice(index)]

/** Moves the item at `from` so that it sits before what is now at `to` (`to` may be `items.length`: the end). */
export function moveTo(items: readonly PageItem[], from: number, to: number): PageItem[] {
  if (from < 0 || from >= items.length) return [...items]
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to > from ? to - 1 : to, 0, item!)
  return next
}

export const removeAt = (items: readonly PageItem[], index: number): PageItem[] => items.filter((_, i) => i !== index)

/** From the page inside the frame to the playground: the visitor rearranged the page, or selected a piece. */
export type PageReport = { type: "ds:page"; items: unknown; selected: number | null }

export function isPageReport(data: unknown): data is PageReport {
  if (typeof data !== "object" || data === null) return false
  const message = data as { type?: unknown; items?: unknown; selected?: unknown }
  return message.type === "ds:page" && Array.isArray(message.items) && (message.selected === null || Number.isInteger(message.selected))
}

/** What a drag carries: a new piece from the tray, or a piece already on the page. */
export const DRAG_TYPE = "application/x-ds-piece"
export type DragPayload = { id: string } | { from: number }

export function readDrag(raw: string): DragPayload | null {
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== "object" || data === null) return null
    const { id, from } = data as { id?: unknown; from?: unknown }
    if (typeof id === "string" && getMeta(id)) return { id }
    if (typeof from === "number" && Number.isInteger(from) && from >= 0) return { from }
  } catch {
    // not ours
  }
  return null
}

/** The tray: every piece, the page sections first. */
export const trayPieces = (): readonly AnyMeta[] => [...allMeta].sort((a, b) => Number(b.group === "sections") - Number(a.group === "sections"))
