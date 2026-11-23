import * as React from "react";
import { cn } from "@/lib/utils";

interface StepProps {
  children: React.ReactNode;
  className?: string;
  /** Gap between top-level children. Defaults to "space-y-6". */
  spacing?: "space-y-3" | "space-y-4" | "space-y-5" | "space-y-6" | "space-y-8";
}

export function Step({ children, className, spacing = "space-y-6" }: StepProps) {
  return (
    <div className={cn(spacing, "animate-in fade-in slide-in-from-right-4", className)}>
      {children}
    </div>
  );
}
