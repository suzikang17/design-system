import * as React from "react";
import { Check, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";

interface StepInfo {
  id: string;
  title: string;
  group?: string;
  optional?: boolean;
}

/** Every word the bar shows, so a screen can translate or reword it. */
export interface WizardTopBarLabels {
  back: string;
  skip: string;
  saveAndExit: string;
  stepOf: (current: number, total: number) => string;
  viewAllSteps: string;
  steps: string;
  optional: string;
  complete: string;
  inProgress: string;
  exitTitle: string;
  exitBody: string;
  keepGoing: string;
  exit: string;
}

const DEFAULT_LABELS: WizardTopBarLabels = {
  back: "Back",
  skip: "Skip",
  saveAndExit: "Save & Exit",
  stepOf: (current, total) => `Step ${current} of ${total}`,
  viewAllSteps: "View all steps",
  steps: "Steps",
  optional: "Optional",
  complete: "complete",
  inProgress: "in progress",
  exitTitle: "Save & Exit?",
  exitBody: "Your progress is saved. You can return and continue anytime.",
  keepGoing: "Keep Going",
  exit: "Save & Exit",
};

interface WizardTopBarProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  isFirstStep?: boolean;
  hideNav?: boolean;
  hideExitButton?: boolean;
  steps?: StepInfo[];
  onStepClick?: (index: number) => void;
  onExit?: () => void;
  phases?: { label: string; stepCount: number }[];
  currentPhase?: number;
  currentStepInPhase?: number;
  isOptionalStep?: boolean;
  onSkip?: () => void;
  onProgressTap?: () => void;
  isReviewStep?: boolean;
  hasLayoutNav?: boolean;
  labels?: Partial<WizardTopBarLabels>;
}

// ─────────────────────────────────────────────────────────────────────────────

