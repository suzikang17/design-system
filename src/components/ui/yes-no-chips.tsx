import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Answer = "yes" | "no" | boolean | undefined | null;

interface YesNoChipsProps {
  /**
   * "yes" | "no" for string fields, true | false for boolean fields. Passing
   * `value` (even as undefined) makes the chips show exactly what it says;
   * leave it out and they keep their own answer, starting from `defaultValue`.
   */
  value?: Answer;
  defaultValue?: Answer;
  onChange: (value: "yes" | "no" | boolean | undefined) => void;
  /** Whether the value type should be boolean (true/false) or string ("yes"/"no") */
  booleanMode?: boolean;
  /** Allow tapping the active chip again to deselect it */
  allowDeselect?: boolean;
  error?: boolean;
  yesLabel?: string;
  noLabel?: string;
}

export function YesNoChips(props: YesNoChipsProps) {
  const {
    defaultValue,
    onChange,
    booleanMode = false,
    allowDeselect = true,
    error,
    yesLabel = "Yes",
    noLabel = "No",
  } = props;
  const controlled = "value" in props;
  const [own, setOwn] = useState<Answer>(defaultValue);
  const current = controlled ? props.value : own;

  const isYes = booleanMode ? current === true : current === "yes";
  const isNo = booleanMode ? current === false : current === "no";

  const handle = (next: "yes" | "no" | boolean | undefined) => {
    if (!controlled) setOwn(next);
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
