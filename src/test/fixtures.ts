import type { CardioActivity, CardioActivityType } from "@/types/cardio";
import type { AthleteProfile, Ledger, WeighIn } from "@/types/ledger";
import type { CompletedSessionSummary, TopSet } from "@/types/workoutSession";
import { addDaysIso } from "@/lib/dates";

/** Test-only builders for ledger entries — sensible defaults, override anything. */

export function makeSession(
  date: string,
  overrides: Partial<CompletedSessionSummary> = {},
): CompletedSessionSummary {
  return {
    id: `s-${date}-${overrides.missionId ?? "m"}`,
    missionId: "m",
    title: "Workout",
    date,
    completedAt: `${date}T10:00:00.000Z`,
    durationSec: 3600,
    setsCompleted: 16,
    totalVolumeKg: 6000,
    xpEarned: 300,
    topSets: [],
    status: "completed",
    ...overrides,
  };
}

export function top(exerciseId: string, weightKg: number, reps: number, name?: string): TopSet {
  return { exerciseId, exerciseName: name ?? exerciseId, weightKg, reps };
}

export function makeCardio(
  date: string,
  durationMin: number,
  type: CardioActivityType = "walk",
  overrides: Partial<CardioActivity> = {},
): CardioActivity {
  return {
    id: `gpx:${date}-${type}-${durationMin}`,
    source: "gpx",
    type,
    startedAt: `${date}T07:00:00.000Z`,
    date,
    durationMin,
    importedAt: `${date}T08:00:00.000Z`,
    ...overrides,
  };
}

export const baseProfile: AthleteProfile = {
  displayName: "Sam",
  sex: "male",
  birthYear: 1996,
  heightCm: 178,
  currentBuild: null,
  goal: "bulk",
  experienceLevel: "intermediate",
  goalBodyShape: "athletic",
  trainingDaysPerWeek: 4,
};

export function makeLedger(overrides: Partial<Ledger> = {}): Ledger {
  return {
    sessions: [],
    cardio: [],
    weighIns: [] as WeighIn[],
    profile: baseProfile,
    ...overrides,
  };
}

/** Sessions on the given weekdays (0 = first day) for `weeks` weeks from `startIso`. */
export function trainingBlock(
  startIso: string,
  weeks: number,
  dayOffsets: number[],
  build: (date: string, week: number) => Partial<CompletedSessionSummary> = () => ({}),
): CompletedSessionSummary[] {
  const sessions: CompletedSessionSummary[] = [];
  for (let week = 0; week < weeks; week++) {
    for (const offset of dayOffsets) {
      const date = addDaysIso(startIso, week * 7 + offset);
      sessions.push(makeSession(date, build(date, week)));
    }
  }
  return sessions;
}
