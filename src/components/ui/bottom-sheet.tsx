import * as React from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Set false to disable backdrop tap and swipe-to-dismiss (required/destructive sheets) */
  dismissible?: boolean;
  /** Names the sheet for screen readers: the id of its title, or a label. */
  "aria-labelledby"?: string;
  "aria-label"?: string;
}

/** Open sheets, oldest first. Only the last one answers Escape. */
const openSheets: object[] = [];

export function BottomSheet({
  open,
  onClose,
  children,
  dismissible = true,
  "aria-labelledby": labelledBy,
  "aria-label": label,
}: BottomSheetProps) {
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const token = React.useRef({});
  const dragStart = React.useRef<number | null>(null);
  const dragY = React.useRef(0);

  // Focus moves into the sheet when it opens and back where it was when it closes.
  React.useEffect(() => {
    if (!open) return;
    const me = token.current;
    const previous = document.activeElement as HTMLElement | null;
    openSheets.push(me);
    sheetRef.current?.focus();
    return () => {
      openSheets.splice(openSheets.indexOf(me), 1);
      previous?.focus?.();
    };
  }, [open]);

  // Escape closes the top-most sheet only, and only when nothing inside it
  // (a menu, a select) has already handled the key.
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (openSheets[openSheets.length - 1] !== token.current) return;
      e.preventDefault();
      if (dismissible) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, dismissible, onClose]);

  // Swipe-to-dismiss starts on the handle, so scrolling the content never drags the sheet.
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
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-label={label}
          tabIndex={-1}
          className="pointer-events-auto w-full max-w-lg md:max-w-[480px] bg-background text-foreground rounded-t-2xl md:rounded-2xl shadow-xl outline-none"
        >
          {/* Drag handle — mobile only */}
          <div
            className="flex justify-center pb-1 pt-3 touch-none md:hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
