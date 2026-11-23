import { describe, expect, it } from "vitest"

import button from "@/client/components/button/button.meta"
import { MAX_ITEMS, cleanItems, decodeItems, decodePage, encodeItems, encodePage, insertAt, isPageReport, itemProps, moveTo, readDrag, removeAt, starterPage, withProps } from "./model"

const a = { id: "button" }
const b = { id: "chips" }
const c = { id: "photo" }

describe("the playground's page model", () => {
  it("round-trips a page through the address, with each piece's options", () => {
    const edited = withProps(a, { ...button.defaults, variant: "outline" })
    expect(edited.p).toBeTruthy()
    const search = encodePage({ look: "urlovematters", items: [edited, b], selected: 1 })
    expect(decodePage(search)).toEqual({ look: "urlovematters", items: [edited, b], selected: 1 })
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
    expect(decodePage(`page=${encodeItems([a])}&sel=0`).selected).toBe(0)
  })

  it("inserts, moves and removes", () => {
    expect(insertAt([a, b], 1, c)).toEqual([a, c, b])
    expect(insertAt([a, b], 2, c)).toEqual([a, b, c])
    expect(moveTo([a, b, c], 0, 3)).toEqual([b, c, a]) // to the end
    expect(moveTo([a, b, c], 2, 0)).toEqual([c, a, b])
    expect(moveTo([a, b, c], 0, 2)).toEqual([b, a, c]) // before what was third
    expect(moveTo([a, b, c], 1, 1)).toEqual([a, b, c])
    expect(moveTo([a, b, c], 1, 2)).toEqual([a, b, c])
    expect(moveTo([a, b], 9, 0)).toEqual([a, b])
    expect(removeAt([a, b, c], 1)).toEqual([a, c])
    const full = Array(MAX_ITEMS).fill(a)
    expect(insertAt(full, 0, b)).toHaveLength(MAX_ITEMS)
  })

  it("reads only its own drags and reports", () => {
    expect(readDrag('{"id":"button"}')).toEqual({ id: "button" })
    expect(readDrag('{"from":2}')).toEqual({ from: 2 })
    for (const raw of ['{"id":"nope"}', '{"from":-1}', '{"from":1.5}', "null", "x", ""]) expect(readDrag(raw)).toBeNull()
    expect(isPageReport({ type: "ds:page", items: [], selected: null })).toBe(true)
    expect(isPageReport({ type: "ds:page", items: [], selected: 0 })).toBe(true)
    for (const data of [null, "ds:page", { type: "ds:page" }, { type: "ds:page", items: "x", selected: null }, { type: "ds:page", items: [], selected: "0" }, { type: "ds:state", items: [], selected: null }]) {
      expect(isPageReport(data)).toBe(false)
    }
  })

  it("the starter page names only pieces that exist", () => {
    for (const item of starterPage()) expect(cleanItems([[item.id]])).toHaveLength(1)
  })
})
