import { describe, expect, it } from "vitest";
import {
  computeOverloadSuggestion,
  getEquipmentIncrement,
  roundToPlateIncrement,
} from "./progression";
import type { CompletedSessionSummary } from "@/store/sessionStore";

describe("progression engine", () => {
  describe("getEquipmentIncrement", () => {
    it("returns 2.5 kg for barbell", () => {
      expect(getEquipmentIncrement("barbell")).toBe(2.5);
    });

    it("returns 1.0 kg for dumbbell", () => {
      expect(getEquipmentIncrement("dumbbell")).toBe(1.0);
    });

    it("returns 0 kg for bodyweight", () => {
      expect(getEquipmentIncrement("bodyweight")).toBe(0.0);
    });

    it("returns 2.5 kg default for unrecognized equipment", () => {
      expect(getEquipmentIncrement(undefined)).toBe(2.5);
    });
  });

  describe("roundToPlateIncrement", () => {
    it("rounds to nearest standard step", () => {
      expect(roundToPlateIncrement(62.3, 2.5)).toBe(62.5);
      expect(roundToPlateIncrement(63.8, 2.5)).toBe(65.0);
      expect(roundToPlateIncrement(21.4, 0.5)).toBe(21.5);
    });
  });

  describe("computeOverloadSuggestion", () => {
    it("returns null for empty session history", () => {
      const suggestion = computeOverloadSuggestion({
        exerciseId: "bench-press",
        history: [],
        targetReps: 8,
        equipment: "barbell",
      });
      expect(suggestion).toBeNull();
    });

    it("returns null when exercise has never been logged in history", () => {
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Leg Day",
          date: "2026-07-01",
          completedAt: "2026-07-01T10:00:00Z",
          durationSec: 3600,
          setsCompleted: 4,
          totalVolumeKg: 4000,
          xpEarned: 150,
          topSets: [{ exerciseId: "squat", exerciseName: "Squat", weightKg: 100, reps: 5 }],
        },
      ];

      const suggestion = computeOverloadSuggestion({
        exerciseId: "bench-press",
        history,
        targetReps: 8,
      });
      expect(suggestion).toBeNull();
    });

    it("steps weight up by 2.5 kg on barbell when target reps are hit", () => {
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Chest Day",
          date: "2026-07-01",
          completedAt: "2026-07-01T10:00:00Z",
          durationSec: 3600,
          setsCompleted: 4,
          totalVolumeKg: 2000,
          xpEarned: 150,
          topSets: [{ exerciseId: "bench-press", exerciseName: "Bench Press", weightKg: 80, reps: 8 }],
        },
      ];

      const suggestion = computeOverloadSuggestion({
        exerciseId: "bench-press",
        history,
        targetReps: 8,
        equipment: "barbell",
      });

      expect(suggestion).not.toBeNull();
      expect(suggestion?.weightKg).toBe(82.5);
      expect(suggestion?.reps).toBe(8);
      expect(suggestion?.reason).toBe("reps_met_weight_step");
    });

    it("maintains weight when target reps are missed", () => {
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Chest Day",
          date: "2026-07-01",
          completedAt: "2026-07-01T10:00:00Z",
          durationSec: 3600,
          setsCompleted: 4,
          totalVolumeKg: 2000,
          xpEarned: 150,
          topSets: [{ exerciseId: "bench-press", exerciseName: "Bench Press", weightKg: 80, reps: 6 }],
        },
      ];

      const suggestion = computeOverloadSuggestion({
        exerciseId: "bench-press",
        history,
        targetReps: 8,
        equipment: "barbell",
      });

      expect(suggestion).not.toBeNull();
      expect(suggestion?.weightKg).toBe(80);
      expect(suggestion?.reps).toBe(7); // Suggests pushing for +1 rep toward target
      expect(suggestion?.reason).toBe("reps_missed_maintain_weight");
    });

    it("steps weight up by 1.0 kg for dumbbell movements", () => {
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Shoulder Day",
          date: "2026-07-01",
          completedAt: "2026-07-01T10:00:00Z",
          durationSec: 3600,
          setsCompleted: 4,
          totalVolumeKg: 1000,
          xpEarned: 120,
          topSets: [{ exerciseId: "db-lateral-raise", exerciseName: "DB Lateral Raise", weightKg: 12, reps: 12 }],
        },
      ];

      const suggestion = computeOverloadSuggestion({
        exerciseId: "db-lateral-raise",
        history,
        targetReps: 12,
        equipment: "dumbbell",
      });

      expect(suggestion).not.toBeNull();
      expect(suggestion?.weightKg).toBe(13);
      expect(suggestion?.reps).toBe(12);
      expect(suggestion?.reason).toBe("reps_met_weight_step");
    });

    it("progresses repetitions for bodyweight exercises without adding weight", () => {
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Calisthenics",
          date: "2026-07-01",
          completedAt: "2026-07-01T10:00:00Z",
          durationSec: 2400,
          setsCompleted: 3,
          totalVolumeKg: 0,
          xpEarned: 100,
          topSets: [{ exerciseId: "pull-up", exerciseName: "Pull-Up", weightKg: 0, reps: 10 }],
        },
      ];

      const suggestion = computeOverloadSuggestion({
        exerciseId: "pull-up",
        history,
        targetReps: 10,
        equipment: "bodyweight",
      });

      expect(suggestion).not.toBeNull();
      expect(suggestion?.weightKg).toBe(0);
      expect(suggestion?.reps).toBe(11);
      expect(suggestion?.reason).toBe("bodyweight_reps_step");
    });

    it("accelerates weight step when RPE is very low (<= 6.5)", () => {
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Squat Day",
          date: "2026-07-01",
          completedAt: "2026-07-01T10:00:00Z",
          durationSec: 3600,
          setsCompleted: 3,
          totalVolumeKg: 3000,
          xpEarned: 150,
          topSets: [
            {
              exerciseId: "squat",
              exerciseName: "Squat",
              weightKg: 100,
              reps: 5,
              // @ts-expect-error extra property test
              rpe: 6.0,
            },
          ],
        },
      ];

      const suggestion = computeOverloadSuggestion({
        exerciseId: "squat",
        history,
        targetReps: 5,
        equipment: "barbell",
        enableRpeAutoRegulation: true,
      });

      expect(suggestion).not.toBeNull();
      expect(suggestion?.weightKg).toBe(105); // Accelerated +5 kg jump instead of +2.5 kg
      expect(suggestion?.reason).toBe("rpe_accelerated_step");
    });

    it("holds weight when RPE indicates maximal exertion (>= 9.5)", () => {
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Deadlift Day",
          date: "2026-07-01",
          completedAt: "2026-07-01T10:00:00Z",
          durationSec: 3600,
          setsCompleted: 3,
          totalVolumeKg: 3500,
          xpEarned: 160,
          topSets: [
            {
              exerciseId: "deadlift",
              exerciseName: "Deadlift",
              weightKg: 140,
              reps: 5,
              // @ts-expect-error extra property test
              rpe: 10.0,
            },
          ],
        },
      ];

      const suggestion = computeOverloadSuggestion({
        exerciseId: "deadlift",
        history,
        targetReps: 5,
        equipment: "barbell",
        enableRpeAutoRegulation: true,
      });

      expect(suggestion).not.toBeNull();
      expect(suggestion?.weightKg).toBe(140);
      expect(suggestion?.reason).toBe("rpe_fatigue_hold");
    });

    it("walks history newest-first and selects the latest performance", () => {
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Session 1",
          date: "2026-06-25",
          completedAt: "2026-06-25T10:00:00Z",
          durationSec: 3000,
          setsCompleted: 3,
          totalVolumeKg: 1500,
          xpEarned: 100,
          topSets: [{ exerciseId: "overhead-press", exerciseName: "OHP", weightKg: 40, reps: 10 }],
        },
        {
          id: "s2",
          missionId: "m2",
          title: "Session 2",
          date: "2026-07-02",
          completedAt: "2026-07-02T10:00:00Z",
          durationSec: 3000,
          setsCompleted: 3,
          totalVolumeKg: 1600,
          xpEarned: 110,
          topSets: [{ exerciseId: "overhead-press", exerciseName: "OHP", weightKg: 42.5, reps: 10 }],
        },
      ];

      const suggestion = computeOverloadSuggestion({
        exerciseId: "overhead-press",
        history,
        targetReps: 10,
        equipment: "barbell",
      });

      expect(suggestion?.weightKg).toBe(45); // Advanced from 42.5 kg, not 40 kg
      expect(suggestion?.reason).toBe("reps_met_weight_step");
    });
  });
});
