"use client";

import { m, AnimatePresence, type Variants } from "framer-motion";
import { X, Check, Lightbulb } from "lucide-react";
import { CoachAvatar } from "@/components/ui/CoachAvatar";
import { getFeatureInfo, getCoachProfile } from "@/data/coachContent";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { duration, easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface CoachInfoSheetProps {
  featureKey: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const sheetVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.dialog, ease: easeOut },
  },
  exit: { opacity: 0, y: 20, scale: 0.96, transition: { duration: 0.15 } },
};

/**
 * On-demand tactical feature explainer sheet.
 * Features an animated coach portrait with tactical tips.
 */
export function CoachInfoSheet({
  featureKey,
  isOpen,
  onClose,
}: CoachInfoSheetProps) {
  if (!featureKey) return null;
  const explainer = getFeatureInfo(featureKey);
  if (!explainer) return null;

  const profile = getCoachProfile(explainer.coach);
  const isKix = explainer.coach === "kix";

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="coach-info-title"
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0" onClick={onClose} aria-hidden />

          {/* Tactical Card */}
          <m.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 flex w-full max-w-md flex-col rounded-t-3xl sm:rounded-3xl border border-border/80 bg-surface-elevated/95 p-5 pb-8 sm:p-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-2 rounded-full",
                    isKix ? "bg-emerald-400" : "bg-cyan-400",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold tracking-widest uppercase",
                    isKix ? "text-emerald-400" : "text-cyan-400",
                  )}
                >
                  Tactical Telemetry // {profile.name} [{profile.callsign}]
                </span>
              </div>
              <IconButton label="Close info" variant="ghost" onClick={onClose}>
                <X size={16} aria-hidden />
              </IconButton>
            </div>

            {/* Coach & Explainer Content */}
            <div className="my-4 flex items-start gap-4">
              <CoachAvatar
                coachId={explainer.coach}
                expression="analytical"
                isSpeaking={true}
                size="md"
                showWaveform={true}
              />
              <div className="min-w-0 flex-1">
                <h3
                  id="coach-info-title"
                  className="font-display text-base font-bold text-foreground tracking-tight"
                >
                  {explainer.title}
                </h3>
                <p className="mt-1 text-xs text-foreground-secondary leading-relaxed">
                  {explainer.summary}
                </p>
              </div>
            </div>

            {/* Tactical Rule Banner */}
            <div
              className={cn(
                "rounded-xl border p-3 text-xs",
                isKix
                  ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                  : "border-cyan-500/30 bg-cyan-950/20 text-cyan-200",
              )}
            >
              <div className="flex items-center gap-1.5 font-mono font-bold text-[10px] uppercase tracking-wider">
                <Lightbulb size={12} className={isKix ? "text-emerald-400" : "text-cyan-400"} />
                Tactical Rule
              </div>
              <p className="mt-1 text-xs text-foreground font-medium">
                &ldquo;{explainer.tacticalTip}&rdquo;
              </p>
            </div>

            {/* Dismiss Button */}
            <div className="mt-5 flex justify-end">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={onClose}
                className="gap-2 text-xs font-semibold"
              >
                <Check size={14} aria-hidden />
                Got It
              </Button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
