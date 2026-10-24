import { AlignCenter, AlignLeft, AlignRight } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default {
  title: "Toggle Group",
  group: "Controls",
  description: "A set of toggles where one, or several, can be on at a time.",
  examples: {
    "Text alignment": () => (
      <ToggleGroup type="single" defaultValue="left" aria-label="Text alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    ),
  },
} satisfies Showcase
