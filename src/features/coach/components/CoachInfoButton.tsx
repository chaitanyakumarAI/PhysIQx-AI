"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { CoachInfoSheet } from "./CoachInfoSheet";
import { cn } from "@/lib/utils";

export interface CoachInfoButtonProps {
  featureKey: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Subtle on-demand (i) information button.
 * Clicking opens a tactical coach explainer card with animated avatar.
 */
export function CoachInfoButton({
  featureKey,
  label = "Explain feature",
  size = "sm",
  className,
}: CoachInfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-border/80 bg-surface/80 text-foreground-secondary transition-all hover:border-brand/60 hover:text-brand hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
          size === "sm" ? "size-5 p-0.5" : "size-6 p-1",
          className,
        )}
      >
        <Info size={size === "sm" ? 11 : 13} aria-hidden />
      </button>

      <CoachInfoSheet
        featureKey={featureKey}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
