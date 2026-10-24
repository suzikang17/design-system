import { useRef, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface WizardNextButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  nextStepTitle?: string;
  isSubmit?: boolean;
  /** Small print under a submit button. */
  submitNote?: ReactNode;
  /** @deprecated use nextStepTitle */
  hint?: string;
}

export function WizardNextButton({
  label,
  onClick,
  disabled,
  loading,
  nextStepTitle,
  isSubmit = false,
  submitNote,
  hint,
}: WizardNextButtonProps) {
  const subtitle = nextStepTitle ?? hint;
  const clickGuard = useRef(false);

  const handleClick = () => {
    if (clickGuard.current) return;
    clickGuard.current = true;
    onClick();
    // Re-enable after a short delay to allow React to update
    setTimeout(() => { clickGuard.current = false; }, 1000);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="w-full h-[60px] rounded-xl px-5 flex items-center bg-primary text-primary-foreground shadow-lg shadow-primary/20 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none transition-all active:opacity-90 md:hover:opacity-90"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : isSubmit ? (
          <span className="w-full text-center text-[15px] font-semibold">{label}</span>
        ) : (
          <>
            <span className="text-[15px] font-semibold">{label}</span>
            {subtitle && (
              <span className="flex-1 text-right text-sm font-normal mx-3 truncate">{subtitle}</span>
            )}
            {!subtitle && <span className="flex-1" />}
            <span className="text-base">→</span>
          </>
        )}
      </button>
      {isSubmit && submitNote && (
        <p className="text-center text-xs text-muted-foreground mt-2.5">
          {submitNote}
        </p>
      )}
    </div>
  );
}
