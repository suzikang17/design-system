import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { THEMES } from "@/client/tokens/contract"
import { LookSwitch } from "./LookSwitch"

describe("LookSwitch", () => {
  it("is a group labelled Look, with one pressed button per look", async () => {
    const onChange = vi.fn()
    render(<LookSwitch value="urlovematters" onChange={onChange} />)
    const group = within(screen.getByRole("group", { name: "Look" }))
    expect(group.getAllByRole("button").map((b) => b.textContent)).toEqual(THEMES.map((look) => look.label))
    expect(group.getByRole("button", { name: "ur love matters" })).toHaveAttribute("aria-pressed", "true")
    await userEvent.click(group.getByRole("button", { name: "Neutral" }))
    expect(onChange).toHaveBeenCalledWith("neutral")
  })
})
