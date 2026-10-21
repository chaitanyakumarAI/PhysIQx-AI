"use client";

import { Button } from "@/components/ui/Button";
import { formatElapsedTime } from "@/features/session/lib/derive";
import { StatChipRow, type StatEntry } from "@/features/shared/components/StatChipRow";
import type { CompletedSessionSummary } from "@/types/workoutSession";
import { useWorkoutCelebration } from "../hooks/useWorkoutCelebration";
import { WorkoutCelebration } from "./WorkoutCelebration";

export interface WorkoutCompleteProps {
  title: string;
  /** The ledger entry this workout left behind (absent only for legacy sessions). */
  summary: CompletedSessionSummary | undefined;
  durationSeconds: number;
  volumeKg: number;
  onDone: () => void;
}

/** The session route's completed state: the celebration, or plain stats if there's no ledger entry. */
export function WorkoutComplete({ title, summary, durationSeconds, volumeKg, onDone }: WorkoutCompleteProps) {
  const celebration = useWorkoutCelebration(summary);
  const stats: StatEntry[] = [
    { label: "Duration", value: formatElapsedTime(durationSeconds) },
    { label: "Volume", value: `${volumeKg.toLocaleString("en-US")}kg` },
    { label: "Sets", value: String(summary?.setsCompleted ?? 0) },
  ];

  if (summary && !celebration) return null; // stores still loading — a frame at most

  if (!summary || !celebration) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-6">
        <h1 className="text-center font-display text-2xl font-bold">Workout complete</h1>
        <StatChipRow stats={stats} />
        <Button size="lg" fullWidth onClick={onDone}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <WorkoutCelebration
      celebration={celebration}
      title={title}
      seed={summary.id}
      stats={stats}
      share={{ durationSeconds, volumeKg }}
      onDone={onDone}
    />
  );
}
