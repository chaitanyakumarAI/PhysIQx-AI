"use client";

import { useMemo } from "react";
import { findProgram, type ProgramDefinition } from "@/data/programs";
import { buildAiCoachProgramDefinition } from "@/lib/aiProgramEngine";
import { useProfileStore } from "@/store/profileStore";
import type { ProgramType } from "@/types/training";

/**
 * A program as this athlete should see it. Library programs are fixed; the
 * PhysIQ Split ("ai") is built from their onboarding goal and experience —
 * the static library copy uses defaults (bulk, intermediate) so it can be
 * prerendered.
 */
export function useProgram(type: ProgramType): ProgramDefinition | undefined {
  const goal = useProfileStore((state) => state.onboardingProfile?.goal);
  const experienceLevel = useProfileStore((state) => state.onboardingProfile?.experienceLevel);
  return useMemo(
    () => (type === "ai" ? buildAiCoachProgramDefinition(goal, experienceLevel) : findProgram(type)),
    [type, goal, experienceLevel],
  );
}

/** The variant matching the athlete's training days per week, else the first. */
export function usePreferredVariantIndex(program: ProgramDefinition | undefined): number {
  const days = useProfileStore((state) => state.onboardingProfile?.trainingDaysPerWeek);
  if (!program || !days) return 0;
  return Math.max(0, program.variants.findIndex((variant) => variant.daysPerWeek === days));
}
