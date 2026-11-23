import type { Showcase } from "@/catalog/types"
import { Badge } from "@/components/ui/badge"

export default {
  title: "Badge",
  group: "Data",
  description: "A small label for a status or a count.",
  examples: {
    Variants: () => (
      <div className="flex flex-wrap justify-center gap-2">
        <Badge>Published</Badge>
        <Badge variant="secondary">Draft</Badge>
        <Badge variant="outline">Archived</Badge>
        <Badge variant="destructive">Failed</Badge>
      </div>
    ),
  },
} satisfies Showcase
