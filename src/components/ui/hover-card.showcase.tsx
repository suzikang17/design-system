import type { Showcase } from "@/catalog/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

export default {
  title: "Hover Card",
  group: "Overlays",
  description: "A preview card that appears while a link is hovered or focused.",
  examples: {
    "Profile preview": () => (
      <HoverCard>
        <HoverCardTrigger href="#" className="font-medium text-primary underline-offset-4 hover:underline">
          @alexrivera
        </HoverCardTrigger>
        <HoverCardContent className="flex gap-3">
          <Avatar>
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">Alex Rivera</p>
            <p className="text-sm text-muted-foreground">Designs the checkout. Joined in 2024.</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    ),
  },
} satisfies Showcase
