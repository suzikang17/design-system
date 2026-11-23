import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import button from "@/client/components/button/button.meta"
import { encodeState } from "@/client/catalog/state"
import { renderAt, stubRegistry, stubScrolling } from "./test-utils"

// Highlighting loads Shiki; the plain text it starts from is what these tests read.
vi.mock("@/site/highlight", () => ({ highlight: () => new Promise<string>(() => {}) }))

beforeEach(() => {
  stubScrolling()
  stubRegistry()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const frame = () => screen.getByTitle("Button preview") as HTMLIFrameElement
const where = () => screen.getByTestId("location").textContent
const lookButton = (name: string) => within(screen.getByRole("group", { name: "Look" })).getByRole("button", { name })
const sideNav = () => within(screen.getByRole("navigation", { name: "Client work" }))
const statesPosted = (post: { mock: { calls: unknown[][] } }) =>
  post.mock.calls.filter(([message]) => (message as { type?: string }).type === "ds:state")

async function openButton(path = "/client/button") {
  renderAt(path)
  await screen.findByRole("heading", { level: 1, name: "Button" })
}

describe("a client piece's page", () => {
  it("shows the name, the summary and a preview frame bound to the piece's home look", async () => {
    await openButton()
    expect(screen.getByText(button.summary)).toBeInTheDocument()
    expect(frame().getAttribute("src")).toMatch(/\/client\/preview\/button\?look=urlovematters$/)
    expect(lookButton("ur love matters")).toHaveAttribute("aria-pressed", "true")
    expect(document.title).toBe("Button · Client work · Design System")
  })

  it("labels the look switch Look, apart from the site's theme switch", async () => {
    await openButton()
    expect(screen.getByText("Look", { selector: "span" })).toBeVisible()
    expect(within(screen.getByRole("group", { name: "Look" })).getAllByRole("button")).toHaveLength(3)
    expect(screen.getByRole("button", { name: /^Theme:/ })).toBeInTheDocument()
  })

  it("switching the look posts ds:state to the frame and updates the address, without reloading the frame", async () => {
    await openButton()
    const src = frame().getAttribute("src")
    const post = vi.spyOn(frame().contentWindow!, "postMessage")

    await userEvent.click(lookButton("We Curate Life"))

    const [message, origin] = statesPosted(post).at(-1)!
    expect((message as { search: string }).search).toBe("look=wecuratelife")
    expect(origin).toBe(window.location.origin)
    expect(where()).toBe("/client/button?look=wecuratelife")
    expect(frame().getAttribute("src")).toBe(src)
    expect(lookButton("We Curate Life")).toHaveAttribute("aria-pressed", "true")
  })

  it("keeps the look and options from the address on load", async () => {
    const search = encodeState(button, { theme: "neutral", props: { ...button.defaults, variant: "outline" } })
    await openButton(`/client/button?${search}`)
    expect(frame().getAttribute("src")).toBe(`/client/preview/button?${search}`)
    expect(lookButton("Neutral")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("radio", { name: "outline" })).toHaveAttribute("aria-checked", "true")
  })

  it("falls back to the home look and defaults for an unusable address (?look=bogus&p=%%%)", async () => {
    await openButton("/client/button?look=bogus&p=%%%")
    expect(lookButton("ur love matters")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("textbox", { name: "Label" })).toHaveValue("Label")
    expect(screen.getByRole("radio", { name: "primary" })).toHaveAttribute("aria-checked", "true")
    expect(frame().getAttribute("src")).toMatch(/\?look=urlovematters$/)
  })

  it("editing an option replaces the address (no new history entry) and posts the state", async () => {
    renderAt("/client")
    await screen.findByRole("heading", { level: 1, name: "Client work" })
    await userEvent.click(within(screen.getByRole("list", { name: "Pieces" })).getByRole("link", { name: "Button" }))
    await screen.findByRole("heading", { level: 1, name: "Button" })
    const post = vi.spyOn(frame().contentWindow!, "postMessage")

    await userEvent.click(screen.getByRole("radio", { name: "outline" }))

    const expected = encodeState(button, { theme: "urlovematters", props: { ...button.defaults, variant: "outline" } })
    expect(where()).toBe(`/client/button?${expected}`)
    expect((statesPosted(post).at(-1)![0] as { search: string }).search).toBe(expected)
    // Back leaves the page: the edit did not push an entry of its own.
    await userEvent.click(screen.getByRole("button", { name: "History back" }))
    expect(where()).toBe("/client")
  })

  it("the size switch sets the frame to 100%, 768px and 390px", async () => {
    await openButton()
    const sizes = within(screen.getByRole("group", { name: "Preview width" }))
    expect(frame().style.width).toBe("100%")
    await userEvent.click(sizes.getByRole("button", { name: "Tablet" }))
    expect(frame().style.width).toBe("768px")
    await userEvent.click(sizes.getByRole("button", { name: "Phone" }))
    expect(frame().style.width).toBe("390px")
    expect(sizes.getByRole("button", { name: "Phone" })).toHaveAttribute("aria-pressed", "true")
    await userEvent.click(sizes.getByRole("button", { name: "Desktop" }))
    expect(frame().style.width).toBe("100%")
  })

  it("Replay posts ds:replay to the frame", async () => {
    await openButton()
    const post = vi.spyOn(frame().contentWindow!, "postMessage")
    await userEvent.click(screen.getByRole("button", { name: "Replay" }))
    expect(post).toHaveBeenCalledWith({ type: "ds:replay" }, window.location.origin)
  })

  it("reaches the look, the sizes, Replay and the options by keyboard, in reading order", async () => {
    await openButton()
    lookButton("Neutral").focus()
    // (In a browser the frame is a stop here, and the piece inside it is reached from there; jsdom skips it.)
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "Desktop" })).toHaveFocus()
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "Replay" })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole("textbox", { name: "Label" })).toHaveFocus()
    for (const name of ["Preview", "Options", "Install", "Dependencies", "Source"]) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument()
    }
  })

  it("a navigation to the same piece with another search resets the page and tells the frame, without reloading it", async () => {
    await openButton("/client/button?look=neutral")
    const before = frame()
    const post = vi.spyOn(before.contentWindow!, "postMessage")

    // The side nav's link carries no search.
    await userEvent.click(sideNav().getByRole("link", { name: "Button" }))

    expect(where()).toBe("/client/button")
    expect(lookButton("Neutral")).toHaveAttribute("aria-pressed", "false")
    expect(lookButton("ur love matters")).toHaveAttribute("aria-pressed", "true")
    expect((statesPosted(post).at(-1)![0] as { search: string }).search).toBe("look=urlovematters")
    expect(frame()).toBe(before)
  })

  it("does not mistake its own address updates for a navigation", async () => {
    await openButton()
    const label = screen.getByRole("textbox", { name: "Label" })
    await userEvent.clear(label)
    await userEvent.type(label, "Hello there")
    expect(label).toHaveValue("Hello there")
    await userEvent.click(lookButton("Neutral"))
    expect(label).toHaveValue("Hello there")
    expect(lookButton("Neutral")).toHaveAttribute("aria-pressed", "true")
  })

  it("Back after edits on two history entries of the same piece shows the earlier entry, matching its address", async () => {
    await openButton()
    await userEvent.click(screen.getByRole("radio", { name: "outline" }))
    const first = where()
    expect(first).toMatch(/look=urlovematters&p=/)
    // A pushed navigation to the same piece, then an edit there.
    await userEvent.click(sideNav().getByRole("link", { name: "Button" }))
    expect(where()).toBe("/client/button")
    await userEvent.click(lookButton("Neutral"))
    expect(where()).toBe("/client/button?look=neutral")

    await userEvent.click(screen.getByRole("button", { name: "History back" }))

    expect(where()).toBe(first)
    expect(lookButton("ur love matters")).toHaveAttribute("aria-pressed", "true")
    expect(lookButton("Neutral")).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByRole("radio", { name: "outline" })).toHaveAttribute("aria-checked", "true")
  })

  it("shows the install command, the published dependencies and the shipped source", async () => {
    const fetchMock = stubRegistry()
    renderAt("/client/select")
    await screen.findByRole("heading", { level: 1, name: "Select" })
    expect(screen.getByText(`npx shadcn@latest add ${window.location.origin}/r/client-select.json`)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith("/r/client-select.json")
    const deps = within(await screen.findByRole("region", { name: "Dependencies" }))
    expect(deps.getByRole("link", { name: "client-input" })).toHaveAttribute("href", "/client/input")
    expect(deps.getByText("client-base").tagName).toBe("SPAN")
    const source = within(screen.getByRole("region", { name: "Source" }))
    expect(await source.findByText("client/components/select/Select.tsx")).toBeInTheDocument()
    expect(await source.findByText("client/components/select/select.css")).toBeInTheDocument()
    expect(source.queryByText(/select\.meta\.ts/)).not.toBeInTheDocument()
  })

  it("links to the site where the piece is seen, when its meta names one", async () => {
    renderAt("/client/select")
    const link = await screen.findByRole("link", { name: /wecuratelife\.com/ })
    expect(link).toHaveAttribute("href", "https://wecuratelife.com/contact")
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
    // Button names no site of its own.
    await userEvent.click(sideNav().getByRole("link", { name: "Button" }))
    await screen.findByRole("heading", { level: 1, name: "Button" })
    expect(screen.queryByText(/^Seen on/)).not.toBeInTheDocument()
  })
})

