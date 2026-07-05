import { cn } from "@/lib/utils";
import { formatElapsedTime } from "../lib/derive";

export interface SessionTimerProps {
  seconds: number;
  className?: string;
}

/**
 * Presentational only — takes the already-ticked seconds as a prop rather
 * than calling useElapsedSeconds itself, so it stays trivially testable and
 * doesn't need a live session to render. Large tabular numeral, the same
 * hero-stat technique GoalStepper already established in Onboarding.
 */
export function SessionTimer({ seconds, className }: SessionTimerProps) {
  return (
    <p
      role="timer"
      aria-label={`Elapsed time ${formatElapsedTime(seconds)}`}
      className={cn("font-display text-5xl font-bold tabular-nums", className)}
    >
      {formatElapsedTime(seconds)}
    </p>
  );
}
