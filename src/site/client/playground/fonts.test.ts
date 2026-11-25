import { describe, expect, it } from "vitest"

import { FONT_SETS, fontSet, fontStyle } from "./fonts"
import { decodePage, encodePage } from "./model"

describe("font sets", () => {
  it("have unique ids and only name fonts a look already loads", () => {
    expect(new Set(FONT_SETS.map((set) => set.id)).size).toBe(FONT_SETS.length)
    const loaded = ["Cormorant", "Inter Tight", "EB Garamond", "Poppins", "Sen", "Tangerine", "Pacifico", "Courier Prime", "Courier New"]
    for (const set of FONT_SETS) {
      for (const name of `${set.heading},${set.body}`.match(/"[^"]+"/g) ?? []) expect(loaded).toContain(name.slice(1, -1))
    }
  })

  it("point the look's font tokens at the picked set, and leave them alone with no pick", () => {
    expect(fontStyle(null)).toBeUndefined()
    expect(fontStyle("nope")).toBeUndefined()
    expect(fontStyle("cormorant")).toMatchObject({ "--ds-font-heading": '"Cormorant", serif', "--ds-font-paragraph": expect.stringContaining("Inter Tight") })
    expect(fontSet("poppins")?.label).toBe("Poppins")
  })

  it("travel with the page", () => {
    const search = encodePage({ look: "neutral", items: [], selected: null, font: "garamond" })
    expect(decodePage(search).font).toBe("garamond")
    expect(encodePage({ look: "neutral", items: [], selected: null, font: null })).not.toContain("font")
  })
})
