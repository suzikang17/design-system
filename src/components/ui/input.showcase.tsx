import type { Showcase } from "@/catalog/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default {
  title: "Input",
  group: "Inputs",
  description: "A single-line text field.",
  examples: {
    "With a label": () => (
      <div className="w-full max-w-xs space-y-1.5">
        <Label htmlFor="input-email">Email</Label>
        <Input id="input-email" type="email" placeholder="alex@example.com" />
      </div>
    ),
  },
} satisfies Showcase
