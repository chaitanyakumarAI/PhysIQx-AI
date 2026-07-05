"use client";

import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

export interface RestTimerProps {
  seconds: number;
  onComplete?: () => void;
  className?: string;
}

/**
 * Self-contained countdown — deliberately not persisted the way the session
 * timer is: a refresh mid-rest just restarts the countdown, which is low
 * enough stakes not to need survival across reloads. `onComplete` is read
 * via a ref so a fresh inline callback from the caller every render can't
 * restart the interval or fire completion more than once.
 */
export function RestTimer({ seconds, onComplete, className }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          clearInterval(interval);
          onCompleteRef.current?.();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-card border border-info/20 bg-info/10 p-4",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-info">Rest</p>
      <p className="font-display text-4xl font-bold tabular-nums text-info">{remaining}s</p>
      <ProgressBar
        value={seconds - remaining}
        max={seconds}
        tone="info"
        className="w-full"
        aria-label={`Rest timer, ${remaining} seconds remaining`}
      />
    </div>
  );
}
