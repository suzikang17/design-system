import { Bell } from "lucide-react"

import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default {
  title: "Tooltip",
  group: "Overlays",
  description: "A short label that appears while a control is hovered or focused.",
  examples: {
    "On an icon button": () => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Notifications">
              <Bell />
            </Button>
          </TooltipTrigger>
          <TooltipContent>3 unread notifications</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
} satisfies Showcase
