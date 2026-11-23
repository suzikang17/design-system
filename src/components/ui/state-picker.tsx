import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { inputResponsiveCn } from "@/components/ui/form-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { US_STATE_OPTIONS } from "@/components/ui/state-picker.data"
import { cn } from "@/lib/utils"

export interface StatePickerOption {
  value: string
  label: string
}

export interface StatePickerProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: boolean
  /** Shown while nothing is picked. */
  placeholder?: string
  /** The control's accessible name. Defaults to "State" unless an `id` ties it to a label. */
  label?: string
  /** Defaults to the US states and DC. */
  options?: StatePickerOption[]
  id?: string
  name?: string
  disabled?: boolean
  "aria-describedby"?: string
  "aria-invalid"?: React.AriaAttributes["aria-invalid"]
}

/**
 * A native <select> on phones and the styled Select from `md` up. Only one of
 * the two is rendered, so `id`, `name` and `ref` always reach the control on
 * screen, and a label or a form library can find and focus it.
 */
export const StatePicker = React.forwardRef<HTMLSelectElement | HTMLButtonElement, StatePickerProps>(
  function StatePicker(
    {
      value,
      onChange,
      onBlur,
      error,
      placeholder = "State",
      label,
      options = US_STATE_OPTIONS,
      id,
      name,
      disabled,
      "aria-describedby": describedBy,
      "aria-invalid": ariaInvalid,
    },
    ref,
  ) {
    const mobile = useIsMobile()
    const open = React.useRef(false)
    const shared = {
      id,
      disabled,
      "aria-label": label ?? (id ? undefined : "State"),
      "aria-describedby": describedBy,
      "aria-invalid": ariaInvalid ?? (error || undefined),
    }

    if (mobile) {
      return (
        <select
          ref={ref as React.Ref<HTMLSelectElement>}
          {...shared}
          name={name}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={cn(
            "w-full appearance-none bg-background text-base text-foreground rounded-xl border px-4 h-14",
            "focus:outline-none focus:border-primary",
            error ? "border-destructive" : "border-input",
            !value && "text-muted-foreground"
          )}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )
    }

    return (
      <Select
        value={value || ""}
        onValueChange={onChange}
        name={name}
        disabled={disabled}
        onOpenChange={(next) => {
          open.current = next
        }}
      >
        <SelectTrigger
          ref={ref as React.Ref<HTMLButtonElement>}
          {...shared}
          // Opening the list moves focus into it; only leaving the closed control is a blur.
          onBlur={() => {
            if (!open.current) onBlur?.()
          }}
          className={inputResponsiveCn(!!error)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  },
)
