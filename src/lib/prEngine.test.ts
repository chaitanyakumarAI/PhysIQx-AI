import { describe, it, expect } from "vitest";
import { makeSession, top } from "@/test/fixtures";
import {
  bestE1rmByExercise,
  buildLiftHistories,
  calculateEpley1RM,
  derivePersonalRecords,
  detectRecentPRs,
  findStalledLifts,
} from "./prEngine";

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

    it("caps reps at 10 so high-rep sets don't inflate the estimate", () => {
      expect(calculateEpley1RM(100, 500)).toBe(calculateEpley1RM(100, 10));
    });
  });


  const bench = (date: string, weightKg: number, reps = 8) =>
    makeSession(date, { topSets: [top("ex-bench-press", weightKg, reps, "Bench Press")] });

  describe("buildLiftHistories", () => {
    it("keeps one point per day — that day's best", () => {
      const sameDay = makeSession("2026-08-01", {
        id: "pm",
        completedAt: "2026-08-01T18:00:00.000Z",
        topSets: [top("ex-bench-press", 95, 3)],
      });
      const [history] = buildLiftHistories([bench("2026-08-01", 80), sameDay]);
      expect(history!.points).toHaveLength(1);
      expect(history!.points[0]!.e1rm).toBe(calculateEpley1RM(95, 3));
    });
  });

  describe("derivePersonalRecords", () => {
    it("returns nothing without a ledger (no fabricated records)", () => {
      expect(derivePersonalRecords([], "2026-09-01")).toEqual([]);
    });

    it("tracks the best e1RM, its 30-day change, and each new best", () => {
      const records = derivePersonalRecords(
        [bench("2026-07-01", 80), bench("2026-08-15", 85), bench("2026-09-01", 90, 6)],
        "2026-09-02",
      );
      expect(records).toHaveLength(1);
      const record = records[0]!;
      expect(record.value).toBe(calculateEpley1RM(90, 6));
      expect(record.delta).toBe(
        Math.round((calculateEpley1RM(90, 6) - calculateEpley1RM(80, 8)) * 10) / 10,
      );
      expect(record.trend.map((point) => point.date)).toEqual([
        "2026-07-01",
        "2026-08-15",
        "2026-09-01",
      ]);
    });
  });

  describe("detectRecentPRs", () => {
    it("reports new bests since a date, but not first-ever logs", () => {
      const sessions = [bench("2026-09-01", 80), bench("2026-09-10", 85), bench("2026-09-12", 82.5)];
      const prs = detectRecentPRs(sessions, "2026-09-05");
      expect(prs).toHaveLength(1);
      expect(prs[0]).toMatchObject({ date: "2026-09-10", weightKg: 85 });
      expect(detectRecentPRs([bench("2026-09-10", 100)], "2026-09-01")).toEqual([]);
    });
  });

  describe("findStalledLifts", () => {
    it("flags a regularly trained lift with no new best in 3+ weeks", () => {
      const sessions = [
        bench("2026-08-20", 90),
        bench("2026-09-01", 87.5),
        bench("2026-09-08", 90),
        bench("2026-09-15", 87.5),
      ];
      const [stalled] = findStalledLifts(sessions, "2026-09-16");
      expect(stalled).toMatchObject({ exerciseId: "ex-bench-press", weeksStalled: 3 });
    });

    it("ignores progressing lifts and lifts without recent evidence", () => {
      const progressing = [bench("2026-08-20", 80), bench("2026-09-08", 82.5), bench("2026-09-15", 85)];
      expect(findStalledLifts(progressing, "2026-09-16")).toEqual([]);
      expect(findStalledLifts([bench("2026-08-20", 90), bench("2026-09-15", 85)], "2026-09-16")).toEqual(
        [],
      );
    });
  });

  describe("bestE1rmByExercise", () => {
    it("respects the since-date window", () => {
      const sessions = [bench("2026-01-01", 120), bench("2026-09-01", 80)];
      expect(bestE1rmByExercise(sessions).get("ex-bench-press")).toBe(calculateEpley1RM(120, 8));
      expect(bestE1rmByExercise(sessions, "2026-06-01").get("ex-bench-press")).toBe(
        calculateEpley1RM(80, 8),
      );
    });
  });
});
