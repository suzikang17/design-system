import { getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table"

import { demoColumns, demoTasks } from "@/catalog/demo-table"
import type { Showcase } from "@/catalog/types"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

function Pager() {
  const table = useReactTable({
    data: demoTasks,
    columns: demoColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  })
  return (
    <div className="w-full max-w-2xl space-y-1">
      <ul className="divide-y rounded-lg border bg-card text-sm">
        {table.getRowModel().rows.map((row) => (
          <li key={row.id} className="flex justify-between gap-3 px-4 py-2">
            <span className="font-medium">{row.original.title}</span>
            <span className="text-muted-foreground">{row.original.owner}</span>
          </li>
        ))}
      </ul>
      <DataTablePagination table={table} pageSizeOptions={[5, 10]} />
    </div>
  )
}

export default {
  title: "Data Table Pagination",
  group: "Data",
  description: "The row count, a rows-per-page menu and page buttons for any TanStack table.",
  examples: { "Pages of a list": Pager },
} satisfies Showcase
