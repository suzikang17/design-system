import { describe, expect, it } from "vitest"

import button from "@/client/components/button/button.meta"
import columns from "@/client/components/columns/columns.meta"
import { MAX_ITEMS, STRUCTURES, addPath, addStructurePath, structureItem, trayPieces, validSelection, cleanItems, countItems, getAt, replaceAt, slotCount, type PageItem, decodeItems, decodePage, encodeItems, encodePage, insertAt, isPageReport, itemProps, moveTo, readDrag, removeAt, starterPage, withProps } from "./model"

const a = { id: "button" }
const b = { id: "chips" }
const c = { id: "photo" }

describe("the playground's page model", () => {
  it("round-trips a page through the address, with each piece's options", () => {
    const edited = withProps(a, { ...button.defaults, variant: "outline" })
    expect(edited.p).toBeTruthy()
    const search = encodePage({ look: "urlovematters", items: [edited, b], selected: [1] })
    expect(decodePage(search)).toEqual({ look: "urlovematters", items: [edited, b], selected: [1] })
    expect(itemProps(edited).variant).toBe("outline")
    expect(itemProps(a)).toEqual(button.defaults)
  })

  it("an item whose options are back at the defaults carries none", () => {
    expect(withProps({ id: "button", p: "x" }, { ...button.defaults })).toEqual({ id: "button" })
  })

  it("no page in the address is not an empty page", () => {
    expect(decodePage("look=neutral").items).toBeNull()
    expect(decodePage(`page=${encodeItems([])}`).items).toEqual([])
  })

  it("never throws, and keeps only what is usable from a link", () => {
    for (const raw of ["%%%", "e30", "W10", "bm9wZQ", "x".repeat(70000)]) expect(decodeItems(raw)).toEqual([])
    expect(decodePage("look=bogus&page=%%%&sel=7")).toEqual({ look: null, items: [], selected: null })
    expect(cleanItems([["button"], ["nope"], [42], "button", null, ["chips", 5], { id: "photo", p: "abc" }, ["button", "y".repeat(20001)]])).toEqual([
      { id: "button" },
      { id: "chips" },
      { id: "photo", p: "abc" },
      { id: "button" },
    ])
    expect(cleanItems(Array(100).fill(["button"]))).toHaveLength(MAX_ITEMS)
    expect(cleanItems("button")).toEqual([])
  })

  it("options from a link are held to what the piece's controls allow", () => {
    const hostile = withProps(a, { ...button.defaults, variant: "outline" })
    const p = btoa(JSON.stringify({ href: "javascript:alert(1)", variant: "nope", children: "Hi" })).replace(/=+$/, "")
    const props = itemProps({ id: "button", p })
    expect(props.href).toBe(button.defaults.href)
    expect(props.variant).toBe(button.defaults.variant)
    expect(props.children).toBe("Hi")
    expect(hostile.id).toBe("button")
  })

  it("a selection outside the page is no selection", () => {
    expect(decodePage(`page=${encodeItems([a])}&sel=1`).selected).toBeNull()
    expect(decodePage(`page=${encodeItems([a])}&sel=-1`).selected).toBeNull()
    expect(decodePage(`page=${encodeItems([a])}&sel=0`).selected).toEqual([0])
  })

  it("inserts, moves and removes", () => {
    expect(insertAt([a, b], [1], c)).toEqual([a, c, b])
    expect(insertAt([a, b], [2], c)).toEqual([a, b, c])
    expect(moveTo([a, b, c], [0], [3])).toEqual({ items: [b, c, a], at: [2] }) // to the end
    expect(moveTo([a, b, c], [2], [0])).toEqual({ items: [c, a, b], at: [0] })
    expect(moveTo([a, b, c], [0], [2]).items).toEqual([b, a, c]) // before what was third
    expect(moveTo([a, b, c], [1], [1]).items).toEqual([a, b, c])
    expect(moveTo([a, b, c], [1], [2]).items).toEqual([a, b, c])
    expect(moveTo([a, b], [9], [0])).toEqual({ items: [a, b], at: [9] })
    expect(removeAt([a, b, c], [1])).toEqual([a, c])
    expect(removeAt([a, b, c], [7])).toEqual([a, b, c])
    expect(replaceAt([a, b, c], [1], c)).toEqual([a, c, c])
    const full = Array(MAX_ITEMS).fill(a)
    expect(insertAt(full, [0], b)).toHaveLength(MAX_ITEMS)
  })

  describe("layout pieces hold other pieces", () => {
    const cols = (...slots: PageItem[][]): PageItem => ({ id: "columns", c: slots })
    const row = (...inside: PageItem[]): PageItem => ({ id: "row", c: [inside] })

    it("a layout piece always carries its slots: one per column for Columns, one for the others", () => {
      expect(insertAt([], [0], { id: "columns" })).toEqual([cols([], [])])
      expect(insertAt([], [0], { id: "row" })).toEqual([row()])
      expect(slotCount({ id: "grid" })).toBe(1)
      expect(slotCount({ id: "button" })).toBe(0)
      expect(insertAt([], [0], { id: "button", c: [[a]] })).toEqual([a])
    })

    it("pieces go into a slot, move between slots and the page, and come out again", () => {
      let page = insertAt([a, cols([], [])], [1, 1, 0], b)
      expect(page).toEqual([a, cols([], [b])])
      expect(getAt(page, [1, 1, 0])).toEqual(b)
      expect(getAt(page, [1, 2, 0])).toBeUndefined()
      expect(countItems(page)).toBe(3)

      // from the page into the first column: the Columns moves up one, so the path follows it
      let moved = moveTo(page, [0], [1, 0, 0])
      expect(moved).toEqual({ items: [cols([a], [b])], at: [0, 0, 0] })
      page = moved.items

      // from one column to the end of the other
      moved = moveTo(page, [0, 0, 0], [0, 1, 1])
      expect(moved).toEqual({ items: [cols([], [b, a])], at: [0, 1, 1] })

      // out to the page, after the Columns
      moved = moveTo(moved.items, [0, 1, 0], [1])
      expect(moved).toEqual({ items: [cols([], [a]), b], at: [1] })

      expect(removeAt(moved.items, [0, 1, 0])).toEqual([cols([], []), b])
      expect(replaceAt(moved.items, [0, 1, 0], c)).toEqual([cols([], [c]), b])
    })

    it("a piece cannot be moved inside itself, into a slot that is not there, or too deep", () => {
      const page = [cols([row(a)], [])]
      expect(moveTo(page, [0], [0, 1, 0]).items).toEqual(page)
      expect(insertAt(page, [0, 5, 0], b)).toEqual(page)
      expect(insertAt(page, [0, 0], b)).toEqual(page)
      // Columns > Row is as deep as layout pieces go: no third one inside
      expect(insertAt(page, [0, 0, 0, 0, 0], { id: "stack" })).toEqual(page)
      expect(insertAt(page, [0, 0, 0, 0, 0], b)).toEqual([cols([row(b, a)], [])])
      // a layout piece that holds another cannot go inside a third
      expect(moveTo([cols([row(a)], []), row()], [0], [1, 0, 0]).items).toEqual([cols([row(a)], []), row()])
    })

    it("when a Columns loses a column, what was in it moves to the last one left", () => {
      const three = withProps(cols([a], [b], [c]), { ...columns.defaults, split: "1/1/1" })
      expect(three.c).toEqual([[a], [b], [c]])
      const two = withProps(three, { ...columns.defaults, split: "2/1" })
      expect(two.c).toEqual([[a], [b, c]])
      expect(withProps(two, { ...columns.defaults, split: "1/1/1/1" }).c).toEqual([[a], [b, c], [], []])
    })

    it("a nested page round-trips through the address, selection included", () => {
      const page = [a, withProps(cols([row(a, b)], [c]), { ...columns.defaults, split: "2/1" })]
      const search = encodePage({ look: "neutral", items: page, selected: [1, 0, 0, 0, 1] })
      expect(decodePage(search)).toEqual({ look: "neutral", items: page, selected: [1, 0, 0, 0, 1] })
      expect(decodePage(`page=${encodeItems(page)}&sel=1.0.0.0.9`).selected).toBeNull()
      // a slot can be selected too (to add into); one that is not there cannot
      expect(decodePage(`page=${encodeItems(page)}&sel=1.0`).selected).toEqual([1, 0])
      expect(decodePage(`page=${encodeItems(page)}&sel=1.5`).selected).toBeNull()
      expect(decodePage(`page=${encodeItems(page)}&sel=0.0`).selected).toBeNull()
    })

    it("holds a link to the limits: the count is of every piece, and layout pieces nest twice", () => {
      const deep = [["columns", "", [[["row", "", [[["stack", "", [[["button"]]]], ["button"]]]]], "nope"]]]
      expect(cleanItems(deep)).toEqual([cols([row(a)], [])])
      const crowd = [["row", "", [Array(100).fill(["button"])]], ["button"]]
      expect(countItems(cleanItems(crowd))).toBe(MAX_ITEMS)
      expect(cleanItems([["row", "", "x"], ["columns", 5, [null, [["chips"]]]]])).toEqual([row(), cols([], [b])])
    })
  })

  it("reads only its own drags and reports", () => {
    expect(readDrag('{"id":"button"}')).toEqual({ id: "button" })
    expect(readDrag('{"id":"columns","p":"abc"}')).toEqual({ id: "columns", p: "abc" })
    expect(readDrag('{"id":"columns","p":5}')).toEqual({ id: "columns" })
    expect(readDrag('{"from":[2]}')).toEqual({ from: [2] })
    expect(readDrag('{"from":[1,0,3]}')).toEqual({ from: [1, 0, 3] })
    for (const raw of ['{"id":"nope"}', '{"from":2}', '{"from":[-1]}', '{"from":[1.5]}', '{"from":[1,0]}', '{"from":[]}', "null", "x", ""]) expect(readDrag(raw)).toBeNull()
    expect(isPageReport({ type: "ds:page", items: [], selected: null })).toBe(true)
    expect(isPageReport({ type: "ds:page", items: [], selected: [0] })).toBe(true)
    expect(isPageReport({ type: "ds:page", items: [], selected: 0 })).toBe(false)
    for (const data of [null, "ds:page", { type: "ds:page" }, { type: "ds:page", items: "x", selected: null }, { type: "ds:page", items: [], selected: "0" }, { type: "ds:state", items: [], selected: null }]) {
      expect(isPageReport(data)).toBe(false)
    }
  })

  it("the starter page names only pieces that exist", () => {
    for (const item of starterPage()) expect(cleanItems([[item.id]])).toHaveLength(1)
    // and it survives a trip through a link unchanged, the Columns in it with what it holds
    for (const look of ["wecuratelife", "urlovematters", "neutral"] as const) expect(decodeItems(encodeItems(starterPage(look)))).toEqual(starterPage(look))
    // almost nothing: a nav bar, one empty structure and a footer
    expect(starterPage().map((item) => item.id)).toEqual(["nav-bar", "columns", "footer"])
    expect(starterPage()[1]?.c).toEqual([[], []])
  })

  it("offers structures: layout pieces with their options set, each starting empty", () => {
    for (const structure of STRUCTURES) {
      const item = structureItem(structure)!
      expect(cleanItems([item]), structure.key).toEqual([item])
      expect(item.c?.every((slot) => slot.length === 0)).toBe(true)
    }
    const byKey = (key: string) => structureItem(STRUCTURES.find((structure) => structure.key === key)!)!
    expect(byKey("full").c).toHaveLength(1)
    expect(byKey("thirds").c).toHaveLength(3)
    expect(itemProps(byKey("wide-narrow")).split).toBe("2/1")
    expect(byKey("grid").id).toBe("grid")
    expect(trayPieces().some((meta) => meta.group === "layout")).toBe(false)
    expect(trayPieces()[0]?.group).toBe("sections")
  })

  it("a piece added from the tray goes where the selection points", () => {
    const halves: PageItem = { id: "columns", c: [[a], []] }
    const page = [{ id: "nav-bar" }, halves, { id: "footer" }]
    expect(addPath(page, null)).toEqual([2]) // onto the page, above the footer
    expect(addPath([a], null)).toEqual([1])
    expect(addPath(page, [1, 1])).toEqual([1, 1, 0]) // into the picked slot
    expect(addPath(page, [1, 0])).toEqual([1, 0, 1])
    expect(addPath(page, [1])).toEqual([1, 1, 0]) // a picked structure: its first empty slot
    expect(addPath([{ id: "columns", c: [[a], [b]] }], [0])).toEqual([0, 0, 1]) // none empty: its first
    expect(addPath(page, [1, 0, 0])).toEqual([1, 0, 1]) // after the picked piece, in its slot
    expect(addPath(page, [0])).toEqual([1]) // after the picked piece, on the page
    expect(addPath(page, [2])).toEqual([2]) // never below the footer
    expect(addPath(page, [9, 0])).toEqual([2]) // a slot that is gone
    expect(addStructurePath(page, [1, 0, 0])).toEqual([2]) // after the structure the selection is in
    expect(addStructurePath(page, null)).toEqual([2])
    expect(addStructurePath([], null)).toEqual([0])
    expect(validSelection(page, [1, 1])).toEqual([1, 1])
    for (const bad of [[1, 2], [0, 0], [7], [], "1", null]) expect(validSelection(page, bad)).toBeNull()
  })
})
