import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { clientPicker, LocationProbe, pickClient } from "./test-utils"

// Stand-in pieces, so the filters can be tried on groups and origins the real ten do not cover.
vi.mock("@/client/catalog/registry", async () => {
  const actual = await vi.importActual<typeof import("@/client/catalog/registry")>("@/client/catalog/registry")
  const Demo = ({ label }: { label: string }) => <button type="button">{label}</button>
  const make = (id: string, name: string, group: string, origin: string[]) => ({
    id,
    name,
    group,
    origin,
    summary: `${name} summary`,
    component: Demo,
    defaults: { label: name },
    controls: {},
    layout: "centered",
    homeTheme: "neutral",
    files: [],
    usage: "",
  })
  return {
    ...actual,
    allMeta: [
      make("alpha", "Alpha", "primitives", ["wecuratelife", "urlovematters"]),
      make("beta", "Beta", "primitives", ["urlovematters"]),
      make("gamma", "Gamma", "sections", ["wecuratelife"]),
    ],
  }
})

const { default: ClientIndex } = await import("./ClientIndex")
const { ClientNav } = await import("./ClientNav")
const { ClientChoiceProvider } = await import("./clientChoice")

const renderAt = (path = "/client") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ClientChoiceProvider>
        <ClientNav />
        <ClientIndex />
      </ClientChoiceProvider>
      <LocationProbe />
    </MemoryRouter>,
  )

const cards = () => within(screen.queryByRole("list", { name: "Pieces" }) ?? document.createElement("ul")).queryAllByRole("listitem")
const nav = () => within(screen.getByRole("navigation", { name: "Client work" }))
const picker = clientPicker
const looks = () => Array.from(document.querySelectorAll("[data-card-view] > .ds-root")).map((root) => root.getAttribute("data-theme"))
const navPieces = () => ["Alpha", "Beta", "Gamma"].filter((name) => nav().queryByRole("link", { name }))
const names = () => cards().map((card) => within(card).getByRole("link").textContent)

beforeEach(() => window.sessionStorage.clear())

describe("the client work index", () => {
  it("shows one card per piece: the name links to its page, the live piece beside it is out of reach", () => {
    renderAt()
    expect(cards()).toHaveLength(3)
    const link = within(screen.getByRole("list", { name: "Pieces" })).getByRole("link", { name: "Alpha" })
    expect(link).toHaveAttribute("href", "/client/alpha")
    expect(link).toHaveAccessibleDescription("Alpha summary")
    const view = cards()[0]!.querySelector("[data-card-view]") as HTMLElement
    expect(view).toHaveAttribute("aria-hidden", "true")
    expect(view).toHaveAttribute("inert", "")
    expect(view.querySelector(".ds-root")).toHaveAttribute("data-theme", "neutral")
    expect(view).toHaveTextContent("Alpha")
    expect(link).not.toContainElement(view)
    // Only the name is a link a keyboard reaches; the piece's own button is hidden away.
    expect(screen.queryByRole("button", { name: "Alpha" })).not.toBeInTheDocument()
  })

  it("the client picker in the side nav keeps to that client's pieces, in the cards and the nav's lists, drawn in its look", async () => {
    renderAt()
    expect(screen.queryByRole("group", { name: "From" })).not.toBeInTheDocument()
    expect(picker()).toHaveTextContent("All clients")
    expect(looks()).toEqual(["neutral", "neutral", "neutral"]) // each stand-in's own home look
    await pickClient("We Curate Life")
    expect(names()).toEqual(["Alpha", "Gamma"])
    expect(navPieces()).toEqual(["Alpha", "Gamma"])
    expect(looks()).toEqual(["wecuratelife", "wecuratelife"])
    await pickClient("ur love matters")
    expect(names()).toEqual(["Alpha", "Beta"])
    expect(looks()).toEqual(["urlovematters", "urlovematters"])
    await pickClient("All clients")
    expect(names()).toEqual(["Alpha", "Beta", "Gamma"])
  })

  it("Neutral is no client's own look: it shows every piece, unbranded", async () => {
    renderAt()
    await pickClient("Neutral")
    expect(names()).toEqual(["Alpha", "Beta", "Gamma"])
    expect(looks()).toEqual(["neutral", "neutral", "neutral"])
  })

  it("a link that names a look opens with that client picked; a link without one starts at All clients", () => {
    window.history.replaceState(null, "", "/client?look=wecuratelife")
    const { unmount } = renderAt("/client?look=wecuratelife")
    expect(picker()).toHaveTextContent("We Curate Life")
    unmount()
    window.history.replaceState(null, "", "/client")
    renderAt()
    expect(picker()).toHaveTextContent("All clients")
  })

  it("filters by group, and combines the two filters", async () => {
    renderAt()
    await userEvent.click(within(screen.getByRole("group", { name: "Group" })).getByRole("button", { name: "Primitives" }))
    expect(names()).toEqual(["Alpha", "Beta"])
    await pickClient("We Curate Life")
    expect(names()).toEqual(["Alpha"])
    expect(screen.getByTestId("location").textContent).toBe("/client?group=primitives")
    await userEvent.click(within(screen.getByRole("group", { name: "Group" })).getByRole("button", { name: "All" }))
    expect(names()).toEqual(["Alpha", "Gamma"])
  })

  it("reads the filters from the address, and treats an unknown value as All", () => {
    const { unmount } = renderAt("/client?group=sections")
    expect(names()).toEqual(["Gamma"])
    unmount()
    renderAt("/client?group=zzz&from=elsewhere")
    expect(cards()).toHaveLength(3)
    expect(within(screen.getByRole("group", { name: "Group" })).getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true")
  })

  it("says so when the filters match nothing, and offers the way back", async () => {
    renderAt("/client?group=galleries")
    expect(cards()).toHaveLength(0)
    expect(screen.getByText(/Nothing here yet/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Show all pieces" }))
    expect(cards()).toHaveLength(3)
  })

  it("offers a group pill only for groups that hold a piece", () => {
    renderAt()
    const pills = within(screen.getByRole("group", { name: "Group" })).getAllByRole("button")
    expect(pills.map((pill) => pill.textContent)).toEqual(["All", "Primitives", "Sections"])
  })
})
