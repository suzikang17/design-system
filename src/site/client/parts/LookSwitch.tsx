import { useId } from "react"

import { THEMES, isThemeId, type ThemeId } from "@/client/tokens/contract"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

/** Picks the client look the piece is drawn in. Separate from the site's theme, and labelled so. */
export function LookSwitch({ value, onChange }: { value: ThemeId; onChange: (look: ThemeId) => void }) {
  const labelId = useId()
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span id={labelId} className="text-sm font-medium">
        Look
      </span>
      <SegmentedControl
        role="group"
        aria-labelledby={labelId}
        value={value}
        onValueChange={(next) => isThemeId(next) && onChange(next)}
        className="max-w-full overflow-x-auto"
      >
        {THEMES.map((look) => (
          <SegmentedControlItem key={look.id} value={look.id} className="shrink-0">
            {look.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  )
}
