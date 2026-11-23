import { act, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import input from "@/client/components/input/input.meta"
import { MAX_FRAME_HEIGHT, frameHeight, isPreviewReport } from "./frameHeight"
import { PreviewFrame } from "./PreviewFrame"
import type { PreviewSize } from "./SizeSwitch"

/** A ResizeObserver that reports one width for whatever it watches. */
function observeWidth(width: number) {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      callback: ResizeObserverCallback
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }
      observe() {
        this.callback([{ contentRect: { width } } as ResizeObserverEntry], this as unknown as ResizeObserver)
      }
      unobserve() {}
      disconnect() {}
    },
  )
}

const renderFrame = (size: PreviewSize, search = "look=wecuratelife") =>
  render(
    <MemoryRouter>
      <PreviewFrame meta={input} search={search} size={size} />
    </MemoryRouter>,
  )

const frame = () => screen.getByTitle("Input preview") as HTMLIFrameElement

afterEach(() => vi.unstubAllGlobals())

describe("PreviewFrame", () => {
  it("draws a fixed width that does not fit scaled down, and says so", () => {
    observeWidth(600)
    renderFrame("tablet")
    expect(frame().style.width).toBe("768px")
    // the tablet's own frame takes 16px a side, and a tablet is at least 560px tall
    const scale = (600 - 32) / 768
    expect(frame().style.transform).toBe(`scale(${scale})`)
    expect(frame().style.height).toBe(`${560 / scale}px`)
    expect(screen.getByText("768px wide, shown at 74%")).toBeInTheDocument()
  })

  it("leaves a width that fits at full size, with no note", () => {
    observeWidth(600)
    renderFrame("phone")
    expect(frame().style.width).toBe("390px")
    expect(frame().style.transform).toBe("")
    expect(screen.queryByText(/shown at/)).not.toBeInTheDocument()
  })

  it("draws the device the size stands for: a monitor, a tablet, or a phone that is tall and takes the look's paper in its status bar", () => {
    observeWidth(1000)
    const view = renderFrame("desktop")
    const device = () => view.container.querySelector("[data-device]")!
    expect(device()).toHaveAttribute("data-device", "desktop")
    expect(frame().style.height).toBe("420px")
    for (const size of ["tablet", "phone"] as const) {
      view.rerender(
        <MemoryRouter>
          <PreviewFrame meta={input} search="look=wecuratelife" size={size} />
        </MemoryRouter>,
      )
      expect(device()).toHaveAttribute("data-device", size)
    }
    expect(frame().style.height).toBe("700px")
    const bar = view.container.querySelector("[data-status-bar]")!
    expect(bar).toHaveClass("ds-root")
    expect(bar).toHaveAttribute("data-theme", "wecuratelife")
    expect(bar).toHaveAttribute("aria-hidden", "true")
  })

  it("keeps its first search as the src and posts later ones", () => {
    const view = renderFrame("desktop")
    const post = vi.spyOn(frame().contentWindow!, "postMessage")
    view.rerender(
      <MemoryRouter>
        <PreviewFrame meta={input} search="look=neutral" size="desktop" />
      </MemoryRouter>,
    )
    expect(frame().getAttribute("src")).toBe("/client/preview/input?look=wecuratelife")
    expect(post).toHaveBeenLastCalledWith({ type: "ds:state", search: "look=neutral" }, window.location.origin)
  })

  it("catches the frame up with the latest state when it finishes loading", () => {
    renderFrame("desktop")
    const post = vi.spyOn(frame().contentWindow!, "postMessage")
    act(() => {
      frame().dispatchEvent(new Event("load"))
    })
    expect(post).toHaveBeenCalledWith({ type: "ds:state", search: "look=wecuratelife" }, window.location.origin)
  })
})

describe("the frame follows the height the piece reports", () => {
  const report = (data: unknown, init: { source?: MessageEventSource | null; origin?: string } = {}) =>
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data,
          source: init.source === undefined ? frame().contentWindow : init.source,
          origin: init.origin ?? window.location.origin,
        }),
      )
    })

  it("grows to a tall piece and shrinks back to the minimum for a short one", () => {
    observeWidth(2000)
    renderFrame("desktop")
    expect(frame().style.height).toBe("420px")
    report({ type: "ds:height", height: 733.2 })
    expect(frame().style.height).toBe("734px")
    report({ type: "ds:height", height: 200 })
    expect(frame().style.height).toBe("420px")
  })

  it("never grows past the maximum", () => {
    renderFrame("desktop")
    report({ type: "ds:height", height: 99999 })
    expect(frame().style.height).toBe(`${MAX_FRAME_HEIGHT}px`)
  })

  it("ignores a report from another window, another origin, or a malformed one", () => {
    renderFrame("desktop")
    report({ type: "ds:height", height: 800 }, { source: window })
    report({ type: "ds:height", height: 800 }, { source: null })
    report({ type: "ds:height", height: 800 }, { origin: "https://example.com" })
    for (const data of [{ type: "ds:height", height: "800" }, { type: "ds:height", height: Infinity }, { type: "ds:height", height: -5 }, { type: "other", height: 800 }, null, "ds:height"]) {
      report(data)
    }
    expect(frame().style.height).toBe("420px")
  })

  it("frameHeight keeps the minimum, drawn at the scale, and caps the report", () => {
    expect(frameHeight(420, 1, null)).toBe(420)
    expect(frameHeight(420, 0.5, null)).toBe(840)
    expect(frameHeight(420, 0.5, 500)).toBe(840)
    expect(frameHeight(420, 0.5, 900.1)).toBe(901)
    expect(frameHeight(420, 1, 5000)).toBe(MAX_FRAME_HEIGHT)
    expect(isPreviewReport({ type: "ds:height", height: 10 })).toBe(true)
    expect(isPreviewReport({ type: "ds:height", height: NaN })).toBe(false)
  })
})
