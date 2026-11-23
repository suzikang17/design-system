import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { StatePicker } from "@/components/ui/state-picker"

const PROVINCES = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "ON", label: "Ontario" },
  { value: "QC", label: "Quebec" },
]

function PickState() {
  const [value, setValue] = useState("")
  return (
    <div className="w-full max-w-xs space-y-2">
      <StatePicker value={value} onChange={setValue} />
      <p className="text-xs text-muted-foreground">Value: {value || "none"}</p>
    </div>
  )
}

function WithError() {
  const [value, setValue] = useState("")
  return (
    <div className="w-full max-w-xs space-y-1.5">
      <StatePicker value={value} onChange={setValue} error={!value} />
      {!value && <p className="text-xs text-destructive">Choose a state.</p>}
    </div>
  )
}

function OtherOptions() {
  const [value, setValue] = useState("BC")
  return (
    <div className="w-full max-w-xs">
      <StatePicker value={value} onChange={setValue} options={PROVINCES} label="Province" placeholder="Province" />
    </div>
  )
}

export default {
  title: "State Picker",
  group: "Inputs",
  description:
    "A US state picker: a native select on phones and a styled select on desktop. Pass other options for other regions.",
  examples: {
    "Pick a state": PickState,
    "Error state": WithError,
    "Other options": OtherOptions,
  },
} satisfies Showcase
