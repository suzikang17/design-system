import { createRef } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LabeledField } from "../form-field"
import { StatePicker } from "../state-picker"

describe("StatePicker", () => {
  it("renders one control, tied to its label by id, and forwards name and ref", () => {
    const ref = createRef<HTMLSelectElement | HTMLButtonElement>()
    render(
      <form>
        <LabeledField label="Home state" htmlFor="home-state">
          <StatePicker id="home-state" name="state" value="CA" onChange={() => undefined} ref={ref} />
        </LabeledField>
      </form>,
    )
    const control = screen.getByLabelText("Home state")
    expect(control).toHaveAttribute("id", "home-state")
    expect(ref.current).toBe(control)
    expect(document.querySelectorAll("#home-state")).toHaveLength(1)
    expect(document.querySelector('select[name="state"]')).not.toBeNull()
  })
})
