import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Progress } from "../progress"

describe("Progress", () => {
  it("reports the progress value", () => {
    render(<Progress value={67} aria-label="Tasks done" />)
    const bar = screen.getByRole("progressbar", { name: "Tasks done" })
    expect(bar).toHaveAttribute("aria-valuenow", "67")
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "100")
  })
})
