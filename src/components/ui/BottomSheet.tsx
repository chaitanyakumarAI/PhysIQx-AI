"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Visually hide the title (it still labels the dialog). */
  hideTitle?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * A modal sheet that rises from the bottom (phone-first). Escape, the
 * backdrop, and the close button all dismiss it; focus moves into the sheet
 * on open and back to the opener on close.
 */
export function BottomSheet({ open, onClose, title, hideTitle, children, className }: BottomSheetProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">
          <m.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <m.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={reducedMotion ? { opacity: 0 } : { y: "100%" }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className={cn(
              "relative z-10 max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-white/[0.08] bg-surface-elevated px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-card-elevated focus:outline-none",
              className,
            )}
          >
            <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 id={titleId} className={cn("font-display text-lg font-bold", hideTitle && "sr-only")}>
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="ml-auto grid size-10 place-items-center rounded-full text-foreground-secondary hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
              >
                <X size={iconSize.sm} aria-hidden />
              </button>
            </div>
            {children}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
