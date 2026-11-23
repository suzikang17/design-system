import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

export type PreviewSize = "desktop" | "tablet" | "phone"

const SIZES: readonly { id: PreviewSize; label: string }[] = [
  { id: "desktop", label: "Desktop" },
  { id: "tablet", label: "Tablet" },
  { id: "phone", label: "Phone" },
]

const isSize = (value: string): value is PreviewSize => SIZES.some((size) => size.id === value)

export function SizeSwitch({ value, onChange }: { value: PreviewSize; onChange: (size: PreviewSize) => void }) {
  return (
    <SegmentedControl role="group" aria-label="Preview width" value={value} onValueChange={(next) => isSize(next) && onChange(next)}>
      {SIZES.map((size) => (
        <SegmentedControlItem key={size.id} value={size.id}>
          {size.label}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  )
}
