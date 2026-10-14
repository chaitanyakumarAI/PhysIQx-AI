import type { Exercise } from "@/types/exercise";
import type { Program } from "@/types/training";

/** Aggregate returned by getTrainData() — the Train screen's data contract. */
export interface TrainData {
  programs: Program[];
  activeProgramId: string;
  /** The loaded catalog subset (mock phase). */
  exercises: Exercise[];
  /** Full library size — drives copy like "Search 400+ exercises". */
  catalogSize: number;
}
