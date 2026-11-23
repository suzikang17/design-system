import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { GridSelector } from "@/components/ui/grid-selector"

const DRINKS = [
  { value: "coffee", label: "Coffee", icon: "☕" },
  { value: "tea", label: "Tea", icon: "🍵" },
  { value: "juice", label: "Juice", icon: "🧃" },
]

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({ value: day, label: day }))

const PLANS = [
  { value: "starter", label: "Starter", description: "One project, two seats" },
  { value: "team", label: "Team", description: "Unlimited projects, ten seats" },
  { value: "scale", label: "Scale", description: "Everything, with single sign-on" },
]

function Single() {
  const [value, setValue] = useState<string | string[]>("tea")
  return <GridSelector options={DRINKS} value={value} onChange={setValue} className="w-full max-w-md" />
}

function Multi() {
  const [value, setValue] = useState<string | string[]>(["Mon", "Wed", "Fri"])
  return (
    <div className="w-full max-w-md space-y-2">
      <GridSelector options={DAYS} value={value} onChange={setValue} mode="multi" columns={4} />
      <p className="text-xs text-muted-foreground">Picked: {(value as string[]).join(", ") || "none"}</p>
    </div>
  )
}

function Plans() {
  const [value, setValue] = useState<string | string[]>("team")
  return <GridSelector options={PLANS} value={value} onChange={setValue} className="w-full max-w-xl" />
}

export default {
  title: "Grid Selector",
  group: "Controls",
  description:
    "A grid of large tap targets for picking one option or several. Options can carry an icon and, from tablet width up, a description.",
  examples: {
    "Pick one": Single,
    "Pick several": Multi,
    "With descriptions": Plans,
  },
} satisfies Showcase
