import type { ColumnDef } from "@tanstack/react-table"

import { demoColumns, demoTasks, type DemoTask } from "@/catalog/demo-table"
import type { Showcase } from "@/catalog/types"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"

/** Owner opts out of sorting, so its header is plain text. */
const mixedColumns: ColumnDef<DemoTask>[] = [
  demoColumns[1],
  {
    accessorKey: "owner",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
  },
  demoColumns[5],
]

export default {
  title: "Data Table Column Header",
  group: "Data",
  description: "A sortable column header with a menu to sort up, sort down or hide the column.",
  examples: {
    "Open a header's menu": () => (
      <div className="w-full self-start">
        <DataTable columns={demoColumns.slice(1, 5)} data={demoTasks.slice(0, 5)} pageSize={5} pageSizeOptions={[5]} />
      </div>
    ),
    "A column that does not sort": () => (
      <div className="w-full max-w-xl self-start">
        <DataTable columns={mixedColumns} data={demoTasks.slice(0, 4)} pageSize={5} pageSizeOptions={[5]} />
      </div>
    ),
  },
} satisfies Showcase
