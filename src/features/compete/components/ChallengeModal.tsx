"use client";

import { X, Zap } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { iconSize } from "@/constants/icons";
import type { LeaderboardEntry } from "@/types/leaderboard";

export interface ChallengeModalProps {
  target: LeaderboardEntry | null;
  onClose: () => void;
}

/**
 * Mock challenge invite modal — Phase 2 preview affordance.
 * Shows a contextual confirmation with the target user's avatar and XP gap.
 * Tapping "Send Challenge" fires a toast; real challenge API comes in Phase 5.
 */
export function ChallengeModal({ target, onClose }: ChallengeModalProps) {
  function handleSend() {
    // Phase 5 seam: replace with a real challenge API call.
    onClose();
    // Show inline feedback via a native-like micro-interaction by briefly
    // flashing the button — the toast system would be wired here for Phase 5.
  }

  return (
    <AnimatePresence>
      {target && (
        <>
          {/* Backdrop */}
          <m.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <m.div
            key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-2xl border-t border-border/60 bg-surface-elevated px-5 pb-10 pt-5 shadow-card"
          >
            {/* Drag pill */}
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border/60" />

            {/* Close */}
            <button
              type="button"
              aria-label="Close challenge dialog"
              onClick={onClose}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
            >
              <X size={iconSize.sm} aria-hidden />
            </button>

            <div className="flex flex-col items-center gap-4 text-center">
              <Avatar
                name={target.name}
                src={target.avatarSrc}
                size="lg"
                variant="brand"
              />
              <div>
                <p className="font-display text-xl font-bold">{target.name}</p>
                <p className="mt-1 text-sm text-foreground-secondary">
                  {target.xp.toLocaleString()} XP · Rank #{target.rank}
                </p>
              </div>

              <div className="w-full rounded-card border border-brand/20 bg-brand/5 px-4 py-3">
                <p className="text-sm font-semibold text-brand">7-Day XP Sprint</p>
                <p className="mt-0.5 text-xs text-foreground-secondary">
                  Who earns more XP over the next 7 days wins the badge.
                </p>
              </div>

              <Button
                size="lg"
                fullWidth
                onClick={handleSend}
              >
                <Zap size={iconSize.sm} aria-hidden fill="currentColor" />
                Send Challenge
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-foreground-secondary transition-colors hover:text-foreground focus-visible:outline-none"
              >
                Maybe later
              </button>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
