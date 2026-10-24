import { cn } from "@/lib/utils";
import { Check, Star } from "lucide-react";

export interface CheckboxListItem {
  value: string;
  label: string;
}

export interface CheckboxListProps {
  items: CheckboxListItem[];
  selected: string[];
  onToggle: (value: string) => void;
  /** If provided, shows a star button on checked rows to mark a preferred item. */
  starredValue?: string;
  onStarToggle?: (value: string) => void;
  maxItems?: number;
  className?: string;
}

export function CheckboxList({
  items,
  selected,
  onToggle,
  starredValue,
  onStarToggle,
  maxItems,
  className,
}: CheckboxListProps) {
  const isAtCap =
    maxItems !== undefined && selected.length >= maxItems;

  // At the cap, an unchecked row is disabled: it can be read but not ticked.
  const handleToggle = (value: string) => {
    if (isAtCap && !selected.includes(value)) return;
    onToggle(value);
  };

  // Selected items float to the top, preserving relative order within each group
  const sortedItems = [
    ...items.filter((i) => selected.includes(i.value)),
    ...items.filter((i) => !selected.includes(i.value)),
  ];

  return (
    <div
      className={cn(
        "bg-card border border-border border-t-0 rounded-b-2xl overflow-hidden",
        className
      )}
    >
      {sortedItems.map((item, index) => {
        const isChecked = selected.includes(item.value);
        const isStarred = starredValue === item.value;
        const isLast = index === sortedItems.length - 1;
        const isCapDisabled = !isChecked && isAtCap;

        return (
          <div
            key={item.value}
            className={cn(
              "flex items-center",
              isChecked ? "bg-primary/5" : "bg-card",
              !isLast && "border-b border-border"
            )}
          >
            <div
              role="checkbox"
              tabIndex={0}
              aria-checked={isChecked}
              aria-disabled={isCapDisabled || undefined}
              className={cn(
                "flex flex-1 items-center gap-3 px-4 py-3",
                isCapDisabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              )}
              onClick={() => handleToggle(item.value)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  handleToggle(item.value);
                }
              }}
            >
              {/* Checkbox */}
              <div
                aria-hidden="true"
                className={cn(
                  "flex items-center justify-center shrink-0",
                  "w-[22px] h-[22px] rounded-md",
                  isChecked
                    ? "bg-primary"
                    : isCapDisabled
                    ? "border-2 border-border"
                    : "border-2 border-muted-foreground/50"
                )}
              >
                {isChecked && (
                  <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "flex-1 text-sm",
                  isChecked
                    ? "font-semibold text-primary"
                    : isCapDisabled
                    ? "text-muted-foreground"
                    : "text-foreground"
                )}
              >
                {item.label}
              </span>
            </div>

            {/* Star button — only when star support is enabled and row is checked */}
            {onStarToggle && isChecked && (
              <button
                type="button"
                aria-label={`Mark ${item.label} as preferred`}
                aria-pressed={isStarred}
                className={cn(
                  "mr-4 flex items-center justify-center shrink-0",
                  "w-9 h-9 rounded-lg",
                  isStarred
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                    : "border-[1.5px] border-input text-muted-foreground"
                )}
                onClick={() => onStarToggle(item.value)}
              >
                <Star
                  className="w-4 h-4"
                  fill={isStarred ? "currentColor" : "none"}
                />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
