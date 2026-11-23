import * as React from "react"

import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"

/**
 * A group of options with exactly one selected: Week / Day / Activity.
 *
 * The track is a `p-0.5` pill around segments one step shorter than the row
 * they sit in (`h-9`/`md:h-7` inside the row's `h-10`/`md:h-8`), so the control
 * as a whole lands on the shared pill scale — see `PILL_CONTROL_SHAPE`.
 *
 * The selected segment is filled and the rest are ghosts. Same shape, told
 * apart by fill, which is how this vocabulary separates everything else too.
 */

/** The track the segments sit in. `p-0.5` is 2px on every side. */
export const SEGMENTED_CONTROL_TRACK = "flex items-center rounded-full border bg-muted p-0.5"

/**
 * One segment, a step below the row so that the TRACK lands on it:
 * 2 + 36 (`h-9`) + 2 = 40 (`h-10`), and 2 + 28 (`md:h-7`) + 2 = 32 (`md:h-8`).
 *
 * That arithmetic is the whole reason these two heights are what they are, and
 * a comment is not enough to hold it — `ui/__tests__/pill.test.tsx` checks it
 * against `PILL_CONTROL_SHAPE`, so moving the shared scale without moving this
 * fails rather than quietly leaving the control off the row.
 */
export const SEGMENTED_CONTROL_ITEM =
  "h-9 rounded-full px-3 text-xs font-medium [&_svg]:size-3.5 md:h-7"

interface SegmentedControlContextValue {
  value: string
  onValueChange: (value: string) => void
}

const SegmentedControlContext = React.createContext<SegmentedControlContextValue | null>(null)

const useSegmentedControl = (component: string) => {
  const context = React.useContext(SegmentedControlContext)
  if (!context) {
    throw new Error(`${component} must be rendered inside a <SegmentedControl>`)
  }
  return context
}

export interface SegmentedControlProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** The selected option's value. */
  value: string
  onValueChange: (value: string) => void
}

const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({ value, onValueChange, className, children, ...props }, ref) => {
    const context = React.useMemo<SegmentedControlContextValue>(
      () => ({ value, onValueChange }),
      [value, onValueChange]
    )
    return (
      <SegmentedControlContext.Provider value={context}>
        <div ref={ref} className={cn(SEGMENTED_CONTROL_TRACK, className)} {...props}>
          {children}
        </div>
      </SegmentedControlContext.Provider>
    )
  }
)
SegmentedControl.displayName = "SegmentedControl"

export interface SegmentedControlItemProps
  extends Omit<ButtonProps, "value" | "variant" | "size"> {
  /** Selected when it matches the group's `value`. */
  value: string
}

const SegmentedControlItem = React.forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  ({ value, className, onClick, ...props }, ref) => {
    const group = useSegmentedControl("SegmentedControlItem")
    const selected = group.value === value
    return (
      <Button
        ref={ref}
        type="button"
        // The fill is the only visible signal of which option is on, so
        // without this a screen reader hears three identical buttons.
        // `aria-pressed` keeps the role a button, which is what the segments
        // behave like — one press applies the view, there is no group to
        // arrow through.
        aria-pressed={selected}
        variant={selected ? "default" : "ghost"}
        size="sm"
        className={cn(SEGMENTED_CONTROL_ITEM, className)}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented) group.onValueChange(value)
        }}
        {...props}
      />
    )
  }
)
SegmentedControlItem.displayName = "SegmentedControlItem"

export { SegmentedControl, SegmentedControlItem }
