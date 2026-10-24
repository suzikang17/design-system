import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"

/**
 * The pill control scale.
 *
 * Every control in a toolbar is drawn to one height and one radius: `h-8` and
 * `rounded-full`, the filter pills' own shape. What separates an action from a
 * filter from a statistic is its fill and its colour, not its shape.
 *
 * Under `md` a control steps back up to `h-10`, because a thumb target still
 * has to be 40px. The step-down is part of the scale, so it is set here rather
 * than by every consumer.
 */

/**
 * The icon size has to be written on the BUTTON. `Button` sets
 * `[&_svg]:size-4`, a descendant selector, which outranks any `h-3.5 w-3.5` put
 * on the icon itself — an icon in a button is sized by the button, or not at
 * all.
 */
export const PILL_CONTROL_ICON = "md:[&_svg]:size-3.5"

/** A control with words in it. */
export const PILL_CONTROL_SHAPE = `h-10 rounded-full md:h-8 ${PILL_CONTROL_ICON}`

/** The same shape for a square icon-only control. */
export const PILL_ICON_CONTROL_SHAPE = `h-10 w-10 rounded-full md:h-8 md:w-8 ${PILL_CONTROL_ICON}`

/** Wording at the pills' size to go with it. */
export const PILL_CONTROL_TEXT = "px-3 text-sm md:text-xs"

/**
 * A statistic drawn to the same scale: same height, same radius, colour
 * instead of an outline. Put it on a `Badge`, which is already `rounded-full`.
 * A chip is not a control, so it has no component of its own here — only the
 * shape that keeps it in the same row.
 */
export const PILL_STAT_CHIP = "h-8 gap-1.5 px-3 font-medium"

/**
 * What this vocabulary adds ON TOP of `Button` — the shape, and the one fill
 * `Button` has no name for.
 *
 * It deliberately does not restate `Button`'s own variants. A cva that listed
 * them all and mapped them to empty strings would return a styleless result to
 * anybody who called it directly; the fill comes from `Button`, which is given
 * the variant separately.
 */
export const pillVariants = cva("", {
  variants: {
    shape: {
      text: `${PILL_CONTROL_SHAPE} ${PILL_CONTROL_TEXT}`,
      icon: PILL_ICON_CONTROL_SHAPE,
    },
    /** `dashed` is an outline with a dashed edge and quiet text. */
    tone: {
      plain: "",
      dashed: "border-dashed text-muted-foreground",
    },
  },
  defaultVariants: {
    shape: "text",
    tone: "plain",
  },
})

export type PillVariantProps = VariantProps<typeof pillVariants>

/** `Button`'s fills, plus the dashed quiet outline. */
export type PillVariant = NonNullable<ButtonProps["variant"]> | "dashed"

/** `dashed` is drawn on top of an outline; the rest are `Button`'s own. */
const buttonVariantFor = (variant: PillVariant): ButtonProps["variant"] =>
  variant === "dashed" ? "outline" : variant

const toneFor = (variant: PillVariant): PillVariantProps["tone"] =>
  variant === "dashed" ? "dashed" : "plain"

export interface PillButtonProps extends Omit<ButtonProps, "variant" | "size"> {
  variant?: PillVariant
}

/**
 * A pill-shaped button with words in it: "New task", "Today", "Reset".
 *
 * `size` is not offered — the height IS the vocabulary. Anything else goes
 * through `className`, which is merged last and still wins.
 *
 * `type="button"` by default: every one of these is an action, and a button
 * with no type submits the form it happens to be standing in. A form's own
 * submit button passes `type="submit"`.
 */
const PillButton = React.forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ className, variant = "default", type = "button", ...props }, ref) => (
    <Button
      ref={ref}
      type={type}
      variant={buttonVariantFor(variant)}
      className={cn(pillVariants({ shape: "text", tone: toneFor(variant) }), className)}
      {...props}
    />
  )
)
PillButton.displayName = "PillButton"

export interface PillIconButtonProps extends Omit<ButtonProps, "variant" | "size"> {
  variant?: PillVariant
  /**
   * Required: the control shows an icon and nothing else, so this is the only
   * name a screen reader or a keyboard user ever gets.
   */
  "aria-label": string
}

/**
 * The square icon-only pill: a week chevron, Export, Collapse all. Outlined
 * unless it is told otherwise — these stand beside a primary action, they are
 * never the primary action.
 */
const PillIconButton = React.forwardRef<HTMLButtonElement, PillIconButtonProps>(
  ({ className, variant = "outline", type = "button", ...props }, ref) => (
    <Button
      ref={ref}
      type={type}
      size="icon"
      variant={buttonVariantFor(variant)}
      className={cn(pillVariants({ shape: "icon", tone: toneFor(variant) }), className)}
      {...props}
    />
  )
)
PillIconButton.displayName = "PillIconButton"

export { PillButton, PillIconButton }
