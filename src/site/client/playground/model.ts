import type { ComponentMeta } from "@/client/catalog/meta"
import { allMeta, getMeta } from "@/client/catalog/registry"
import { splitShares } from "@/client/components/columns/splitShares"
import { decodeState, encodeState } from "@/client/catalog/state"
import { isThemeId, type ThemeId } from "@/client/tokens/contract"

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- a meta of any piece, as in the registry
type AnyMeta = ComponentMeta<any>

/** One piece on the playground's page: which piece, its options as that piece's own link encodes them (`p`), and,
 *  for a layout piece (Columns, Row, Grid, Stack, Container), the pieces it holds, one list per slot (`c`). Columns
 *  has a slot per column; the others have one. */
export type PageItem = { id: string; p?: string; c?: PageItem[][] }

/** Where an item is: its index on the page, or index, slot, index for an item inside a layout piece, and so on. */
export type Path = readonly number[]

export type PageState = { look: ThemeId; items: PageItem[]; selected: Path | null }

/** A page holds at most this many pieces, whatever a link says. */
export const MAX_ITEMS = 24
const MAX_PAGE_LENGTH = 60000
const MAX_ITEM_P = 20000
/** A layout piece may sit inside another, and no deeper. */
export const MAX_DEPTH = 2

/** The look the page is drawn in when no client is picked. */
export const DEFAULT_LOOK: ThemeId = "wecuratelife"

/** The page a visitor starts from: a whole small site, top to bottom, with each section in the layout of the
 *  site whose look the page is drawn in, and one Columns holding a photo and a few words. Ids with no piece are skipped. */
