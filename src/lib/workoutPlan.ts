import { buildAiCoachProgramDefinition } from "@/lib/aiProgramEngine";
import { programLibrary, type ProgramDefinition, type ProgramVariant } from "@/data/programs";
import type { Exercise, MuscleGroup } from "@/types/exercise";
import { muscleGroupLabels } from "@/types/exercise";
import type { ExperienceLevel, ProfileGoal } from "@/types/profile";
import type { PlanDay, UserPlan } from "@/types/plan";
import type { Mission, MissionIntensity, ProgramType } from "@/types/training";
import type { WorkoutTemplate } from "@/types/workoutTemplate";
import type { CompletedSessionSummary } from "@/types/workoutSession";

/**
 * Plans → today's workout. The active plan's days rotate in order: the
 * next workout is the day after the one most recently trained, whatever
 * the calendar says — miss a Tuesday and Wednesday picks up where you
 * left off instead of skipping a muscle group.
 */

/** The session id contract with /session/[id] (resumed from the store). */
export function planDayMissionId(plan: UserPlan, day: PlanDay): string {
  return `plan-${plan.id}-${day.id}`;
}

/** XP for a plan day: a base for showing up plus a per-lift bonus, capped. */
export function planDayXp(day: PlanDay): number {
  return Math.min(150 + day.exercises.length * 25, 400);
}

export interface PlanDayLaunch {
  missionId: string;
  title: string;
  template: WorkoutTemplate;
  xpReward: number;
}

/** Everything startSession needs to run a plan day. */
export function buildPlanDayLaunch(plan: UserPlan, day: PlanDay): PlanDayLaunch {
  const missionId = planDayMissionId(plan, day);
  return {
    missionId,
    title: day.name,
    template: { id: `template-${missionId}`, missionId, exercises: day.exercises },
    xpReward: planDayXp(day),
  };
}

export type TodaysWorkoutStatus = "ready" | "done";

export interface TodaysWorkout {
  plan: UserPlan;
  day: PlanDay;
  dayIndex: number;
  missionId: string;
  /** "done" once a session of this plan was finished today. */
  status: TodaysWorkoutStatus;
  /** The day that follows — "Up next" after today's is done. */
  nextDay: PlanDay;
  completedToday: CompletedSessionSummary | null;
}

export function resolveTodaysWorkout(
  plan: UserPlan | null,
  sessions: CompletedSessionSummary[],
  todayIso: string,
): TodaysWorkout | null {
  if (!plan || plan.days.length === 0) return null;
  const dayIndexByMission = new Map(
    plan.days.map((day, index) => [planDayMissionId(plan, day), index]),
  );
  const lastPlanSession = [...sessions]
    .filter((session) => dayIndexByMission.has(session.missionId) && session.setsCompleted > 0)
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
    .at(-1);

  const count = plan.days.length;
  const lastIndex = lastPlanSession ? dayIndexByMission.get(lastPlanSession.missionId)! : -1;
  const doneToday = lastPlanSession?.date === todayIso;
  const dayIndex = doneToday ? lastIndex : (lastIndex + 1) % count;
  const day = plan.days[dayIndex]!;
  return {
    plan,
    day,
    dayIndex,
    missionId: planDayMissionId(plan, day),
    status: doneToday ? "done" : "ready",
    nextDay: plan.days[(dayIndex + 1) % count]!,
    completedToday: doneToday ? lastPlanSession! : null,
  };
}

/** Rough session length: ~40 s per working set plus its rest, plus warm-up. */
export function estimateDayMinutes(day: PlanDay): number {
  const seconds = day.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length * (40 + exercise.restSeconds),
    0,
  );
  return Math.max(10, Math.round((seconds / 60 + 5) / 5) * 5);
}

function intensityOf(day: PlanDay): MissionIntensity {
  const sets = day.exercises.flatMap((exercise) => exercise.sets);
  if (sets.length === 0) return "low";
  const avgReps = sets.reduce((sum, set) => sum + set.targetReps, 0) / sets.length;
  if (avgReps <= 6) return "high";
  if (avgReps <= 12) return "moderate";
  return "low";
}

/** The day's top muscle groups, weighted by stimulus share × sets. */
export function primaryMuscles(day: PlanDay, catalog: Exercise[], limit = 3): string[] {
  const load = new Map<MuscleGroup, number>();
  for (const entry of day.exercises) {
    const exercise = catalog.find((item) => item.id === entry.exerciseId);
    if (!exercise) continue;
    for (const [group, share] of Object.entries(exercise.muscleHit) as [MuscleGroup, number][]) {
      load.set(group, (load.get(group) ?? 0) + share * entry.sets.length);
    }
  }
  return [...load.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([group]) => muscleGroupLabels[group]);
}

/** The Mission view model the mission card renders for a plan day. */
export function missionFromPlanDay(
  plan: UserPlan,
  day: PlanDay,
  catalog: Exercise[],
  state: Mission["state"],
): Mission {
  return {
    id: planDayMissionId(plan, day),
    title: day.name,
    muscleGroups: primaryMuscles(day, catalog),
    durationMinutes: estimateDayMinutes(day),
    liftCount: day.exercises.length,
    intensity: intensityOf(day),
    xpReward: planDayXp(day),
    aiProgrammed: false,
    state,
  };
}

// --- Adopting programs -------------------------------------------------------

/** Turns a program variant into an editable user plan. */
export function planFromProgram(
  program: ProgramDefinition,
  variant: ProgramVariant,
  stamp: number,
): UserPlan {
  const name =
    program.variants.length > 1 ? `${program.name} (${variant.daysPerWeek}-day)` : program.name;
  return {
    id: `plan-${program.type}-${stamp}`,
    name,
    days: variant.days.map((day, index) => ({
      id: `day-${stamp}-${index}`,
      name: day.name,
      exercises: day.exercises,
    })),
  };
}

/** The variant whose frequency is closest to the athlete's (ties → fewer days). */
export function closestVariant(program: ProgramDefinition, daysPerWeek: number): ProgramVariant {
  return [...program.variants].sort(
    (a, b) =>
      Math.abs(a.daysPerWeek - daysPerWeek) - Math.abs(b.daysPerWeek - daysPerWeek) ||
      a.daysPerWeek - b.daysPerWeek,
  )[0]!;
}

export interface StarterPlanInput {
  split: ProgramType | null;
  daysPerWeek: number;
  goal: ProfileGoal | null;
  experienceLevel: ExperienceLevel | null;
}

/**
 * The plan onboarding hands a new athlete: their chosen split at the
 * closest frequency; the PhysIQ Split is built for their goal and level.
 */
export function buildStarterPlan(input: StarterPlanInput, stamp: number): UserPlan {
  const program =
    input.split === "ai" || !input.split
      ? buildAiCoachProgramDefinition(input.goal ?? "maintain", input.experienceLevel ?? "beginner")
      : (programLibrary.find((entry) => entry.type === input.split) ??
        buildAiCoachProgramDefinition(input.goal ?? "maintain", input.experienceLevel ?? "beginner"));
  return planFromProgram(program, closestVariant(program, input.daysPerWeek), stamp);
}
