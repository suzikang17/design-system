import { useState } from "react"
import { CalendarDays, Columns3, List, Plus } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import { PillButton } from "@/components/ui/pill"
import { PillInput } from "@/components/ui/pill-input"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

function Periods() {
  const [value, setValue] = useState("week")
  return (
    <SegmentedControl value={value} onValueChange={setValue} aria-label="Period">
      <SegmentedControlItem value="day">Day</SegmentedControlItem>
      <SegmentedControlItem value="week">Week</SegmentedControlItem>
      <SegmentedControlItem value="month">Month</SegmentedControlItem>
    </SegmentedControl>
  )
}

function Views() {
  const [value, setValue] = useState("list")
  return (
    <SegmentedControl value={value} onValueChange={setValue} aria-label="View">
      <SegmentedControlItem value="list">
        <List aria-hidden="true" />
        List
      </SegmentedControlItem>
      <SegmentedControlItem value="board">
        <Columns3 aria-hidden="true" />
        Board
      </SegmentedControlItem>
      <SegmentedControlItem value="calendar">
        <CalendarDays aria-hidden="true" />
        Calendar
      </SegmentedControlItem>
    </SegmentedControl>
  )
}

function InARow() {
  const [query, setQuery] = useState("")
  return (
    <div className="flex w-full max-w-2xl flex-wrap items-center gap-2">
      <PillInput
        aria-label="Search"
        placeholder="Search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
        containerClassName="w-full sm:w-48"
      />
      <Periods />
      <PillButton className="sm:ml-auto">
        <Plus aria-hidden="true" />
        New event
      </PillButton>
    </div>
  )
}

export default {
  title: "Segmented Control",
  group: "Controls",
  description:
    "A row of options with exactly one selected. The selected segment is filled and the rest are ghosts, and the track sits on the same pill scale as the buttons beside it.",
  examples: {
    "Three options": Periods,
    "With icons": Views,
    "In a toolbar row": InARow,
  },
} satisfies Showcase
