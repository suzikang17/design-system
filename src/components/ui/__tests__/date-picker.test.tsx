import { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DatePicker, type DatePickerProps } from "../date-picker"

/** A parent that stores what the picker reports, as a form would. */
function Field({ initial = "", onChange, ...props }: Omit<DatePickerProps, "value"> & { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <DatePicker
      aria-label="Date"
      {...props}
      value={value}
      onChange={(next) => {
        onChange?.(next)
        setValue(next)
      }}
    />
  )
}

describe("DatePicker", () => {
  it("does not commit a typed date before minDate, and reverts it on blur", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Field onChange={onChange} minDate={new Date(2026, 0, 10)} />)
    const input = screen.getByLabelText("Date")

    await user.type(input, "01/05/2026")
    expect(onChange).not.toHaveBeenCalled()
    await user.tab()
    expect(input).toHaveValue("")

    await user.type(input, "01/15/2026")
    expect(onChange).toHaveBeenLastCalledWith("2026-01-15")
  })

  it("does not commit a date that does not exist", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Field onChange={onChange} />)
    await user.type(screen.getByLabelText("Date"), "02/30/2025")
    await user.tab()
    expect(onChange).not.toHaveBeenCalled()
  })

  it("reports an empty value when the field is cleared", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Field initial="2026-03-14" onChange={onChange} />)
    await user.clear(screen.getByLabelText("Date"))
    expect(onChange).toHaveBeenCalledWith("")
  })

  it("does not commit a half-edited date, and keeps the caret where the edit is", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Field initial="2026-03-14" onChange={onChange} />)
    const input = screen.getByLabelText<HTMLInputElement>("Date")

    // Change the day from 14 to 15: delete the 4, then type 5.
    await user.type(input, "{Backspace}", { initialSelectionStart: 5, initialSelectionEnd: 5 })
    expect(input).toHaveValue("03/1/2026")
    expect(onChange).not.toHaveBeenCalled()
    await user.keyboard("5")
    expect(onChange).toHaveBeenLastCalledWith("2026-03-15")
    expect(input).toHaveValue("03/15/2026")
    expect(input.selectionStart).toBe(5)
  })

  it("moves between months without changing the value", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Field initial="2026-03-14" onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: "Open calendar to select date" }))
    await user.click(screen.getByRole("button", { name: "Go to next month" }))
    await user.click(screen.getByRole("button", { name: "Today" }))
    await user.click(screen.getByRole("button", { name: "Go to next month" }))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByLabelText("Date")).toHaveValue("03/14/2026")
  })

  it("commits a day picked in another month", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Field initial="2026-03-14" onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: "Open calendar to select date" }))
    await user.click(screen.getByRole("button", { name: "Go to next month" }))
    await user.click(screen.getByRole("gridcell", { name: "20" }))
    expect(onChange).toHaveBeenCalledWith("2026-04-20")
    expect(screen.getByLabelText("Date")).toHaveValue("04/20/2026")
  })

  it("opens on defaultYear while there is no value", async () => {
    const user = userEvent.setup()
    render(<Field defaultYear={1990} />)
    await user.click(screen.getByRole("button", { name: "Open calendar to select date" }))
    expect(screen.getByRole("combobox", { name: "Year" })).toHaveTextContent("1990")
  })
})
