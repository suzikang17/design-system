import React, { useState, useRef, useEffect, useId } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { format, isBefore, isAfter, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, type Day } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// ─── helpers ──────────────────────────────────────────────────────────────────

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** A real calendar date, or undefined: 2025-02-30 does not roll over to March. */
function fromISO(s: string): Date | undefined {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : undefined;
}

function displayDate(s: string): string {
  const d = fromISO(s);
  return d ? format(d, "MM/dd/yyyy") : "";
}

/** Sunday-first, as `Date.getDay()` counts. */
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** The weekday labels in display order for a week that starts on `weekStartsOn`. */
function weekdayLabels(weekStartsOn: Day): string[] {
  return [...WEEKDAYS.slice(weekStartsOn), ...WEEKDAYS.slice(0, weekStartsOn)];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Calendar grid ─────────────────────────────────────────────────────────

interface CalendarGridProps {
  month: Date;
  startDate?: Date;
  endDate?: Date;
  selecting: "start" | "end";
  onSelectDay: (d: Date) => void;
  weekStartsOn: Day;
}

function CalendarGrid({ month, startDate, endDate, selecting, onSelectDay, weekStartsOn }: CalendarGridProps) {
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  // Blank cells before the 1st: how far the 1st sits from the first day of the week.
  const firstDow = (days[0].getDay() - weekStartsOn + 7) % 7;

  const isInRange = (d: Date) => {
    if (!startDate || !endDate) return false;
    return isAfter(d, startDate) && isBefore(d, endDate);
  };

  const isStart = (d: Date) => startDate && isSameDay(d, startDate);
  const isEnd = (d: Date) => endDate && isSameDay(d, endDate);
  const isDisabled = (d: Date) => selecting === "end" && startDate != null && !isAfter(d, startDate);

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {weekdayLabels(weekStartsOn).map((w) => (
          <div key={w} className="text-center text-[11px] font-semibold text-muted-foreground py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const start = isStart(day);
          const end = isEnd(day);
          const inRange = isInRange(day);
          const selected = start || end;
          const disabled = isDisabled(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              aria-label={format(day, "EEEE, MMMM d, yyyy")}
              aria-pressed={Boolean(selected)}
              onClick={() => onSelectDay(day)}
              className={cn(
                "relative flex items-center justify-center h-11 text-[15px] font-medium transition-colors",
                disabled && "opacity-30 cursor-not-allowed",
                !disabled && !selected && !inRange && "hover:bg-primary/10 rounded-full",
                inRange && "bg-primary/10",
                selected && "text-primary-foreground z-10",
                start && "rounded-l-full",
                end && "rounded-r-full",
              )}
            >
              {selected && (
                <span className="absolute inset-0.5 rounded-full bg-primary" />
              )}
              <span className="relative z-10">{day.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Year picker ──────────────────────────────────────────────────────────

const LAST_YEAR_DEFAULT = new Date().getFullYear() + 10;
const YEAR_RANGE_DEFAULT = Array.from({ length: LAST_YEAR_DEFAULT - 1960 + 1 }, (_, i) => 1960 + i).reverse();

interface YearPickerProps {
  selectedYear: number;
  onSelect: (year: number) => void;
  yearRange?: number[];
}

function YearPicker({ selectedYear, onSelect, yearRange = YEAR_RANGE_DEFAULT }: YearPickerProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Centre the chosen year by scrolling the list itself: scrollIntoView would
  // scroll the page too.
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-year="${selectedYear}"]`);
    if (list && el) list.scrollTop = el.offsetTop - (list.clientHeight - el.offsetHeight) / 2;
  }, [selectedYear]);

  return (
    <div ref={listRef} className="relative overflow-y-auto overscroll-contain max-h-64 -mx-4 px-4">
      <div className="grid grid-cols-4 gap-1.5 py-1">
        {yearRange.map((y) => (
          <button
            key={y}
            type="button"
            data-year={y}
            aria-pressed={y === selectedYear}
            onClick={() => onSelect(y)}
            className={cn(
              "py-2.5 rounded-xl text-sm font-medium transition-colors",
              y === selectedYear
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Trigger field ─────────────────────────────────────────────────────────

interface TriggerFieldProps {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  onClick: () => void;
  required?: boolean;
  buttonRef?: React.Ref<HTMLButtonElement>;
}

function TriggerField({ label, value, placeholder, error, onClick, required, buttonRef }: TriggerFieldProps) {
  const id = useId();
  const hasValue = Boolean(fromISO(value));
  return (
    <div className="space-y-1.5">
      {label && (
        <Label id={`${id}-label`} htmlFor={id} className={cn(
          "font-medium text-foreground",
          required && "after:content-['*'] after:text-muted-foreground after:ml-0.5"
        )}>
          {label}
        </Label>
      )}
      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={onClick}
        aria-labelledby={label ? `${id}-label ${id}` : undefined}
        aria-haspopup="dialog"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "w-full h-14 md:h-9 px-4 md:px-3 flex items-center justify-between rounded-xl md:rounded-md text-base md:text-sm bg-background border transition-colors text-left",
          error ? "border-destructive" : "border-input",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <span className={hasValue ? "text-foreground" : "text-muted-foreground"}>
          {hasValue ? displayDate(value) : placeholder}
        </span>
        <span aria-hidden="true" className="flex items-center gap-1.5 shrink-0">
          {error && <AlertCircle className="h-4 w-4 text-destructive" />}
          {hasValue && !error && <Check className="h-4 w-4 text-green-600 dark:text-green-400" />}
          <CalendarIcon className={cn("h-4 w-4", error ? "text-destructive" : "text-muted-foreground")} />
        </span>
      </button>
      {error && <p id={`${id}-error`} className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

// ─── Calendar panel (shared inner content) ─────────────────────────────────

interface CalendarPanelProps {
  selecting: "start" | "end";
  setSelecting: (v: "start" | "end") => void;
  startValue: string;
  endValue: string;
  startLabel: string;
  endLabel: string;
  viewMonth: Date;
  setViewMonth: React.Dispatch<React.SetStateAction<Date>>;
  yearPickerOpen: boolean;
  setYearPickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onDaySelect: (d: Date) => void;
  yearRange?: number[];
  // single-date mode: no start/end toggle
  singleDate?: boolean;
  weekStartsOn: Day;
}

function CalendarPanel({
  selecting, setSelecting,
  startValue, endValue,
  startLabel, endLabel,
  viewMonth, setViewMonth,
  yearPickerOpen, setYearPickerOpen,
  onDaySelect,
  yearRange,
  singleDate = false,
  weekStartsOn,
}: CalendarPanelProps) {
  const startDate = fromISO(startValue);
  const endDate = fromISO(endValue);

  return (
    <div className="px-4 pb-4 pt-2">
      {/* Start / End toggle (range mode only) */}
      {!singleDate && (
        <div className="flex gap-3 mb-4">
          {(["start", "end"] as const).map((which) => {
            const isActive = selecting === which;
            const label = which === "start" ? startLabel : endLabel;
            const val = which === "start" ? startValue : endValue;
            return (
              <button
                key={which}
                type="button"
                onClick={() => { setSelecting(which); setYearPickerOpen(false); }}
                className={cn(
                  "flex-1 flex flex-col items-start px-3 py-2 rounded-xl border transition-colors text-left",
                  isActive ? "bg-primary border-primary" : "border-input"
                )}
              >
                <span className={cn("text-[10px] font-semibold uppercase tracking-wide mb-0.5", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {label}
                </span>
                <span className={cn("text-sm font-semibold", isActive ? "text-primary-foreground" : "text-muted-foreground")}>
                  {val ? displayDate(val) : "MM/DD/YYYY"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => !yearPickerOpen && setViewMonth((m) => subMonths(m, 1))}
          className={cn(
            "h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors",
            yearPickerOpen && "opacity-30 pointer-events-none"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setYearPickerOpen((v) => !v)}
          aria-expanded={yearPickerOpen}
          className="flex items-center gap-1 text-base font-semibold text-foreground hover:text-primary transition-colors"
        >
          {MONTHS[viewMonth.getMonth()]}
          <span className={cn(
            "px-1.5 py-0.5 rounded-lg text-sm transition-colors",
            yearPickerOpen ? "bg-primary text-primary-foreground" : "text-primary hover:bg-primary/10"
          )}>
            {viewMonth.getFullYear()}
          </span>
        </button>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => !yearPickerOpen && setViewMonth((m) => addMonths(m, 1))}
          className={cn(
            "h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors",
            yearPickerOpen && "opacity-30 pointer-events-none"
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {yearPickerOpen ? (
        <YearPicker
          selectedYear={viewMonth.getFullYear()}
          yearRange={yearRange}
          onSelect={(y) => {
            setViewMonth((m) => new Date(y, m.getMonth(), 1));
            setYearPickerOpen(false);
          }}
        />
      ) : (
        <CalendarGrid
          month={viewMonth}
          startDate={startDate}
          endDate={singleDate ? undefined : endDate}
          selecting={selecting}
          onSelectDay={onDaySelect}
          weekStartsOn={weekStartsOn}
        />
      )}
    </div>
  );
}

// ─── Dual-mode picker container ────────────────────────────────────────────
// Phones: a bottom sheet you can swipe down by its handle.
// Desktop: a popover under the fields.
// Both are portalled dialogs: Escape and an outside tap close the calendar
// alone, focus moves in when it opens and back to the field when it closes.

interface PickerContainerProps {
  open: boolean;
  onClose: () => void;
  /** The dialog's accessible name. */
  label: string;
  /** The fields the popover sits under. Clicks inside them do not close it. */
  anchorRef: React.RefObject<HTMLDivElement | null>;
  /** Gets focus back when the picker closes. */
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
  children: React.ReactNode;
}

function PickerContainer({ open, onClose, label, anchorRef, returnFocusRef, children }: PickerContainerProps) {
  const isMobile = useIsMobile();
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const dragY = useRef(0);

  const onOpenChange = (next: boolean) => {
    if (!next) onClose();
  };
  const returnFocus = (event: Event) => {
    event.preventDefault();
    returnFocusRef.current?.focus();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientY;
    dragY.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStart.current === null) return;
    dragY.current = e.touches[0].clientY - dragStart.current;
    if (sheetRef.current && dragY.current > 0) {
      sheetRef.current.style.transform = `translateY(${dragY.current}px)`;
    }
  };
  const onTouchEnd = () => {
    if (sheetRef.current) sheetRef.current.style.transform = "";
    if (dragY.current > 80) onClose();
    dragStart.current = null;
    dragY.current = 0;
  };

  if (isMobile) {
    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            ref={sheetRef}
            aria-describedby={undefined}
            onCloseAutoFocus={returnFocus}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-2xl bg-popover text-popover-foreground shadow-xl outline-none duration-200 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom"
          >
            <DialogPrimitive.Title className="sr-only">{label}</DialogPrimitive.Title>
            <div
              className="flex justify-center pb-2 pt-3 touch-none"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            {children}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Anchor virtualRef={anchorRef} />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          aria-label={label}
          align="start"
          sideOffset={6}
          collisionPadding={8}
          onCloseAutoFocus={returnFocus}
          onInteractOutside={(event) => {
            if (anchorRef.current?.contains(event.target as Node)) event.preventDefault();
          }}
          className="z-50 w-80 rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl outline-none animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

// ─── DateRangeSheet ────────────────────────────────────────────────────────

export interface DateRangeSheetProps {
  startValue: string;
  endValue: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  startError?: string;
  endError?: string;
  startLabel?: string;
  endLabel?: string;
  /** When true, hides the end date trigger for an open-ended range. */
  hideEnd?: boolean;
  /** First day of the week in the calendar grid: 0 is Sunday, 1 (the default) is Monday. */
  weekStartsOn?: Day;
  /** Marks both fields as required. On by default. */
  required?: boolean;
}

export function DateRangeSheet({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  startError,
  endError,
  startLabel = "Start Date",
  endLabel = "End Date",
  hideEnd = false,
  weekStartsOn = 1,
  required = true,
}: DateRangeSheetProps) {
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => fromISO(startValue) ?? new Date());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  const endButton = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLButtonElement | null>(null);

  const startDate = fromISO(startValue);
  const endDate = fromISO(endValue);

  const openFor = (which: "start" | "end") => {
    setSelecting(which);
    setYearPickerOpen(false);
    const ref = which === "start" ? fromISO(startValue) : fromISO(endValue) ?? fromISO(startValue);
    setViewMonth(ref ?? new Date());
    returnTo.current = which === "start" ? startButton.current : endButton.current;
    setOpen(true);
  };

  const handleDaySelect = (day: Date) => {
    if (hideEnd) {
      // An open-ended range has no end to pick: the start is the whole answer.
      onStartChange(toISO(day));
      setOpen(false);
    } else if (selecting === "start") {
      onStartChange(toISO(day));
      if (endDate && (isBefore(endDate, day) || isSameDay(endDate, day))) {
        onEndChange("");
      }
      setSelecting("end");
    } else {
      if (startDate && (isBefore(day, startDate) || isSameDay(day, startDate))) {
        onStartChange(toISO(day));
        onEndChange("");
        setSelecting("end");
      } else {
        onEndChange(toISO(day));
        setOpen(false);
      }
    }
  };

  return (
    <div ref={wrapperRef} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <TriggerField
        label={startLabel}
        value={startValue}
        placeholder="MM/DD/YYYY"
        error={startError}
        onClick={() => openFor("start")}
        required={required}
        buttonRef={startButton}
      />
      {hideEnd ? (
        <div className="space-y-1.5">
          <Label className="font-medium text-foreground">{endLabel}</Label>
          <div className="flex items-center h-14 md:h-9 rounded-xl md:rounded-md border border-input bg-background px-4 md:px-3 text-base md:text-sm text-muted-foreground select-none">
            —
          </div>
        </div>
      ) : (
        <TriggerField
          label={endLabel}
          value={endValue}
          placeholder="MM/DD/YYYY"
          error={endError}
          onClick={() => openFor("end")}
          required={required}
          buttonRef={endButton}
        />
      )}

      <PickerContainer
        open={open}
        onClose={() => setOpen(false)}
        label={hideEnd ? startLabel : `${startLabel} and ${endLabel}`}
        anchorRef={wrapperRef}
        returnFocusRef={returnTo}
      >
        <CalendarPanel
          selecting={selecting}
          setSelecting={setSelecting}
          startValue={startValue}
          endValue={endValue}
          startLabel={startLabel}
          endLabel={endLabel}
          viewMonth={viewMonth}
          setViewMonth={setViewMonth}
          yearPickerOpen={yearPickerOpen}
          setYearPickerOpen={setYearPickerOpen}
          onDaySelect={handleDaySelect}
          singleDate={hideEnd}
          weekStartsOn={weekStartsOn}
        />
      </PickerContainer>
    </div>
  );
}

// ─── DateSheet (single date) ───────────────────────────────────────────────

export interface DateSheetProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  yearRange?: number[];
  /** First day of the week in the calendar grid: 0 is Sunday, 1 (the default) is Monday. */
  weekStartsOn?: Day;
}

export function DateSheet({
  value,
  onChange,
  label = "Date",
  placeholder = "MM/DD/YYYY",
  error,
  required,
  yearRange,
  weekStartsOn = 1,
}: DateSheetProps) {
  const [open, setOpen] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => fromISO(value) ?? new Date());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  const selected = fromISO(value);

  const openPicker = () => {
    setYearPickerOpen(false);
    setViewMonth(selected ?? new Date());
    setOpen(true);
  };

  const handleDaySelect = (day: Date) => {
    onChange(toISO(day));
    setOpen(false);
  };

  return (
    <div ref={wrapperRef}>
      <TriggerField
        label={label}
        value={value}
        placeholder={placeholder}
        error={error}
        onClick={openPicker}
        required={required}
        buttonRef={button}
      />

      <PickerContainer
        open={open}
        onClose={() => setOpen(false)}
        label={label}
        anchorRef={wrapperRef}
        returnFocusRef={button}
      >
        <CalendarPanel
          singleDate
          selecting="start"
          setSelecting={() => {}}
          startValue={value}
          endValue=""
          startLabel={label}
          endLabel=""
          viewMonth={viewMonth}
          setViewMonth={setViewMonth}
          yearPickerOpen={yearPickerOpen}
          setYearPickerOpen={setYearPickerOpen}
          onDaySelect={handleDaySelect}
          yearRange={yearRange}
          weekStartsOn={weekStartsOn}
        />
      </PickerContainer>
    </div>
  );
}
