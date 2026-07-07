/**
 * Frequent-win milestones — streak psychology. People need wins early and
 * often, not only at day 100: the first workout matters more to retention
 * than the hundredth. Definitions are data so the celebration surface
 * (AchievementSpotlight) and any future notification system read one list.
 *
 * "First deload" is deliberately absent: no deload concept exists in the
 * data model yet. "First PR" isn't here either — PRs celebrate through the
 * spotlight's own `pr` kind, with the actual numbers.
 */
export interface MilestoneDefinition {
  id: string;
  /** Which profile stat this milestone watches. */
  metric: "sessions" | "streakDays";
  threshold: number;
  title: string;
  detail: string;
}

export const milestoneDefinitions: MilestoneDefinition[] = [
  { id: "first-workout", metric: "sessions", threshold: 1, title: "First workout", detail: "The hardest one is done." },
  { id: "first-week", metric: "streakDays", threshold: 7, title: "One week streak", detail: "Seven days of showing up." },
  { id: "two-week-streak", metric: "streakDays", threshold: 14, title: "Two week streak", detail: "This is becoming a habit." },
  { id: "first-month", metric: "streakDays", threshold: 30, title: "One month streak", detail: "A month of consistency — rare air." },
  { id: "fifty-workouts", metric: "sessions", threshold: 50, title: "50 workouts", detail: "Halfway to the century club." },
  { id: "century-club", metric: "sessions", threshold: 100, title: "Century Club", detail: "100 workouts. You're the real deal." },
];

export interface MilestoneStats {
  sessions: number;
  streakDays: number;
}

/** The highest milestone the user has crossed, or null before the first. */
export function deriveLatestMilestone(stats: MilestoneStats): MilestoneDefinition | null {
  const crossed = milestoneDefinitions.filter(
    (milestone) =>
      (milestone.metric === "sessions" ? stats.sessions : stats.streakDays) >=
      milestone.threshold,
  );
  return crossed.at(-1) ?? null;
}
