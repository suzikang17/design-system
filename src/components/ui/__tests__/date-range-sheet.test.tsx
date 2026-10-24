import { useState } from "react"
import { format } from "date-fns"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { BottomSheet } from "../bottom-sheet"
import { DateRangeSheet } from "../date-range-sheet"

const today = new Date()
const fifteenth = new Date(today.getFullYear(), today.getMonth(), 15)
const dayLabel = format(fifteenth, "EEEE, MMMM d, yyyy")
const fifteenthISO = format(fifteenth, "yyyy-MM-dd")

function OpenEnded({ onStartChange, onEndChange }: { onStartChange: (v: string) => void; onEndChange: (v: string) => void }) {
  const [start, setStart] = useState("")
  return (
    <DateRangeSheet
      hideEnd
      startLabel="Member since"
      endLabel="Until"
      startValue={start}
      endValue=""
      onStartChange={(value) => {
        onStartChange(value)
        setStart(value)
      }}
      onEndChange={onEndChange}
    />
  )
}

describe("DateRangeSheet", () => {
  it("closes after the start is picked when the end is hidden, and never reports an end", async () => {
    const user = userEvent.setup()
    const onStartChange = vi.fn()
    const onEndChange = vi.fn()
    render(<OpenEnded onStartChange={onStartChange} onEndChange={onEndChange} />)

    const field = screen.getByRole("button", { name: /^Member since/ })
    await user.click(field)
    const dialog = screen.getByRole("dialog", { name: "Member since" })
    await user.click(within(dialog).getByRole("button", { name: dayLabel }))

    expect(onStartChange).toHaveBeenCalledWith(fifteenthISO)
    expect(onEndChange).not.toHaveBeenCalled()
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(field).toHaveFocus()
  })

  it("treats a date that does not exist as no date, instead of rolling it over", () => {
    render(
      <DateRangeSheet startLabel="From" endLabel="To" startValue="2025-02-30" endValue="" onStartChange={() => undefined} onEndChange={() => undefined} />,
    )
    expect(screen.getByLabelText("From")).toHaveTextContent("MM/DD/YYYY")
    expect(screen.getByLabelText("From")).not.toHaveTextContent("03/02/2025")
  })

  it("ties each label to its field", () => {
    render(
      <DateRangeSheet startLabel="Check in" endLabel="Check out" startValue="" endValue="" onStartChange={() => undefined} onEndChange={() => undefined} />,
    )
    expect(screen.getByLabelText("Check in")).toHaveAttribute("aria-haspopup", "dialog")
    expect(screen.getByLabelText("Check out")).toHaveAttribute("aria-haspopup", "dialog")
  })

  it("closes only the calendar on Escape", async () => {
    const user = userEvent.setup()
    const closeSheet = vi.fn()
    render(
      <BottomSheet open onClose={closeSheet} aria-label="Booking">
        <OpenEnded onStartChange={() => undefined} onEndChange={() => undefined} />
      </BottomSheet>,
    )
    await user.click(screen.getByRole("button", { name: /^Member since/ }))
    expect(screen.getByRole("dialog", { name: "Member since" })).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog", { name: "Member since" })).toBeNull()
    expect(closeSheet).not.toHaveBeenCalled()
  })
})
