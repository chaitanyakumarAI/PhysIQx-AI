import type { Program } from "@/types/training";
import { mockTodayMission } from "@/data/mission";
import { mockExercises } from "@/data/exercises";
import type { TrainData } from "../types";

/**
 * Fixtures for the Train feature only. Mission and exercise catalog come
 * from shared src/data fixtures (also used by Home and Session
 * respectively) so no two screens can ever disagree on them.
 */

const programs: Program[] = [
  { id: "program-ai", name: "Coach", type: "ai", source: "ai" },
  { id: "program-ppl", name: "PPL", type: "ppl", source: "preset" },
  {
    id: "program-upper-lower",
    name: "Upper/Lower",
    type: "upper-lower",
    source: "preset",
  },
  { id: "program-bro", name: "Bro", type: "bro", source: "preset" },
  {
    id: "program-full-body",
    name: "Full Body",
    type: "full-body",
    source: "preset",
  },
];

export const mockTrainData: TrainData = {
  mission: mockTodayMission,
  programs,
  activeProgramId: "program-ai",
  exercises: mockExercises,
  // Honest count: the curated catalog itself, not an aspirational number.
  catalogSize: mockExercises.length,
};
