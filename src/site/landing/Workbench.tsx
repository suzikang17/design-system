import { useEffect, useState } from "react"
import { addDays, format, parseISO } from "date-fns"
import { ChevronDown, Plus } from "lucide-react"
import type { ColumnDef, Table } from "@tanstack/react-table"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DateRangeSheet } from "@/components/ui/date-range-sheet"
import { FilterPillLabel, filterPillClass } from "@/components/ui/filter-pill"
import { PillButton } from "@/components/ui/pill"
import { PillInput } from "@/components/ui/pill-input"
import { PILL_ITEM, PillPopoverContent } from "@/components/ui/pill-popover"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

type Status = "Open" | "In review" | "Done"
interface Task {
  id: string
  title: string
  owner: string
  status: Status
  due: string
}

const day = (offset: number) => format(addDays(new Date(), offset), "yyyy-MM-dd")
const initials = (name: string) => name.split(" ").map((part) => part[0]).join("")

const SEED: Task[] = [
  { id: "t1", title: "Write release notes", owner: "Alex Rivera", status: "In review", due: day(2) },
  { id: "t2", title: "Audit color contrast", owner: "Sam Chen", status: "Open", due: day(4) },
  { id: "t3", title: "Ship the date range picker", owner: "Priya Patel", status: "Done", due: day(-3) },
  { id: "t4", title: "Plan the next release", owner: "Jordan Lee", status: "Open", due: day(9) },
  { id: "t5", title: "Update the icon set", owner: "Alex Rivera", status: "Done", due: day(-1) },
  { id: "t6", title: "Review the welcome emails", owner: "Sam Chen", status: "In review", due: day(6) },
  { id: "t7", title: "Fix the checkout focus order", owner: "Priya Patel", status: "Open", due: day(1) },
]
const OWNERS = [...new Set(SEED.map((task) => task.owner))].sort()

const STATUS_STYLE: Record<Status, "default" | "secondary" | "outline"> = {
  Open: "outline",
  "In review": "secondary",
  Done: "default",
}

const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Task" />,
    cell: ({ row }) => <span className="whitespace-nowrap font-medium">{row.original.title}</span>,
  },
  {
    accessorKey: "owner",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
    filterFn: "equalsString",
    cell: ({ row }) => (
      <span className="flex items-center gap-2 whitespace-nowrap">
        <Avatar className="size-6">
          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-foreground">
            {initials(row.original.owner)}
          </AvatarFallback>
        </Avatar>
        {row.original.owner}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant={STATUS_STYLE[row.original.status]} className="whitespace-nowrap">{row.original.status}</Badge>,
  },
  {
    accessorKey: "due",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Due" />,
    filterFn: (row, id, [from, to]: [string, string]) => {
      const due = row.getValue<string>(id)
      return (!from || due >= from) && (!to || due <= to)
    },
    cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{format(parseISO(row.original.due), "MMM d")}</span>,
  },
]

const VIEWS: Record<string, Status[] | undefined> = {
  all: undefined,
  open: ["Open", "In review"],
  done: ["Done"],
}

/** A small task list built only from the system's own components. */
export function Workbench() {
  const [tasks, setTasks] = useState(SEED)
  const addTask = () => {
    setTasks((list) => [
      { id: `t${list.length + 1}`, title: "Untitled task", owner: "Alex Rivera", status: "Open", due: day(7) },
      ...list,
    ])
    toast.success("Task added", { description: "Untitled task, due in a week." })
  }
  return (
    <figure>
      <div className="rounded-xl border bg-card p-3 text-card-foreground shadow-sm sm:p-5">
        <DataTable
          columns={columns}
          data={tasks}
          pageSize={5}
          pageSizeOptions={[5, 10, 20]}
          toolbar={({ table }) => <Toolbar table={table} onAdd={addTask} />}
        />
      </div>
      <figcaption className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Every control in the toolbar shares one height and one radius: 32px on desktop, 40px on touch screens. Fill, not
        shape, tells a filter from an action.
      </figcaption>
    </figure>
  )
}

