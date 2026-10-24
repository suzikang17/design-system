/** Sample rows and columns shared by the data-table showcases. */
import type { ColumnDef } from "@tanstack/react-table"
import { CheckCircle2, Circle, Timer } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"

export type Status = "Todo" | "In progress" | "Done"
export type Priority = "Low" | "Medium" | "High"

export interface DemoTask {
  id: string
  title: string
  owner: string
  status: Status
  priority: Priority
  estimate: number
}

export const demoTasks: DemoTask[] = [
  { id: "TSK-101", title: "Write release notes", owner: "Alex Rivera", status: "In progress", priority: "High", estimate: 3 },
  { id: "TSK-102", title: "Audit color contrast", owner: "Sam Chen", status: "Todo", priority: "High", estimate: 5 },
  { id: "TSK-103", title: "Ship the date range picker", owner: "Priya Patel", status: "Done", priority: "Medium", estimate: 8 },
  { id: "TSK-104", title: "Plan the next release", owner: "Jordan Lee", status: "Todo", priority: "Low", estimate: 2 },
  { id: "TSK-105", title: "Update the icon set", owner: "Alex Rivera", status: "Done", priority: "Low", estimate: 1 },
  { id: "TSK-106", title: "Review the welcome emails", owner: "Sam Chen", status: "In progress", priority: "Medium", estimate: 2 },
  { id: "TSK-107", title: "Fix the checkout focus order", owner: "Priya Patel", status: "Todo", priority: "High", estimate: 3 },
  { id: "TSK-108", title: "Draft the pricing page", owner: "Jordan Lee", status: "In progress", priority: "Medium", estimate: 5 },
  { id: "TSK-109", title: "Record the product tour", owner: "Alex Rivera", status: "Todo", priority: "Low", estimate: 3 },
  { id: "TSK-110", title: "Clean up unused styles", owner: "Sam Chen", status: "Done", priority: "Low", estimate: 1 },
  { id: "TSK-111", title: "Add keyboard shortcuts", owner: "Priya Patel", status: "In progress", priority: "High", estimate: 5 },
  { id: "TSK-112", title: "Translate the help center", owner: "Jordan Lee", status: "Todo", priority: "Medium", estimate: 8 },
]

export const statusOptions = [
  { value: "Todo", label: "Todo", icon: Circle },
  { value: "In progress", label: "In progress", icon: Timer },
  { value: "Done", label: "Done", icon: CheckCircle2 },
]

export const priorityOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
]

const inList = (row: { getValue: (id: string) => unknown }, id: string, value: string[]) =>
  value.includes(row.getValue(id) as string)

export const demoColumns: ColumnDef<DemoTask>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Task" />,
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => <span className="whitespace-nowrap font-medium">{row.original.title}</span>,
  },
  {
    accessorKey: "owner",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
    cell: ({ row }) => <span className="whitespace-nowrap">{row.original.owner}</span>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    filterFn: inList,
    cell: ({ row }) => (
      <Badge variant={row.original.status === "Done" ? "default" : "secondary"} className="whitespace-nowrap">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
    filterFn: inList,
  },
  {
    accessorKey: "estimate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Days" />,
    cell: ({ row }) => <span className="tabular-nums">{row.original.estimate}</span>,
  },
]
