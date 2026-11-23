import { act, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { App } from "../App"
import "./test-utils" // the longer wait for lazy pages

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

const root = () => document.querySelector(".ds-root") as HTMLElement

async function openPreview(path: string) {
  const view = renderAt(path)
  await screen.findByRole("button", { name: "Label" })
  return view
}

function send(data: unknown, init: { source?: MessageEventSource | null; origin?: string } = {}) {
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data,
        source: init.source === undefined ? window.parent : init.source,
        origin: init.origin ?? window.location.origin,
      }),
    )
  })
}

beforeEach(() => {
  const html = document.documentElement
  delete html.dataset.theme
  html.classList.remove("dark")
})

afterEach(() => localStorage.clear())

describe("the bare preview of a piece", () => {
  it("renders only the piece, in the look from its own address, with no site chrome", async () => {
    await openPreview("/client/preview/button?look=wecuratelife")
    expect(root()).toHaveAttribute("data-theme", "wecuratelife")
    expect(root()).toHaveAttribute("data-layout", "centered")
    expect(screen.queryByRole("banner")).not.toBeInTheDocument()
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument()
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
  })

  it("puts the look on the piece's root only: <html> gets no site theme and no dark class", async () => {
    localStorage.setItem("ds-theme", "midnight")
    await openPreview("/client/preview/button?look=neutral&theme=midnight")
    const html = document.documentElement
    expect(html).not.toHaveAttribute("data-theme")
    expect(html).not.toHaveClass("dark")
    expect(root()).toHaveAttribute("data-theme", "neutral")
    expect(root()).toHaveClass("min-h-screen")
  })

  it("paints the page behind the piece in the look's paper, and gives it back on the way out", async () => {
    const { unmount } = await openPreview("/client/preview/button?look=wecuratelife")
    // jsdom resolves no custom properties, so the colour read from the root is whatever it computes; the point
    // is that the body takes the root's colour and lets go of it.
    expect(document.body.style.backgroundColor).toBe(getComputedStyle(root()).backgroundColor)
    unmount()
    expect(document.body.style.backgroundColor).toBe("")
  })

  it("gives a block-level form piece its preview width, and leaves others at their own size", async () => {
    const { unmount } = renderAt("/client/preview/input?look=wecuratelife")
    await screen.findByRole("textbox")
    const fit = root().querySelector("[data-preview-fit]") as HTMLElement
    expect(fit.style.width).toBe("100%")
    expect(fit.style.maxWidth).toBe("360px")
    unmount()
    await openPreview("/client/preview/button")
    expect(root().querySelector("[data-preview-fit]")).toBeNull()
  })

  it("applies ds:state from the parent window", async () => {
    await openPreview("/client/preview/button?look=urlovematters")
    send({ type: "ds:state", search: "look=neutral" })
    expect(root()).toHaveAttribute("data-theme", "neutral")
  })

  it("ds:replay mounts the piece afresh", async () => {
    await openPreview("/client/preview/button")
    const before = screen.getByRole("button", { name: "Label" })
    send({ type: "ds:replay" })
    expect(screen.getByRole("button", { name: "Label" })).not.toBe(before)
  })

  it("ignores messages from another source or another origin", async () => {
    await openPreview("/client/preview/button?look=urlovematters")
    send({ type: "ds:state", search: "look=neutral" }, { source: new MessageChannel().port1 })
    send({ type: "ds:state", search: "look=neutral" }, { source: null })
    send({ type: "ds:state", search: "look=neutral" }, { origin: "https://evil.example" })
    expect(root()).toHaveAttribute("data-theme", "urlovematters")
    const before = screen.getByRole("button", { name: "Label" })
    send({ type: "ds:replay" }, { origin: "https://evil.example" })
    expect(screen.getByRole("button", { name: "Label" })).toBe(before)
  })

  it("ignores malformed messages", async () => {
    await openPreview("/client/preview/button?look=urlovematters")
    send("ds:state")
    send({ type: "ds:state", search: 42 })
    send(null)
    expect(root()).toHaveAttribute("data-theme", "urlovematters")
  })

  it("falls back to the home look and defaults for an unusable address", async () => {
    await openPreview("/client/preview/button?look=bogus&p=%%%")
    expect(root()).toHaveAttribute("data-theme", "urlovematters")
  })
})

describe("telling the framing page how tall the piece is", () => {
  it("posts the piece's height, with the root's padding, to its parent at its own origin", async () => {
    const parent = { postMessage: vi.fn() }
    const original = Object.getOwnPropertyDescriptor(window, "parent")
    Object.defineProperty(window, "parent", { value: parent, configurable: true })
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} })
    try {
      await openPreview("/client/preview/button?look=wecuratelife")
      expect(parent.postMessage).toHaveBeenCalledWith({ type: "ds:height", height: expect.any(Number) }, window.location.origin)
    } finally {
      vi.unstubAllGlobals()
      if (original) Object.defineProperty(window, "parent", original)
    }
  })
})
