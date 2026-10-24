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

interface StatePickerProps {
  value: string
  onChange: (value: string) => void
  error?: boolean
  /** Shown while nothing is picked. */
  placeholder?: string
  /** The control's accessible name. */
  label?: string
  /** Defaults to the US states and DC. */
  options?: StatePickerOption[]
}

/** Responsive state picker: native <select> on mobile, ShadCN Select on desktop. */
export function StatePicker({
  value,
  onChange,
  error,
  placeholder = "State",
  label = "State",
  options = US_STATE_OPTIONS,
}: StatePickerProps) {
  return (
    <>
      {/* Native select — mobile only */}
      <select
        aria-label={label}
        aria-invalid={error || undefined}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "md:hidden w-full appearance-none bg-background text-base text-foreground rounded-xl border px-4 h-14",
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

      {/* ShadCN select — desktop only */}
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger
          aria-label={label}
          aria-invalid={error || undefined}
          className={cn(inputResponsiveCn(!!error), "hidden md:flex")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
