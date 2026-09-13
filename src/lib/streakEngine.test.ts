import { describe, it, expect } from "vitest";
import {
  deriveDayStatusSeries,
  computeStreakSummary,
  generateHeatmapWeeks,
  localIso,
  getWeekMonday,
} from "./streakEngine";
import type { CompletedSessionSummary } from "@/store/sessionStore";
import type { CardioSession } from "@/store/cardioStore";

describe("streakEngine", () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function offsetIso(daysAgo: number): string {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return localIso(d);
  }

  describe("deriveDayStatusSeries", () => {
    it("marks dates with completed workouts as trained", () => {
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Push",
          date: offsetIso(1),
          completedAt: new Date().toISOString(),
          durationSec: 3600,
          setsCompleted: 12,
          totalVolumeKg: 3000,
          xpEarned: 150,
          topSets: [],
        },
      ];

      const series = deriveDayStatusSeries({
        history,
        startDate: offsetIso(3),
        endDate: offsetIso(0),
      });

      const trainedDay = series.find((d) => d.date === offsetIso(1));
      expect(trainedDay?.status).toBe("trained");
    });

    it("marks dates with cardio sessions as trained", () => {
      const cardio: CardioSession[] = [
        {
          id: "c1",
          activity: "run",
          minutes: 30,
          date: offsetIso(2),
        },
      ];

      const series = deriveDayStatusSeries({
        history: [],
        cardio,
        startDate: offsetIso(3),
        endDate: offsetIso(0),
      });

      const cardioDay = series.find((d) => d.date === offsetIso(2));
      expect(cardioDay?.status).toBe("trained");
    });

    it("does not mark today as missed even if no workout is logged yet", () => {
      const series = deriveDayStatusSeries({
        history: [],
        startDate: offsetIso(2),
        endDate: localIso(today),
      });

      const todayEntry = series.find((d) => d.date === localIso(today));
      expect(todayEntry?.isToday).toBe(true);
      expect(todayEntry?.status).toBe("unplanned");
    });
  });

  describe("computeStreakSummary", () => {
    it("returns zero streak for empty history", () => {
      const summary = computeStreakSummary([]);
      expect(summary.currentStreakDays).toBe(0);
      expect(summary.activeStreak).toBe(false);
    });

    it("counts consecutive trained days ending today or yesterday", () => {
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Workout 1",
          date: offsetIso(1),
          completedAt: new Date().toISOString(),
          durationSec: 3000,
          setsCompleted: 10,
          totalVolumeKg: 2500,
          xpEarned: 100,
          topSets: [],
        },
        {
          id: "s2",
          missionId: "m2",
          title: "Workout 2",
          date: offsetIso(2),
          completedAt: new Date().toISOString(),
          durationSec: 3000,
          setsCompleted: 10,
          totalVolumeKg: 2500,
          xpEarned: 100,
          topSets: [],
        },
      ];

      const summary = computeStreakSummary(history, [], 4);
      expect(summary.currentStreakDays).toBeGreaterThanOrEqual(2);
      expect(summary.activeStreak).toBe(true);
    });

    it("calculates weekly completion percent", () => {
      const monday = getWeekMonday(today);
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Monday Lift",
          date: localIso(monday),
          completedAt: new Date().toISOString(),
          durationSec: 3000,
          setsCompleted: 10,
          totalVolumeKg: 2500,
          xpEarned: 100,
          topSets: [],
        },
      ];

      const summary = computeStreakSummary(history, [], 4);
      // 1 day out of 4 target days = 25%
      expect(summary.completionPercent).toBe(25);
    });
  });

  describe("generateHeatmapWeeks", () => {
    it("generates exactly 12 weeks of 7 days each", () => {
      const weeks = generateHeatmapWeeks([], [], 12);
      expect(weeks.length).toBe(12);
      weeks.forEach((week) => {
        expect(week.length).toBe(7);
        week.forEach((day) => {
          expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(["M", "T", "W", "T", "F", "S", "S"]).toContain(day.weekdayLabel);
        });
      });
    });

    it("places completed sessions into the correct heatmap cells", () => {
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Bench Session",
          date: offsetIso(5),
          completedAt: new Date().toISOString(),
          durationSec: 3000,
          setsCompleted: 10,
          totalVolumeKg: 2500,
          xpEarned: 100,
          topSets: [],
        },
      ];

      const weeks = generateHeatmapWeeks(history, [], 12);
      const allDays = weeks.flat();
      const targetDay = allDays.find((d) => d.date === offsetIso(5));

      expect(targetDay).toBeDefined();
      expect(targetDay?.status).toBe("trained");
    });
  });
});
