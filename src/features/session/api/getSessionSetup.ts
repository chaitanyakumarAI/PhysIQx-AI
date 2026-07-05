import { mockExercises } from "@/data/exercises";
import { mockTodayMission } from "@/data/mission";
import { mockPushDayATemplate } from "@/data/workoutTemplates";
import type { Exercise } from "@/types/exercise";
import type { Mission } from "@/types/training";
import type { WorkoutTemplate } from "@/types/workoutTemplate";

export interface SessionSetup {
  mission: Mission;
  template: WorkoutTemplate;
  exercises: Exercise[];
}

const missionsById: Record<string, Mission> = {
  [mockTodayMission.id]: mockTodayMission,
};

const templatesByMissionId: Record<string, WorkoutTemplate> = {
  [mockPushDayATemplate.missionId]: mockPushDayATemplate,
};

/**
 * Resolves a session's setup data by mission id. Only one mission exists in
 * the mock dataset today, so this is a single-entry lookup — shaped as a
 * lookup table (not an if-statement) so adding missions later is a data
 * change here, not a code change at every call site.
 */
export async function getSessionSetup(missionId: string): Promise<SessionSetup | null> {
  const mission = missionsById[missionId];
  const template = templatesByMissionId[missionId];
  if (!mission || !template) return null;
  return { mission, template, exercises: mockExercises };
}
