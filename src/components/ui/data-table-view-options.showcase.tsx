import { useState } from "react"

import { demoColumns, demoTasks } from "@/catalog/demo-table"
import type { Showcase } from "@/catalog/types"
import { DataTable } from "@/components/ui/data-table"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { Input } from "@/components/ui/input"

function WithFilter() {
  const [query, setQuery] = useState("")
  return (
    <div className="w-full self-start">
      <DataTable
        columns={demoColumns}
        data={demoTasks}
        pageSize={5}
        pageSizeOptions={[5]}
        toolbar={({ table }) => (
          <div className="flex items-center gap-2">
            <Input
              aria-label="Filter by title"
              placeholder="Filter by title"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                table.getColumn("title")?.setFilterValue(event.target.value)
              }}
              className="h-8 w-full sm:w-56"
            />
            <DataTableViewOptions table={table} />
          </div>
        )}
      />
    </div>
  )
}

export default {
  title: "Data Table View Options",
  group: "Data",
  description: "A menu that shows or hides a table's columns.",
  examples: {
    "Hide a column": () => (
      <div className="w-full self-start">
        <DataTable
          columns={demoColumns}
          data={demoTasks.slice(0, 4)}
          pageSize={5}
          pageSizeOptions={[5]}
          toolbar={({ table }) => (
            <div className="flex justify-end">
              <DataTableViewOptions table={table} />
            </div>
          )}
        />
      </div>
    ),
    "Beside a filter": WithFilter,
  },
} satisfies Showcase
