"use client";

import { useState } from "react";
import { X, Share2, Copy, Check, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Mascot } from "@/components/mascots/Mascot";
import { iconSize } from "@/constants/icons";
import { formatElapsedTime } from "../lib/derive";
import { playScanSuccess } from "@/lib/audioEngine";

export interface WorkoutShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutTitle: string;
  durationSeconds: number;
  volumeKg: number;
  xpReward: number;
  dateStr?: string;
}

export function WorkoutShareModal({
  isOpen,
  onClose,
  workoutTitle,
  durationSeconds,
  volumeKg,
  xpReward,
  dateStr,
}: WorkoutShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displayDate = dateStr || new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedDuration = formatElapsedTime(durationSeconds);

  const shareText = `⚡ PhysIQx AI Workout Conquered!\n🏋️ ${workoutTitle}\n📊 Volume: ${volumeKg.toLocaleString()} kg | ⏱️ Time: ${formattedDuration} | 🏆 +${xpReward} XP\n#PhysIQx #ProgressiveOverload`;

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "PhysIQx AI Workout Victory",
          text: shareText,
        });
        playScanSuccess();
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    handleCopy();
  }

  function handleCopy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      playScanSuccess();
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-surface p-5 shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Share2 size={iconSize.xs} className="text-brand" />
            <h2 id="share-modal-title" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Share Workout Victory
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-8 place-items-center rounded-full text-foreground-secondary hover:bg-surface-elevated hover:text-foreground"
          >
            <X size={iconSize.sm} />
          </button>
        </div>

        {/* The Graphic Athletic Story Card */}
        <div className="my-4 relative flex flex-col items-center rounded-2xl bg-gradient-to-b from-surface-elevated via-neutral-900 to-black p-6 text-center border border-brand/30 shadow-[0_0_24px_rgba(0,240,255,0.12)]">
          {/* Top Stamp */}
          <div className="flex items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand border border-brand/30">
            <Sparkles size={11} /> Verified Workout
          </div>

          {/* Mascot Trophy Frame */}
          <div className="my-4 size-24 overflow-hidden rounded-full ring-4 ring-brand/40 shadow-lg bg-surface">
            <Mascot pose="kix-proud" shape="circle" size={96} />
          </div>

          <h3 className="font-display text-xl font-bold text-foreground line-clamp-1">
            {workoutTitle}
          </h3>
          <p className="text-xs text-foreground-secondary mt-0.5">{displayDate}</p>

          {/* Stats Grid */}
          <div className="mt-5 grid grid-cols-3 gap-2 w-full border-t border-border/40 pt-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-foreground-secondary uppercase tracking-wider">
                Volume
              </span>
              <span className="font-display font-bold text-foreground text-sm tabular-nums mt-0.5">
                {volumeKg.toLocaleString()}k
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-foreground-secondary uppercase tracking-wider">
                Time
              </span>
              <span className="font-display font-bold text-foreground text-sm tabular-nums mt-0.5">
                {formattedDuration}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-foreground-secondary uppercase tracking-wider">
                Reward
              </span>
              <span className="font-display font-bold text-brand text-sm tabular-nums mt-0.5">
                +{xpReward} XP
              </span>
            </div>
          </div>

          {/* Watermark */}
          <p className="mt-5 text-[9px] font-semibold tracking-widest uppercase text-foreground-secondary/60">
            Engineered with PhysIQx AI
          </p>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-col gap-2">
          <Button size="md" variant="primary" fullWidth onClick={handleShare}>
            <Share2 size={iconSize.xs} /> Share Story Card
          </Button>

          <Button size="sm" variant="secondary" fullWidth onClick={handleCopy}>
            {copied ? (
              <>
                <Check size={iconSize.xs} className="text-brand" /> Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy size={iconSize.xs} /> Copy Workout Summary
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
