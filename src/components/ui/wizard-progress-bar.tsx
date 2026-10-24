import { cn } from "@/lib/utils"

interface WizardProgressBarProps {
  currentStep: number
  totalSteps: number
  className?: string
  /** The text above the bar. Defaults to "Step 2 of 5". */
  formatLabel?: (current: number, total: number) => string
}

const defaultLabel = (current: number, total: number) => `Step ${current} of ${total}`

export function WizardProgressBar({
  currentStep,
  totalSteps,
  className,
  formatLabel = defaultLabel,
}: WizardProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100)
  const label = formatLabel(currentStep, totalSteps)

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="h-2 w-full overflow-hidden rounded-full bg-border"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
