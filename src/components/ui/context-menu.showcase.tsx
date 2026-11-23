import type { Showcase } from "@/catalog/types"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export default {
  title: "Context Menu",
  group: "Overlays",
  description: "A menu that opens on right-click or a long press.",
  examples: {
    "Right-click the area": () => (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-32 w-full max-w-xs items-center justify-center rounded-lg border border-dashed bg-card text-sm text-muted-foreground">
          Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          <ContextMenuItem>
            Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Duplicate <ContextMenuShortcut>⌘D</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Move to trash</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ),
  },
} satisfies Showcase
