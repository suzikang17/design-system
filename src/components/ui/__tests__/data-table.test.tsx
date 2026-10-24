import { createPortal } from "react-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DataTable } from "../data-table"
import { DataTableFacetedFilter } from "../data-table-faceted-filter"

interface Person {
  id: string
  name: string
  status: string
}

const PEOPLE: Person[] = [
  { id: "a", name: "Alpha", status: "Active" },
  { id: "b", name: "Beta", status: "Inactive" },
  { id: "c", name: "Gamma", status: "Active" },
  { id: "d", name: "Delta", status: "Paused" },
]

const columns: ColumnDef<Person>[] = [
  {
    id: "select",
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label={`Select ${row.original.name}`}
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "status", header: "Status" },
]

const names = () => screen.queryAllByRole<HTMLTableRowElement>("row").slice(1).map((row) => row.cells[1]?.textContent)

describe("DataTable", () => {
  it("filters a column by every value picked in a faceted filter, matching whole values", async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={PEOPLE}
        toolbar={({ table }) => (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={["Active", "Inactive", "Paused"].map((value) => ({ value, label: value }))}
          />
        )}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Status" }))
    // An option's name ends in its row count.
    await user.click(screen.getByRole("option", { name: /^Active\d*$/ }))
    // "Active" must not match "Inactive".
    expect(names()).toEqual(["Alpha", "Gamma"])
    await user.click(screen.getByRole("option", { name: /^Paused\d*$/ }))
    expect(names()).toEqual(["Alpha", "Gamma", "Delta"])
  })

  it("keeps selection with the record, not its position, when rows are removed", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<DataTable columns={columns} data={PEOPLE} />)
    await user.click(screen.getByRole("checkbox", { name: "Select Alpha" }))
    await user.click(screen.getByRole("checkbox", { name: "Select Beta" }))

    rerender(<DataTable columns={columns} data={PEOPLE.filter((p) => p.id !== "a" && p.id !== "b")} />)
    expect(screen.getByRole("checkbox", { name: "Select Gamma" })).not.toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Select Delta" })).not.toBeChecked()
  })

  it("does not count clicks on controls in a cell, or in a menu portalled out of one, as row clicks", async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    const withControls: ColumnDef<Person>[] = [
      ...columns,
      {
        id: "actions",
        cell: ({ row }) => (
          <>
            <button type="button">Edit {row.original.name}</button>
            {row.original.id === "a" && createPortal(<span>Menu for Alpha</span>, document.body)}
          </>
        ),
      },
    ]
    render(<DataTable columns={withControls} data={PEOPLE} onRowClick={onRowClick} />)

    await user.click(screen.getByRole("button", { name: "Edit Alpha" }))
    await user.click(screen.getByRole("checkbox", { name: "Select Alpha" }))
    await user.click(screen.getByText("Menu for Alpha"))
    expect(onRowClick).not.toHaveBeenCalled()

    await user.click(screen.getByText("Alpha"))
    expect(onRowClick).toHaveBeenCalledTimes(1)
    expect(onRowClick.mock.calls[0][0].original.name).toBe("Alpha")
  })
})
