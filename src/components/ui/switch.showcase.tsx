import type { Showcase } from "@/catalog/types"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default {
  title: "Switch",
  group: "Controls",
  description: "An on-off control for a setting that takes effect at once.",
  examples: {
    Settings: () => (
      <div className="w-full max-w-xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="switch-email" className="text-foreground">
            Email notifications
          </Label>
          <Switch id="switch-email" defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="switch-digest" className="text-foreground">
            Weekly digest
          </Label>
          <Switch id="switch-digest" />
        </div>
      </div>
    ),
  },
} satisfies Showcase
