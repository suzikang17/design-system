import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Slider } from "../slider"

describe("Slider", () => {
  it("names the slider's thumb", () => {
    render(<Slider defaultValue={[40]} aria-label="Volume" />)
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument()
  })
})
