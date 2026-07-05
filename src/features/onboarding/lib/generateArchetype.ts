import type { ProfileGoal } from "@/types/profile";
import type { ProgramType } from "@/types/training";

const goalDescriptor: Record<ProfileGoal, string> = {
  cut: "Cut-focused",
  bulk: "Bulk-focused",
  maintain: "Balanced",
  endurance: "Endurance-forward",
};

const splitNoun: Record<ProgramType, string> = {
  ai: "adaptive athlete",
  ppl: "strength athlete",
  "upper-lower": "hybrid athlete",
  bro: "bodybuilding athlete",
  "full-body": "well-rounded athlete",
};

/**
 * Composes the "PhysIQ DNA" reveal phrase from two independent parts (4
 * goals x 5 splits = 20 combinations) rather than hand-authoring all 20.
 * Deterministic flavor text, not a real computation — matches the existing
 * dnaArchetype copy style already shown on Profile (src/data/profile.ts).
 */
export function generateArchetype(goal: ProfileGoal, split: ProgramType): string {
  return `${goalDescriptor[goal]} ${splitNoun[split]}`;
}
