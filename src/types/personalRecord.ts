/**
 * PersonalRecord — docs/DATA_MODELS.md "PersonalRecord". Best performance per
 * exercise, with its trend series for the Insights chart.
 */
export interface PersonalRecordTrendPoint {
  date: string;
  value: number;
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  unit: string;
  value: number;
  /** Signed change vs. 30 days ago. */
  delta: number;
  windowLabel: string;
  trend: PersonalRecordTrendPoint[];
}
