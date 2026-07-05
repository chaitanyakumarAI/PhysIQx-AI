"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { RestTimer } from "./RestTimer";
import { SetRow } from "./SetRow";
import type { SessionExercise } from "@/types/workoutSession";

export interface ExerciseSessionCardProps {
  exercise: SessionExercise;
  restSeconds: number;
  unit: string;
  onLogSet: (setId: string, patch: { weight?: number | null; reps?: number | null }) => void;
  onToggleSetCompleted: (setId: string) => void;
}

/** One exercise's set list. Owns its own "which set just finished, show the
 *  rest timer beneath it" state — ephemeral UI state, not session data, so
 *  it doesn't belong in the persisted store. */
export function ExerciseSessionCard({
  exercise,
  restSeconds,
  unit,
  onLogSet,
  onToggleSetCompleted,
}: ExerciseSessionCardProps) {
  const [restingAfterSetId, setRestingAfterSetId] = useState<string | null>(null);

  function handleToggle(setId: string, wasCompleted: boolean) {
    onToggleSetCompleted(setId);
    // Only start resting when completing a set, not un-completing one.
    if (!wasCompleted) setRestingAfterSetId(setId);
  }

  return (
    <Card padding="lg" className="flex flex-col gap-3">
      <h3 className="font-semibold">{exercise.exerciseName}</h3>
      <div className="flex flex-col gap-2">
        {exercise.sets.map((set) => (
          <div key={set.id} className="flex flex-col gap-2">
            <SetRow
              set={set}
              unit={unit}
              onChangeWeight={(weight) => onLogSet(set.id, { weight })}
              onChangeReps={(reps) => onLogSet(set.id, { reps })}
              onToggleCompleted={() => handleToggle(set.id, set.completed)}
            />
            {restingAfterSetId === set.id && (
              <RestTimer seconds={restSeconds} onComplete={() => setRestingAfterSetId(null)} />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
