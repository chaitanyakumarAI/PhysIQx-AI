/**
 * Personal record base values — shared by Insights (PR cards with trends)
 * and Home (achievement spotlight), so the same PR can never show two
 * different numbers. Promoted from features/insights/mocks the moment Home
 * needed the latest PR, per the src/data promotion rule. Trend series stay
 * feature-side (only Insights renders them).
 */
export interface PersonalRecordBase {
  id: string;
  exerciseName: string;
  unit: "kg" | "lb";
  value: number;
  delta: number;
  windowLabel: string;
}

export const mockPersonalRecordBases: PersonalRecordBase[] = [
  {
    id: "pr-bench-press",
    exerciseName: "Bench Press",
    unit: "kg",
    value: 92.5,
    delta: 5,
    windowLabel: "Last 30 days",
  },
  {
    id: "pr-deadlift",
    exerciseName: "Deadlift",
    unit: "kg",
    value: 180,
    delta: 7.5,
    windowLabel: "Last 30 days",
  },
  {
    id: "pr-back-squat",
    exerciseName: "Back Squat",
    unit: "kg",
    value: 140,
    delta: 5,
    windowLabel: "Last 30 days",
  },
  {
    id: "pr-overhead-press",
    exerciseName: "Overhead Press",
    unit: "kg",
    value: 60,
    delta: 2.5,
    windowLabel: "Last 30 days",
  },
];

/** The most recent PR — Home's "today's biggest win" spotlight. */
export const mockLatestPR = mockPersonalRecordBases[0]!;
