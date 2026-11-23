import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DataTable } from "../data-table"

describe("DataTablePagination", () => {
  it("shows page 1 of 1 for an empty table, and a page size that is not one of the options", () => {
    render(<DataTable columns={[{ accessorKey: "name", header: "Name" }]} data={[]} pageSize={7} />)
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Rows per page" })).toHaveTextContent("7")
  })
})
