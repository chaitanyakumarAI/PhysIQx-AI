import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { iconSize } from "@/constants/icons";
import { StatChipRow, type StatEntry } from "@/features/shared/components/StatChipRow";
import { goalLabels, type ProfileGoal } from "@/types/profile";
import { programTypeLabels, type ProgramType } from "@/types/training";
import { generateArchetype } from "../../lib/generateArchetype";

export interface DNAResultStepProps {
  goal: ProfileGoal;
  activeSplit: ProgramType;
  trainingDaysPerWeek: number;
  proteinGoalGrams: number;
  hydrationGoalLiters: number;
}

/**
 * The one moment in this flow that earns extra visual weight — a reveal,
 * not another question. Reuses CircularProgress's glow (already built for
 * Home's score gauge) rather than inventing a new celebratory effect.
 */
export function DNAResultStep({
  goal,
  activeSplit,
  trainingDaysPerWeek,
  proteinGoalGrams,
  hydrationGoalLiters,
}: DNAResultStepProps) {
  const archetype = generateArchetype(goal, activeSplit);

  const identityStats: StatEntry[] = [
    { label: "Goal", value: goalLabels[goal] },
    { label: "Split", value: programTypeLabels[activeSplit] },
    { label: "Days/wk", value: String(trainingDaysPerWeek) },
  ];

  const goalStats: StatEntry[] = [
    { label: "Protein", value: `${proteinGoalGrams}g` },
    { label: "Water", value: `${hydrationGoalLiters}L` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card variant="accent" padding="lg" className="flex flex-col items-center gap-4 text-center">
        <CircularProgress value={100} size={100} strokeWidth={8} glow>
          <Sparkles size={iconSize.lg} className="text-brand" aria-hidden />
        </CircularProgress>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary">
            Your PhysIQ DNA
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-brand">
            {archetype}
          </h2>
        </div>
      </Card>

      <StatChipRow stats={identityStats} />
      <StatChipRow stats={goalStats} columns={2} />
    </div>
  );
}
