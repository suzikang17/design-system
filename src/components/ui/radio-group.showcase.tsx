import type { Showcase } from "@/catalog/types"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const OPTIONS = [
  ["standard", "Standard, 3 to 5 days"],
  ["express", "Express, next day"],
  ["pickup", "Pick up in store"],
]

export default {
  title: "Radio Group",
  group: "Controls",
  description: "A set of options where exactly one can be chosen. Arrow keys move between them.",
  examples: {
    "Delivery options": () => (
      <RadioGroup defaultValue="standard" aria-label="Delivery">
        {OPTIONS.map(([value, label]) => (
          <div key={value} className="flex items-center gap-2">
            <RadioGroupItem value={value} id={`delivery-${value}`} />
            <Label htmlFor={`delivery-${value}`} className="text-foreground">
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    ),
  },
} satisfies Showcase
