"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { iconSize } from "@/constants/icons";
import { mockExercises } from "@/data/exercises";
import { usePlansStore } from "@/store/plansStore";
import type { PlanDay, UserPlan } from "@/types/plan";
import type { WorkoutTemplateExercise } from "@/types/workoutTemplate";
import { setsOf } from "@/types/workoutTemplate";

const REST_OPTIONS = [45, 60, 90, 120, 180];

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function exerciseName(exerciseId: string): string {
  return mockExercises.find((exercise) => exercise.id === exerciseId)?.name ?? "Exercise";
}

export interface PlanEditorProps {
  /** Absent = creating a new plan. */
  planId?: string;
}

/**
 * The plan builder: name → days → exercises → per-set reps. Edits a local
 * draft and commits whole plans to the persisted store on Save — no
 * partial-edit states to corrupt. Any set count, any reps per set: the
 * whole reason WorkoutTemplateExercise moved to a per-set array.
 */
export function PlanEditor({ planId }: PlanEditorProps) {
  const router = useRouter();
  const { plans, savePlan, deletePlan } = usePlansStore();
  const [draft, setDraft] = useState<UserPlan | null>(planId ? null : blankPlan());
  const [pickerDayId, setPickerDayId] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState("");

  useEffect(() => {
    if (!planId) return;
    // Same local-rehydrate contract as SessionScreen: don't trust the root
    // StoreHydrator's timing when this screen needs the data on mount.
    let cancelled = false;
    void Promise.resolve(usePlansStore.persist.rehydrate()).then(() => {
      if (cancelled) return;
      const existing = usePlansStore.getState().plans.find((plan) => plan.id === planId);
      setDraft(existing ? structuredClone(existing) : blankPlan());
    });
    return () => {
      cancelled = true;
    };
  }, [planId]);

  if (!draft) return null;

  function blankPlan(): UserPlan {
    return {
      id: newId("plan"),
      name: "",
      days: [{ id: newId("day"), name: "Day 1", exercises: [] }],
    };
  }

  function patchDay(dayId: string, patch: (day: PlanDay) => PlanDay) {
    setDraft((current) =>
      current
        ? {
            ...current,
            days: current.days.map((day) => (day.id === dayId ? patch(day) : day)),
          }
        : current,
    );
  }

  function patchExercise(
    dayId: string,
    index: number,
    patch: (exercise: WorkoutTemplateExercise) => WorkoutTemplateExercise,
  ) {
    patchDay(dayId, (day) => ({
      ...day,
      exercises: day.exercises.map((exercise, i) => (i === index ? patch(exercise) : exercise)),
    }));
  }

  const canSave =
    draft.name.trim().length > 0 &&
    draft.days.length > 0 &&
    draft.days.every((day) => day.name.trim().length > 0 && day.exercises.length > 0);

  const pickerResults = mockExercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(pickerQuery.toLowerCase()),
  );

  return (
    <PageContainer>
      <div className="flex items-center gap-3 pt-6">
        <IconButton label="Back to Train" variant="ghost" onClick={() => router.push("/train")}>
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </IconButton>
        <h1 className="font-display text-2xl font-bold">
          {planId ? "Edit plan" : "New plan"}
        </h1>
      </div>

      <Input
        label="Plan name"
        placeholder="e.g. My Push/Pull split"
        value={draft.name}
        onChange={(event) =>
          setDraft((current) => (current ? { ...current, name: event.target.value } : current))
        }
      />

      {draft.days.map((day) => (
        <Section
          key={day.id}
          title={day.name || "Untitled day"}
          action={
            draft.days.length > 1 ? (
              <IconButton
                label={`Remove ${day.name}`}
                variant="ghost"
                onClick={() =>
                  setDraft((current) =>
                    current
                      ? { ...current, days: current.days.filter((d) => d.id !== day.id) }
                      : current,
                  )
                }
              >
                <Trash2 size={iconSize.sm} aria-hidden />
              </IconButton>
            ) : undefined
          }
        >
          <Card padding="md" className="flex flex-col gap-4">
            <Input
              label="Day name"
              placeholder="e.g. Push Day"
              value={day.name}
              onChange={(event) =>
                patchDay(day.id, (d) => ({ ...d, name: event.target.value }))
              }
            />

            {day.exercises.map((exercise, index) => (
              <div
                key={`${exercise.exerciseId}-${index}`}
                className="flex flex-col gap-3 rounded-field border border-border/60 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{exerciseName(exercise.exerciseId)}</p>
                  <IconButton
                    label={`Remove ${exerciseName(exercise.exerciseId)}`}
                    variant="ghost"
                    onClick={() =>
                      patchDay(day.id, (d) => ({
                        ...d,
                        exercises: d.exercises.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    <X size={iconSize.sm} aria-hidden />
                  </IconButton>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {exercise.sets.map((set, setIndex) =>
                    set.toFailure || set.durationSeconds ? (
                      // Adopted-program AMRAP/timed sets: shown, not edited —
                      // rep steppers don't apply to "empty the tank" or 40s.
                      <span
                        key={setIndex}
                        className="rounded-field bg-surface-elevated px-2 py-2 text-xs font-semibold text-foreground-secondary"
                      >
                        {set.toFailure ? "Failure" : `${set.durationSeconds}s`}
                      </span>
                    ) : (
                      <label key={setIndex} className="flex items-center gap-1">
                        <span className="sr-only">
                          Set {setIndex + 1} target reps
                        </span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          value={set.targetReps}
                          onChange={(event) => {
                            const reps = Math.max(1, Number(event.target.value) || 1);
                            patchExercise(day.id, index, (ex) => ({
                              ...ex,
                              sets: ex.sets.map((s, si) =>
                                si === setIndex ? { targetReps: reps } : s,
                              ),
                            }));
                          }}
                          className="w-14 rounded-field border border-border bg-surface px-2 py-2 text-center text-sm tabular-nums focus-visible:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                        />
                      </label>
                    ),
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      patchExercise(day.id, index, (ex) => ({
                        ...ex,
                        sets: [...ex.sets, { targetReps: ex.sets.at(-1)?.targetReps ?? 10 }],
                      }))
                    }
                  >
                    <Plus size={iconSize.xs} aria-hidden />
                    Set
                  </Button>
                  {exercise.sets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        patchExercise(day.id, index, (ex) => ({
                          ...ex,
                          sets: ex.sets.slice(0, -1),
                        }))
                      }
                    >
                      <X size={iconSize.xs} aria-hidden />
                      Set
                    </Button>
                  )}
                </div>
                <p className="text-xs text-foreground-secondary">
                  {exercise.sets.length} sets · reps per set shown above
                </p>

                <label className="flex items-center gap-2 text-sm text-foreground-secondary">
                  Rest
                  <select
                    value={exercise.restSeconds}
                    onChange={(event) =>
                      patchExercise(day.id, index, (ex) => ({
                        ...ex,
                        restSeconds: Number(event.target.value),
                      }))
                    }
                    className="rounded-field border border-border bg-surface px-2 py-1.5 text-sm text-foreground focus-visible:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    {REST_OPTIONS.map((seconds) => (
                      <option key={seconds} value={seconds}>
                        {seconds}s
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ))}

            {pickerDayId === day.id ? (
              <div className="flex flex-col gap-2">
                <SearchInput
                  placeholder="Search exercises"
                  value={pickerQuery}
                  onChange={(event) => setPickerQuery(event.target.value)}
                />
                <ul className="max-h-56 overflow-y-auto rounded-field border border-border/60">
                  {pickerResults.map((exercise) => (
                    <li key={exercise.id}>
                      <button
                        type="button"
                        onClick={() => {
                          patchDay(day.id, (d) => ({
                            ...d,
                            exercises: [
                              ...d.exercises,
                              { exerciseId: exercise.id, sets: setsOf(3, 10), restSeconds: 60 },
                            ],
                          }));
                          setPickerDayId(null);
                          setPickerQuery("");
                        }}
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/60"
                      >
                        {exercise.name}
                        <span className="text-xs capitalize text-foreground-secondary">
                          {exercise.muscleGroups[0]}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" size="sm" onClick={() => setPickerDayId(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setPickerDayId(day.id);
                  setPickerQuery("");
                }}
              >
                <Plus size={iconSize.xs} aria-hidden />
                Add exercise
              </Button>
            )}
          </Card>
        </Section>
      ))}

      <Button
        variant="secondary"
        onClick={() =>
          setDraft((current) =>
            current
              ? {
                  ...current,
                  days: [
                    ...current.days,
                    {
                      id: newId("day"),
                      name: `Day ${current.days.length + 1}`,
                      exercises: [],
                    },
                  ],
                }
              : current,
          )
        }
      >
        <Plus size={iconSize.sm} aria-hidden />
        Add day
      </Button>

      <div className="flex flex-col gap-3 pb-8">
        {!canSave && (
          <p className="text-center text-xs font-medium text-amber-400/90">
            {!draft.name.trim()
              ? "Give your plan a name to save"
              : "Add at least one exercise to each day to save"}
          </p>
        )}
        <Button
          size="lg"
          fullWidth
          disabled={!canSave}
          onClick={() => {
            savePlan(draft);
            router.push("/train");
          }}
        >
          Save plan
        </Button>
        {planId && plans.some((plan) => plan.id === planId) && (
          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              deletePlan(planId);
              router.push("/train");
            }}
          >
            Delete plan
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
