import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CheckboxList } from "../checkbox-list"

describe("CheckboxList", () => {
  const items = [
    { value: "a", label: "Apples" },
    { value: "b", label: "Pears" },
  ]

  it("does not tick past maxItems", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<CheckboxList items={items} selected={["a"]} onToggle={onToggle} maxItems={1} />)
    await user.click(screen.getByRole("checkbox", { name: "Pears" }))
    expect(onToggle).not.toHaveBeenCalled()
    await user.click(screen.getByRole("checkbox", { name: "Apples" }))
    expect(onToggle).toHaveBeenCalledWith("a")
  })

  it("keeps the star button out of the row's name", () => {
    render(<CheckboxList items={items} selected={["a"]} onToggle={() => undefined} onStarToggle={() => undefined} />)
    expect(screen.getByRole("checkbox", { name: "Apples" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Mark Apples as preferred" })).toBeInTheDocument()
  })
})
