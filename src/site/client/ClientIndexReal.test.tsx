import { render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { allMeta } from "@/client/catalog/registry"
import ClientIndex from "./ClientIndex"

// ClientIndex.test.tsx swaps the registry for stand-ins; this file renders the real cards, live pieces and all.
describe("the client work index with the real pieces", () => {
  let errors: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    errors = vi.spyOn(console, "error")
    render(
      <MemoryRouter initialEntries={["/client"]}>
        <ClientIndex />
      </MemoryRouter>,
    )
  })
  afterEach(() => errors.mockRestore())

  it("renders every card without a console error", () => {
    expect(within(screen.getByRole("list", { name: "Pieces" })).getAllByRole("listitem")).toHaveLength(allMeta.length)
    expect(errors).not.toHaveBeenCalled()
  })

  it("has no interactive element inside a link, and every card links to its page", () => {
    expect(document.querySelectorAll("a a, a button, a input, a select, a textarea, a [tabindex]")).toHaveLength(0)
    for (const meta of allMeta) {
      expect(screen.getByRole("link", { name: meta.name })).toHaveAttribute("href", `/client/${meta.id}`)
    }
  })

  it("keeps every live piece inert and hidden from assistive technology", () => {
    const views = document.querySelectorAll("[data-card-view]")
    expect(views).toHaveLength(allMeta.length)
    for (const view of views) {
      expect(view).toHaveAttribute("inert", "")
      expect(view).toHaveAttribute("aria-hidden", "true")
    }
  })

  it("draws each piece in its home look", () => {
    const looks = Array.from(document.querySelectorAll("[data-card-view] > .ds-root")).map((root) => root.getAttribute("data-theme"))
    expect(looks).toEqual(allMeta.map((meta) => meta.homeTheme))
  })

  it("loads the Photo card image eagerly, so the card is not a blank frame", () => {
    const card = screen.getByRole("link", { name: "Photo" }).closest("li")!
    expect(card.querySelector("img")).toHaveAttribute("loading", "eager")
  })
})
