import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { defineMeta } from "@/client/catalog/meta"
import { Controls } from "./Controls"

interface FakeProps {
  title: string
  open: boolean
  size: string
  shape: string
  count: number
  words: string[]
}

const meta = defineMeta<FakeProps>({
  id: "fake",
  name: "Fake",
  group: "primitives",
  origin: ["urlovematters"],
  summary: "A fake piece for control tests.",
  component: () => null,
  defaults: { title: "Hi", open: false, size: "s", shape: "a", count: 2, words: ["one", "two"] },
  controls: {
    title: { type: "text", label: "Title" },
    open: { type: "boolean", label: "Open" },
    size: { type: "select", label: "Size", options: ["s", "m", "l"] },
    shape: { type: "select", label: "Shape", options: ["a", "b", "c", "d", "e"] },
    count: { type: "number", label: "Count", min: 1, max: 5 },
    words: { type: "list", label: "Words" },
  },
  layout: "centered",
  homeTheme: "urlovematters",
  files: [],
  usage: "",
})

const setup = () => {
  const onChange = vi.fn()
  render(<Controls meta={meta} props={{ ...meta.defaults }} onChange={onChange} />)
  return onChange
}

describe("Controls", () => {
  it("draws one labelled field per option, each of the right kind", () => {
    setup()
    expect(document.querySelectorAll("[data-control]")).toHaveLength(6)
    expect(screen.getByRole("textbox", { name: "Title" }).tagName).toBe("INPUT")
    expect(screen.getByRole("switch", { name: "Open" })).not.toBeChecked()
    expect(screen.getByRole("radiogroup", { name: "Size" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "s" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: "m" })).toHaveAttribute("aria-checked", "false")
    expect(screen.getByRole("combobox", { name: "Shape" })).toHaveTextContent("a")
    expect(screen.getByRole("slider", { name: "Count" })).toHaveAttribute("aria-valuenow", "2")
    expect(screen.getByRole("textbox", { name: "Words" }).tagName).toBe("TEXTAREA")
  })

  it("typing in a text field reports the new props", async () => {
    const onChange = setup()
    await userEvent.type(screen.getByRole("textbox", { name: "Title" }), "!")
    expect(onChange).toHaveBeenLastCalledWith({ ...meta.defaults, title: "Hi!" })
  })

  it("switch, toggles, menu and slider report typed values", async () => {
    const onChange = setup()
    await userEvent.click(screen.getByRole("switch", { name: "Open" }))
    expect(onChange).toHaveBeenLastCalledWith({ ...meta.defaults, open: true })
    await userEvent.click(screen.getByRole("radio", { name: "l" }))
    expect(onChange).toHaveBeenLastCalledWith({ ...meta.defaults, size: "l" })
    await userEvent.click(screen.getByRole("combobox", { name: "Shape" }))
    await userEvent.click(await screen.findByRole("option", { name: "e" }))
    expect(onChange).toHaveBeenLastCalledWith({ ...meta.defaults, shape: "e" })
    screen.getByRole("slider", { name: "Count" }).focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(onChange).toHaveBeenLastCalledWith({ ...meta.defaults, count: 3 })
  })

  it("pressing the chosen toggle again keeps it chosen", async () => {
    const onChange = setup()
    await userEvent.click(screen.getByRole("radio", { name: "s" }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it("a list field turns lines into items, and an emptied field into []", () => {
    const onChange = setup()
    const area = screen.getByRole("textbox", { name: "Words" })
    expect(area).toHaveValue("one\ntwo")
    fireEvent.change(area, { target: { value: "a\nb" } })
    expect(onChange).toHaveBeenLastCalledWith({ ...meta.defaults, words: ["a", "b"] })
    fireEvent.change(area, { target: { value: "" } })
    expect(onChange).toHaveBeenLastCalledWith({ ...meta.defaults, words: [] })
  })

  it("says so when a piece has no options", () => {
    render(<Controls meta={{ ...meta, controls: {} }} props={{}} onChange={() => {}} />)
    expect(screen.getByText("This piece has no options.")).toBeInTheDocument()
  })
})
