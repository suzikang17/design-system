import { Bold, Italic, Underline } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import { Toggle } from "@/components/ui/toggle"

export default {
  title: "Toggle",
  group: "Controls",
  description: "A two-state button that stays pressed until it is pressed again.",
  examples: {
    "Text styles": () => (
      <div className="flex gap-1">
        <Toggle aria-label="Bold" defaultPressed>
          <Bold className="size-4" />
        </Toggle>
        <Toggle aria-label="Italic">
          <Italic className="size-4" />
        </Toggle>
        <Toggle aria-label="Underline" variant="outline">
          <Underline className="size-4" />
        </Toggle>
      </div>
    ),
  },
} satisfies Showcase
