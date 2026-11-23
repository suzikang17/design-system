import * as React from "react";
import { cn } from "@/lib/utils";

type BannerVariant = "info" | "success" | "warning" | "neutral";

const VARIANT_STYLES: Record<BannerVariant, string> = {
  info: "bg-primary/5 border-primary/20 text-foreground",
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-200",
  warning: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-200",
  neutral: "bg-muted border-border text-muted-foreground",
};

interface InfoBannerProps {
  variant?: BannerVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function InfoBanner({ variant = "info", icon, children, className }: InfoBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 border rounded-xl px-4 py-3 md:py-4 text-sm",
        VARIANT_STYLES[variant],
        className
      )}
    >
      {icon && <span className="shrink-0 mt-0.5">{icon}</span>}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
