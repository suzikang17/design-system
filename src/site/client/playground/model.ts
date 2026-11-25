import type { ComponentMeta } from "@/client/catalog/meta"
import { allMeta, getMeta } from "@/client/catalog/registry"
import { splitShares } from "@/client/components/columns/splitShares"
import { decodeState, encodeState } from "@/client/catalog/state"
import { isThemeId, type ThemeId } from "@/client/tokens/contract"
import { fontSet } from "./fonts"

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- a meta of any piece, as in the registry
type AnyMeta = ComponentMeta<any>

/** One piece on the playground's page: which piece, its options as that piece's own link encodes them (`p`), and,
 *  for a layout piece (Columns, Row, Grid, Stack, Container), the pieces it holds, one list per slot (`c`). Columns
 *  has a slot per column; the others have one. */
export type PageItem = { id: string; p?: string; c?: PageItem[][] }

/** Where an item is: its index on the page, or index, slot, index for an item inside a layout piece, and so on. */
export type Path = readonly number[]

/** `font` is the id of a picked font set (see fonts.ts); null keeps the fonts of the look. */
export type PageState = { look: ThemeId; items: PageItem[]; selected: Path | null; font?: string | null }

/** A page holds at most this many pieces, whatever a link says. */
export const MAX_ITEMS = 24
const MAX_PAGE_LENGTH = 60000
const MAX_ITEM_P = 20000
/** A layout piece may sit inside another, and no deeper. */
export const MAX_DEPTH = 2

/** The look the page is drawn in when no client is picked. */
export const DEFAULT_LOOK: ThemeId = "wecuratelife"

/** The page a visitor starts from: almost nothing. A nav bar and a footer in the layout of the site whose look the
 *  page is drawn in, and between them one empty two-column structure, waiting for pieces. */
const STARTER_IDS = ["nav-bar", "columns", "footer"]
const STARTER_VARIANTS: Record<ThemeId, Record<string, string>> = {
  wecuratelife: { "nav-bar": "bar", footer: "minimal" },
  urlovematters: { "nav-bar": "menu", footer: "row" },
  neutral: { "nav-bar": "menu", footer: "row" },
}
export function starterPage(look: ThemeId = DEFAULT_LOOK): PageItem[] {
  return STARTER_IDS.flatMap((id) => {
    const meta = getMeta(id)
    if (!meta) return []
    const variant = STARTER_VARIANTS[look][id]
    return [tidy(variant ? withProps({ id }, { ...meta.defaults, variant }) : { id })]
  })
}

/** The structures the tray offers: a layout piece with its options set, drawn as a small wireframe. `cells` are
 *  the shares of the width the wireframe shows; `rows` repeats them (a grid). */
export type Structure = { key: string; label: string; id: string; props: Record<string, unknown>; cells: readonly number[]; rows?: number; loose?: boolean }
export const STRUCTURES: readonly Structure[] = [
  { key: "full", label: "Full width", id: "columns", props: { split: "1" }, cells: [1] },
  { key: "halves", label: "Halves", id: "columns", props: { split: "1/1" }, cells: [1, 1] },
  { key: "thirds", label: "Thirds", id: "columns", props: { split: "1/1/1" }, cells: [1, 1, 1] },
  { key: "quarters", label: "Quarters", id: "columns", props: { split: "1/1/1/1" }, cells: [1, 1, 1, 1] },
  { key: "wide-narrow", label: "Wide left", id: "columns", props: { split: "2/1" }, cells: [2, 1] },
  { key: "narrow-wide", label: "Wide right", id: "columns", props: { split: "1/2" }, cells: [1, 2] },
  { key: "grid", label: "Grid", id: "grid", props: {}, cells: [1, 1, 1], rows: 2 },
  { key: "line", label: "In a line", id: "row", props: {}, cells: [2, 3, 2], loose: true },
]

/** The page item a structure starts as: empty, with its options set. */
export function structureItem(structure: Structure): PageItem | undefined {
  const meta = getMeta(structure.id)
  return meta ? tidy(withProps({ id: structure.id }, { ...meta.defaults, ...structure.props })) : undefined
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
  if (state.font) params.set("font", state.font)
  if (state.selected !== null) params.set("sel", state.selected.join("."))
  return params.toString()
}

