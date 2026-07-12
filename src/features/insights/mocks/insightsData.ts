import { mockPhysIQScore } from "@/data/score";
import { mockPersonalRecordBases } from "@/data/personalRecords";
import type { Insight } from "@/types/insight";
import type { PersonalRecord, PersonalRecordTrendPoint } from "@/types/personalRecord";
import type { ScoreTrendPoint, ScoreTrendRange } from "@/types/score";
import type { DayStatus } from "@/types/training";
import type { InsightsData } from "../types";

/**
 * Fixtures for the Insights feature only. The score comes from the shared
 * src/data/score.ts fixture (also shown on Home) so the two screens can
 * never disagree on the current PhysIQ Score. Trend/PR/heatmap series are
 * generated deterministically (no Math.random()) so the fixture is
 * reproducible, and every generated series' final point is pinned to the
 * value actually displayed elsewhere, so numbers never contradict each other.
 */

const today = new Date("2026-07-04T00:00:00Z");

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function generateScoreTrend(days: number, endScore: number): ScoreTrendPoint[] {
  const points: ScoreTrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - i);
    const t = days - i;
    const wave = Math.sin(t / 6) * 6 + Math.sin(t / 17) * 4;
    const drift = (t / days) * 8;
    const score = i === 0 ? endScore : Math.round(clamp(endScore - 8 + wave + drift, 55, 96));
    points.push({ date: date.toISOString().slice(0, 10), score });
  }
  return points;
}

function generatePRTrend(
  days: number,
  endValue: number,
  delta: number,
): PersonalRecordTrendPoint[] {
  const startValue = endValue - delta;
  const points: PersonalRecordTrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - i);
    const progress = (days - i) / days;
    const dip = Math.sin(progress * Math.PI) * -2.5;
    const value =
      i === 0
        ? endValue
        : Math.round((startValue + (endValue - startValue) * progress + dip) * 2) / 2;
    points.push({ date: date.toISOString().slice(0, 10), value });
  }
  return points;
}

function mostRecentMonday(date: Date): Date {
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return monday;
}

const weekdayLabels = ["M", "T", "W", "T", "F", "S", "S"];
const heatmapCyclePattern: DayStatus["status"][] = [
  "trained",
  "trained",
  "missed",
  "trained",
  "rest-honored",
  "trained",
  "rest-honored",
];

function generateStreakWeeks(weekCount: number): DayStatus[][] {
  const currentWeekMonday = mostRecentMonday(today);
  const firstWeekMonday = new Date(currentWeekMonday);
  firstWeekMonday.setUTCDate(currentWeekMonday.getUTCDate() - (weekCount - 1) * 7);
  const todayKey = today.toISOString().slice(0, 10);

  const weeks: DayStatus[][] = [];
  for (let week = 0; week < weekCount; week++) {
    const days: DayStatus[] = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(firstWeekMonday);
      date.setUTCDate(firstWeekMonday.getUTCDate() + week * 7 + day);
      const dateKey = date.toISOString().slice(0, 10);
      const isFuture = date.getTime() > today.getTime();
      const patternIndex = (week * 3 + day) % heatmapCyclePattern.length;

      days.push({
        date: dateKey,
        weekdayLabel: weekdayLabels[day]!,
        status: isFuture ? "unplanned" : heatmapCyclePattern[patternIndex]!,
        isToday: dateKey === todayKey,
      });
    }
    weeks.push(days);
  }
  return weeks;
}

const trends: Record<ScoreTrendRange, ScoreTrendPoint[]> = {
  "7d": generateScoreTrend(7, mockPhysIQScore.score),
  "30d": generateScoreTrend(30, mockPhysIQScore.score),
  "90d": generateScoreTrend(90, mockPhysIQScore.score),
  "1y": generateScoreTrend(365, mockPhysIQScore.score),
};

const insights: Insight[] = [
  {
    id: "insight-peaking",
    category: "training",
    severity: "celebrate",
    headline: "You're peaking",
    body: "Volume up 14% and RPE steady. Add one heavy top set on bench tomorrow.",
    state: "fresh",
  },
  {
    id: "insight-cardio-gap",
    category: "training",
    severity: "suggest",
    headline: "Cardio gap",
    body: "Cardio is your weakest pillar at 75%. Two zone-2 sessions this week would move it most.",
    state: "fresh",
  },
];

// Base values come from the shared fixture (also feeds Home's achievement
// spotlight); only the trend series is built here, since only Insights
// renders it.
const personalRecords: PersonalRecord[] = mockPersonalRecordBases.map((base) => ({
  ...base,
  trend: generatePRTrend(30, base.value, base.delta),
}));

export const mockInsightsData: InsightsData = {
  score: mockPhysIQScore,
  trends,
  insights,
  personalRecords,
  streakWeeks: generateStreakWeeks(12),
};
