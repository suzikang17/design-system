import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ChevronRight } from "lucide-react"

import { demoColumns, demoTasks, priorityOptions, statusOptions, type DemoTask } from "@/catalog/demo-table"
import type { Showcase } from "@/catalog/types"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function FullTable() {
  const [query, setQuery] = useState("")
  return (
    <div className="w-full self-start">
      <DataTable
        columns={demoColumns}
        data={demoTasks}
        pageSize={5}
        pageSizeOptions={[5, 10, 20]}
        toolbar={({ table }) => (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              aria-label="Filter tasks"
              placeholder="Filter tasks"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                table.setGlobalFilter(event.target.value)
              }}
              className="h-8 w-full sm:w-56"
            />
            <DataTableFacetedFilter column={table.getColumn("status")} title="Status" options={statusOptions} />
            <DataTableFacetedFilter column={table.getColumn("priority")} title="Priority" options={priorityOptions} />
            <DataTableViewOptions table={table} />
          </div>
        )}
      />
    </div>
  )
}

/** A chevron per row that opens the row's panel and turns to show it is open. */
const expandColumn: ColumnDef<DemoTask> = {
  id: "expand",
  size: 44,
  header: () => <span className="sr-only">Details</span>,
  cell: ({ row }) => (
    <button
      type="button"
      aria-expanded={row.getIsExpanded()}
      aria-label={`Details for ${row.original.title}`}
      onClick={row.getToggleExpandedHandler()}
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <ChevronRight aria-hidden="true" className={cn("size-4 transition-transform", row.getIsExpanded() && "rotate-90")} />
    </button>
  ),
}

export default {
  title: "Data Table",
  group: "Data",
  description:
    "A table with sorting, filtering, column visibility and pagination, built on TanStack Table. Its toolbar slot receives the table instance.",
  examples: {
    "Sort, filter and page": FullTable,
    "Rows that expand": () => (
      <div className="w-full self-start">
        <DataTable
          columns={[expandColumn, ...demoColumns.slice(0, 4)]}
          data={demoTasks.slice(0, 4)}
          pageSize={10}
          pageSizeOptions={[10]}
          renderExpanded={(row) => (
            <p className="text-sm text-muted-foreground">
              {row.original.title}: estimated at {row.original.estimate} days, {row.original.priority.toLowerCase()} priority.
            </p>
          )}
        />
      </div>
    ),
  },
} satisfies Showcase
