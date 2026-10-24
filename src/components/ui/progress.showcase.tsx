import type { Showcase } from "@/catalog/types"
import { Progress } from "@/components/ui/progress"

export default {
  title: "Progress",
  group: "Feedback",
  description: "A bar that shows how far along a task is.",
  examples: {
    Uploading: () => (
      <div className="w-full max-w-xs space-y-2">
        <div className="flex justify-between text-sm">
          <span>Uploading photos</span>
          <span className="tabular-nums text-muted-foreground">64%</span>
        </div>
        <Progress value={64} aria-label="Upload progress" />
      </div>
    ),
  },
} satisfies Showcase
