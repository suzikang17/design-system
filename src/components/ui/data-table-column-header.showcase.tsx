import { demoColumns, demoTasks } from "@/catalog/demo-table"
import type { Showcase } from "@/catalog/types"
import { DataTable } from "@/components/ui/data-table"

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
  },
} satisfies Showcase
