import { act, createEvent, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import ClientPlayground from "./ClientPlayground"
import ClientPlaygroundPage from "./ClientPlaygroundPage"
import { DRAG_TYPE, decodePage, encodeItems, encodePage, starterPage, type PageItem, type Path } from "./playground/model"
import { LocationProbe, renderAt, stubRegistry, stubScrolling } from "./test-utils"

beforeEach(() => {
  window.sessionStorage.clear()
  stubScrolling()
  stubRegistry()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const page = (ids: string[]): PageItem[] => ids.map((id) => ({ id }))
const frame = () => screen.getByTitle("Your page") as HTMLIFrameElement
const where = () => screen.getByTestId("location").textContent ?? ""
const pageInAddress = () => decodePage(where().split("?")[1] ?? "").items?.map((item) => item.id)
/** What the playground last told the page inside its frame. */
const told = (post: { mock: { calls: unknown[][] } }) => decodePage((post.mock.calls.filter(([m]) => (m as { type?: string }).type === "ds:state").at(-1)![0] as { search: string }).search)
/** A message as the page inside the frame would send it. */
const report = (data: unknown, from: { source?: unknown; origin?: string } = {}) =>
  act(() => {
    window.dispatchEvent(new MessageEvent("message", { data, source: (from.source === undefined ? frame().contentWindow : from.source) as Window | null, origin: from.origin ?? window.location.origin }))
  })

function renderPlayground(path = "/client/playground") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ClientPlayground />
      <LocationProbe />
    </MemoryRouter>,
  )
}

describe("the playground", () => {
  it("is in the side nav and starts from a ready-made page, in a look, inside the device frame", async () => {
    renderAt("/client/playground")
    await screen.findByRole("heading", { level: 1, name: "Playground" })
    expect(within(screen.getByRole("navigation", { name: "Client work" })).getByRole("link", { name: "Playground" })).toHaveAttribute("href", "/client/playground")
    const src = frame().getAttribute("src")!
    expect(src).toMatch(/^\/client\/preview\/playground\?/)
    const first = decodePage(src.split("?")[1]!)
    expect(first.look).toBe("wecuratelife")
    expect(first.items).toEqual(starterPage())
    expect(document.title).toBe("Playground · Client work · Design System")
  })

  it("opens the page a link carries, in the look it names", async () => {
    // the picked client is read from the browser's own address, as on a real visit
    const path = `/client/playground?look=urlovematters&page=${encodeItems(page(["chips", "button"]))}`
    window.history.replaceState(null, "", path)
    renderAt(path)
    window.history.replaceState(null, "", "/")
    await screen.findByRole("heading", { level: 1, name: "Playground" })
    const first = decodePage(frame().getAttribute("src")!.split("?")[1]!)
    expect(first.look).toBe("urlovematters")
    expect(first.items).toEqual(page(["chips", "button"]))
  })

  it("adds a piece from the tray at the end, selects it and shows its options; the address follows", async () => {
    renderPlayground(`/client/playground?page=${encodeItems(page(["chips"]))}`)
    const post = vi.spyOn(frame().contentWindow!, "postMessage")
    await userEvent.click(screen.getByRole("button", { name: "Add Button" }))
    expect(told(post).items).toEqual(page(["chips", "button"]))
    expect(told(post).selected).toEqual([1])
    expect(screen.getByRole("heading", { level: 2, name: "Button options" })).toBeInTheDocument()
    await waitFor(() => expect(pageInAddress()).toEqual(["chips", "button"]))
  })

  it("a structure from the tray goes onto the page with its first space picked, and pieces then go into it", async () => {
    renderPlayground(`/client/playground?page=${encodeItems(page(["nav-bar", "footer"]))}`)
    const post = vi.spyOn(frame().contentWindow!, "postMessage")
    await userEvent.click(screen.getByRole("button", { name: "Add structure: Halves" }))
    expect(told(post).items!.map((item) => item.id)).toEqual(["nav-bar", "columns", "footer"])
    expect(told(post).selected).toEqual([1, 0])
    expect(screen.getByText("Tap a piece to add it to the picked space.")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Add Button" }))
    await userEvent.click(screen.getByRole("button", { name: "Add Chips" }))
    expect(told(post).items![1]!.c).toEqual([[{ id: "button" }, { id: "chips" }], []])
    expect(told(post).selected).toEqual([1, 0]) // the space stays picked

    // the page reports that the other space was picked: the next piece goes there
    report({ type: "ds:page", items: told(post).items!.map((item) => (item.c ? [item.id, item.p ?? "", item.c.map((slot) => slot.map((inside) => [inside.id]))] : [item.id, item.p ?? ""])), selected: [1, 1] })
    await userEvent.click(screen.getByRole("button", { name: "Add Eyebrow" }))
    expect(told(post).items![1]!.c![1]).toEqual([{ id: "eyebrow" }])

    // with a structure itself selected, a piece fills its first empty space; a second structure goes after it
    report({ type: "ds:page", items: [["nav-bar"], ["columns", "", [[["button"]], []]], ["footer"]], selected: [1] })
    expect(screen.getByRole("heading", { level: 2, name: "Structure options" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Add Chips" }))
    expect(told(post).items![1]!.c).toEqual([[{ id: "button" }], [{ id: "chips" }]])
    await userEvent.click(screen.getByRole("button", { name: "Add structure: Grid" }))
    expect(told(post).items!.map((item) => item.id)).toEqual(["nav-bar", "columns", "grid", "footer"])
  })

  it("the tray lists structures as pictures and no layout piece among the pieces", () => {
    renderPlayground(`/client/playground?page=${encodeItems([])}`)
    expect(screen.getAllByRole("button", { name: /^Add structure: / })).toHaveLength(8)
    for (const name of ["Add Columns", "Add Row", "Add Grid", "Add Stack", "Add Container"]) expect(screen.queryByRole("button", { name })).toBeNull()
    expect(screen.getByRole("button", { name: "Add Hero" })).toBeInTheDocument()
  })

  it("editing the selected piece's options changes that piece only", async () => {
    renderPlayground(`/client/playground?page=${encodeItems(page(["button", "button"]))}`)
    const post = vi.spyOn(frame().contentWindow!, "postMessage")
    report({ type: "ds:page", items: [["button"], ["button"]], selected: [1] })
    await userEvent.click(screen.getByRole("radio", { name: "outline" }))
    const items = told(post).items!
    expect(items[0]).toEqual({ id: "button" })
    expect(items[1]!.p).toBeTruthy()
  })

  it("takes the arrangement the page inside the frame reports, from that frame only", async () => {
    renderPlayground(`/client/playground?page=${encodeItems(page(["chips", "button"]))}`)
    const post = vi.spyOn(frame().contentWindow!, "postMessage")
    report({ type: "ds:page", items: [["button"], ["chips"], ["nope"]], selected: [0] })
    expect(told(post).items).toEqual(page(["button", "chips"]))
    expect(screen.getByRole("heading", { level: 2, name: "Button options" })).toBeInTheDocument()
    for (const from of [{ source: window }, { source: null }, { origin: "https://example.com" }]) {
      report({ type: "ds:page", items: [], selected: null }, from)
    }
    report({ type: "ds:page", items: "x", selected: null })
    expect(told(post).items).toEqual(page(["button", "chips"]))
  })

  it("Clear page empties it and Start over brings the starter back", async () => {
    renderPlayground(`/client/playground?page=${encodeItems(page(["chips"]))}`)
    const post = vi.spyOn(frame().contentWindow!, "postMessage")
    await userEvent.click(screen.getByRole("button", { name: "Clear page" }))
    expect(told(post).items).toEqual([])
    expect(screen.getByRole("button", { name: "Clear page" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Start over" }))
    expect(told(post).items).toEqual(starterPage())
  })

  it("a font picked from the set reaches the page and the address, a link brings it back, and Start over drops it", async () => {
    renderPlayground(`/client/playground?page=${encodeItems(page(["chips"]))}&font=garamond`)
    const post = vi.spyOn(frame().contentWindow!, "postMessage")
    const fonts = screen.getByRole("combobox", { name: "Fonts" })
    expect(fonts).toHaveTextContent("EB Garamond + Sen")
    expect(fonts.tagName).toBe("BUTTON")
    await userEvent.click(fonts)
    await userEvent.click(await screen.findByRole("option", { name: "Poppins" }))
    expect(told(post).font).toBe("poppins")
    await waitFor(() => expect(where()).toContain("font=poppins"))
    await userEvent.click(screen.getByRole("button", { name: "Start over" }))
    expect(told(post).font).toBeNull()
  })

  it("Copy link copies this page's address with the look and the arrangement", async () => {
    const writeText = vi.fn(async (text: string) => void text)
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } })
    renderPlayground(`/client/playground?page=${encodeItems(page(["chips"]))}`)
    fireEvent.click(screen.getByRole("button", { name: /Copy link/ }))
    await screen.findByText("Link copied")
    const url = new URL(writeText.mock.calls[0]![0] as string)
    expect(decodePage(url.search)).toMatchObject({ look: "wecuratelife", items: page(["chips"]) })
  })
})

describe("the page inside the playground's frame", () => {
  const renderPage = (items: PageItem[], selected: Path | null = null) =>
    render(
      <MemoryRouter initialEntries={[`/client/preview/playground?${encodePage({ look: "urlovematters", items, selected })}`]}>
        <ClientPlaygroundPage />
      </MemoryRouter>,
    )
  const rows = () => Array.from(document.querySelectorAll<HTMLElement>("[data-item]"))
  const order = () => rows().map((row) => row.querySelector(".ds-root, [class^='ds-']")?.className.split(" ")[0])

  it("stacks the pieces in order, in the look, and says so when the page is empty", () => {
    const view = renderPage(page(["chips", "button"]))
    expect(document.querySelector(".ds-root")).toHaveAttribute("data-theme", "urlovematters")
    expect(order()).toEqual(["ds-chips", "ds-button"])
    view.unmount()
    renderPage([])
    expect(screen.getByText("Pick a structure to start your page.")).toBeInTheDocument()
  })

  it("each piece has buttons to move it up, down and off the page; the ends cannot move further", async () => {
    renderPage(page(["chips", "button", "eyebrow"]))
    expect(screen.getByRole("button", { name: "Move Chips up" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Move Eyebrow down" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Move Chips down" }))
    expect(order()).toEqual(["ds-button", "ds-chips", "ds-eyebrow"])
    expect(rows()[1]).toHaveAttribute("data-selected")
    await userEvent.click(screen.getByRole("button", { name: "Move Eyebrow up" }))
    expect(order()).toEqual(["ds-button", "ds-eyebrow", "ds-chips"])
    await userEvent.click(screen.getByRole("button", { name: "Remove Eyebrow" }))
    expect(order()).toEqual(["ds-button", "ds-chips"])
  })

  it("a click selects a piece, and a link inside a piece does not leave the page", async () => {
    renderPage(page(["text-link", "chips"]))
    const link = rows()[0]!.querySelector("a")!
    const event = new MouseEvent("click", { bubbles: true, cancelable: true })
    act(() => {
      link.dispatchEvent(event)
    })
    expect(event.defaultPrevented).toBe(true)
    expect(rows()[0]).toHaveAttribute("data-selected")
    await userEvent.click(rows()[1]!.querySelector(".ds-chips")!)
    expect(rows()[1]).toHaveAttribute("data-selected")
    expect(rows()[0]).not.toHaveAttribute("data-selected")
  })

  it("a piece dropped from the tray lands where it is dropped; a piece dragged on the page moves there", () => {
    renderPage(page(["chips", "button"]))
    // jsdom lays nothing out: every row is at 0, so a drop at y=10 lands after the last row, y=-10 before the first.
    const drop = (payload: object, clientY: number) => {
      const dataTransfer = { types: [DRAG_TYPE], getData: () => JSON.stringify(payload), dropEffect: "none" }
      const root = document.querySelector(".ds-root")!
      for (const make of [createEvent.dragOver, createEvent.drop]) {
        const event = make(root, { dataTransfer })
        Object.defineProperty(event, "clientY", { value: clientY }) // jsdom's drag events carry no position
        fireEvent(root, event)
      }
    }
    drop({ id: "eyebrow" }, 10)
    expect(order()).toEqual(["ds-chips", "ds-button", "ds-eyebrow"])
    drop({ from: [2] }, -10)
    expect(order()).toEqual(["ds-eyebrow", "ds-chips", "ds-button"])
    drop({ id: "nope" }, 10)
    drop({ from: [99] }, 10)
    expect(order()).toEqual(["ds-eyebrow", "ds-chips", "ds-button"])
  })

  describe("with layout pieces", () => {
    const nested: PageItem[] = [{ id: "chips" }, { id: "columns", c: [[{ id: "button" }], []] }]
    const dropOn = (target: Element, payload: object, clientY = 10) => {
      const dataTransfer = { types: [DRAG_TYPE], getData: () => JSON.stringify(payload), dropEffect: "none" }
      for (const make of [createEvent.dragOver, createEvent.drop]) {
        const event = make(target, { dataTransfer })
        Object.defineProperty(event, "clientY", { value: clientY })
        fireEvent(target, event)
      }
    }
    const slot = (key: string) => document.querySelector(`[data-slot="${key}"]`)!
    const inSlot = (key: string) => Array.from(slot(key).children).filter((child) => child.matches("[data-item]")).map((row) => row.querySelector("[class^='ds-']")?.className.split(" ")[0])

    it("draws a Columns with a slot per column, its pieces inside, and an invitation in an empty one", () => {
      renderPage(nested)
      expect(document.querySelectorAll(".ds-columns__grid > [data-slot]")).toHaveLength(2)
      expect(inSlot("1.0")).toEqual(["ds-button"])
      expect(slot("1.1")).toHaveTextContent("Add a piece")
      expect(within(slot("1.1") as HTMLElement).getByRole("button", { name: "Add a piece here" })).toHaveAttribute("data-empty")
      expect(within(slot("1.0") as HTMLElement).getByRole("button", { name: "Add a piece here" })).not.toHaveAttribute("data-empty")
      expect(rows().map((row) => row.dataset.item)).toEqual(["0", "1", "1.0.0"])
    })

    it("a piece dropped on a slot goes into it; one dragged from the page moves in, and out again", () => {
      renderPage(nested)
      dropOn(slot("1.1"), { id: "eyebrow" })
      expect(inSlot("1.1")).toEqual(["ds-eyebrow"])
      dropOn(slot("1.0"), { from: [0] }, -10) // the chips, from the page to the top of the first column
      expect(rows().map((row) => row.dataset.item)).toEqual(["0", "0.0.0", "0.0.1", "0.1.0"])
      expect(inSlot("0.0")).toEqual(["ds-chips", "ds-button"])
      expect(document.querySelector('[data-item="0.0.0"]')).toHaveAttribute("data-selected")
      dropOn(document.querySelector(".ds-root")!, { from: [0, 1, 0] }) // the eyebrow, out to the end of the page
      expect(inSlot("0.1")).toEqual([])
      expect(rows().at(-1)?.dataset.item).toBe("1")
    })

    it("a Row holds its pieces as its own children, and a layout piece dropped into itself stays put", () => {
      renderPage([{ id: "row", c: [[{ id: "button" }, { id: "text-link" }]] }])
      const row = document.querySelector(".ds-row")!
      expect(row).toHaveAttribute("data-slot", "0.0")
      expect(row).toHaveAttribute("data-flow", "row")
      expect(Array.from(row.children).every((child) => child.matches("[data-item], [data-slot-add]"))).toBe(true)
      dropOn(row, { from: [0] })
      expect(rows().map((r) => r.dataset.item)).toEqual(["0", "0.0.0", "0.0.1"])
    })

    it("“Add a piece” picks its slot, and says so to the playground", async () => {
      renderPage(nested)
      const post = vi.spyOn(window.parent, "postMessage")
      const add = within(slot("1.1") as HTMLElement).getByRole("button", { name: "Add a piece here" })
      await userEvent.click(add)
      expect(slot("1.1")).toHaveAttribute("data-slot-selected")
      expect(add).toHaveAttribute("aria-pressed", "true")
      expect(document.querySelector("[data-item][data-selected]")).toBeNull()
      // jsdom's window is its own parent, so nothing is posted here; the selection is what the page holds
      expect(post).not.toHaveBeenCalled()
      await userEvent.click(document.querySelector(".ds-chips")!)
      expect(slot("1.1")).not.toHaveAttribute("data-slot-selected")
      post.mockRestore()
    })

    it("a click selects the innermost piece, and the buttons move a piece within its own slot", async () => {
      renderPage([{ id: "stack", c: [[{ id: "button" }, { id: "chips" }]] }])
      await userEvent.click(document.querySelector(".ds-chips")!)
      expect(document.querySelector('[data-item="0.0.1"]')).toHaveAttribute("data-selected")
      expect(document.querySelector('[data-item="0"]')).not.toHaveAttribute("data-selected")
      expect(screen.getByRole("button", { name: "Move Stack up" })).toBeDisabled()
      expect(screen.getByRole("button", { name: "Move Stack down" })).toBeDisabled()
      await userEvent.click(screen.getByRole("button", { name: "Move Chips up" }))
      expect(inSlot("0.0")).toEqual(["ds-chips", "ds-button"])
      await userEvent.click(screen.getByRole("button", { name: "Remove Stack" }))
      expect(screen.getByText("Pick a structure to start your page.")).toBeInTheDocument()
    })
  })

  it("sets the page in the picked fonts, over those of the look", () => {
    render(
      <MemoryRouter initialEntries={[`/client/preview/playground?${encodePage({ look: "urlovematters", items: page(["button"]), selected: null, font: "poppins" })}`]}>
        <ClientPlaygroundPage />
      </MemoryRouter>,
    )
    const root = document.querySelector<HTMLElement>(".ds-root[data-theme]")!
    expect(root.style.getPropertyValue("--ds-font-heading")).toContain("Poppins")
    expect(root.style.getPropertyValue("--ds-font-mono")).toBe("")
  })

  it("ignores a drag that is not a piece", () => {
    renderPage(page(["chips"]))
    const dataTransfer = { types: ["text/plain"], getData: () => "hello", dropEffect: "none" }
    const root = document.querySelector(".ds-root")!
    expect(fireEvent.dragOver(root, { dataTransfer, clientY: 10 })).toBe(true) // not prevented: not a drop target for it
    fireEvent.drop(root, { dataTransfer, clientY: 10 })
    expect(order()).toEqual(["ds-chips"])
  })

  it("takes the page its framing page sends, and only from that page", () => {
    renderPage(page(["chips"]))
    const send = (source: unknown, origin = window.location.origin) =>
      act(() => {
        window.dispatchEvent(new MessageEvent("message", { data: { type: "ds:state", search: encodePage({ look: "neutral", items: page(["button"]), selected: [0] }) }, source: source as Window, origin }))
      })
    send(window.parent, "https://example.com")
    send(null)
    expect(order()).toEqual(["ds-chips"])
    send(window.parent)
    expect(order()).toEqual(["ds-button"])
    expect(document.querySelector(".ds-root")).toHaveAttribute("data-theme", "neutral")
  })
})
