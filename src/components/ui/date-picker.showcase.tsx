import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { DatePicker } from "@/components/ui/date-picker"

function TypeOrPick() {
  const [value, setValue] = useState("2026-03-14")
  return (
    <div className="w-full max-w-xs space-y-2">
      <DatePicker value={value} onChange={setValue} />
      <p className="text-xs text-muted-foreground">Value: {value || "none"}</p>
    </div>
  )
}

function FromToday() {
  const [value, setValue] = useState("")
  return (
    <div className="w-full max-w-xs">
      <DatePicker value={value} onChange={setValue} minDate={new Date()} placeholder="MM/DD/YYYY" />
    </div>
  )
}

export default {
  title: "Date Picker",
  group: "Inputs",
  description:
    "A date field you can type into or fill from a calendar with month and year menus. It reports dates as YYYY-MM-DD.",
  examples: {
    "Type or pick": TypeOrPick,
    "No past dates": FromToday,
    Disabled: () => (
      <div className="w-full max-w-xs">
        <DatePicker value="2026-01-05" disabled />
      </div>
    ),
  },
} satisfies Showcase
