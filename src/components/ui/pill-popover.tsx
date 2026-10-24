import * as React from "react"

import { PopoverContent } from "@/components/ui/popover"
import { CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"

/**
 * The panel a pill opens.
 *
 * The default popover is square-cornered with full-bleed rows, so under a
 * `rounded-full` pill it reads as a different control system. This is the same
 * shape continued: rounded, inset rows, a hairline between sections, and
 * selection carried by a primary tint rather than a block of accent.
 */
export const PillPopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ className, ...props }, ref) => (
  <PopoverContent
    ref={ref}
    align="start"
    sideOffset={6}
    className={cn(
      "overflow-hidden rounded-xl border-input p-0 shadow-lg",
      // Callers set fixed widths up to 26rem; a phone is narrower than that.
      "max-w-[calc(100vw-1rem)]",
      // The list breathes inside the panel so a highlighted row is an inset
      // pill, not a bar across the whole thing.
      "[&_[cmdk-list]]:p-1",
      // The search row is a line of the panel, not a field in its own right.
      "[&_[cmdk-input-wrapper]]:h-9 [&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input]]:h-9 [&_[cmdk-input]]:text-xs",
      "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide",
      className,
    )}
    {...props}
  />
))
PillPopoverContent.displayName = "PillPopoverContent"

/** A row in that panel: inset, rounded, tinted rather than filled when active. */
export const PILL_ITEM =
  "rounded-lg px-2 py-1.5 text-xs data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground"

/** The last row of a panel — "New label" — under a hairline. */
export function PillActionItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandItem>) {
  return (
    <CommandItem
      className={cn(PILL_ITEM, "font-medium text-primary", className)}
      {...props}
    />
  )
}
