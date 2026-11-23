import type { Showcase } from "@/catalog/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default {
  title: "Label",
  group: "Inputs",
  description: "The text that names a form control. Clicking it focuses the control.",
  examples: {
    "For a field": () => (
      <div className="w-full max-w-xs space-y-1.5">
        <Label htmlFor="label-name">Display name</Label>
        <Input id="label-name" defaultValue="Alex Rivera" />
      </div>
    ),
  },
} satisfies Showcase
