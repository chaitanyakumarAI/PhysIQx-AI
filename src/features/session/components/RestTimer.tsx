"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Plus, Minus } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import { playCountdownTick, playRestComplete, triggerHaptic } from "@/lib/audioEngine";
import {
  speakVoiceCue,
  getRestMilestoneCue,
  cancelVoiceCues,
  isSpeechSynthesisAvailable,
} from "@/lib/voiceCoach";

export interface RestTimerProps {
  seconds: number;
  onComplete?: () => void;
  className?: string;
}

/**
 * Self-contained countdown with Web Speech voice coaching cues,
 * haptic pulses, sound synthesis, and quick time adjusters (+30s / -15s).
 */
export function RestTimer({ seconds, onComplete, className }: RestTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(seconds);
  const [remaining, setRemaining] = useState(seconds);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const voiceEnabledRef = useRef(voiceEnabled);
  voiceEnabledRef.current = voiceEnabled;

  // Sync if prop changes
  useEffect(() => {
    setTotalSeconds(seconds);
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((current) => {
        // Already 0 = the Skip button finished us — don't fire twice.
        if (current <= 0) {
          clearInterval(interval);
          return 0;
        }

        const next = current - 1;

        if (next <= 0) {
          clearInterval(interval);
          playRestComplete();
          if (voiceEnabledRef.current) {
            speakVoiceCue("Rest complete. Let's lift!");
          }
          onCompleteRef.current?.();
          return 0;
        }

        // Voice cue at milestones (e.g. 60s, 30s, 10s)
        if (voiceEnabledRef.current) {
          const cue = getRestMilestoneCue(next);
          if (cue) {
            speakVoiceCue(cue);
          }
        }

        // Audio tick on 3, 2, 1
        if (next <= 3 && next > 0) {
          playCountdownTick();
        }

        return next;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      cancelVoiceCues();
    };
  }, [totalSeconds]);

  function adjustTime(delta: number) {
    triggerHaptic("light");
    setRemaining((prev) => {
      const next = Math.max(1, prev + delta);
      return next;
    });
    setTotalSeconds((prev) => Math.max(1, prev + delta));
  }

  function handleSkip() {
    cancelVoiceCues();
    setRemaining(0);
    playRestComplete();
    onCompleteRef.current?.();
  }

  const hasSpeech = isSpeechSynthesisAvailable();

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-2.5 rounded-card border border-info/30 bg-info/10 p-4 shadow-sm",
        className,
      )}
    >
      {/* Top Header: Label & Voice Toggle */}
      <div className="flex w-full items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-info">
          Rest Interval
        </span>

        {hasSpeech && (
          <button
            type="button"
            onClick={() => setVoiceEnabled((v) => !v)}
            aria-label={voiceEnabled ? "Mute voice coach cues" : "Enable voice coach cues"}
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-info/90 hover:bg-info/15 transition-colors"
          >
            {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="text-[10px]">{voiceEnabled ? "Voice ON" : "Voice OFF"}</span>
          </button>
        )}
      </div>

      {/* Countdown Digits */}
      <p className="font-display text-5xl font-bold tabular-nums text-info tracking-tight">
        {remaining}
        <span className="text-xl font-normal text-info/80 ml-1">s</span>
      </p>

      {/* Progress Bar */}
      <ProgressBar
        value={Math.max(0, totalSeconds - remaining)}
        max={Math.max(1, totalSeconds)}
        tone="info"
        className="w-full h-2"
        aria-label={`Rest timer, ${remaining} seconds remaining`}
      />

      {/* Control Buttons Row */}
      <div className="flex w-full items-center justify-between pt-1">
        {/* Quick Adjust Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => adjustTime(-15)}
            disabled={remaining <= 15}
            aria-label="Subtract 15 seconds"
            className="flex items-center gap-0.5 rounded-full border border-info/30 bg-info/10 px-2.5 py-1 text-xs font-semibold text-info hover:bg-info/20 disabled:opacity-40 transition-colors"
          >
            <Minus size={12} />
            <span>15s</span>
          </button>
          <button
            type="button"
            onClick={() => adjustTime(30)}
            aria-label="Add 30 seconds"
            className="flex items-center gap-0.5 rounded-full border border-info/30 bg-info/10 px-2.5 py-1 text-xs font-semibold text-info hover:bg-info/20 transition-colors"
          >
            <Plus size={12} />
            <span>30s</span>
          </button>
        </div>

        {/* Skip Rest Button */}
        <button
          type="button"
          onClick={handleSkip}
          className="min-h-9 rounded-full bg-info/20 px-4 text-xs font-bold text-info transition-all hover:bg-info hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
        >
          Skip Rest →
        </button>
      </div>
    </div>
  );
}
