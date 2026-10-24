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

  // Always defer to the parent, even at the cap, so it can say why nothing
  // changed (e.g. a "You can pick up to 3" toast). A click that silently does
  // nothing reads as a broken row.
  const handleToggle = (value: string) => {
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
            role="checkbox"
            tabIndex={0}
            aria-checked={isChecked}
            aria-disabled={isCapDisabled || undefined}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              isChecked ? "bg-primary/5" : "bg-card",
              isCapDisabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer",
              !isLast && "border-b border-border"
            )}
            onClick={() => handleToggle(item.value)}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                handleToggle(item.value);
              }
            }}
          >
            {/* Checkbox */}
            <div
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

            {/* Star button — only when star support is enabled and row is checked */}
            {onStarToggle && isChecked && (
              <button
                type="button"
                aria-label={`Mark ${item.label} as preferred`}
                aria-pressed={isStarred}
                className={cn(
                  "flex items-center justify-center shrink-0",
                  "w-9 h-9 rounded-lg",
                  isStarred
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                    : "border-[1.5px] border-input text-muted-foreground"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onStarToggle(item.value);
                }}
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
