import type { Exercise } from "@/types/exercise";
import type { Mission, Program } from "@/types/training";

/** Aggregate returned by getTrainData() — the Train screen's data contract. */
export interface TrainData {
  /** null represents a rest day — a real state, not an error. */
  mission: Mission | null;
  programs: Program[];
  activeProgramId: string;
  /** The loaded catalog subset (mock phase). */
  exercises: Exercise[];
  /** Full library size — drives copy like "Search 400+ exercises". */
  catalogSize: number;
}
