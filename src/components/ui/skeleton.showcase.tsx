import type { Showcase } from "@/catalog/types"
import { Skeleton } from "@/components/ui/skeleton"

export default {
  title: "Skeleton",
  group: "Feedback",
  description: "A pulsing placeholder in the shape of content that is still loading.",
  examples: {
    "A loading card": () => (
      <div className="flex w-full max-w-xs items-center gap-3" aria-busy="true" aria-label="Loading">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ),
  },
} satisfies Showcase
