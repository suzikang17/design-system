import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * The filter pill: a dropdown trigger that says what it filters and what it is
 * set to, in one line — `Status` unset, `Group by: Owner` set.
 *
 * A filter row is a single scrolling line. Everything a control has to say is
 * inside the pill, so the row can be one line high.
 *
 * `h-8` and `rounded-full` are this shape, and the whole pill vocabulary is
 * built to them — see `PILL_CONTROL_SHAPE` in `./pill`.
 *
 * `max-w-xs` caps a pill at 20rem, and `overflow-hidden` is what a pill that
 * still cannot fit clips against — a label is never allowed to shrink (see
 * `FilterPillLabel`), so without the clip an over-long one would paint over
 * the pill beside it.
 */
export const FILTER_PILL_BASE =
  "inline-flex h-8 max-w-xs shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full border px-3 text-xs font-normal shadow-sm transition-colors [&_svg]:size-3.5"

/** Not narrowing anything: reads as part of the page furniture. */
export const FILTER_PILL_UNSET =
  "border-input bg-card text-foreground hover:bg-muted hover:text-foreground"

/**
 * Narrowing the list right now.
 *
 * In a long row part of it is off-screen, and a set filter that has scrolled
 * out of sight leaves a person looking at a short list with no idea why. A set
 * control is filled, and the caller sorts it to the front.
 */
// The fill, the border and the weight carry the state; the words stay in the
// foreground colour, because primary text on a primary tint falls under AA at
// 12px.
export const FILTER_PILL_SET =
  "border-primary bg-primary/10 font-medium text-foreground hover:bg-primary/15 hover:text-foreground"

export const filterPillVariants = cva(FILTER_PILL_BASE, {
  variants: {
    state: {
      unset: FILTER_PILL_UNSET,
      set: FILTER_PILL_SET,
    },
  },
  defaultVariants: {
    state: "unset",
  },
})

export type FilterPillVariantProps = VariantProps<typeof filterPillVariants>

/** The pill's look for a control that is, or is not, narrowing the list. */
export function filterPillClass(active: boolean, className?: string): string {
  return cn(filterPillVariants({ state: active ? "set" : "unset" }), className)
}

export interface FilterPillLabelProps {
  /** What the control filters. Always shown — it IS the control's name. */
  label: string
  /** What it is set to, if anything. */
  value?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * The text inside a pill: `Manager` unset, `Manager: Alice` set.
 *
 * The label is inside the pill, so the pill's own content is what a screen
 * reader announces as the control's name.
 *
 * A LABEL NEVER TRUNCATES. Only a value may: a control that has clipped its own
 * name is not a control anybody can identify, however readable the value
 * beside it is.
 */
export function FilterPillLabel({ label, value, icon: Icon }: FilterPillLabelProps) {
  const hasValue = value !== undefined && value !== null && value !== ""
  return (
    <>
      {Icon && <Icon className="shrink-0 opacity-60" aria-hidden="true" />}
      <span className="flex min-w-0 items-center">
        {/* `shrink-0`: this is the control's name and it stays whole. The
            separator is part of it, so a heavily clipped value can never eat
            the colon and leave `Manager Ali…`. */}
        <span className="shrink-0">
          {label}
          {hasValue ? ": " : ""}
        </span>
        {hasValue && <span className="min-w-0 truncate font-medium">{value}</span>}
      </span>
    </>
  )
}
