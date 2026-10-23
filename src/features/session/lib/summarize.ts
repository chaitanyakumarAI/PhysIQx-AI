import type { CompletedSessionSummary, TopSet, WorkoutSession } from "@/types/workoutSession";
import { localIsoFromTimestamp } from "@/lib/dates";
import { computeEarnedXp } from "@/features/session/lib/setValidation";

/**
 * Turns a finished session into its ledger summary. Pure, so the client
 * (sessionStore) and the server (saveWorkoutSession) compute volume and XP
 * the same way — the server never trusts client-sent totals.
 */
export type FinalStatus = Exclude<CompletedSessionSummary["status"], "active" | undefined>;

export function summarize(
  session: WorkoutSession,
  completedAt: string,
  status: FinalStatus,
): CompletedSessionSummary {
  let setsCompleted = 0;
  let totalSets = 0;
  let totalVolumeKg = 0;
  let totalRpe = 0;
  let rpeCount = 0;
  const topSets: TopSet[] = [];
  for (const exercise of session.exercises) {
    let best: TopSet | null = null;
    for (const exerciseSet of exercise.sets) {
      totalSets += 1;
      if (!exerciseSet.completed) continue;
      const weight = Math.max(0, exerciseSet.weight ?? 0);
      const reps = Math.max(0, exerciseSet.reps ?? 0);
      // A "completed" set with no reps holds no work (legacy data could).
      if (reps === 0) continue;
      setsCompleted += 1;
      totalVolumeKg += weight * reps;
      if (exerciseSet.rpe && exerciseSet.rpe > 0) {
        totalRpe += exerciseSet.rpe;
        rpeCount += 1;
      }
      if (weight > 0 && reps > 0 && (!best || weight > best.weightKg)) {
        best = {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          weightKg: weight,
          reps,
        };
      }
    }
    if (best) topSets.push(best);
  }
  const durationSec = Math.max(
    0,
    Math.round(
      (new Date(completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000,
    ),
  );
  return {
    id: session.id,
    missionId: session.missionId,
    title: session.title,
    date: localIsoFromTimestamp(completedAt),
    completedAt,
    durationSec,
    setsCompleted,
    totalVolumeKg: Math.round(totalVolumeKg),
    xpEarned: computeEarnedXp(session.xpReward, setsCompleted, totalSets),
    topSets,
    avgRpe: rpeCount > 0 ? Math.round((totalRpe / rpeCount) * 10) / 10 : undefined,
    status,
  };
}