describe("client work navigation", () => {
  it("the header links to Client work beside Components", async () => {
    renderAt("/")
    const site = within(screen.getByRole("navigation", { name: "Site" }))
    expect(site.getAllByRole("link").map((link) => link.textContent)).toEqual(expect.arrayContaining(["Components", "Client work"]))
    expect(site.getByRole("link", { name: "Client work" })).toHaveAttribute("href", "/client")
  })

  it("the side nav lists the pages, the styles and the pieces", async () => {
    renderAt("/client/button")
    await screen.findByRole("heading", { level: 1, name: "Button" })
    for (const [name, href] of [
      ["All pieces", "/client"],
      ["Using these", "/client/using"],
      ["Colour", "/client/styles/colour"],
      ["Type", "/client/styles/type"],
      ["Motion", "/client/styles/motion"],
      ["Select", "/client/select"],
    ]) {
      expect(sideNav().getByRole("link", { name })).toHaveAttribute("href", href)
    }
    expect(sideNav().getByRole("link", { name: "Button" })).toHaveAttribute("aria-current", "page")
  })
})

describe("missing pieces", () => {
  it("/client/nope says so inside the site's layout", async () => {
    renderAt("/client/nope")
    expect(await screen.findByRole("heading", { level: 1, name: "No piece called nope" })).toBeInTheDocument()
    expect(screen.getByRole("banner")).toBeInTheDocument()
    expect(document.title).toBe("Not found · Design System")
  })

  it("/client/preview/nope says the same, bare", async () => {
    renderAt("/client/preview/nope")
    expect(await screen.findByRole("heading", { level: 1, name: "No piece called nope" })).toBeInTheDocument()
    expect(screen.queryByRole("banner")).not.toBeInTheDocument()
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument()
  })

  it.each([encodeURIComponent("Call us at 555 0100 for a refund"), "x".repeat(41), encodeURIComponent("<img src=x>"), "caf%C3%A9"])(
    "does not echo an odd id (%s) into the heading",
    async (id) => {
      renderAt(`/client/${id}`)
      expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(/^Page not found$/)
    },
  )
})
