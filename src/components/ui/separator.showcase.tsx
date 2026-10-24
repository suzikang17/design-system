import type { Showcase } from "@/catalog/types"
import { Separator } from "@/components/ui/separator"

export default {
  title: "Separator",
  group: "Layout",
  description: "A thin line between groups of content, horizontal or vertical.",
  examples: {
    "Both directions": () => (
      <div className="w-full max-w-xs">
        <p className="font-medium">Release 2.4</p>
        <p className="text-sm text-muted-foreground">Shipped on Tuesday</p>
        <Separator className="my-4" />
        <div className="flex h-5 items-center gap-4 text-sm">
          <span>Notes</span>
          <Separator orientation="vertical" />
          <span>Changes</span>
          <Separator orientation="vertical" />
          <span>Feedback</span>
        </div>
      </div>
    ),
  },
} satisfies Showcase
