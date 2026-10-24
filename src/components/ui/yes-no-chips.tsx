import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface YesNoChipsProps {
  /** "yes" | "no" for string fields, true | false for boolean fields */
  value: "yes" | "no" | boolean | undefined | null;
  onChange: (value: "yes" | "no" | boolean | undefined) => void;
  /** Whether the value type should be boolean (true/false) or string ("yes"/"no") */
  booleanMode?: boolean;
  /** Allow tapping the active chip again to deselect it */
  allowDeselect?: boolean;
  error?: boolean;
  yesLabel?: string;
  noLabel?: string;
}

export function YesNoChips({
  value,
  onChange,
  booleanMode = false,
  allowDeselect = true,
  error,
  yesLabel = "Yes",
  noLabel = "No",
}: YesNoChipsProps) {
  // Local state drives the visual so deselect is immediate regardless of
  // when (or whether) a form library re-renders with the new value.
  const [local, setLocal] = useState(value);

  // Sync when the external value changes (e.g. form reset, loading saved data).
  useEffect(() => {
    setLocal(value);
  }, [value]);

  const isYes = booleanMode ? local === true : local === "yes";
  const isNo = booleanMode ? local === false : local === "no";

  const handle = (next: "yes" | "no" | boolean | undefined) => {
    setLocal(next);
    onChange(next);
  };

  const handleYes = () => {
    const next = allowDeselect && isYes ? undefined : (booleanMode ? true : "yes") as "yes" | boolean;
    handle(next);
  };

  const handleNo = () => {
    const next = allowDeselect && isNo ? undefined : (booleanMode ? false : "no") as "no" | boolean;
    handle(next);
  };

  const base = "flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-lg text-sm font-medium transition-all touch-manipulation active:scale-[0.98]";
  const unselected = cn(base, "bg-background border-2", error ? "border-destructive/60 text-destructive" : "border-input text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground");
  const selectedCls = cn(base, "border-2 border-primary bg-primary/10 text-primary font-semibold");

  return (
    <div className="flex gap-2 w-full">
      <button type="button" aria-pressed={isYes} onClick={handleYes} className={isYes ? selectedCls : unselected}>
        {isYes && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />}
        {yesLabel}
      </button>
      <button type="button" aria-pressed={isNo} onClick={handleNo} className={isNo ? selectedCls : unselected}>
        {isNo && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />}
        {noLabel}
      </button>
    </div>
  );
}
