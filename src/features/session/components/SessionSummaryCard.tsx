import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { iconSize } from "@/constants/icons";
import { StatChipRow, type StatEntry } from "@/features/shared/components/StatChipRow";
import { formatElapsedTime } from "../lib/derive";

export interface SessionSummaryCardProps {
  durationSeconds: number;
  volume: number;
  unit: string;
  xpReward: number;
  className?: string;
}

/** The completed-session celebration. Reuses CircularProgress's glow —
 *  the same pattern as Onboarding's DNAResultStep — rather than inventing a
 *  new celebratory effect for this one moment. */
export function SessionSummaryCard({
  durationSeconds,
  volume,
  unit,
  xpReward,
  className,
}: SessionSummaryCardProps) {
  const stats: StatEntry[] = [
    { label: "Duration", value: formatElapsedTime(durationSeconds) },
    { label: "Volume", value: `${volume.toLocaleString()}${unit}` },
    { label: "XP Earned", value: `+${xpReward}` },
  ];

  return (
    <div className={className}>
      <Card variant="accent" padding="lg" className="flex flex-col items-center gap-4 text-center">
        <CircularProgress value={100} size={100} strokeWidth={8} glow>
          <Trophy size={iconSize.lg} className="text-brand" aria-hidden />
        </CircularProgress>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary">
            Workout complete
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-brand">Nice work.</h2>
        </div>
      </Card>
      <StatChipRow stats={stats} className="mt-4" />
    </div>
  );
}
