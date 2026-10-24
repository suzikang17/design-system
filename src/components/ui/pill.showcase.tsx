import { useState } from "react"
import { ChevronLeft, ChevronRight, Download, Plus, Trash2 } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import { Badge } from "@/components/ui/badge"
import { PILL_STAT_CHIP, PillButton, PillIconButton } from "@/components/ui/pill"

function WeekStepper() {
  const weeks = ["Mar 2 – Mar 8", "Mar 9 – Mar 15", "Mar 16 – Mar 22"]
  const [index, setIndex] = useState(1)
  return (
    <div className="flex items-center gap-2">
      <PillIconButton aria-label="Previous week" disabled={index === 0} onClick={() => setIndex(index - 1)}>
        <ChevronLeft />
      </PillIconButton>
      <PillButton variant="outline" className="min-w-[9.5rem] tabular-nums">
        {weeks[index]}
      </PillButton>
      <PillIconButton aria-label="Next week" disabled={index === weeks.length - 1} onClick={() => setIndex(index + 1)}>
        <ChevronRight />
      </PillIconButton>
    </div>
  )
}

export default {
  title: "Pill",
  group: "Controls",
  description:
    "Pill-shaped buttons drawn to one shared control scale: 32px tall on desktop and 40px on touch screens. Variants differ by fill, never by shape.",
  examples: {
    Variants: () => (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <PillButton>New task</PillButton>
        <PillButton variant="outline">Export</PillButton>
        <PillButton variant="secondary">Archive</PillButton>
        <PillButton variant="ghost">Cancel</PillButton>
        <PillButton variant="dashed">Reset</PillButton>
        <PillButton variant="destructive">Delete</PillButton>
      </div>
    ),
    "With icons": () => (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <PillButton>
          <Plus />
          New task
        </PillButton>
        <PillIconButton aria-label="Download CSV">
          <Download />
        </PillIconButton>
        <PillIconButton variant="destructive" aria-label="Delete selected">
          <Trash2 />
        </PillIconButton>
      </div>
    ),
    "Icon buttons around a label": WeekStepper,
    "A toolbar row": () => (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="secondary" className={PILL_STAT_CHIP}>
          12 open
        </Badge>
        <Badge className={PILL_STAT_CHIP}>3 due today</Badge>
        <PillButton variant="outline">Today</PillButton>
        <PillButton>
          <Plus />
          New task
        </PillButton>
      </div>
    ),
  },
} satisfies Showcase
