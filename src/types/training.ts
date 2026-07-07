/**
 * Training-side view models — docs/DATA_MODELS.md "Mission", "DayStatus
 * (derived series)", "Streak".
 */

export type ProgramType = "ai" | "ppl" | "upper-lower" | "bro" | "full-body";

/** Shared display labels — used by Train's program chips and Profile's SPLIT stat. */
export const programTypeLabels: Record<ProgramType, string> = {
  ai: "AI",
  ppl: "PPL",
  "upper-lower": "Upper/Lower",
  bro: "Bro",
  "full-body": "Full Body",
};

/**
 * Program — docs/DATA_MODELS.md "Program". Minimal view-model: the schedule
 * pattern and WorkoutTemplate list arrive with the planner phase; modeling
 * them now would be speculation the Train screen doesn't need.
 */
export interface Program {
  id: string;
  name: string;
  type: ProgramType;
  source: "preset" | "ai";
}

export type MissionState = "pending" | "started" | "completed" | "rest-day";

export type MissionIntensity = "low" | "moderate" | "high";

/** Shared display labels — used by both Home's and Train's mission cards. */
export const missionIntensityLabels: Record<MissionIntensity, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

export interface Mission {
  id: string;
  title: string;
  muscleGroups: string[];
  durationMinutes: number;
  liftCount: number;
  intensity: MissionIntensity;
  xpReward: number;
  aiProgrammed: boolean;
  state: MissionState;
}

export type DayStatusValue = "trained" | "rest-honored" | "missed" | "unplanned";

/**
 * Shared color meaning for a day's status — used by Home's WeeklyActivityCard
 * bars AND Insights' streak heatmap cells, so "what does this color mean" is
 * defined exactly once. Tailwind class fragments (not raw hex): stays on the
 * design system's tokens.
 */
/** Human-readable status names — the heatmap legend and day-detail panel
 *  both read these, so "what does this color mean" has one answer. */
export const dayStatusLabels: Record<DayStatusValue, string> = {
  trained: "Trained",
  "rest-honored": "Rest honored",
  missed: "Missed",
  unplanned: "No plan",
};

export const dayStatusTone: Record<DayStatusValue, string> = {
  trained: "bg-brand",
  "rest-honored": "bg-foreground/15",
  // Quiet, not punitive: at /40 the red rendered as heavy dried-blood
  // blocks across the heatmap and weekly bars — visually loud and against
  // the product philosophy (missed days are reflected, never punished).
  missed: "bg-danger/25",
  unplanned: "bg-foreground/10",
};

export interface DayStatus {
  /** ISO date (yyyy-mm-dd). */
  date: string;
  /** Single-letter weekday label for the bar chart ("M", "T", …). */
  weekdayLabel: string;
  status: DayStatusValue;
  isToday?: boolean;
}

/**
 * Scoped to what the Home "This Week" card needs. DATA_MODELS' full
 * WeeklySummary aggregate (volume, fuel adherence, XP, score delta) belongs
 * to Analytics/Insights and extends this shape later — not built here.
 */
export interface WeeklySummary {
  /** Derived — always computed from `days`, never hand-authored. */
  completionPercent: number;
  days: DayStatus[];
}

export interface StreakSummary {
  currentStreakDays: number;
  longestStreakDays: number;
}
