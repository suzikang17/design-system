import * as React from "react"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PILL_CONTROL_ICON } from "@/components/ui/pill"

/**
 * A search box drawn as a pill: leading icon, and a clear button once there is
 * something to clear.
 *
 * It has the same shape and the same fill as an unset filter pill
 * (`FILTER_PILL_UNSET`), because it sits at the head of a pill row.
 *
 * Width is deliberately left out: `w-full` is the default, and a screen that
 * wants a fixed desktop width passes it through `className`.
 */
const PILL_INPUT_SHAPE =
  "h-10 w-full rounded-full border-input bg-card pl-9 pr-9 shadow-sm md:h-8 md:pl-8 md:pr-8 md:text-xs"

/** The leading icon steps down with the box it sits in. */
const PILL_INPUT_ICON =
  "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground md:left-2.5 md:h-3.5 md:w-3.5"

/** The clear button, inset in the right end of the box. */
const PILL_INPUT_CLEAR = "absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full p-0 md:h-6 md:w-6"

export interface PillInputProps extends Omit<React.ComponentProps<"input">, "value"> {
  value: string
  /** Leading icon. Defaults to a magnifying glass — this is a search field. */
  icon?: React.ComponentType<{ className?: string }>
  /**
   * Clear the field. The button appears only while `value` is non-empty, so a
   * screen that wants no clear button simply omits this.
   */
  onClear?: () => void
  clearLabel?: string
  /** For the positioning wrapper, not the input. */
  containerClassName?: string
}

const PillInput = React.forwardRef<HTMLInputElement, PillInputProps>(
  (
    {
      value,
      icon: Icon = Search,
      onClear,
      clearLabel = "Clear search",
      className,
      containerClassName,
      type = "text",
      ...props
    },
    ref
  ) => (
    <div className={cn("relative", containerClassName)}>
      <Icon className={PILL_INPUT_ICON} />
      <Input
        ref={ref}
        type={type}
        value={value}
        className={cn(PILL_INPUT_SHAPE, className)}
        {...props}
      />
      {onClear && value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={clearLabel}
          onClick={onClear}
          className={cn(PILL_INPUT_CLEAR, PILL_CONTROL_ICON)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
)
PillInput.displayName = "PillInput"

export { PillInput, PILL_INPUT_SHAPE }
