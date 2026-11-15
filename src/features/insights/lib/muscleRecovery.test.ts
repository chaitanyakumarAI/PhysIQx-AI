import { describe, expect, it } from "vitest";
import type { Exercise } from "@/types/exercise";
import type { CompletedSessionSummary } from "@/types/workoutSession";
import { deriveMuscleRecovery } from "./muscleRecovery";

const TODAY = "2026-11-15";

function exercise(id: string, muscleHit: Exercise["muscleHit"]): Exercise {
  return {
    id,
    name: id,
    muscleHit,
    muscleGroups: Object.keys(muscleHit) as Exercise["muscleGroups"],
    equipment: "barbell",
    type: "compound",
    difficulty: "beginner",
  };
}

const CATALOG: Exercise[] = [
  exercise("bench", { chest: 60, shoulders: 25, arms: 15 }),
  exercise("squat", { legs: 70, core: 20 }), // core share below the 25 threshold
  exercise("row", { back: 65, arms: 25 }),
];

function session(date: string, exerciseIds: string[], setsCompleted = 10): CompletedSessionSummary {
  return {
    id: `s-${date}-${exerciseIds.join("-")}`,
    missionId: "m1",
    title: "Workout",
    date,
    completedAt: `${date}T18:00:00.000Z`,
    durationSec: 3600,
    setsCompleted,
    totalVolumeKg: 5000,
    xpEarned: 200,
    topSets: exerciseIds.map((exerciseId) => ({
      exerciseId,
      exerciseName: exerciseId,
      weightKg: 60,
      reps: 8,
    })),
  };
}

const byGroup = (entries: ReturnType<typeof deriveMuscleRecovery>) =>
  Object.fromEntries(entries.map((entry) => [entry.group, entry]));

describe("deriveMuscleRecovery", () => {
  it("reports every group untrained before any session", () => {
    const entries = deriveMuscleRecovery([], CATALOG, TODAY);
    expect(entries).toHaveLength(6);
    for (const entry of entries) {
      expect(entry.status).toBe("untrained");
      expect(entry.percent).toBeNull();
      expect(entry.daysSince).toBeNull();
    }
  });

  it("maps days since training onto the status ladder", () => {
    const entries = byGroup(
      deriveMuscleRecovery(
        [
          session(TODAY, ["bench"]), // chest + shoulders today
          session("2026-11-14", ["squat"]), // legs 1 day ago
          session("2026-11-13", ["row"]), // back + arms 2 days ago
        ],
        CATALOG,
        TODAY,
      ),
    );
    expect(entries.chest).toMatchObject({ status: "worked", daysSince: 0, percent: 25 });
    expect(entries.shoulders!.status).toBe("worked");
    expect(entries.legs).toMatchObject({ status: "recovering", daysSince: 1, percent: 55 });
    expect(entries.back).toMatchObject({ status: "nearly", daysSince: 2, percent: 85 });
    expect(entries.arms!.status).toBe("nearly");
  });

  it("marks a muscle ready after three or more days", () => {
    const entries = byGroup(
      deriveMuscleRecovery([session("2026-11-10", ["bench"])], CATALOG, TODAY),
    );
    expect(entries.chest).toMatchObject({ status: "ready", daysSince: 5, percent: 100 });
  });

  it("ignores stimulus shares below the threshold", () => {
    const entries = byGroup(deriveMuscleRecovery([session(TODAY, ["squat"])], CATALOG, TODAY));
    expect(entries.legs!.status).toBe("worked");
    expect(entries.core!.status).toBe("untrained"); // squat's 20% core share doesn't count
    expect(entries.arms!.status).toBe("untrained"); // bench's 15% arms share never involved
  });

  it("uses the most recent training day per muscle", () => {
    const entries = byGroup(
      deriveMuscleRecovery(
        [session("2026-11-01", ["bench"]), session("2026-11-14", ["bench"])],
        CATALOG,
        TODAY,
      ),
    );
    expect(entries.chest!.lastTrainedIso).toBe("2026-11-14");
    expect(entries.chest!.daysSince).toBe(1);
  });

  it("skips empty sessions and future-dated rows", () => {
    const entries = byGroup(
      deriveMuscleRecovery(
        [session("2026-11-14", ["bench"], 0), session("2026-11-20", ["row"])],
        CATALOG,
        TODAY,
      ),
    );
    expect(entries.chest!.status).toBe("untrained");
    expect(entries.back!.status).toBe("untrained");
  });
});
