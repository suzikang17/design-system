import * as React from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Set false to disable backdrop tap and swipe-to-dismiss (required/destructive sheets) */
  dismissible?: boolean;
}

export function BottomSheet({ open, onClose, children, dismissible = true }: BottomSheetProps) {
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const dragStart = React.useRef<number | null>(null);
  const dragY = React.useRef(0);

  // ESC key dismisses on desktop
  React.useEffect(() => {
    if (!open || !dismissible) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, dismissible, onClose]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!dismissible) return;
    dragStart.current = e.touches[0].clientY;
    dragY.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dismissible || dragStart.current === null) return;
    dragY.current = e.touches[0].clientY - dragStart.current;
    if (sheetRef.current && dragY.current > 0) {
      sheetRef.current.style.transform = `translateY(${dragY.current}px)`;
    }
  };

  const onTouchEnd = () => {
    if (!dismissible) return;
    if (sheetRef.current) sheetRef.current.style.transform = "";
    if (dragY.current > 80) onClose();
    dragStart.current = null;
    dragY.current = 0;
  };

  if (!open) return null;

  return (
    <>
      {/* Single wrapper handles both backdrop and centering on desktop */}
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30"
          onClick={dismissible ? onClose : undefined}
        />
        {/* Sheet positioner: bottom on mobile, centered on desktop */}
        <div className="absolute inset-0 flex items-end justify-center md:items-center md:p-4 pointer-events-none">
          <div
            ref={sheetRef}
            className="pointer-events-auto w-full max-w-lg md:max-w-[480px] bg-background text-foreground rounded-t-2xl md:rounded-2xl shadow-xl"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Drag handle — mobile only */}
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3 mb-1 md:hidden" />
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
