import { describe, expect, it } from "vitest";
import type { CardioActivity } from "@/types/cardio";
import type { CompletedSessionSummary } from "@/types/workoutSession";
import {
  computeStreak,
  daysSinceLastActive,
  deriveCurrentWeek,
  deriveDayStatuses,
  generateHeatmapWeeks,
  type CalendarInput,
} from "./streakEngine";

// 2026-10-12 is a Monday.
const MON = "2026-10-12";

function session(date: string, setsCompleted = 10): CompletedSessionSummary {
  return {
    id: `s-${date}`,
    missionId: "m",
    title: "Workout",
    date,
    completedAt: `${date}T10:00:00.000Z`,
    durationSec: 3600,
    setsCompleted,
    totalVolumeKg: 5000,
    xpEarned: 300,
    topSets: [],
    status: "completed",
  };
}

function cardio(date: string, durationMin: number): CardioActivity {
  return {
    id: `c-${date}`,
    source: "gpx",
    type: "run",
    startedAt: `${date}T07:00:00.000Z`,
    date,
    durationMin,
    importedAt: `${date}T08:00:00.000Z`,
  };
}

function input(overrides: Partial<CalendarInput>): CalendarInput {
  return { sessions: [], cardio: [], trainingDaysPerWeek: 4, todayIso: MON, ...overrides };
}

describe("deriveDayStatuses", () => {
  it("spends the weekly rest allowance before calling a day missed", () => {
    // 6 days/week → 1 rest day. Trained Mon only; today is Fri.
    const days = deriveDayStatuses(
      input({ sessions: [session(MON)], trainingDaysPerWeek: 6, todayIso: "2026-10-16" }),
      MON,
      "2026-10-18",
    );
    expect(days.map((day) => day.status)).toEqual([
      "trained", // Mon
      "rest-honored", // Tue — the week's one rest day
      "missed", // Wed
      "missed", // Thu
      "unplanned", // Fri — today, still open
      "unplanned", // Sat — future
      "unplanned", // Sun — future
    ]);
    expect(days[4]!.isToday).toBe(true);
  });

  it("never marks days before the first workout as missed", () => {
    const days = deriveDayStatuses(
      input({ sessions: [session("2026-10-14")], todayIso: "2026-10-15" }),
      MON,
      "2026-10-15",
    );
    expect(days.slice(0, 2).every((day) => day.status === "unplanned")).toBe(true);
  });

  it("counts real cardio bouts as training days, but not short strolls", () => {
    const days = deriveDayStatuses(
      input({ cardio: [cardio(MON, 30), cardio("2026-10-13", 10)], todayIso: "2026-10-14" }),
      MON,
      "2026-10-13",
    );
    expect(days[0]!.status).toBe("trained");
    expect(days[1]!.status).not.toBe("trained");
  });

  it("starts the allowance walk at Monday when the range starts mid-week", () => {
    // 6 days/week. Mon trained, Tue (rest) consumes the allowance, so a range
    // starting Wed must still see Wed as missed.
    const days = deriveDayStatuses(
      input({ sessions: [session(MON)], trainingDaysPerWeek: 6, todayIso: "2026-10-16" }),
      "2026-10-14",
      "2026-10-14",
    );
    expect(days).toHaveLength(1);
    expect(days[0]!.status).toBe("missed");
  });
});

describe("computeStreak", () => {
  it("is zero with no training", () => {
    expect(computeStreak(input({}))).toEqual({
      currentStreakDays: 0,
      longestStreakDays: 0,
      trainedToday: false,
    });
  });

  it("keeps the streak alive across planned rest days", () => {
    // 4 days/week → 3 rest days. Train Mon, Wed, Fri, Sat; today is next Mon.
    const result = computeStreak(
      input({
        sessions: [
          session(MON),
          session("2026-10-14"),
          session("2026-10-16"),
          session("2026-10-17"),
        ],
        todayIso: "2026-10-19",
      }),
    );
    // Mon..Sun all trained or rest-honored = 7; today (Mon) still open.
    expect(result.currentStreakDays).toBe(7);
    expect(result.trainedToday).toBe(false);
  });

  it("breaks once the rest allowance is exhausted", () => {
    // 6 days/week: Mon trained, Tue rest, Wed missed. Today Thu.
    const result = computeStreak(
      input({ sessions: [session(MON)], trainingDaysPerWeek: 6, todayIso: "2026-10-15" }),
    );
    expect(result.currentStreakDays).toBe(0);
    expect(result.longestStreakDays).toBe(2);
  });

  it("counts today once it is trained", () => {
    const result = computeStreak(
      input({ sessions: [session(MON), session("2026-10-13")], todayIso: "2026-10-13" }),
    );
    expect(result.currentStreakDays).toBe(2);
    expect(result.trainedToday).toBe(true);
  });

  it("ignores sessions with no completed sets", () => {
    const result = computeStreak(input({ sessions: [session(MON, 0)], todayIso: "2026-10-13" }));
    expect(result.currentStreakDays).toBe(0);
  });
});

describe("deriveCurrentWeek", () => {
  it("returns Mon–Sun with completion vs target", () => {
    const week = deriveCurrentWeek(
      input({ sessions: [session(MON), session("2026-10-13")], todayIso: "2026-10-15" }),
    );
    expect(week.days).toHaveLength(7);
    expect(week.days[0]!.date).toBe(MON);
    expect(week.completionPercent).toBe(50);
    expect(week.days.find((day) => day.isToday)?.date).toBe("2026-10-15");
  });
});

describe("generateHeatmapWeeks", () => {
  it("returns full weeks ending with the current one", () => {
    const weeks = generateHeatmapWeeks(input({ sessions: [session(MON)], todayIso: "2026-10-15" }));
    expect(weeks).toHaveLength(12);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks.at(-1)![0]!.date).toBe(MON);
    expect(weeks.at(-1)![0]!.status).toBe("trained");
  });
});

describe("daysSinceLastActive", () => {
  it("measures the gap to the latest training day", () => {
    expect(daysSinceLastActive([session(MON)], [], "2026-10-19")).toBe(7);
    expect(daysSinceLastActive([], [], MON)).toBeNull();
  });
});