/** Never throws. `page` absent means "no page given" (null items), which the playground answers with the starter. */
export function decodePage(search: string): { look: ThemeId | null; items: PageItem[] | null; selected: Path | null; font: string | null } {
  const params = new URLSearchParams(search)
  const look = params.get("look")
  const items = params.has("page") ? decodeItems(params.get("page")) : null
  const sel = (params.get("sel") ?? "").split(".").map((part) => (/^\d+$/.test(part) ? Number(part) : Number.NaN))
  const selected = items ? validSelection(items, sel) : null
  return { look: isThemeId(look) ? look : null, items, selected, font: fontSet(params.get("font"))?.id ?? null }
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

const isNumbers = (path: unknown): path is Path => Array.isArray(path) && path.length > 0 && path.every((n) => Number.isInteger(n) && n >= 0)
/** A path to an item: an odd number of steps. */
const isPath = (path: unknown): path is Path => isNumbers(path) && path.length % 2 === 1
/** A path to a slot of a layout piece: the item's path, then which slot. */
export const isSlotPath = (path: unknown): boolean => isNumbers(path) && path.length % 2 === 0

/** The pieces in a slot, if the slot is there. */
export function listAt(items: readonly PageItem[], slotPath: Path): PageItem[] | undefined {
  if (!isNumbers(slotPath) || slotPath.length % 2 !== 0) return undefined
  const holder = getAt(items, slotPath.slice(0, -1))
  return holder ? slotsOf(holder)[slotPath.at(-1)!] : undefined
}

/** What is selected: a piece, or a slot of a layout piece (to add pieces into). Anything else is no selection. */
export const validSelection = (items: readonly PageItem[], path: unknown): Path | null =>
  isNumbers(path) && (isSlotPath(path) ? listAt(items, path) : getAt(items, path)) ? path : null

/** Where on the page itself something added from the tray goes: after whatever holds the selection, else at the
 *  end; never below a footer that closes the page. */
export function addStructurePath(items: readonly PageItem[], selected: Path | null): Path {
  const root = selected ? items[selected[0]!] : undefined
  if (!root) return [items.at(-1)?.id === "footer" ? items.length - 1 : items.length]
  return [root.id === "footer" ? selected![0]! : selected![0]! + 1]
}

/** Where a piece added from the tray goes: into the selected slot; into the selected structure's first empty slot
 *  (its first slot when none is empty); after the selected piece when that is inside a structure; else onto the
 *  page, as a structure would. */
export function addPath(items: readonly PageItem[], selected: Path | null): Path {
  if (selected && isSlotPath(selected)) {
    const list = listAt(items, selected)
    if (list) return [...selected, list.length]
  }
  const item = selected ? getAt(items, selected) : undefined
  if (!selected || !item) return addStructurePath(items, null)
  if (slotCount(item) > 0) {
    const slots = slotsOf(item)
    const empty = Math.max(0, slots.findIndex((slot) => slot.length === 0))
    return [...selected, empty, slots[empty]!.length]
  }
  return selected.length > 1 ? [...selected.slice(0, -1), selected.at(-1)! + 1] : addStructurePath(items, selected)
}

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
  return message.type === "ds:page" && Array.isArray(message.items) && (message.selected === null || isNumbers(message.selected))
}

/** What a drag carries: a new piece from the tray, or a piece already on the page. */
export const DRAG_TYPE = "application/x-ds-piece"
export type DragPayload = { id: string; p?: string } | { from: Path }

export function readDrag(raw: string): DragPayload | null {
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== "object" || data === null) return null
    const { id, p, from } = data as { id?: unknown; p?: unknown; from?: unknown }
    if (typeof id === "string" && getMeta(id)) return typeof p === "string" && p.length > 0 && p.length <= MAX_ITEM_P ? { id, p } : { id }
    if (isPath(from)) return { from }
  } catch {
    // not ours
  }
  return null
}

/** The tray's components: every piece that is not a layout piece (those are offered as structures), the page
 *  sections first. */
export const trayPieces = (): readonly AnyMeta[] =>
  allMeta.filter((meta) => meta.group !== "layout").sort((a, b) => Number(b.group === "sections") - Number(a.group === "sections"))
