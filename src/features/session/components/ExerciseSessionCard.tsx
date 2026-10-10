"use client";

import { useState } from "react";
import { Plus, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { useProfileStore, DEFAULT_USER_PREFERENCES } from "@/store/profileStore";
import { RestTimer } from "./RestTimer";
import { SetRow } from "./SetRow";
import { ExercisePlateModal } from "./ExercisePlateModal";
import type { SessionExercise } from "@/types/workoutSession";

export interface ExerciseSessionCardProps {
  exercise: SessionExercise;
  restSeconds: number;
  unit: string;
  /** Ghost of the previous performance, e.g. "Last time: 60 kg × 8". */
  lastTime?: string;
  /** Progressive overload suggestion — ghost-fills weight/reps inputs. */
  suggest?: { weightKg: number; reps: number } | null;
  onLogSet: (setId: string, patch: { weight?: number | null; reps?: number | null; rpe?: number | null }) => void;
  onToggleSetCompleted: (setId: string) => void;
  onAddSet?: () => void;
  onRemoveSet?: (setId: string) => void;
}

/**
 * ExerciseSessionCard — holds the sets for one exercise. Sets can be added
 * at any time; removing is restricted to the newest set while still uncompleted
 * (completed sets are logged work, never silently deletable).
 */
export function ExerciseSessionCard({
  exercise,
  restSeconds,
  unit,
  lastTime,
  suggest,
  onLogSet,
  onToggleSetCompleted,
  onAddSet,
  onRemoveSet,
}: ExerciseSessionCardProps) {
  const preferences = useProfileStore(
    (state) => state.preferences ?? DEFAULT_USER_PREFERENCES,
  );
  const [restingAfterSetId, setRestingAfterSetId] = useState<string | null>(null);
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const lastSet = exercise.sets.at(-1);
  const activeUncompletedSet = exercise.sets.find((s) => !s.completed);
  const defaultPlateWeight =
    activeUncompletedSet?.weight ??
    suggest?.weightKg ??
    lastSet?.weight ??
    60;

  function handleToggle(setId: string, wasCompleted: boolean) {
    onToggleSetCompleted(setId);
    // Only start resting when completing a set, not un-completing one, and if enabled in preferences.
    if (!wasCompleted && preferences.autoRestTimer) {
      setRestingAfterSetId(setId);
    }
  }

  return (
    <Card padding="lg" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <h3 className="font-semibold truncate">{exercise.exerciseName}</h3>
          {lastTime && (
            <p className="text-xs text-foreground-secondary">{lastTime}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsPlateModalOpen(true)}
          className="flex items-center gap-1 rounded-lg bg-surface-elevated/80 px-2 py-1 text-[11px] font-medium text-foreground-secondary hover:bg-brand/15 hover:text-brand transition-colors border border-border/60 shrink-0"
          title="Open plate calculator and warmup ladder"
        >
          <Dumbbell size={12} aria-hidden />
          <span>Plates</span>
        </button>
      </div>
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
                suggest={
                  preferences.showGhostSuggestions && set.weight === null && set.reps === null
                    ? suggest
                    : undefined
                }
                onChangeWeight={(weight) => onLogSet(set.id, { weight })}
                onChangeReps={(reps) => onLogSet(set.id, { reps })}
                onChangeRPE={
                  preferences.trackRpe
                    ? (rpe) => onLogSet(set.id, { rpe })
                    : undefined
                }
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

      <ExercisePlateModal
        isOpen={isPlateModalOpen}
        onClose={() => setIsPlateModalOpen(false)}
        exerciseName={exercise.exerciseName}
        initialWeight={defaultPlateWeight}
        onApplyWeight={(weight) => {
          const targetSet = activeUncompletedSet ?? lastSet;
          if (targetSet) {
            onLogSet(targetSet.id, { weight });
          }
        }}
      />
    </Card>
  );
}
