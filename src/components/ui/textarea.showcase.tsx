import type { Showcase } from "@/catalog/types"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default {
  title: "Textarea",
  group: "Inputs",
  description: "A multi-line text field.",
  examples: {
    "With a label": () => (
      <div className="w-full max-w-sm space-y-1.5">
        <Label htmlFor="textarea-note">Note for the team</Label>
        <Textarea id="textarea-note" placeholder="What changed, and why" />
      </div>
    ),
  },
} satisfies Showcase
