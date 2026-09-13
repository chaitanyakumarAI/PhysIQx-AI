import type { PersonalRecord, PersonalRecordTrendPoint } from "@/types/personalRecord";
import type { CompletedSessionSummary } from "@/store/sessionStore";
import { mockPersonalRecordBases } from "@/data/personalRecords";

/**
 * Calculates estimated One-Rep Max (e1RM) using the industry-standard Epley formula:
 * e1RM = Weight * (1 + Reps / 30)
 */
export function calculateEpley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weightKg * 10) / 10;
  const e1rm = weightKg * (1 + reps / 30);
  return Math.round(e1rm * 10) / 10;
}

interface ExerciseLiftEvent {
  date: string;
  weightKg: number;
  reps: number;
  e1rm: number;
}

/**
 * Derives personal records and chronological progression trend lines from session ledgers.
 * If user has no sessions, falls back gracefully to standard reference records.
 */
export function derivePersonalRecords(
  history: CompletedSessionSummary[],
  unit: "kg" | "lb" = "kg",
): PersonalRecord[] {
  if (history.length === 0) {
    // Generate fallback PRs from canonical mock bases with realistic synthetic curves
    return mockPersonalRecordBases.map((base) => ({
      id: base.id,
      exerciseName: base.exerciseName,
      unit: base.unit,
      value: base.value,
      delta: base.delta,
      windowLabel: base.windowLabel,
      trend: [
        { date: "2026-06-15", value: Math.round((base.value - base.delta) * 10) / 10 },
        { date: "2026-06-25", value: Math.round((base.value - base.delta * 0.5) * 10) / 10 },
        { date: "2026-07-04", value: base.value },
      ],
    }));
  }

  // 1. Collect all top sets chronologically
  const sortedSessions = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const exerciseEvents = new Map<string, { exerciseName: string; events: ExerciseLiftEvent[] }>();

  for (const session of sortedSessions) {
    for (const topSet of session.topSets) {
      const key = topSet.exerciseId || topSet.exerciseName.toLowerCase().replace(/\s+/g, "-");
      const e1rm = calculateEpley1RM(topSet.weightKg, topSet.reps);

      const entry = exerciseEvents.get(key) ?? {
        exerciseName: topSet.exerciseName,
        events: [],
      };

      entry.events.push({
        date: session.date,
        weightKg: topSet.weightKg,
        reps: topSet.reps,
        e1rm,
      });

      exerciseEvents.set(key, entry);
    }
  }

  const results: PersonalRecord[] = [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString().split("T")[0]!;

  // 2. Compute PRs per exercise
  for (const [id, { exerciseName, events }] of exerciseEvents.entries()) {
    if (events.length === 0) continue;

    // Track running PR progression for the trend chart
    let currentBest = 0;
    const trend: PersonalRecordTrendPoint[] = [];

    for (const ev of events) {
      if (ev.weightKg > currentBest) {
        currentBest = ev.weightKg;
        trend.push({
          date: ev.date,
          value: ev.weightKg,
        });
      }
    }

    const allTimeBest = currentBest;

    // Delta vs 30 days ago
    const olderEvents = events.filter((e) => e.date < thirtyDaysAgoIso);
    let baselineBest = 0;
    if (olderEvents.length > 0) {
      baselineBest = Math.max(...olderEvents.map((e) => e.weightKg));
    } else {
      // If all lifts are recent, baseline is first logged lift
      baselineBest = events[0]?.weightKg ?? allTimeBest;
    }

    const delta = Math.round((allTimeBest - baselineBest) * 10) / 10;

    results.push({
      id: `pr-${id}`,
      exerciseName,
      unit,
      value: allTimeBest,
      delta,
      windowLabel: "Last 30 days",
      trend: trend.length > 0 ? trend : [{ date: events[0]!.date, value: allTimeBest }],
    });
  }

  // Sort by highest value / significance
  return results.sort((a, b) => b.value - a.value);
}

/**
 * Returns the single most recent or significant PR for home spotlights.
 */
export function deriveLatestPR(records: PersonalRecord[]): PersonalRecord | null {
  if (records.length === 0) return null;
  // Pick the record with highest positive delta, or the first record
  const withGain = records.filter((r) => r.delta > 0);
  if (withGain.length > 0) {
    return withGain.sort((a, b) => b.delta - a.delta)[0]!;
  }
  return records[0]!;
}
