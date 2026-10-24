import { demoColumns, demoTasks } from "@/catalog/demo-table"
import type { Showcase } from "@/catalog/types"
import { DataTable } from "@/components/ui/data-table"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"

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
  },
} satisfies Showcase
