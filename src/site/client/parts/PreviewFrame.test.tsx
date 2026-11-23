import { act, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import input from "@/client/components/input/input.meta"
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
    expect(frame().style.transform).toBe(`scale(${600 / 768})`)
    expect(frame().style.height).toBe(`${420 / (600 / 768)}px`)
    expect(screen.getByText("768px wide, shown at 78%")).toBeInTheDocument()
  })

  it("leaves a width that fits at full size, with no note", () => {
    observeWidth(600)
    renderFrame("phone")
    expect(frame().style.width).toBe("390px")
    expect(frame().style.transform).toBe("")
    expect(screen.queryByText(/shown at/)).not.toBeInTheDocument()
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
