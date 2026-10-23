import { describe, expect, it } from "vitest";
import { userPlanSchema } from "./planSchema";
import { buildStarterPlan } from "./workoutPlan";

describe("userPlanSchema", () => {
  it("accepts every kind of starter plan", () => {
    for (const split of ["ppl", "upper-lower", "full-body", "bro", null] as const) {
      const plan = buildStarterPlan({ split, daysPerWeek: 4, goal: "bulk", experienceLevel: "beginner" }, 1);
      expect(userPlanSchema.safeParse(plan).success, String(split)).toBe(true);
    }
  });

  it("rejects malformed plans", () => {
    expect(userPlanSchema.safeParse({ id: "", name: "x", days: [] }).success).toBe(false);
    const negativeReps = {
      id: "p",
      name: "x",
      days: [
        { id: "d", name: "Day 1", exercises: [{ exerciseId: "bench", sets: [{ targetReps: -1 }], restSeconds: 90 }] },
      ],
    };
    expect(userPlanSchema.safeParse(negativeReps).success).toBe(false);
  });
});
