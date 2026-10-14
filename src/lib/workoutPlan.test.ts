import { describe, expect, it } from "vitest";
import { mockExercises } from "@/data/exercises";
import { programLibrary } from "@/data/programs";
import { makeSession } from "@/test/fixtures";
import type { UserPlan } from "@/types/plan";
import {
  buildStarterPlan,
  closestVariant,
  estimateDayMinutes,
  missionFromPlanDay,
  planDayMissionId,
  resolveTodaysWorkout,
} from "./workoutPlan";

const plan: UserPlan = {
  id: "p1",
  name: "PPL",
  days: [
    {
      id: "push",
      name: "Push",
      exercises: [
        { exerciseId: "ex-bench-press", sets: [{ targetReps: 5 }, { targetReps: 5 }], restSeconds: 120 },
      ],
    },
    {
      id: "pull",
      name: "Pull",
      exercises: [{ exerciseId: "ex-deadlift", sets: [{ targetReps: 5 }], restSeconds: 180 }],
    },
    {
      id: "legs",
      name: "Legs",
      exercises: [{ exerciseId: "ex-back-squat", sets: [{ targetReps: 8 }], restSeconds: 150 }],
    },
  ],
};

const doneOn = (dayId: string, date: string, hour = "10") =>
  makeSession(date, {
    id: `${dayId}-${date}`,
    missionId: `plan-p1-${dayId}`,
    completedAt: `${date}T${hour}:00:00.000Z`,
  });

describe("resolveTodaysWorkout", () => {
  it("starts at day one with no history", () => {
    const today = resolveTodaysWorkout(plan, [], "2026-10-14")!;
    expect(today.day.id).toBe("push");
    expect(today.status).toBe("ready");
    expect(today.missionId).toBe(planDayMissionId(plan, plan.days[0]!));
  });

  it("rotates to the day after the last one trained, regardless of gaps", () => {
    const today = resolveTodaysWorkout(plan, [doneOn("push", "2026-10-10")], "2026-10-14")!;
    expect(today.day.id).toBe("pull");
  });

  it("wraps around after the last day", () => {
    const today = resolveTodaysWorkout(
      plan,
      [doneOn("pull", "2026-10-11"), doneOn("legs", "2026-10-12")],
      "2026-10-14",
    )!;
    expect(today.day.id).toBe("push");
  });

  it("reports today's workout as done, with what's next", () => {
    const today = resolveTodaysWorkout(plan, [doneOn("push", "2026-10-14")], "2026-10-14")!;
    expect(today.status).toBe("done");
    expect(today.day.id).toBe("push");
    expect(today.nextDay.id).toBe("pull");
    expect(today.completedToday?.missionId).toBe("plan-p1-push");
  });

  it("ignores sessions from other plans and returns null without a plan", () => {
    const other = makeSession("2026-10-13", { missionId: "plan-other-x" });
    expect(resolveTodaysWorkout(plan, [other], "2026-10-14")!.day.id).toBe("push");
    expect(resolveTodaysWorkout(null, [], "2026-10-14")).toBeNull();
  });
});

describe("missionFromPlanDay", () => {
  it("summarizes the day for the mission card", () => {
    const mission = missionFromPlanDay(plan, plan.days[0]!, mockExercises, "pending");
    expect(mission.title).toBe("Push");
    expect(mission.muscleGroups[0]).toBe("Chest");
    expect(mission.intensity).toBe("high");
    expect(mission.liftCount).toBe(1);
    expect(mission.aiProgrammed).toBe(false);
    expect(mission.durationMinutes).toBe(estimateDayMinutes(plan.days[0]!));
  });
});

describe("buildStarterPlan", () => {
  it("adopts the chosen split at the closest frequency", () => {
    const ppl = programLibrary.find((program) => program.type === "ppl")!;
    const starter = buildStarterPlan(
      { split: "ppl", daysPerWeek: 5, goal: "bulk", experienceLevel: "intermediate" },
      1,
    );
    expect(starter.days).toHaveLength(closestVariant(ppl, 5).days.length);
    expect(starter.id).toBe("plan-ppl-1");
  });

  it("builds the PhysIQ Split for the athlete's goal and level", () => {
    const starter = buildStarterPlan(
      { split: "ai", daysPerWeek: 4, goal: "cut", experienceLevel: "beginner" },
      2,
    );
    expect(starter.days).toHaveLength(4);
    expect(starter.name).toContain("PhysIQ Split");
  });
});
