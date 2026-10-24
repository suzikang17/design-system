import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { DateRangeSheet, DateSheet } from "@/components/ui/date-range-sheet"

/** Room for the calendar, which opens below the fields on desktop. */
const FRAME = "w-full max-w-xl self-start md:min-h-[30rem]"

function Range() {
  const [range, setRange] = useState({ start: "", end: "" })
  return (
    <div className={FRAME}>
      <DateRangeSheet
        startLabel="Check in"
        endLabel="Check out"
        startValue={range.start}
        endValue={range.end}
        onStartChange={(start) => setRange((prev) => ({ ...prev, start }))}
        onEndChange={(end) => setRange((prev) => ({ ...prev, end }))}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Value: {range.start || "none"} to {range.end || "none"}
      </p>
    </div>
  )
}

function OpenEnded() {
  const [start, setStart] = useState("")
  return (
    <div className={FRAME}>
      <DateRangeSheet
        startLabel="Member since"
        endLabel="Until"
        hideEnd
        startValue={start}
        endValue=""
        onStartChange={setStart}
        onEndChange={() => undefined}
      />
    </div>
  )
}

function Single() {
  const [value, setValue] = useState("")
  return (
    <div className={`${FRAME} max-w-xs`}>
      <DateSheet label="Delivery date" value={value} onChange={setValue} />
    </div>
  )
}

function SundayFirst() {
  const [range, setRange] = useState({ start: "", end: "" })
  return (
    <div className={FRAME}>
      <DateRangeSheet
        weekStartsOn={0}
        required={false}
        startLabel="From"
        endLabel="To"
        startValue={range.start}
        endValue={range.end}
        onStartChange={(start) => setRange((prev) => ({ ...prev, start }))}
        onEndChange={(end) => setRange((prev) => ({ ...prev, end }))}
      />
    </div>
  )
}

export default {
  title: "Date Range Sheet",
  group: "Inputs",
  description:
    "Start and end date fields that open one calendar: a bottom sheet on phones and a popover on desktop. DateSheet is the single-date version.",
  examples: {
    "Date range": Range,
    "Open-ended range": OpenEnded,
    "Single date": Single,
    "Weeks that start on Sunday": SundayFirst,
  },
} satisfies Showcase
