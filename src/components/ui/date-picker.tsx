import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DatePickerProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "type" | "min" | "max"
  > {
  /** The date as YYYY-MM-DD, or "" for none. */
  value?: string;
  /** Called with YYYY-MM-DD when a date is committed, and with "" when the field is cleared. */
  onChange?: (value: string) => void;
  /** The year the calendar opens on while there is no value. Defaults to this year. */
  defaultYear?: number;
  /** The earliest date that can be picked or typed. */
  minDate?: Date;
  /** The latest date that can be picked or typed. */
  maxDate?: Date;
}

/** A real calendar date, or undefined: there is no February 30. */
function makeDate(year: number, month: number, day: number): Date | undefined {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined;
}

function fromISO(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? makeDate(+match[1], +match[2], +match[3]) : undefined;
}

/** MM/DD/YYYY while typing; M/D/YYYY is also accepted when the field loses focus. */
function fromTyped(text: string, complete: boolean): Date | undefined {
  const pattern = complete ? /^(\d{2})\/(\d{2})\/(\d{4})$/ : /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = pattern.exec(text.trim());
  return match ? makeDate(+match[3], +match[1], +match[2]) : undefined;
}

const toISO = (date: Date) => format(date, "yyyy-MM-dd");
const toText = (date: Date) => format(date, "MM/dd/yyyy");
const dayOf = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const monthOf = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

/**
 * A date field you can type into or fill from a calendar. Typing commits once
 * the date is complete and allowed, or when the field loses focus; anything
 * else reverts. The calendar's month and year menus only change the month on
 * show, never the value. Props it does not use go to the text input, so `id`,
 * `name`, `onBlur`, `aria-*` and `ref` wire it to a label or a form library.
 */
export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    value = "",
    onChange,
    placeholder = "MM/DD/YYYY",
    disabled = false,
    className,
    defaultYear,
    minDate,
    maxDate,
    onBlur,
    ...inputProps
  },
  ref,
) {
  const selected = fromISO(value);
  const allowed = (date: Date) =>
    (!minDate || date >= dayOf(minDate)) && (!maxDate || date <= dayOf(maxDate));

  const startMonth = () => {
    if (selected) return monthOf(selected);
    const today = new Date();
    const month = new Date(defaultYear ?? today.getFullYear(), today.getMonth(), 1);
    if (minDate && month < monthOf(minDate)) return monthOf(minDate);
    if (maxDate && month > maxDate) return monthOf(maxDate);
    return month;
  };

  const [text, setText] = React.useState(() => (selected ? toText(selected) : value));
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(startMonth);
  // The value this field last reported. When the parent passes it back, the
  // text stays as typed, so the caret does not move.
  const reported = React.useRef(value);

  React.useEffect(() => {
    if (value === reported.current) return;
    reported.current = value;
    const date = fromISO(value);
    setText(date ? toText(date) : value);
    if (date) setMonth(monthOf(date));
  }, [value]);

  const commit = (next: string) => {
    reported.current = next;
    if (next !== value) onChange?.(next);
  };

  const handleText = (next: string) => {
    setText(next);
    if (!next.trim()) return commit("");
    const date = fromTyped(next, true);
    if (date && allowed(date)) {
      commit(toISO(date));
      setMonth(monthOf(date));
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const date = fromTyped(text, false);
    if (!text.trim()) {
      commit("");
    } else if (date && allowed(date)) {
      commit(toISO(date));
      setText(toText(date));
      setMonth(monthOf(date));
    } else {
      setText(selected ? toText(selected) : value);
    }
    onBlur?.(event);
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    commit(toISO(date));
    setText(toText(date));
    setOpen(false);
  };

  const firstYear = Math.min(minDate?.getFullYear() ?? 1920, month.getFullYear());
  const lastYear = Math.max(maxDate?.getFullYear() ?? 2050, month.getFullYear());
  const disabledDays = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        ref={ref}
        type="text"
        {...inputProps}
        value={text}
        onChange={(e) => handleText(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />

      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next) setMonth(startMonth());
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="px-3 transition-colors"
            type="button"
            disabled={disabled}
            title="Open calendar to select date"
            aria-label="Open calendar to select date"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-center justify-between gap-2 border-b bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <Select
                value={String(month.getMonth())}
                onValueChange={(m) => setMonth(new Date(month.getFullYear(), Number(m), 1))}
              >
                <SelectTrigger aria-label="Month" className="h-8 w-24 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {format(new Date(2000, i, 1), "MMM")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(month.getFullYear())}
                onValueChange={(y) => setMonth(new Date(Number(y), month.getMonth(), 1))}
              >
                <SelectTrigger aria-label="Year" className="h-8 w-20 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {Array.from({ length: lastYear - firstYear + 1 }, (_, i) => {
                    const year = lastYear - i;
                    return (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setMonth(monthOf(new Date()))}
            >
              Today
            </Button>
          </div>

          <Calendar
            mode="single"
            required
            selected={selected}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            className="p-3 pt-0"
            disabled={disabledDays}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
});
