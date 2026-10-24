import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GridOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

interface GridSelectorProps {
  options: GridOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  columns?: number;
  mode?: "single" | "multi";
  className?: string;
}

export function GridSelector({
  options,
  value,
  onChange,
  columns = 3,
  mode = "single",
  className,
}: GridSelectorProps) {
  const isSelected = (optionValue: string): boolean => {
    if (mode === "single") return value === optionValue;
    return Array.isArray(value) && value.includes(optionValue);
  };

  const handleSelect = (optionValue: string) => {
    if (mode === "single") {
      onChange(optionValue);
    } else {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    }
  };

  return (
    <div className={cn("bg-muted/50 p-2 rounded-[14px] border-[1.5px] border-border", className)}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: "0.5rem" }}>
        {options.map((option) => {
          const selected = isSelected(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "rounded-[10px] text-[13px] font-semibold touch-manipulation active:scale-[0.97] transition-all",
                "flex flex-col items-center justify-center gap-0.5 py-3 px-2 text-center",
                "md:items-start md:text-left md:py-3.5 md:px-3.5",
                selected
                  ? "bg-primary text-primary-foreground border-[1.5px] border-primary shadow-sm"
                  : "border-[1.5px] border-border text-foreground bg-card md:hover:border-muted-foreground/40"
              )}
            >
              {option.icon && (
                <span className="text-lg leading-none mb-0.5">{option.icon}</span>
              )}
              <span className="flex items-center gap-1 flex-wrap justify-center md:justify-start">
                {mode === "multi" && selected && (
                  <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                )}
                {option.label}
              </span>
              {option.description && (
                <span className={cn(
                  "text-[11px] font-normal mt-0.5 leading-tight hidden md:block",
                  selected ? "opacity-90" : "text-muted-foreground"
                )}>
                  {option.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