export function WizardTopBar({
  currentStep,
  totalSteps,
  onBack,
  isFirstStep = false,
  hideNav = false,
  hideExitButton = false,
  steps,
  onStepClick,
  onExit,
  phases,
  currentPhase,
  currentStepInPhase,
  isOptionalStep = false,
  onSkip,
  onProgressTap,
  isReviewStep = false,
  hasLayoutNav = false,
  labels,
}: WizardTopBarProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [stepPickerOpen, setStepPickerOpen] = React.useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = React.useState(false);

  if (hideNav) return null;

  const handleStepSelect = (index: number) => {
    if (onStepClick) {
      onStepClick(index);
      setStepPickerOpen(false);
    }
  };

  // On desktop: back arrow always (first step → exit confirm). On mobile: keep X for first step.
  const backButton = (
    <button
      type="button"
      aria-label={isFirstStep ? text.saveAndExit : text.back}
      onClick={isFirstStep ? () => setExitConfirmOpen(true) : onBack}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden"
    >
      <ChevronLeft className="h-5 w-5" />
    </button>
  );

  const rightControl = isOptionalStep && onSkip ? (
    <button
      type="button"
      onClick={onSkip}
      className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted md:hidden"
    >
      {text.skip}
    </button>
  ) : hideExitButton ? (
    <div className="h-9 w-9 shrink-0 md:hidden" />
  ) : (
    <button
      type="button"
      onClick={() => setExitConfirmOpen(true)}
      className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted md:hidden"
    >
      {text.saveAndExit}
    </button>
  );

  return (
    <>
      {/* ── TOP BAR ───────────────────────────────────────────────────────── */}
      <div className={cn("fixed inset-x-0 z-50 bg-background shadow-sm md:relative md:inset-x-auto md:shadow-none md:border-b md:border-border md:top-0", hasLayoutNav ? "top-16" : "top-0")}>
        <div className="px-4 pt-3 pb-3">

          {/* Row 1: back | pills / spacer | skip or 🌐 */}
          <div className="flex items-center gap-2">
            {hideExitButton ? (
              <div className="h-9 w-9 shrink-0 md:hidden" />
            ) : (
              backButton
            )}

            {/* Mobile: pill progress bar. Desktop: step counter pill. */}
            {phases && phases.length > 0 && currentPhase !== undefined ? (
              <div className="flex-1 flex items-center gap-1 px-1 md:hidden">
                {phases.map((phase, i) => {
                  const isDone = i < currentPhase;
                  const isActive = i === currentPhase;
                  return (
                    <div
                      key={phase.label}
                      aria-label={`${phase.label}${isDone ? ` — ${text.complete}` : isActive ? ` — ${text.inProgress}` : ""}`}
                      className={cn(
                        "flex-1 h-1 rounded-full transition-all duration-300",
                        isDone && "bg-primary",
                        isActive && "bg-primary/40",
                        !isDone && !isActive && "bg-border"
                      )}
                    />
                  );
                })}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => steps && setStepPickerOpen(true)}
                className="flex-1 flex items-center gap-1.5 md:hidden"
                aria-label={text.viewAllSteps}
              >
                {steps?.map((_, index) => {
                  const isComplete = index < currentStep;
                  const isCurrent = index === currentStep;
                  return (
                    <div
                      key={index}
                      className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                        isComplete ? "bg-primary" : isCurrent ? "bg-primary/30" : "bg-border"
                      }`}
                    />
                  );
                })}
              </button>
            )}
            {/* Desktop: step counter in top row */}
            {!isReviewStep && (
              <span className="hidden md:inline-flex text-xs font-semibold text-muted-foreground bg-muted rounded-full px-3 py-1 shrink-0">
                {text.stepOf(currentStep + 1, totalSteps)}
              </span>
            )}

            {rightControl}
          </div>

          {/* Row 2: current step / phase title — mobile only, taps to overview */}
          <button
            type="button"
            onClick={onProgressTap}
            disabled={!onProgressTap}
            className="flex flex-col items-center w-full mt-0.5 md:hidden disabled:pointer-events-none"
          >
            {phases && currentPhase !== undefined ? (
              <>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {phases[Math.min(currentPhase, phases.length - 1)]?.label}
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="text-lg font-medium text-foreground">
                    {steps?.[currentStep]?.title}
                  </p>
                  {onProgressTap && <span className="text-muted-foreground text-xs">›</span>}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium text-foreground">
                  {steps?.[currentStep]?.title}
                </p>
                {steps?.[currentStep]?.optional && (
                  <span className="text-[11px] font-semibold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {text.optional}
                  </span>
                )}
                {onProgressTap && <span className="text-muted-foreground text-xs">›</span>}
              </div>
            )}
          </button>

          {/* ── DESKTOP: compact step title + step count ───────────────────── */}
          {steps?.[currentStep] && (
            <div className="hidden md:flex items-center gap-3 pt-3 pb-1 border-t border-border mt-3">
              <p className="text-base font-medium text-foreground">
                {steps[currentStep].title}
              </p>
            </div>
          )}

        </div>
      </div>


      {/* ── STEP PICKER ───────────────────────────────────────────────────── */}
      <BottomSheet open={stepPickerOpen} onClose={() => setStepPickerOpen(false)}>
        <div className="px-4 pb-6 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {text.steps}
          </p>
          <div className="space-y-0.5 max-h-72 overflow-y-auto">
            {steps?.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepSelect(index)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-left transition-colors",
                    isCurrent ? "bg-primary/10" : "hover:bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground",
                      !isCompleted && !isCurrent && "border-2 border-input text-muted-foreground"
                    )}
                  >
                    {isCompleted
                      ? <Check className="h-3 w-3" />
                      : index + 1}
                  </span>
                  <span
                    className={cn(
                      "truncate",
                      isCompleted && "text-primary",
                      isCurrent && "font-semibold text-primary",
                    )}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </BottomSheet>

      {/* ── EXIT CONFIRMATION ─────────────────────────────────────────────── */}
      <BottomSheet open={exitConfirmOpen} onClose={() => setExitConfirmOpen(false)}>
        <div className="px-5 pb-6 pt-3 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {text.exitTitle}
            </h3>
            <p className="text-sm text-muted-foreground">
              {text.exitBody}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row-reverse">
            <Button
              type="button"
              className="flex-1 h-12 rounded-full font-semibold"
              onClick={() => setExitConfirmOpen(false)}
            >
              {text.keepGoing}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-12 rounded-full text-muted-foreground"
              onClick={() => {
                setExitConfirmOpen(false);
                onExit?.();
              }}
            >
              {text.exit}
            </Button>
          </div>
        </div>
      </BottomSheet>

    </>
  );
}
