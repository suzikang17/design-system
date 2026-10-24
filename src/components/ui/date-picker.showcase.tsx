import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { DatePicker } from "@/components/ui/date-picker"

function TypeOrPick() {
  const [value, setValue] = useState("2026-03-14")
  return (
    <div className="w-full max-w-xs space-y-2">
      <DatePicker aria-label="Date" value={value} onChange={setValue} />
      <p className="text-xs text-muted-foreground">Value: {value || "none"}</p>
    </div>
  )
}

function Birthday() {
  const [value, setValue] = useState("")
  return (
    <div className="w-full max-w-xs">
      <DatePicker aria-label="Date of birth" value={value} onChange={setValue} defaultYear={1990} maxDate={new Date()} />
    </div>
  )
}

function FromToday() {
  const [value, setValue] = useState("")
  return (
    <div className="w-full max-w-xs">
      <DatePicker aria-label="Start date" value={value} onChange={setValue} minDate={new Date()} />
    </div>
  )
}

export default {
  title: "Date Picker",
  group: "Inputs",
  description:
    "A date field you can type into or fill from a calendar with month and year menus. It reports dates as YYYY-MM-DD and keeps typed dates inside its min and max.",
  examples: {
    "Type or pick": TypeOrPick,
    "No past dates": FromToday,
    "Birthday, opening on 1990": Birthday,
    Disabled: () => (
      <div className="w-full max-w-xs">
        <DatePicker aria-label="Date" value="2026-01-05" disabled />
      </div>
    ),
  },
} satisfies Showcase
