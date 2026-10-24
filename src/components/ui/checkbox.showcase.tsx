import type { Showcase } from "@/catalog/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default {
  title: "Checkbox",
  group: "Controls",
  description: "A box that is checked or not, for agreeing to something or picking items from a list.",
  examples: {
    "With labels": () => (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox id="checkbox-terms" defaultChecked />
          <Label htmlFor="checkbox-terms" className="text-foreground">
            I agree to the terms
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="checkbox-updates" />
          <Label htmlFor="checkbox-updates" className="text-foreground">
            Send me product updates
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="checkbox-locked" disabled />
          <Label htmlFor="checkbox-locked">Unavailable on this plan</Label>
        </div>
      </div>
    ),
  },
} satisfies Showcase
