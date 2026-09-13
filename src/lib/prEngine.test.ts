import { describe, it, expect } from "vitest";
import {
  calculateEpley1RM,
  derivePersonalRecords,
  deriveLatestPR,
} from "./prEngine";
import type { CompletedSessionSummary } from "@/store/sessionStore";

describe("prEngine", () => {
  describe("calculateEpley1RM", () => {
    it("returns the exact weight for a 1-rep set", () => {
      expect(calculateEpley1RM(100, 1)).toBe(100);
    });

    it("calculates estimated 1RM using Epley formula for multi-rep sets", () => {
      // 100 kg for 10 reps -> 100 * (1 + 10/30) = 133.3 kg
      expect(calculateEpley1RM(100, 10)).toBe(133.3);
      // 80 kg for 8 reps -> 80 * (1 + 8/30) = 101.3 kg
      expect(calculateEpley1RM(80, 8)).toBe(101.3);
    });

    it("handles non-positive inputs gracefully", () => {
      expect(calculateEpley1RM(0, 5)).toBe(0);
      expect(calculateEpley1RM(100, 0)).toBe(0);
    });
  });

  describe("derivePersonalRecords", () => {
    it("returns standard fallback PRs when history is empty", () => {
      const records = derivePersonalRecords([]);
      expect(records.length).toBeGreaterThan(0);
      expect(records[0]?.exerciseName).toBeDefined();
      expect(records[0]?.trend.length).toBeGreaterThan(0);
    });

    it("computes authentic PRs and trend points from session history", () => {
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Bench Day",
          date: "2026-08-01",
          completedAt: "2026-08-01T10:00:00Z",
          durationSec: 3000,
          setsCompleted: 10,
          totalVolumeKg: 2000,
          xpEarned: 100,
          topSets: [
            {
              exerciseId: "ex-bench-press",
              exerciseName: "Barbell Bench Press",
              weightKg: 80,
              reps: 8,
            },
          ],
        },
        {
          id: "s2",
          missionId: "m1",
          title: "Bench Day 2",
          date: "2026-08-15",
          completedAt: "2026-08-15T10:00:00Z",
          durationSec: 3000,
          setsCompleted: 10,
          totalVolumeKg: 2200,
          xpEarned: 100,
          topSets: [
            {
              exerciseId: "ex-bench-press",
              exerciseName: "Barbell Bench Press",
              weightKg: 85,
              reps: 8,
            },
          ],
        },
        {
          id: "s3",
          missionId: "m1",
          title: "Bench Day 3",
          date: "2026-09-01",
          completedAt: "2026-09-01T10:00:00Z",
          durationSec: 3000,
          setsCompleted: 10,
          totalVolumeKg: 2400,
          xpEarned: 100,
          topSets: [
            {
              exerciseId: "ex-bench-press",
              exerciseName: "Barbell Bench Press",
              weightKg: 90,
              reps: 6,
            },
          ],
        },
      ];

      const records = derivePersonalRecords(history, "kg");
      expect(records.length).toBe(1);

      const bench = records[0]!;
      expect(bench.exerciseName).toBe("Barbell Bench Press");
      expect(bench.value).toBe(90);
      expect(bench.delta).toBe(10); // 90 - 80
      expect(bench.trend.length).toBe(3);
      expect(bench.trend[0]!.value).toBe(80);
      expect(bench.trend[2]!.value).toBe(90);
    });
  });

  describe("deriveLatestPR", () => {
    it("returns null for empty records", () => {
      expect(deriveLatestPR([])).toBeNull();
    });

    it("prioritizes the record with the largest positive delta", () => {
      const records = [
        {
          id: "pr-1",
          exerciseName: "Squat",
          unit: "kg",
          value: 120,
          delta: 2.5,
          windowLabel: "Last 30 days",
          trend: [],
        },
        {
          id: "pr-2",
          exerciseName: "Deadlift",
          unit: "kg",
          value: 160,
          delta: 10,
          windowLabel: "Last 30 days",
          trend: [],
        },
      ];

      const latest = deriveLatestPR(records);
      expect(latest?.exerciseName).toBe("Deadlift");
    });
  });
});
