"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { RestTimer } from "./RestTimer";
import { SetRow } from "./SetRow";
import type { SessionExercise } from "@/types/workoutSession";

export interface ExerciseSessionCardProps {
  exercise: SessionExercise;
  restSeconds: number;
  unit: string;
  onLogSet: (setId: string, patch: { weight?: number | null; reps?: number | null }) => void;
  onToggleSetCompleted: (setId: string) => void;
  onAddSet?: () => void;
  onRemoveSet?: (setId: string) => void;
}

/** One exercise's set list. Owns its own "which set just finished, show the
 *  rest timer beneath it" state — ephemeral UI state, not session data, so
 *  it doesn't belong in the persisted store. Set count is the athlete's
 *  call mid-workout: add freely; remove only the last, uncompleted set
 *  (completed sets are logged work, never silently deletable). */
export function ExerciseSessionCard({
  exercise,
  restSeconds,
  unit,
  onLogSet,
  onToggleSetCompleted,
  onAddSet,
  onRemoveSet,
}: ExerciseSessionCardProps) {
  const [restingAfterSetId, setRestingAfterSetId] = useState<string | null>(null);
  const lastSet = exercise.sets.at(-1);

  function handleToggle(setId: string, wasCompleted: boolean) {
    onToggleSetCompleted(setId);
    // Only start resting when completing a set, not un-completing one.
    if (!wasCompleted) setRestingAfterSetId(setId);
  }

  return (
    <Card padding="lg" className="flex flex-col gap-3">
      <h3 className="font-semibold">{exercise.exerciseName}</h3>
      <div className="flex flex-col gap-2">
        {exercise.sets.map((set) => {
          const removable =
            !!onRemoveSet &&
            exercise.sets.length > 1 &&
            set.id === lastSet?.id &&
            !set.completed;
          return (
            <div key={set.id} className="flex flex-col gap-2">
              <SetRow
                set={set}
                unit={unit}
                onChangeWeight={(weight) => onLogSet(set.id, { weight })}
                onChangeReps={(reps) => onLogSet(set.id, { reps })}
                onToggleCompleted={() => handleToggle(set.id, set.completed)}
                onRemove={removable ? () => onRemoveSet(set.id) : undefined}
              />
              {restingAfterSetId === set.id && (
                <RestTimer seconds={restSeconds} onComplete={() => setRestingAfterSetId(null)} />
              )}
            </div>
          );
        })}
      </div>
      {onAddSet && (
        <Button variant="ghost" size="sm" onClick={onAddSet} className="self-start">
          <Plus size={iconSize.xs} aria-hidden />
          Add set
        </Button>
      )}
    </Card>
  );
}
