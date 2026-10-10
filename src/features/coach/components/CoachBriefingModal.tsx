"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Play } from "lucide-react";
import { CoachAvatar } from "@/components/ui/CoachAvatar";
import { getIntroBriefing, getCoachProfile } from "@/data/coachContent";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { fadeInUp, duration, easeOut } from "@/lib/motion";
import type { Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: duration.dialog, ease: easeOut },
  },
  exit: { opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.15 } },
};

export interface CoachBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const BRIEFING_KEY = "physiqx_briefing_completed_v1";

export function CoachBriefingModal({
  isOpen,
  onClose,
  onComplete,
}: CoachBriefingModalProps) {
  const steps = getIntroBriefing();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [activeSpeakerIdx, setActiveSpeakerIdx] = useState(0); // 0 = Kix, 1 = Nyra

  const currentStep = steps[currentStepIdx] ?? steps[0]!;
  const isLast = currentStepIdx === steps.length - 1;

  // Auto-switch speaker focus every few seconds if user doesn't click
  useEffect(() => {
    setActiveSpeakerIdx(0);
  }, [currentStepIdx]);

  function handleNext() {
    if (isLast) {
      if (typeof window !== "undefined") {
        localStorage.setItem(BRIEFING_KEY, "true");
        window.dispatchEvent(new CustomEvent("physiqx_briefing_finished"));
      }
      onClose();
      onComplete?.();
      return;
    }
    setCurrentStepIdx((prev) => prev + 1);
  }

  function handleBack() {
    setCurrentStepIdx((prev) => Math.max(0, prev - 1));
  }

  const kixProfile = getCoachProfile("kix");
  const nyraProfile = getCoachProfile("nyra");

  const kixLine = currentStep.lines.find((l) => l.speaker === "kix");
  const nyraLine = currentStep.lines.find((l) => l.speaker === "nyra");

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="briefing-title"
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-md p-0 sm:p-4"
        >
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={onClose} aria-hidden />

          {/* Modal Container */}
          <m.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 flex w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl border border-border/80 bg-surface-elevated/95 p-5 pb-8 sm:p-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Header: Mission Briefing Telemetry */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-brand animate-ping" />
                <span className="text-[11px] font-mono font-bold tracking-widest text-brand uppercase">
                  Tactical Comms // Channel 01
                </span>
              </div>
              <IconButton label="Close briefing" variant="ghost" onClick={onClose}>
                <X size={16} aria-hidden />
              </IconButton>
            </div>

            {/* Stepper Progress */}
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-foreground-secondary">
              <span className="font-mono font-semibold tracking-wider uppercase">
                Phase 0{currentStep.step} / 0{steps.length}: {currentStep.topic}
              </span>
              <ProgressBar
                value={currentStep.step}
                max={steps.length}
                className="w-24"
                aria-label={`Step ${currentStep.step} of ${steps.length}`}
              />
            </div>

            {/* Dialogue Conversation Body */}
            <div className="my-5 flex flex-col gap-4">
              {/* KIX COMMS BUBBLE */}
              {kixLine && (
                <m.div
                  key={`kix-${currentStep.step}`}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    "flex items-start gap-3.5 rounded-2xl border p-3.5 transition-all",
                    activeSpeakerIdx === 0
                      ? "border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "border-border/40 bg-surface/60 opacity-85",
                  )}
                  onClick={() => setActiveSpeakerIdx(0)}
                >
                  <CoachAvatar
                    coachId="kix"
                    expression={kixLine.expression}
                    isSpeaking={activeSpeakerIdx === 0}
                    size="md"
                    showWaveform={activeSpeakerIdx === 0}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                          {kixProfile.name}
                        </span>
                        <span className="text-[10px] text-foreground-muted font-mono">
                          [{kixProfile.callsign}]
                        </span>
                      </div>
                      {activeSpeakerIdx === 0 && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-400">
                          TRANSMITTING
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-foreground leading-relaxed">
                      {kixLine.text}
                    </p>
                  </div>
                </m.div>
              )}

              {/* NYRA COMMS BUBBLE */}
              {nyraLine && (
                <m.div
                  key={`nyra-${currentStep.step}`}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    "flex items-start gap-3.5 rounded-2xl border p-3.5 transition-all",
                    activeSpeakerIdx === 1
                      ? "border-cyan-500/50 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      : "border-border/40 bg-surface/60 opacity-85",
                  )}
                  onClick={() => setActiveSpeakerIdx(1)}
                >
                  <CoachAvatar
                    coachId="nyra"
                    expression={nyraLine.expression}
                    isSpeaking={activeSpeakerIdx === 1}
                    size="md"
                    showWaveform={activeSpeakerIdx === 1}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                          {nyraProfile.name}
                        </span>
                        <span className="text-[10px] text-foreground-muted font-mono">
                          [{nyraProfile.callsign}]
                        </span>
                      </div>
                      {activeSpeakerIdx === 1 && (
                        <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-cyan-400">
                          TRANSMITTING
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-foreground leading-relaxed">
                      {nyraLine.text}
                    </p>
                  </div>
                </m.div>
              )}
            </div>

            {/* Modal Navigation Controls */}
            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
              <Button
                variant="ghost"
                size="md"
                disabled={currentStepIdx === 0}
                onClick={handleBack}
                className="gap-1.5 text-xs text-foreground-secondary"
              >
                <ChevronLeft size={16} aria-hidden />
                Previous
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                className="gap-1.5 text-xs font-bold tracking-wide"
              >
                {isLast ? (
                  <>
                    <Play size={14} className="fill-current" aria-hidden />
                    Engage First Mission
                  </>
                ) : (
                  <>
                    Next Phase
                    <ChevronRight size={16} aria-hidden />
                  </>
                )}
              </Button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Check if the recruit has already completed the initial briefing */
export function hasSeenCoachBriefing(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(BRIEFING_KEY) === "true";
}

export function markCoachBriefingSeen(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(BRIEFING_KEY, "true");
  }
}

export function resetCoachBriefing(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(BRIEFING_KEY);
  }
}
