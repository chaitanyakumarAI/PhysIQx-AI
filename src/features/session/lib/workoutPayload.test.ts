import { describe, expect, it } from "vitest";
import { finishedSessionSchema } from "./sessionSchema";
import { toWorkoutPayload } from "./workoutPayload";

const set = (setNumber: number, weight: number | null, reps: number | null, completed = true) => ({
  id: `s${setNumber}`, setNumber, targetReps: 10, weight, reps, rpe: null, completed,
});

const session = {
  id: "session-push-1",
  missionId: "mission-push",
  title: "Push Day",
  status: "completed" as const,
  startedAt: "2026-10-23T10:00:00.000Z",
  completedAt: "2026-10-23T10:45:00.000Z",
  xpReward: 300,
  exercises: [
    { exerciseId: "bench", exerciseName: "Bench Press", restSeconds: 90, suggest: null, sets: [set(1, 60, 10), set(2, 70, 8), set(3, 70, 0), set(4, 80, 5, false)] },
    { exerciseId: "dips", exerciseName: "Dips", restSeconds: 60, suggest: null, sets: [set(1, 0, 12)] },
  ],
};

describe("finishedSessionSchema", () => {
  it("accepts a real finished workout", () => {
    expect(finishedSessionSchema.safeParse(session).success).toBe(true);
  });

  it("rejects active sessions, absurd weights and inflated XP rewards", () => {
    expect(finishedSessionSchema.safeParse({ ...session, status: "active" }).success).toBe(false);
    expect(finishedSessionSchema.safeParse({ ...session, xpReward: 5000 }).success).toBe(false);
    const heavy = { ...session, exercises: [{ ...session.exercises[0]!, sets: [set(1, 5000, 1)] }] };
    expect(finishedSessionSchema.safeParse(heavy).success).toBe(false);
  });
});

describe("toWorkoutPayload", () => {
  const payload = toWorkoutPayload(finishedSessionSchema.parse(session), "2026-10-23T11:00:00.000Z");

  it("recomputes volume and XP instead of trusting client totals", () => {
    expect(payload.total_volume_kg).toBe(60 * 10 + 70 * 8);
    // 3 of 5 planned sets did work → 3/5 of the 300 XP reward.
    expect(payload.xp_earned).toBe(180);
  });

  it("stores only completed sets with reps and flags the heaviest per exercise", () => {
    expect(payload.exercises[0]!.sets.map((s) => [s.set_number, s.is_pr])).toEqual([[1, false], [2, true]]);
    expect(payload.exercises[1]!.sets[0]!.is_pr).toBe(false);
  });

  it("awards no XP for an abandoned workout", () => {
    const abandoned = toWorkoutPayload(finishedSessionSchema.parse({ ...session, status: "abandoned" }), session.completedAt);
    expect(abandoned.xp_earned).toBe(0);
  });
});
