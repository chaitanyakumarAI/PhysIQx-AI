import type { PlanDay, UserPlan } from "@/types/plan";
import type { WorkoutTemplate } from "@/types/workoutTemplate";

export interface PlanDayLaunch {
  missionId: string;
  title: string;
  template: WorkoutTemplate;
  xpReward: number;
}

/**
 * Turns a user plan's day into everything startSession needs — the custom
 * counterpart of getSessionSetup's mission→template resolution. The id's
 * "plan-" prefix is the contract with /session/[id] (which resumes such
 * sessions from the store instead of a server lookup).
 *
 * XP formula (authored, mock-phase): a base for showing up plus a per-lift
 * bonus, capped so a 10-exercise day can't out-reward the AI mission tier.
 */
export function buildPlanDayLaunch(plan: UserPlan, day: PlanDay): PlanDayLaunch {
  const missionId = `plan-${plan.id}-${day.id}`;
  return {
    missionId,
    title: day.name,
    template: {
      id: `template-${missionId}`,
      missionId,
      exercises: day.exercises,
    },
    xpReward: Math.min(150 + day.exercises.length * 25, 400),
  };
}
