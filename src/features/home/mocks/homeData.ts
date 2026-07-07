import { BarChart3, Beef, Droplets, Dumbbell } from "lucide-react";
import type { DayStatus } from "@/types/training";
import { mockTodayMission } from "@/data/mission";
import { mockPhysIQScore } from "@/data/score";
import { mockProfile } from "@/data/profile";
import { mockStreak } from "@/data/streak";
import { mockLevel } from "@/data/level";
import type { FuelProgress } from "@/types/nutrition";
import type { Insight } from "@/types/insight";
import type { DailyPriority, HomeData, QuickAction } from "../types";
import { computePercent } from "@/lib/math";
import { computeCompletionPercent } from "../lib/derive";

/**
 * Fixtures for the Home feature only — not application-wide mock data.
 * Every derived field (percent, weakestPillarId, completionPercent) is
 * computed from its source values via lib/derive, so nothing here can
 * silently drift out of consistency. Figures are invented to satisfy the
 * data model, not copied from /design where the mocks conflict with it
 * (see DATA_MODELS.md's XPTransaction note on the lifetime-vs-window mismatch
 * in the shipped screenshots).
 */

// Profile, streak, score, level, and mission are shared with Train/Insights/
// Compete/Profile — single definitions in src/data/ so no two screens can
// ever show a different value for the same underlying fact.
const profile = mockProfile;
const streak = mockStreak;
const score = mockPhysIQScore;
const level = mockLevel;
const mission = mockTodayMission;

const weekdayLabels = ["M", "T", "W", "T", "F", "S", "S"];
// Mon trained, Tue missed (life happens — never punished, just reflected),
// Wed–Fri trained, Sat (today) rest-honored, Sun not yet reached. Exercises
// all four DayStatusValue states so the bar-chart styling can be verified.
const weekStatuses: DayStatus["status"][] = [
  "trained",
  "missed",
  "trained",
  "trained",
  "trained",
  "rest-honored",
  "unplanned",
];

const weekStart = new Date("2026-06-29T00:00:00Z");

const days: DayStatus[] = weekdayLabels.map((weekdayLabel, index) => {
  const date = new Date(weekStart);
  date.setUTCDate(weekStart.getUTCDate() + index);
  return {
    date: date.toISOString().slice(0, 10),
    weekdayLabel,
    status: weekStatuses[index] ?? "unplanned",
    isToday: index === 5,
  };
});

const week: HomeData["week"] = {
  completionPercent: computeCompletionPercent(days),
  days,
};

const fuel: FuelProgress[] = [
  {
    kind: "hydration",
    label: "Hydration",
    current: 1.8,
    goal: profile.hydrationGoalLiters,
    unit: "L",
    percent: computePercent(1.8, profile.hydrationGoalLiters),
  },
  {
    kind: "protein",
    label: "Protein",
    current: 118,
    goal: profile.proteinGoalGrams,
    unit: "g",
    percent: computePercent(118, profile.proteinGoalGrams),
  },
];

const insight: Insight = {
  id: "insight-hydration-gap",
  category: "nutrition",
  severity: "suggest",
  headline: "Hydration dropped this week.",
  body: "500ml before your session protects strength output — your bench trends confirm it.",
  state: "fresh",
  actionLabel: "Ask AI Coach",
  actionHref: "/insights",
};

// Today's Priorities — every figure derived from the fixtures above (fuel
// currents/goals, the mission), so the coach can never ask for an amount
// that contradicts the fuel bars rendered on the same screen.
const hydrationRemaining = profile.hydrationGoalLiters - 1.8;
const proteinRemaining = profile.proteinGoalGrams - 118;

const priorities: DailyPriority[] = [
  {
    id: "priority-mission",
    label: `Complete ${mission.title}`,
    detail: `+${mission.xpReward} XP and today's biggest score mover`,
    iconId: "dumbbell",
    completed: false,
    href: `/session/${mission.id}`,
  },
  {
    id: "priority-water",
    label: `Drink ${hydrationRemaining.toFixed(1)}L more water`,
    detail: "Water is your weakest pillar — this closes today's gap",
    iconId: "droplets",
    completed: hydrationRemaining <= 0,
    href: "/home?log=water",
  },
  {
    id: "priority-protein",
    label: `${proteinRemaining}g protein to go`,
    detail: `Hits your ${profile.proteinGoalGrams}g daily goal`,
    iconId: "beef",
    completed: proteinRemaining <= 0,
    href: "/home?log=protein",
  },
];

const quickActions: QuickAction[] = [
  { id: "log-water", label: "Log water", icon: Droplets, href: "/home?log=water" },
  { id: "log-protein", label: "Log protein", icon: Beef, href: "/home?log=protein" },
  { id: "start-workout", label: "Start workout", icon: Dumbbell, href: "/train" },
  { id: "view-insights", label: "View insights", icon: BarChart3, href: "/insights" },
];

export const mockHomeData: HomeData = {
  profile,
  streak,
  score,
  mission,
  week,
  fuel,
  insight,
  level,
  quickActions,
  priorities,
};
