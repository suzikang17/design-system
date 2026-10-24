import { useState } from "react"

import { demoColumns, demoTasks, priorityOptions, statusOptions } from "@/catalog/demo-table"
import type { Showcase } from "@/catalog/types"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { Input } from "@/components/ui/input"

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
          columns={demoColumns.slice(0, 4)}
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
