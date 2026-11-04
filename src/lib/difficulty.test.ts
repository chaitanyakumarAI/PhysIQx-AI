import { describe, expect, it } from "vitest";
import type { CompletedSessionSummary, WorkoutSession } from "@/types/workoutSession";
import { adjustSessionDifficulty, difficultySignal } from "./difficulty";

const day = (date: string, avgRpe?: number, status: CompletedSessionSummary["status"] = "completed"): CompletedSessionSummary => ({
  id: `s-${date}`,
  missionId: "m",
  title: "Workout",
  date,
  completedAt: `${date}T18:00:00.000Z`,
  durationSec: 3600,
  setsCompleted: 12,
  totalVolumeKg: 5000,
  xpEarned: 100,
  topSets: [],
  ...(avgRpe ? { avgRpe } : {}),
  status,
});
const TODAY = "2026-11-04";

describe("difficultySignal", () => {
  it("suggests a lighter day after two or more very hard workouts", () => {
    expect(difficultySignal([day("2026-11-01", 9.5), day("2026-11-03", 9.1)], TODAY)).toEqual({ kind: "deload", avgRpe: 9.3, sessions: 2 });
  });

  it("suggests another set only after three easy workouts", () => {
    expect(difficultySignal([day("2026-11-01", 6.5), day("2026-11-02", 7)], TODAY)).toBeNull();
    expect(difficultySignal([day("2026-10-31", 6), day("2026-11-01", 6.5), day("2026-11-02", 7)], TODAY)).toMatchObject({ kind: "add-set" });
  });

  it("reads the newest workouts, not the oldest", () => {
    const old = ["2026-10-01", "2026-10-03", "2026-10-05", "2026-10-07", "2026-10-09"].map((date) => day(date, 9.8));
    const recent = ["2026-10-30", "2026-11-01", "2026-11-03"].map((date) => day(date, 8));
    expect(difficultySignal([...old, ...recent], TODAY)).toBeNull();
  });

  it("stays quiet without RPE, after a long break, and ignores abandoned workouts", () => {
    expect(difficultySignal([day("2026-11-01"), day("2026-11-03")], TODAY)).toBeNull();
    expect(difficultySignal([day("2026-09-01", 9.5), day("2026-09-03", 9.5)], TODAY)).toBeNull();
    expect(difficultySignal([day("2026-11-01", 9.5), day("2026-11-03", 9.9, "abandoned")], TODAY)).toBeNull();
  });
});

const set = (n: number, completed = false) => ({ id: `bench-${n}`, setNumber: n, targetReps: 8, weight: completed ? 80 : null, reps: completed ? 8 : null, rpe: null, completed });
const session: WorkoutSession = {
  id: "w",
  missionId: "m",
  title: "Push",
  status: "active",
  startedAt: "2026-11-04T17:00:00.000Z",
  completedAt: null,
  xpReward: 200,
  exercises: [
    { exerciseId: "bench", exerciseName: "Bench", restSeconds: 100, suggest: null, sets: [set(1, true), set(2), set(3)] },
    { exerciseId: "dips", exerciseName: "Dips", restSeconds: 60, suggest: null, sets: [{ ...set(1), id: "dips-1" }] },
  ],
};

describe("adjustSessionDifficulty", () => {
  it("drops the last open set, rests longer, and never touches logged sets or the last set", () => {
    const lighter = adjustSessionDifficulty(session, "deload");
    expect(lighter.exercises[0]!.sets.map((s) => [s.id, s.setNumber])).toEqual([["bench-1", 1], ["bench-2", 2]]);
    expect(lighter.exercises[0]!.restSeconds).toBe(120);
    expect(lighter.exercises[1]!.sets).toHaveLength(1);
    expect(lighter.difficulty).toEqual({ kind: "deload", choice: "applied" });
  });

  it("adds one set to each exercise, copying the last set's target", () => {
    const harder = adjustSessionDifficulty(session, "add-set");
    expect(harder.exercises.map((exercise) => exercise.sets.length)).toEqual([4, 2]);
    expect(harder.exercises[0]!.sets[3]).toMatchObject({ setNumber: 4, targetReps: 8, completed: false });
  });
});
