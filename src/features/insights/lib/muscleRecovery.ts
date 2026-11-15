import { daysBetweenIso } from "@/lib/dates";
import { muscleGroupLabels, type Exercise, type MuscleGroup } from "@/types/exercise";
import type { CompletedSessionSummary } from "@/types/workoutSession";

/**
 * Muscle recovery map — per muscle group, how long since the ledger last
 * saw real work for it, read off each session's top sets through the
 * catalog's stimulus shares. No physiology is measured: the status is an
 * estimate from elapsed training days (muscle protein synthesis runs
 * roughly 48–72 h), and the copy says so.
 */

export type MuscleRecoveryStatus = "worked" | "recovering" | "nearly" | "ready" | "untrained";

export const muscleRecoveryStatusLabels: Record<MuscleRecoveryStatus, string> = {
  worked: "Worked today",
  recovering: "Recovering",
  nearly: "Nearly ready",
  ready: "Ready",
  untrained: "No data yet",
};

export interface MuscleRecoveryEntry {
  group: MuscleGroup;
  label: string;
  /** Local day the muscle was last meaningfully trained; null = never. */
  lastTrainedIso: string | null;
  daysSince: number | null;
  status: MuscleRecoveryStatus;
  /** Estimated readiness 0–100; null before the muscle was ever trained. */
  percent: number | null;
}

/** A set only counts for a muscle the exercise meaningfully loads. */
const MIN_STIMULUS_SHARE = 25;

const GROUPS = Object.keys(muscleGroupLabels) as MuscleGroup[];

function statusFor(daysSince: number | null): [MuscleRecoveryStatus, number | null] {
  if (daysSince === null) return ["untrained", null];
  if (daysSince <= 0) return ["worked", 25];
  if (daysSince === 1) return ["recovering", 55];
  if (daysSince === 2) return ["nearly", 85];
  return ["ready", 100];
}

export function deriveMuscleRecovery(
  sessions: CompletedSessionSummary[],
  catalog: Exercise[],
  todayIso: string,
): MuscleRecoveryEntry[] {
  const hitsByExercise = new Map(catalog.map((exercise) => [exercise.id, exercise.muscleHit]));
  const lastTrained = new Map<MuscleGroup, string>();

  for (const session of sessions) {
    if (session.setsCompleted === 0 || session.date > todayIso) continue;
    for (const set of session.topSets) {
      const hits = hitsByExercise.get(set.exerciseId);
      if (!hits) continue;
      for (const group of GROUPS) {
        if ((hits[group] ?? 0) < MIN_STIMULUS_SHARE) continue;
        const previous = lastTrained.get(group);
        if (!previous || session.date > previous) lastTrained.set(group, session.date);
      }
    }
  }

  return GROUPS.map((group) => {
    const lastTrainedIso = lastTrained.get(group) ?? null;
    const daysSince = lastTrainedIso ? daysBetweenIso(lastTrainedIso, todayIso) : null;
    const [status, percent] = statusFor(daysSince);
    return { group, label: muscleGroupLabels[group], lastTrainedIso, daysSince, status, percent };
  });
}
