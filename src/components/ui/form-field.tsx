import * as React from "react";
import { FieldError as RHFFieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface LabeledFieldProps {
  /** The label text displayed above the input. */
  label: string;
  /** htmlFor on the label — should match the input's id. */
  htmlFor?: string;
  /** Whether to show a required asterisk after the label. */
  required?: boolean;
  /** Error object from react-hook-form, or a plain string message. */
  error?: RHFFieldError | string;
  children: React.ReactNode;
  className?: string;
  /** Label size variant. Defaults to "sm". */
  labelSize?: "xs" | "sm" | "base";
  /** Override the full label className (replaces labelSize). */
  labelClassName?: string;
  /** Override the required asterisk className. Defaults to red. */
  requiredClassName?: string;
}

const LABEL_SIZE: Record<NonNullable<LabeledFieldProps["labelSize"]>, string> = {
  xs: "text-xs font-semibold text-muted-foreground",
  sm: "text-sm font-medium text-foreground",
  base: "text-base font-semibold text-foreground",
};

export function LabeledField({
  label,
  htmlFor,
  required,
  error,
  children,
  className,
  labelSize = "sm",
  labelClassName,
  requiredClassName = "after:content-['*'] after:text-muted-foreground after:ml-1",
}: LabeledFieldProps) {
  const message = typeof error === "string" ? error : error?.message;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={htmlFor}
        className={cn(
          labelClassName ?? LABEL_SIZE[labelSize],
          required && requiredClassName
        )}
      >
        {label}
      </Label>
      {children}
      {message && (
        <p className="text-destructive text-xs mt-1.5">{message}</p>
      )}
    </div>
  );
}

/** Standalone error message — for cases where label+input aren't co-located. */
export function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-destructive text-xs mt-1.5">{message}</p> : null;
}

/** Returns the input className for error vs normal state.
 *  Error state: destructive border, and a destructive ring on focus.
 *  Normal state: background fill, primary border + ring on focus.
 */
export function inputCn(hasError: boolean, base = "h-14 text-base rounded-xl px-4") {
  return hasError
    ? `${base} border-destructive focus-visible:ring-destructive focus-visible:ring-offset-0`
    : `${base} bg-background border-input focus:border-primary focus-visible:ring-primary focus-visible:ring-offset-0`;
}


/** Returns a responsive input className — mobile-first (h-14 rounded-xl),
 *  switching to desktop sizing at md breakpoint (h-9 rounded-md). */
export function inputResponsiveCn(hasError: boolean) {
  return hasError
    ? "h-14 md:h-9 text-base md:text-sm rounded-xl md:rounded-md px-4 md:px-3 border-destructive md:bg-background md:focus-visible:ring-destructive/30"
    : "h-14 md:h-9 text-base md:text-sm rounded-xl md:rounded-md px-4 md:px-3 bg-muted/50 md:bg-background border-input";
}