function Toolbar({ table, onAdd }: { table: Table<Task>; onAdd: () => void }) {
  const [query, setQuery] = useState("")
  const [view, setView] = useState("all")
  const [owner, setOwner] = useState<string>()
  const [ownerOpen, setOwnerOpen] = useState(false)
  const [range, setRange] = useState({ start: "", end: "" })

  const search = (value: string) => {
    setQuery(value)
    table.setGlobalFilter(value)
  }
  const pickView = (value: string) => {
    setView(value)
    table.getColumn("status")?.setFilterValue(VIEWS[value])
  }
  const pickOwner = (value?: string) => {
    setOwner(value)
    setOwnerOpen(false)
    table.getColumn("owner")?.setFilterValue(value)
  }
  // The sheet can report a new start and a cleared end in one go, so the filter
  // follows the settled range rather than each call.
  useEffect(() => {
    table.getColumn("due")?.setFilterValue(range.start || range.end ? [range.start, range.end] : undefined)
  }, [table, range])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <PillInput
          aria-label="Search tasks"
          placeholder="Search tasks"
          value={query}
          onChange={(event) => search(event.target.value)}
          onClear={() => search("")}
          containerClassName="w-full sm:w-52"
        />
        <SegmentedControl value={view} onValueChange={pickView} aria-label="Show">
          <SegmentedControlItem value="all">All</SegmentedControlItem>
          <SegmentedControlItem value="open">Open</SegmentedControlItem>
          <SegmentedControlItem value="done">Done</SegmentedControlItem>
        </SegmentedControl>
        <Popover open={ownerOpen} onOpenChange={setOwnerOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={filterPillClass(Boolean(owner), "h-10 md:h-8")}>
              <FilterPillLabel label="Owner" value={owner} />
              <ChevronDown aria-hidden="true" className="opacity-60" />
            </button>
          </PopoverTrigger>
          <PillPopoverContent className="w-56">
            <Command>
              <CommandList>
                <CommandGroup>
                  <CommandItem className={PILL_ITEM} onSelect={() => pickOwner(undefined)}>
                    Anyone
                  </CommandItem>
                  {OWNERS.map((name) => (
                    <CommandItem key={name} className={PILL_ITEM} onSelect={() => pickOwner(name)}>
                      {name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PillPopoverContent>
        </Popover>
        <span className="ml-auto flex items-center gap-0.5">
          <PillButton onClick={onAdd}>
            <Plus aria-hidden="true" />
            New task
          </PillButton>
          <DimensionMark />
        </span>
      </div>
      <div className="max-w-xl">
        <DateRangeSheet
          startLabel="Due from"
          endLabel="Due by"
          required={false}
          startValue={range.start}
          endValue={range.end}
          onStartChange={(start) => setRange((prev) => ({ ...prev, start }))}
          onEndChange={(end) => setRange((prev) => ({ ...prev, end }))}
        />
      </div>
    </div>
  )
}

/**
 * A dimension callout on "New task": dashed extension lines from the
 * button's top and bottom edges, a dimension line with a tick at each end,
 * and the height every control in the toolbar shares.
 */
function DimensionMark() {
  return (
    <span aria-hidden="true" className="hidden h-10 items-center sm:flex md:h-8">
      <span className="flex h-full w-2 flex-col justify-between">
        <span className="border-t border-dashed border-primary/60" />
        <span className="border-t border-dashed border-primary/60" />
      </span>
      <span className="relative h-full w-2.5">
        <span className="absolute inset-y-0 left-1/2 border-l border-primary" />
        <span className="absolute inset-x-0 top-0 border-t border-primary" />
        <span className="absolute inset-x-0 bottom-0 border-t border-primary" />
      </span>
      <span className="ml-1.5 font-mono text-[11px] font-medium tabular-nums text-primary">
        <span className="md:hidden">40px</span>
        <span className="hidden md:inline">32px</span>
      </span>
    </span>
  )
}
