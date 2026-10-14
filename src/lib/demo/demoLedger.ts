import { mockExercises } from "@/data/exercises";
import { programLibrary } from "@/data/programs";
import type { CardioActivity, CardioActivityType } from "@/types/cardio";
import type { Ledger, WeighIn } from "@/types/ledger";
import type { UserPlan } from "@/types/plan";
import type { CompletedSessionSummary, TopSet } from "@/types/workoutSession";
import { addDaysIso, weekdayIndex } from "@/lib/dates";
import { closestVariant, planDayMissionId, planDayXp, planFromProgram } from "@/lib/workoutPlan";

/**
 * Demo mode: ten weeks of believable, generated training for exploring the
 * app before you have your own. Deterministic (seeded) so screens look the
 * same on every visit, built relative to "today" so it never looks stale,
 * and never written into the athlete's real stores.
 */

const WEEKS = 10;
/** Mon, Tue, Thu, Fri — the Upper/Lower rhythm. */
const TRAINING_WEEKDAYS = new Set([0, 1, 3, 4]);

/** Small seeded PRNG (mulberry32) so the demo is identical every time. */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Starting working weights (kg) for common lifts; others scale by type. */
const BASE_LOADS: Record<string, number> = {
  "ex-bench-press": 72.5,
  "ex-back-squat": 100,
  "ex-deadlift": 125,
  "ex-overhead-press": 45,
  "ex-barbell-row": 65,
  "ex-romanian-deadlift": 90,
  "ex-incline-db-press": 26,
  "ex-pull-up": 0,
};

function baseLoad(exerciseId: string): number {
  if (exerciseId in BASE_LOADS) return BASE_LOADS[exerciseId]!;
  const exercise = mockExercises.find((item) => item.id === exerciseId);
  if (!exercise || exercise.equipment === "bodyweight") return 0;
  if (exercise.equipment === "dumbbell") return 18;
  return exercise.type === "compound" ? 60 : 30;
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export interface DemoData {
  ledger: Ledger;
  plan: UserPlan;
}

export function buildDemoData(todayIso: string): DemoData {
  const rand = random(20261014);
  const program = programLibrary.find((entry) => entry.type === "upper-lower")!;
  const plan: UserPlan = { ...planFromProgram(program, closestVariant(program, 4), 1), id: "demo-plan" };

  // End two days ago, so "today" in the demo always has a workout to start.
  const lastDay = addDaysIso(todayIso, -2);
  const firstDay = addDaysIso(lastDay, -WEEKS * 7 + 1);

  const sessions: CompletedSessionSummary[] = [];
  const cardio: CardioActivity[] = [];
  const weighIns: WeighIn[] = [];
  let dayCursor = 0;

  for (let date = firstDay, week = 0; date <= lastDay; date = addDaysIso(date, 1)) {
    const weekday = weekdayIndex(date);
    if (weekday === 0 && date !== firstDay) week += 1;

    if (TRAINING_WEEKDAYS.has(weekday) && rand() > 0.08) {
      const day = plan.days[dayCursor % plan.days.length]!;
      dayCursor += 1;
      const progress = 1 + week * 0.012;
      let volume = 0;
      let sets = 0;
      const topSets: TopSet[] = day.exercises.map((entry) => {
        const weight = roundTo(baseLoad(entry.exerciseId) * progress, 2.5);
        const reps = entry.sets[0]?.targetReps ?? 8;
        sets += entry.sets.length;
        volume += weight * reps * entry.sets.length;
        return {
          exerciseId: entry.exerciseId,
          exerciseName: mockExercises.find((item) => item.id === entry.exerciseId)?.name ?? "Exercise",
          weightKg: weight,
          reps,
        };
      });
      const completedAt = new Date(`${date}T18:${String(10 + Math.floor(rand() * 40)).padStart(2, "0")}:00`);
      sessions.push({
        id: `demo-${date}`,
        missionId: planDayMissionId(plan, day),
        title: day.name,
        date,
        completedAt: completedAt.toISOString(),
        durationSec: 2700 + Math.floor(rand() * 1500),
        setsCompleted: sets,
        totalVolumeKg: Math.round(volume),
        xpEarned: planDayXp(day),
        topSets: topSets.filter((set) => set.weightKg > 0),
        avgRpe: Math.round((7.5 + rand()) * 10) / 10,
        status: "completed",
      });
    }

    // Cardio: easy walks Wed/Sat, a run on Sunday.
    const cardioPlan: [number, CardioActivityType, number][] = [
      [2, "walk", 40],
      [5, "walk", 45],
      [6, "run", 26],
    ];
    for (const [cardioDay, type, minutes] of cardioPlan) {
      if (weekday !== cardioDay || rand() < 0.15) continue;
      const startedAt = new Date(`${date}T07:15:00`).toISOString();
      const durationMin = Math.round(minutes * (0.85 + rand() * 0.3));
      cardio.push({
        id: `gpx:demo-${date}-${type}`,
        source: "gpx",
        externalId: `demo-${date}-${type}`,
        type,
        startedAt,
        date,
        durationMin,
        distanceKm: Math.round(durationMin * (type === "run" ? 0.18 : 0.09) * 10) / 10,
        avgHeartRate: type === "run" ? 152 + Math.round(rand() * 8) : 104 + Math.round(rand() * 10),
        importedAt: startedAt,
      });
    }

    // Weekly Monday weigh-in, trending up on a lean bulk.
    if (weekday === 0) {
      weighIns.push({ date, weightKg: Math.round((80.6 + week * 0.18 + rand() * 0.3) * 10) / 10 });
    }
  }

  return {
    plan,
    ledger: {
      sessions,
      cardio: cardio.sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
      weighIns,
      profile: {
        displayName: "Alex",
        sex: "male",
        birthYear: 1995,
        heightCm: 180,
        currentBuild: "athletic",
        goal: "bulk",
        experienceLevel: "intermediate",
        goalBodyShape: "muscular",
        trainingDaysPerWeek: 4,
      },
    },
  };
}
