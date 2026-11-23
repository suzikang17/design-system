import { getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table"

import { demoColumns, demoTasks, type DemoTask } from "@/catalog/demo-table"
import type { Showcase } from "@/catalog/types"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

function Pager({ data, pageSize, options }: { data: DemoTask[]; pageSize: number; options: number[] }) {
  const table = useReactTable({
    data,
    columns: demoColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
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
      <DataTablePagination table={table} pageSizeOptions={options} />
    </div>
  )
}

/** Five copies of the sample tasks, so there are pages to step through. */
const manyTasks = Array.from({ length: 5 }, (_, copy) =>
  demoTasks.map((task) => ({ ...task, id: `${task.id}-${copy}` })),
).flat()

export default {
  title: "Data Table Pagination",
  group: "Data",
  description: "The row count, a rows-per-page menu and page buttons for any TanStack table.",
  examples: {
    "Pages of a list": () => <Pager data={demoTasks} pageSize={5} options={[5, 10]} />,
    "First and last page buttons on wide screens": () => <Pager data={manyTasks} pageSize={4} options={[4, 8, 16]} />,
  },
} satisfies Showcase