const STARTER_IDS = ["nav-bar", "hero", "steps", "gallery", "faq", "cta-band", "footer"]
const STARTER_VARIANTS: Record<ThemeId, Record<string, string>> = {
  wecuratelife: { "nav-bar": "bar", hero: "wordmark", "cta-band": "mark", footer: "minimal" },
  urlovematters: { "nav-bar": "menu", hero: "split", "cta-band": "band", footer: "row" },
  neutral: { "nav-bar": "menu", hero: "split", "cta-band": "band", footer: "row" },
}
/** In the middle of the starter: a photo beside a few words, to show that Columns holds other pieces. */
const starterColumns = (): PageItem[] => {
  const meta = getMeta("columns")
  if (!meta) return []
  const inside = (ids: string[]) => ids.filter((id) => getMeta(id)).map((id) => ({ id }))
  return [{ ...withProps({ id: "columns" }, { ...meta.defaults, align: "center", gap: "lg" }), c: [inside(["photo"]), inside(["eyebrow", "button"])] }]
}
export function starterPage(look: ThemeId = DEFAULT_LOOK): PageItem[] {
  return STARTER_IDS.flatMap((id) => {
    const meta = getMeta(id)
    if (!meta) return []
    const variant = STARTER_VARIANTS[look][id]
    const item = variant ? withProps({ id }, { ...meta.defaults, variant }) : { id }
    return id === "steps" ? [item, ...starterColumns()] : [item]
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

/** How many slots an item has for other pieces: none unless it is a layout piece; one per column for Columns. */
export function slotCount(item: PageItem): number {
  if (getMeta(item.id)?.group !== "layout") return 0
  return item.id === "columns" ? splitShares(String(itemProps(item).split)).length : 1
}

/** An item's slots, as many as it has now: when a Columns loses a column, what was in it moves to the last one. */
export function slotsOf(item: PageItem): PageItem[][] {
  const count = slotCount(item)
  const given = item.c ?? []
  return Array.from({ length: count }, (_, index) => (index < count - 1 ? (given[index] ?? []) : given.slice(index).flat()))
}

const tidy = (item: PageItem): PageItem => {
  const base: PageItem = item.p ? { id: item.id, p: item.p } : { id: item.id }
  return slotCount(base) > 0 ? { ...base, c: slotsOf({ ...base, c: item.c }) } : base
}

export const countItems = (items: readonly PageItem[]): number => items.reduce((sum, item) => sum + 1 + (item.c ?? []).reduce((n, slot) => n + countItems(slot), 0), 0)

/** How many layout pieces deep an item goes: 0 for a plain piece, 1 for a layout piece holding plain ones. */
const layoutHeight = (item: PageItem): number =>
  slotCount(item) === 0 ? 0 : 1 + Math.max(0, ...slotsOf(item).flatMap((slot) => slot.map(layoutHeight)))

/** Keeps what is usable from untrusted input: known pieces only, options as short strings, at most MAX_ITEMS in
 *  all, layout pieces at most MAX_DEPTH deep. */
export function cleanItems(input: unknown): PageItem[] {
  const budget = { left: MAX_ITEMS }
  const clean = (list: unknown, depth: number): PageItem[] => {
    if (!Array.isArray(list)) return []
    const items: PageItem[] = []
    for (const entry of list) {
      if (budget.left <= 0) break
      const [id, p, c] = Array.isArray(entry) ? entry : typeof entry === "object" && entry !== null ? [(entry as PageItem).id, (entry as PageItem).p, (entry as PageItem).c] : []
      if (typeof id !== "string" || !getMeta(id)) continue
      const item: PageItem = typeof p === "string" && p.length > 0 && p.length <= MAX_ITEM_P ? { id, p } : { id }
      if (slotCount(item) === 0) {
        budget.left -= 1
        items.push(item)
        continue
      }
      if (depth >= MAX_DEPTH) continue
      budget.left -= 1
      items.push(tidy({ ...item, c: Array.isArray(c) ? c.map((slot) => clean(slot, depth + 1)) : [] }))
    }
    return items
  }
  return clean(input, 0)
}

type Entry = [string] | [string, string] | [string, string, Entry[][]]

/** The page as plain arrays, the form it travels in: `[id]`, `[id, options]` or `[id, options, slots]`. */
export const toEntries = (items: readonly PageItem[]): Entry[] =>
  items.map((item) => (item.c ? [item.id, item.p ?? "", item.c.map(toEntries)] : item.p ? [item.id, item.p] : [item.id]))

export const encodeItems = (items: readonly PageItem[]) => toBase64Url(JSON.stringify(toEntries(items)))

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
  if (state.selected !== null) params.set("sel", state.selected.join("."))
  return params.toString()
}

/** Never throws. `page` absent means "no page given" (null items), which the playground answers with the starter. */
export function decodePage(search: string): { look: ThemeId | null; items: PageItem[] | null; selected: Path | null } {
  const params = new URLSearchParams(search)
  const look = params.get("look")
  const items = params.has("page") ? decodeItems(params.get("page")) : null
  const sel = (params.get("sel") ?? "").split(".").map((part) => (/^\d+$/.test(part) ? Number(part) : Number.NaN))
  const selected = items && getAt(items, sel) ? sel : null
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
  return tidy(p ? { id: item.id, p, c: item.c } : { id: item.id, c: item.c })
}

const isPath = (path: unknown): path is Path => Array.isArray(path) && path.length % 2 === 1 && path.every((n) => Number.isInteger(n) && n >= 0)

/** The item at a path, if there is one. */
export function getAt(items: readonly PageItem[], path: Path): PageItem | undefined {
  if (!isPath(path)) return undefined
  const [index, slot, ...rest] = path
  const item = items[index!]
  if (!item || slot === undefined) return item
  const inside = slotsOf(item)[slot]
  return inside ? getAt(inside, rest) : undefined
}

/** The page with the list a path points into replaced. `listPath` is a path without its last index. */
function mapList(items: readonly PageItem[], listPath: Path, change: (list: PageItem[]) => PageItem[]): PageItem[] {
  if (listPath.length === 0) return change([...items])
  const [index, slot, ...rest] = listPath
  return items.map((item, i) => (i !== index ? item : { ...item, c: slotsOf(item).map((inside, s) => (s === slot ? mapList(inside, rest, change) : inside)) }))
}

/** Whether an item may go where a path points: the place exists, and layout pieces stay MAX_DEPTH deep. */
function fits(items: readonly PageItem[], path: Path, item: PageItem): boolean {
  if (!isPath(path)) return false
  const parent = path.slice(0, -2)
  if (parent.length > 0) {
    const holder = getAt(items, parent)
    if (!holder || path.at(-2)! >= slotCount(holder)) return false
  }
  return (path.length - 1) / 2 + layoutHeight(item) <= MAX_DEPTH
}

/** The page with an item put before what is now at `path` (whose last index may be one past the end). The page is
 *  returned unchanged when it is full or the item cannot go there. */
export function insertAt(items: readonly PageItem[], path: Path, item: PageItem): PageItem[] {
  const fresh = tidy(item)
  if (countItems(items) + countItems([fresh]) > MAX_ITEMS || !fits(items, path, fresh)) return [...items]
  const at = path.at(-1)!
  return mapList(items, path.slice(0, -1), (list) => [...list.slice(0, at), fresh, ...list.slice(at)])
}

export const removeAt = (items: readonly PageItem[], path: Path): PageItem[] =>
  getAt(items, path) ? mapList(items, path.slice(0, -1), (list) => list.filter((_, i) => i !== path.at(-1))) : [...items]

/** The page with the item at a path swapped for another (its options changed, say). */
export const replaceAt = (items: readonly PageItem[], path: Path, item: PageItem): PageItem[] =>
  getAt(items, path) ? mapList(items, path.slice(0, -1), (list) => list.map((old, i) => (i === path.at(-1) ? item : old))) : [...items]

/** Moves the item at `from` so that it sits before what is now at `to`, and says where it ended up. Nothing moves
 *  when `to` is inside the item itself or the item cannot go there. */
export function moveTo(items: readonly PageItem[], from: Path, to: Path): { items: PageItem[]; at: Path } {
  const item = getAt(items, from)
  const same = { items: [...items], at: from }
  if (!item || !isPath(to)) return same
  const inside = to.length > from.length && from.every((n, i) => to[i] === n)
  if (inside) return same
  // Taking the item out shifts everything after it in its own list, which `to` may pass through.
  const level = from.length - 1
  const shifted = to.length > level && from.slice(0, level).every((n, i) => to[i] === n) && from[level]! < to[level]!
  const at = shifted ? to.map((n, i) => (i === level ? n - 1 : n)) : [...to]
  const without = removeAt(items, from)
  if (!fits(without, at, item)) return same
  const index = at.at(-1)!
  return { items: mapList(without, at.slice(0, -1), (list) => [...list.slice(0, index), item, ...list.slice(index)]), at }
}

/** From the page inside the frame to the playground: the visitor rearranged the page, or selected a piece. */
export type PageReport = { type: "ds:page"; items: unknown; selected: Path | null }

export function isPageReport(data: unknown): data is PageReport {
  if (typeof data !== "object" || data === null) return false
  const message = data as { type?: unknown; items?: unknown; selected?: unknown }
  return message.type === "ds:page" && Array.isArray(message.items) && (message.selected === null || isPath(message.selected))
}

/** What a drag carries: a new piece from the tray, or a piece already on the page. */
export const DRAG_TYPE = "application/x-ds-piece"
export type DragPayload = { id: string } | { from: Path }

export function readDrag(raw: string): DragPayload | null {
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== "object" || data === null) return null
    const { id, from } = data as { id?: unknown; from?: unknown }
    if (typeof id === "string" && getMeta(id)) return { id }
    if (isPath(from)) return { from }
  } catch {
    // not ours
  }
  return null
}

/** The tray: every piece, the page sections first, then the layout pieces that hold others. */
const TRAY_ORDER = ["sections", "layout"]
const trayRank = (meta: AnyMeta) => (TRAY_ORDER.indexOf(meta.group) + 1 || TRAY_ORDER.length + 1)
export const trayPieces = (): readonly AnyMeta[] => [...allMeta].sort((a, b) => trayRank(a) - trayRank(b))
