import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { YesNoChips } from "@/components/ui/yes-no-chips"

function StringValues() {
  const [value, setValue] = useState<"yes" | "no" | boolean | undefined>("yes")
  return (
    <div className="w-full max-w-sm space-y-2">
      <p className="text-sm font-medium">Do you need a parking spot?</p>
      <YesNoChips value={value} onChange={setValue} />
      <p className="text-xs text-muted-foreground">Value: {String(value)}</p>
    </div>
  )
}

function BooleanMode() {
  const [value, setValue] = useState<"yes" | "no" | boolean | undefined>(undefined)
  return (
    <div className="w-full max-w-sm space-y-2">
      <p className="text-sm font-medium">Subscribe to the newsletter?</p>
      <YesNoChips value={value} onChange={setValue} booleanMode />
      <p className="text-xs text-muted-foreground">Value: {String(value)}</p>
    </div>
  )
}

function WithError() {
  const [value, setValue] = useState<"yes" | "no" | boolean | undefined>(undefined)
  return (
    <div className="w-full max-w-sm space-y-2">
      <p className="text-sm font-medium">Have you read the terms?</p>
      <YesNoChips value={value} onChange={setValue} error={value === undefined} allowDeselect={false} />
      {value === undefined && <p className="text-xs text-destructive">Choose yes or no to continue.</p>}
    </div>
  )
}

function OtherWords() {
  const [value, setValue] = useState<"yes" | "no" | boolean | undefined>(undefined)
  return (
    <div className="w-full max-w-sm space-y-2">
      <p className="text-sm font-medium">Ship to the same address?</p>
      <YesNoChips value={value} onChange={setValue} yesLabel="Same address" noLabel="Somewhere else" />
    </div>
  )
}

export default {
  title: "Yes No Chips",
  group: "Controls",
  description: "Two large chips for a yes-or-no answer. Tapping the chosen chip again clears the answer.",
  examples: {
    "String values": StringValues,
    "Boolean mode": BooleanMode,
    "Error state": WithError,
    "Your own words": OtherWords,
  },
} satisfies Showcase
