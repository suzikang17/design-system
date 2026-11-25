import { Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

export type PreviewSize = "desktop" | "tablet" | "phone"

const SIZES: readonly { id: PreviewSize; label: string; icon: LucideIcon }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "phone", label: "Phone", icon: Smartphone },
]

const isSize = (value: string): value is PreviewSize => SIZES.some((size) => size.id === value)

export function SizeSwitch({ value, onChange }: { value: PreviewSize; onChange: (size: PreviewSize) => void }) {
  return (
    <SegmentedControl role="group" aria-label="Preview width" value={value} onValueChange={(next) => isSize(next) && onChange(next)}>
      {SIZES.map((size) => (
        <SegmentedControlItem key={size.id} value={size.id} className="gap-1.5">
          <size.icon aria-hidden="true" className="size-4" />
          {size.label}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  )
}
