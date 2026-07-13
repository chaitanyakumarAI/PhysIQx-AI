import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Dumbbell, Gauge, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { mockExercises } from "@/data/exercises";
import {
  equipmentLabels,
  exerciseTypeLabels,
  muscleGroupLabels,
  type ExerciseDifficulty,
  type MuscleGroup,
} from "@/types/exercise";

interface ExercisePageProps {
  params: Promise<{ id: string }>;
}

const difficultyMeta: Record<ExerciseDifficulty, { label: string; tone: string }> = {
  beginner: { label: "Beginner", tone: "bg-brand/15 text-brand" },
  intermediate: { label: "Intermediate", tone: "bg-warning/15 text-warning" },
  advanced: { label: "Advanced", tone: "bg-danger/15 text-danger" },
};

export function generateStaticParams() {
  return mockExercises.map((exercise) => ({ id: exercise.id }));
}

export async function generateMetadata({ params }: ExercisePageProps): Promise<Metadata> {
  const { id } = await params;
  const exercise = mockExercises.find((entry) => entry.id === id);
  return { title: exercise?.name ?? "Exercise" };
}

/**
 * Exercise detail — every catalog row links here. Static per exercise
 * (generateStaticParams over the shared fixture) with honest content only:
 * involvement-ordered muscles, equipment, difficulty, and a path into the
 * plan builder. Per-exercise instructions arrive with the coach content
 * pass — no filler copy until then.
 */
export default async function ExercisePage({ params }: ExercisePageProps) {
  const { id } = await params;
  const exercise = mockExercises.find((entry) => entry.id === id);
  if (!exercise) notFound();

  const difficulty = difficultyMeta[exercise.difficulty];
  // Highest share first — authored EMG-informed content (see the catalog).
  const muscleShares = (
    Object.entries(exercise.muscleHit) as [MuscleGroup, number][]
  ).sort((a, b) => b[1] - a[1]);

  return (
    <PageContainer>
      <div className="flex items-center gap-3 pt-6">
        <Link
          href="/train"
          aria-label="Back to Train"
          className="grid size-11 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </Link>
        <h1 className="font-display text-2xl font-bold">{exercise.name}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
            difficulty.tone,
          )}
        >
          {difficulty.label}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-surface-elevated px-3 py-1 text-xs font-semibold text-foreground-secondary">
          <Dumbbell size={iconSize.xs} aria-hidden />
          {equipmentLabels[exercise.equipment]}
        </span>
        <span className="rounded-full bg-info/15 px-3 py-1 text-xs font-semibold text-info">
          {exerciseTypeLabels[exercise.type]}
        </span>
      </div>

      <Section title="Muscle hit">
        <Card padding="md" className="flex flex-col gap-4">
          {muscleShares.map(([muscle, share], index) => (
            <div key={muscle} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className={index === 0 ? "font-semibold" : "text-foreground-secondary"}>
                  {muscleGroupLabels[muscle]}
                </span>
                <span
                  className={cn(
                    "font-display text-sm font-bold tabular-nums",
                    index === 0 ? "text-brand" : "text-foreground-secondary",
                  )}
                >
                  {share}%
                </span>
              </div>
              <ProgressBar
                value={share}
                size="sm"
                tone={index === 0 ? "brand" : "neutral"}
                aria-label={`${muscleGroupLabels[muscle]} receives ${share}% of the stimulus`}
              />
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Level guide">
        <Card padding="md" className="flex items-start gap-3">
          <span
            aria-hidden
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full",
              difficulty.tone,
            )}
          >
            <Gauge size={iconSize.sm} />
          </span>
          <p className="text-sm leading-relaxed text-foreground-secondary">
            {exercise.difficulty === "beginner" &&
              "Friendly to learn — a solid pick from your first session. Focus on full range of motion before adding load."}
            {exercise.difficulty === "intermediate" &&
              "Technique matters here. Warm up to working weight and keep 1–2 reps in reserve while the pattern settles."}
            {exercise.difficulty === "advanced" &&
              "High skill, high reward. Build up with the easier variations first and treat every warm-up set as practice."}
          </p>
        </Card>
      </Section>

      <Button size="lg" fullWidth asChild>
        <Link href="/train/plans/new">
          <Plus size={iconSize.sm} aria-hidden />
          Add to a plan
        </Link>
      </Button>
    </PageContainer>
  );
}
