import type { CompletedSessionSummary } from "@/store/sessionStore";
import type { Equipment, ExerciseType } from "@/types/exercise";

export interface ComputeOverloadParams {
  exerciseId: string;
  history: CompletedSessionSummary[];
  targetReps: number;
  equipment?: Equipment | string;
  exerciseType?: ExerciseType | string;
  enableRpeAutoRegulation?: boolean;
}

export type OverloadReason =
  | "reps_met_weight_step"
  | "reps_missed_maintain_weight"
  | "bodyweight_reps_step"
  | "rpe_accelerated_step"
  | "rpe_fatigue_hold";

export interface OverloadSuggestion {
  weightKg: number;
  reps: number;
  reason: OverloadReason;
  explanation: string;
}

/**
 * Standard minimum equipment weight increment in kilograms.
 */
export function getEquipmentIncrement(equipment?: Equipment | string): number {
  switch (equipment) {
    case "barbell":
      return 2.5; // Standard 1.25 kg collar plates per side
    case "dumbbell":
      return 1.0; // 0.5 kg to 1.0 kg step per dumbbell
    case "cable":
    case "machine":
      return 2.5; // Standard selectorized stack pin increment
    case "kettlebell":
      return 2.0; // Standard 2 kg bell jump
    case "plate":
      return 2.5;
    case "sled":
      return 5.0;
    case "bodyweight":
      return 0.0;
    default:
      return 2.5;
  }
}

/**
 * Rounds a weight to the nearest realistic plate or microplate increment.
 */
export function roundToPlateIncrement(weightKg: number, step: number = 0.5): number {
  if (step <= 0) return weightKg;
  return Math.round(weightKg / step) * step;
}

/**
 * Computes the progressive overload prescription for an exercise based on
 * previous session history, equipment type, target reps, and RPE feedback.
 *
 * Implements standard Double Progression & Auto-Regulation:
 * 1. Bodyweight: Rep progressions (+1 or +2 reps) when target is reached.
 * 2. Weighted: Equipment-aware step (+2.5 kg barbell, +1.0 kg dumbbell) when target reps hit.
 * 3. RPE Auto-Regulation: Accelerated step on low exertion (RPE <= 6.5), hold on high fatigue (RPE >= 9.5).
 */
export function computeOverloadSuggestion({
  exerciseId,
  history,
  targetReps,
  equipment,
  exerciseType,
  enableRpeAutoRegulation = true,
}: ComputeOverloadParams): OverloadSuggestion | null {
  if (!history || history.length === 0) {
    return null;
  }

  // Walk history newest-first to locate the most recent performance
  for (let i = history.length - 1; i >= 0; i--) {
    const session = history[i];
    if (!session || !session.topSets) continue;

    const top = session.topSets.find((t) => t.exerciseId === exerciseId);
    if (!top) continue;

    const isBodyweight =
      equipment === "bodyweight" ||
      exerciseType === "bodyweight" ||
      (top.weightKg === 0 && top.reps > 0);

    // Case 1: Pure Bodyweight Exercise
    if (isBodyweight) {
      if (top.reps >= targetReps) {
        const nextReps = top.reps + (top.reps > targetReps + 2 ? 2 : 1);
        return {
          weightKg: 0,
          reps: nextReps,
          reason: "bodyweight_reps_step",
          explanation: `Target reps hit (${top.reps}/${targetReps}). Push for ${nextReps} reps today.`,
        };
      }

      return {
        weightKg: 0,
        reps: targetReps,
        reason: "reps_missed_maintain_weight",
        explanation: `Keep pushing bodyweight to reach your target of ${targetReps} reps (last: ${top.reps}).`,
      };
    }

    // Case 2: Weighted Movement
    const step = getEquipmentIncrement(equipment);
    const lastWeight = top.weightKg;
    const lastRpe = (top as unknown as { rpe?: number | null }).rpe;

    // RPE-aware auto-regulation
    if (enableRpeAutoRegulation && lastRpe != null) {
      // Very light exertion (RPE <= 6.5) and target reps achieved -> Accelerated step
      if (lastRpe <= 6.5 && top.reps >= targetReps) {
        const acceleratedStep = step * 2;
        const nextWeight = roundToPlateIncrement(lastWeight + acceleratedStep, step);
        return {
          weightKg: nextWeight,
          reps: targetReps,
          reason: "rpe_accelerated_step",
          explanation: `Low exertion (RPE ${lastRpe}) last session. Safe to jump +${acceleratedStep} kg to ${nextWeight} kg.`,
        };
      }

      // High fatigue / near failure (RPE >= 9.5) -> Hold current weight
      if (lastRpe >= 9.5) {
        return {
          weightKg: lastWeight,
          reps: targetReps,
          reason: "rpe_fatigue_hold",
          explanation: `High exertion (RPE ${lastRpe}) last time. Hold ${lastWeight} kg to consolidate form and manage fatigue.`,
        };
      }
    }

    // Standard Double Progression
    if (top.reps >= targetReps) {
      const nextWeight = roundToPlateIncrement(lastWeight + step, step);
      return {
        weightKg: nextWeight,
        reps: targetReps,
        reason: "reps_met_weight_step",
        explanation: `Target reps cleared (${top.reps} reps). Stepping load up by +${step} kg to ${nextWeight} kg.`,
      };
    }

    // Target reps not met -> hold weight and aim to beat previous reps
    const targetRepSuggestion = Math.min(targetReps, top.reps + 1);
    return {
      weightKg: lastWeight,
      reps: targetRepSuggestion,
      reason: "reps_missed_maintain_weight",
      explanation: `Hold ${lastWeight} kg and aim for ${targetRepSuggestion} reps (last: ${top.reps}/${targetReps}).`,
    };
  }

  return null;
}
