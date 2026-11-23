import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { YesNoChips } from "../yes-no-chips"

describe("YesNoChips", () => {
  it("shows the value it is given, not the last tap, when controlled", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    // The parent ignores the change, so the answer stays "yes".
    render(<YesNoChips value="yes" onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: "No" }))
    expect(onChange).toHaveBeenCalledWith("no")
    expect(screen.getByRole("button", { name: "Yes" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "No" })).toHaveAttribute("aria-pressed", "false")
  })

  it("treats value={undefined} as controlled with no answer", async () => {
    const user = userEvent.setup()
    render(<YesNoChips value={undefined} onChange={() => undefined} />)
    await user.click(screen.getByRole("button", { name: "Yes" }))
    expect(screen.getByRole("button", { name: "Yes" })).toHaveAttribute("aria-pressed", "false")
  })

  it("keeps its own answer when no value is passed", async () => {
    const user = userEvent.setup()
    render(<YesNoChips onChange={() => undefined} />)
    await user.click(screen.getByRole("button", { name: "Yes" }))
    expect(screen.getByRole("button", { name: "Yes" })).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: "Yes" }))
    expect(screen.getByRole("button", { name: "Yes" })).toHaveAttribute("aria-pressed", "false")
  })
})
