import type { WorkoutSession } from "@/types/workoutSession";

/** "12:34" — minutes:seconds, hours:minutes:seconds past the first hour. */
export function formatElapsedTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/** Total weight moved across completed sets — kg (or lb) × reps, summed. */
export function computeSessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce((exerciseTotal, exercise) => {
    const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
      if (!set.completed || set.weight === null || set.reps === null) return setTotal;
      return setTotal + set.weight * set.reps;
    }, 0);
    return exerciseTotal + exerciseVolume;
  }, 0);
}

export interface SessionProgress {
  completedSets: number;
  totalSets: number;
  percent: number;
}

/** Derived — always computed from the session's sets, never hand-authored. */
export function computeSessionProgress(session: WorkoutSession): SessionProgress {
  const totalSets = session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const completedSets = session.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
    0,
  );
  return {
    completedSets,
    totalSets,
    percent: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
  };
}

/** Which exercise the user is currently on — the first one with an incomplete set. */
export function findActiveExerciseIndex(session: WorkoutSession): number {
  const index = session.exercises.findIndex((exercise) =>
    exercise.sets.some((set) => !set.completed),
  );
  return index === -1 ? session.exercises.length - 1 : index;
}
