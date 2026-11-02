import { describe, expect, it } from "vitest";
import { computeOverloadSuggestion } from "@/lib/progression";
import type { WorkoutSession } from "@/types/workoutSession";
import { summarize } from "./summarize";

const set = (setNumber: number, weight: number, reps: number, rpe: number | null) => ({
  id: `s${setNumber}`, setNumber, targetReps: 5, weight, reps, rpe, completed: true,
});

const session = (rpe: number | null): WorkoutSession => ({
  id: "w1",
  missionId: "m1",
  title: "Squat Day",
  status: "completed",
  startedAt: "2026-11-01T10:00:00.000Z",
  completedAt: "2026-11-01T11:00:00.000Z",
  xpReward: 200,
  exercises: [
    { exerciseId: "squat", exerciseName: "Squat", restSeconds: 120, suggest: null, sets: [set(1, 80, 5, 7), set(2, 100, 5, rpe)] },
  ],
});

describe("top sets carry RPE", () => {
  it("keeps the heaviest set's RPE, and only when it was logged", () => {
    expect(summarize(session(6), "2026-11-01T11:00:00.000Z", "completed").topSets[0]).toMatchObject({ weightKg: 100, rpe: 6 });
    expect(summarize(session(null), "2026-11-01T11:00:00.000Z", "completed").topSets[0]).not.toHaveProperty("rpe");
  });

  it("lets the overload engine auto-regulate from a real logged workout", () => {
    const history = [summarize(session(6), "2026-11-01T11:00:00.000Z", "completed")];
    const suggestion = computeOverloadSuggestion({ exerciseId: "squat", history, targetReps: 5, equipment: "barbell" });
    expect(suggestion?.reason).toBe("rpe_accelerated_step");
  });
});
