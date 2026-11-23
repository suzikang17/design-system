import { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { BottomSheet } from "../bottom-sheet"

describe("BottomSheet", () => {
  it("leaves Escape to a control inside it that handles the key", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <BottomSheet open onClose={onClose} aria-label="Share">
        <input
          aria-label="Search"
          onKeyDown={(event) => {
            if (event.key === "Escape") event.preventDefault()
          }}
        />
      </BottomSheet>,
    )
    await user.click(screen.getByLabelText("Search"))
    await user.keyboard("{Escape}")
    expect(onClose).not.toHaveBeenCalled()

    screen.getByRole("dialog", { name: "Share" }).focus()
    await user.keyboard("{Escape}")
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("closes only the top-most sheet on Escape", async () => {
    const user = userEvent.setup()
    const closeOuter = vi.fn()
    const closeInner = vi.fn()
    render(
      <>
        <BottomSheet open onClose={closeOuter} aria-label="Outer">
          outer
        </BottomSheet>
        <BottomSheet open onClose={closeInner} aria-label="Inner">
          inner
        </BottomSheet>
      </>,
    )
    await user.keyboard("{Escape}")
    expect(closeInner).toHaveBeenCalledTimes(1)
    expect(closeOuter).not.toHaveBeenCalled()
  })

  it("is a modal dialog that takes focus and gives it back", async () => {
    const user = userEvent.setup()
    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <BottomSheet open={open} onClose={() => setOpen(false)} aria-label="Details">
            <button type="button" onClick={() => setOpen(false)}>
              Done
            </button>
          </BottomSheet>
        </>
      )
    }
    render(<Harness />)
    await user.click(screen.getByRole("button", { name: "Open" }))
    const dialog = screen.getByRole("dialog", { name: "Details" })
    expect(dialog).toHaveAttribute("aria-modal", "true")
    expect(dialog).toHaveFocus()
    await user.click(screen.getByRole("button", { name: "Done" }))
    expect(screen.getByRole("button", { name: "Open" })).toHaveFocus()
  })
})
