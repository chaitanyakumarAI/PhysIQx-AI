import type { WorkoutTemplate } from "@/types/workoutTemplate";

/**
 * Push Day A's blueprint — the only mission that currently exists
 * (src/data/mission.ts), so the only template needed. Six lifts matching
 * the mission's own "6 lifts" stat and "Chest, Shoulders, Triceps" theme.
 * Shared location since Session and (eventually) a template-preview on
 * Train would both read the same blueprint.
 */
export const mockPushDayATemplate: WorkoutTemplate = {
  id: "template-push-day-a",
  missionId: "mission-push-a",
  exercises: [
    { exerciseId: "ex-bench-press", targetSets: 4, targetReps: 8, restSeconds: 90 },
    { exerciseId: "ex-incline-db-press", targetSets: 3, targetReps: 10, restSeconds: 75 },
    { exerciseId: "ex-cable-fly", targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: "ex-overhead-press", targetSets: 3, targetReps: 8, restSeconds: 90 },
    { exerciseId: "ex-lateral-raise", targetSets: 3, targetReps: 15, restSeconds: 45 },
    { exerciseId: "ex-triceps-pushdown", targetSets: 3, targetReps: 12, restSeconds: 45 },
  ],
};
