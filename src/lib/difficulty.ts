import { daysBetweenIso } from "@/lib/dates";
import type { CompletedSessionSummary, SessionExercise, WorkoutSession } from "@/types/workoutSession";

/**
 * Adaptive difficulty from logged RPE — rule-based, and only ever a
 * suggestion (owner decision 2026-11-02): the athlete taps to apply it to
 * today's workout. Needs RPE logging (Preferences › Track RPE); without
 * RPE there's no signal and nothing is suggested.
 */
export type DifficultyKind = "deload" | "add-set";

export interface DifficultySignal {
  kind: DifficultyKind;
  /** Average RPE of the rated sessions it's based on (one decimal). */
  avgRpe: number;
  sessions: number;
}

/** How far back to look, in workouts. */
const WINDOW = 5;
/** After a break this long, old fatigue no longer says anything. */
const STALE_AFTER_DAYS = 21;
const DELOAD_AT_RPE = 9;
const ADD_SET_AT_RPE = 7;
/** Rest gets this much longer on a lighter day. */
export const DELOAD_REST_FACTOR = 1.2;

/** The latest `count` workouts, newest first (history is stored oldest first). */
export function recentSessions(history: CompletedSessionSummary[], count = WINDOW): CompletedSessionSummary[] {
  return [...history].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, count);
}

export function difficultySignal(history: CompletedSessionSummary[], todayIso: string): DifficultySignal | null {
  const recent = recentSessions(history).filter((session) => session.status !== "abandoned");
  const latest = recent[0];
  if (!latest || daysBetweenIso(latest.date, todayIso) > STALE_AFTER_DAYS) return null;

  const rated = recent.filter((session) => (session.avgRpe ?? 0) > 0);
  if (rated.length < 2) return null; // one hard day isn't a trend
  const avgRpe = Math.round((rated.reduce((sum, session) => sum + session.avgRpe!, 0) / rated.length) * 10) / 10;

  if (avgRpe >= DELOAD_AT_RPE) return { kind: "deload", avgRpe, sessions: rated.length };
  if (avgRpe <= ADD_SET_AT_RPE && rated.length >= 3) return { kind: "add-set", avgRpe, sessions: rated.length };
  return null;
}

/**
 * Today's workout, adjusted. A lighter day drops the last set of each
 * exercise that has more than one still to do, and rests longer; "add a
 * set" repeats each exercise's last set. Sets already logged are never
 * touched.
 */
export function adjustSessionDifficulty(session: WorkoutSession, kind: DifficultyKind): WorkoutSession {
  const exercises = session.exercises.map((exercise): SessionExercise => {
    const sets =
      kind === "deload"
        ? dropLastOpenSet(exercise.sets)
        : [...exercise.sets, repeatLastSet(exercise)];
    return {
      ...exercise,
      sets: sets.map((exerciseSet, index) => ({ ...exerciseSet, setNumber: index + 1 })),
      restSeconds: kind === "deload" ? Math.round(exercise.restSeconds * DELOAD_REST_FACTOR) : exercise.restSeconds,
    };
  });
  return { ...session, exercises, difficulty: { kind, choice: "applied" } };
}

function dropLastOpenSet(sets: SessionExercise["sets"]): SessionExercise["sets"] {
  const open = sets.filter((exerciseSet) => !exerciseSet.completed);
  const last = open.at(-1);
  if (!last || sets.length <= 1 || open.length <= 1) return sets;
  return sets.filter((exerciseSet) => exerciseSet.id !== last.id);
}

function repeatLastSet(exercise: SessionExercise): SessionExercise["sets"][number] {
  const last = exercise.sets.at(-1);
  return {
    id: `${exercise.exerciseId}-set-extra-${Date.now()}`,
    setNumber: exercise.sets.length + 1,
    targetReps: last?.targetReps ?? 10,
    ...(last?.toFailure ? { toFailure: true } : {}),
    ...(last?.durationSeconds ? { durationSeconds: last.durationSeconds } : {}),
    weight: null,
    reps: null,
    rpe: null,
    completed: false,
  };
}
