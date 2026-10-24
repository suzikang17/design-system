import type { Showcase } from "@/catalog/types"
import { AspectRatio } from "@/components/ui/aspect-ratio"

export default {
  title: "Aspect Ratio",
  group: "Layout",
  description: "A box that keeps a width-to-height ratio as it resizes, for images and video.",
  examples: {
    "16 by 9": () => (
      <div className="w-full max-w-sm">
        <AspectRatio ratio={16 / 9} className="flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/80 to-primary text-sm font-medium text-primary-foreground">
          16:9
        </AspectRatio>
      </div>
    ),
  },
} satisfies Showcase
