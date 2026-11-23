import { screen, render, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import button from "@/client/components/button/button.meta"
import { encodeState } from "@/client/catalog/state"
import { App } from "../App"
import { LocationProbe, stubRegistry, stubScrolling } from "./test-utils"

vi.mock("@/site/highlight", () => ({ highlight: () => new Promise<string>(() => {}) }))

beforeEach(() => {
  stubScrolling()
  stubRegistry()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
  window.history.replaceState(null, "", "/")
})

/** The real address bar: the site's theme provider rewrites it with history.replaceState. */
function openInBrowser(url: string) {
  window.history.replaceState(null, "", url)
  return render(
    <BrowserRouter>
      <App />
      <LocationProbe />
    </BrowserRouter>,
  )
}

describe("the site's ?theme= beside a piece's look", () => {
  const search = encodeState(button, { theme: "wecuratelife", props: { ...button.defaults, variant: "outline" } })

  it("keeps look and p when the site drops theme, and the router agrees with the address bar", async () => {
    openInBrowser(`/client/button?theme=midnight&${search}`)
    await screen.findByRole("heading", { level: 1, name: "Button" })

    expect(document.documentElement).toHaveAttribute("data-theme", "midnight")
    await waitFor(() => expect(window.location.search).toBe(`?${search}`))
    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe(`/client/button?${search}`))
    const look = within(screen.getByRole("group", { name: "Look" }))
    expect(look.getByRole("button", { name: "We Curate Life" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("radio", { name: "outline" })).toHaveAttribute("aria-checked", "true")
    expect((screen.getByTitle("Button preview") as HTMLIFrameElement).getAttribute("src")).toBe(`/client/preview/button?${search}`)

    // An edit afterwards does not bring theme back.
    await userEvent.click(look.getByRole("button", { name: "Neutral" }))
    // The address follows an edit after a short quiet time.
    await waitFor(() => expect(window.location.search).toContain("look=neutral"))
    expect(window.location.search).not.toContain("theme=")
  })

  it("an index filter chosen after the site drops theme does not bring it back", async () => {
    openInBrowser("/client?theme=midnight&from=wecuratelife")
    await screen.findByRole("heading", { level: 1, name: "Client work" })
    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe("/client?from=wecuratelife"))
    await userEvent.click(within(screen.getByRole("group", { name: "Group" })).getByRole("button", { name: "Primitives" }))
    expect(window.location.search).toBe("?from=wecuratelife&group=primitives")
  })
})
