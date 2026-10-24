import { demoColumns, demoTasks, priorityOptions, statusOptions } from "@/catalog/demo-table"
import type { Showcase } from "@/catalog/types"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"

export default {
  title: "Data Table Faceted Filter",
  group: "Data",
  description: "A dashed filter button that opens a searchable list of a column's values, with counts, and shows what is selected.",
  examples: {
    "Options with icons": () => (
      <div className="w-full self-start">
        <DataTable
          columns={demoColumns.slice(1)}
          data={demoTasks}
          pageSize={5}
          pageSizeOptions={[5, 10]}
          toolbar={({ table }) => (
            <DataTableFacetedFilter column={table.getColumn("status")} title="Status" options={statusOptions} />
          )}
        />
      </div>
    ),
    "Two filters together": () => (
      <div className="w-full self-start">
        <DataTable
          columns={demoColumns.slice(1)}
          data={demoTasks}
          pageSize={5}
          pageSizeOptions={[5, 10]}
          toolbar={({ table }) => (
            <div className="flex flex-wrap gap-2">
              <DataTableFacetedFilter column={table.getColumn("status")} title="Status" options={statusOptions} />
              <DataTableFacetedFilter column={table.getColumn("priority")} title="Priority" options={priorityOptions} />
            </div>
          )}
        />
      </div>
    ),
  },
} satisfies Showcase
