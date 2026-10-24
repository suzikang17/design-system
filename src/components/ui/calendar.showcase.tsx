import { useState } from "react"

import type { Showcase } from "@/catalog/types"
import { Calendar } from "@/components/ui/calendar"

function SingleDate() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-lg border bg-card" />
}

export default {
  title: "Calendar",
  group: "Inputs",
  description: "A month grid for picking dates, built on react-day-picker. Weeks start on Monday unless weekStartsOn says otherwise.",
  examples: { "Pick a date": SingleDate },
} satisfies Showcase
