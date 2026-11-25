import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { THEMES, TOKENS } from "@/client/tokens/contract"
import { renderAt, stubScrolling } from "./test-utils"

beforeEach(stubScrolling)
afterEach(() => vi.restoreAllMocks())

const columns = () => Array.from(document.querySelectorAll<HTMLElement>("[data-look-column]"))

async function open(page: string, heading: string) {
  renderAt(`/client/styles/${page}`)
  await screen.findByRole("heading", { level: 1, name: heading })
}

describe("the style pages", () => {
  it("colour: one column per look, each in its look, with one swatch per colour token", async () => {
    await open("colour", "Colour")
    const cols = columns()
    expect(cols.map((col) => col.dataset.theme)).toEqual(THEMES.map((look) => look.id))
    expect(cols.every((col) => col.classList.contains("ds-root"))).toBe(true)
    expect(cols.map((col) => within(col).getByRole("heading", { level: 2 }).textContent)).toEqual(THEMES.map((look) => look.label))
    const colourTokens = TOKENS.filter((token) => token.startsWith("--ds-color-"))
    expect(colourTokens.length).toBeGreaterThan(5)
    for (const col of cols) {
      expect(Array.from(col.querySelectorAll("[data-token]")).map((name) => name.textContent)).toEqual(colourTokens)
    }
    expect(document.title).toBe("Colour · Client work · Design System")
  })

  it("type: three columns of six specimens", async () => {
    await open("type", "Type")
    expect(columns()).toHaveLength(3)
    for (const col of columns()) expect(col.querySelectorAll("[data-specimen]")).toHaveLength(6)
  })

  it("motion: a Play button per easing in each column, and playing sends the dot on its way", async () => {
    await open("motion", "Motion")
    const col = columns()[0]!
    const play = within(col).getAllByRole("button", { name: /^Play/ })
    expect(play).toHaveLength(2)
    expect(play[0]).toHaveAccessibleName("Play, Ease out, We Curate Life")
    expect(col.querySelector("[data-run]")).toBeNull()
    await userEvent.click(play[0]!)
    expect(col.querySelectorAll("[data-run]")).toHaveLength(1)
  })

  it("an unknown style page says so", async () => {
    renderAt("/client/styles/bogus")
    expect(await screen.findByRole("heading", { level: 1, name: "No style page at this address" })).toBeInTheDocument()
    expect(columns()).toHaveLength(0)
  })
})
