"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";
import { ExerciseSessionCard } from "@/features/session/components/ExerciseSessionCard";
import { SessionSummaryCard } from "@/features/session/components/SessionSummaryCard";
import { SessionTimer } from "@/features/session/components/SessionTimer";
import { useElapsedSeconds } from "@/features/session/hooks/useElapsedSeconds";
import { computeSessionProgress, computeSessionVolume } from "@/features/session/lib/derive";
import { useSessionStore } from "@/store/sessionStore";
import type { Exercise } from "@/types/exercise";
import type { Mission } from "@/types/training";
import type { WorkoutTemplate } from "@/types/workoutTemplate";

export interface SessionScreenProps {
  missionId: string;
  mission: Mission;
  template: WorkoutTemplate;
  exercises: Exercise[];
}

/**
 * One route, two states, keyed off session.status — per docs/ROUTES.md.
 * "Leave" navigates freely rather than confirming first: per that doc's
 * "pause and keep" wording, the leave-guard means preserving state (already
 * handled by the persisted store), not blocking navigation with a prompt.
 */
export function SessionScreen({ missionId, mission, template, exercises }: SessionScreenProps) {
  const router = useRouter();
  const { session, startSession, logSet, toggleSetCompleted, finishSession, clearSession } =
    useSessionStore();

  useEffect(() => {
    // Explicitly rehydrate before deciding whether to resume or start fresh
    // — the store uses skipHydration (see sessionStore.ts), and React fires
    // effects bottom-up on mount, so the root-level StoreHydrator's
    // rehydration would otherwise race with (and could clobber) this call.
    // Doing it locally makes this effect correct regardless of that timing.
    // rehydrate() types as `Promise<void> | void` (localStorage reads are
    // synchronous) — Promise.resolve() normalizes both so .then() always runs.
    let cancelled = false;
    void Promise.resolve(useSessionStore.persist.rehydrate()).then(() => {
      if (!cancelled) {
        startSession({ missionId, template, exercises, xpReward: mission.xpReward });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [missionId, template, exercises, mission.xpReward, startSession]);

  const elapsedSeconds = useElapsedSeconds(
    session?.startedAt ?? null,
    session?.status === "active",
  );

  if (!session) return null;

  function handleDone() {
    clearSession();
    router.push("/home");
  }

  if (session.status === "completed") {
    // completedAt/startedAt are exact timestamps, more accurate for the
    // final duration than the live hook (which stops ticking the instant
    // status flips and can be up to ~1s stale).
    const durationSeconds = session.completedAt
      ? Math.floor(
          (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) /
            1000,
        )
      : elapsedSeconds;

    return (
      <PageContainer withBottomNav={false}>
        <div className="flex flex-1 flex-col justify-center gap-6">
          <SessionSummaryCard
            durationSeconds={durationSeconds}
            volume={computeSessionVolume(session)}
            unit="kg"
            xpReward={session.xpReward}
          />
          <Button size="lg" fullWidth onClick={handleDone}>
            Done
          </Button>
        </div>
      </PageContainer>
    );
  }

  const progress = computeSessionProgress(session);

  return (
    <PageContainer withBottomNav={false}>
      <div className="flex items-center justify-between">
        <IconButton label="Leave session" variant="ghost" onClick={() => router.push("/home")}>
          <X size={iconSize.sm} aria-hidden />
        </IconButton>
        <p className="text-sm font-semibold text-foreground-secondary">{mission.title}</p>
        <span aria-hidden className="size-11" />
      </div>

      <div className="flex flex-col items-center gap-3">
        <SessionTimer seconds={elapsedSeconds} />
        <ProgressBar
          value={progress.completedSets}
          max={progress.totalSets}
          className="w-full"
          aria-label={`${progress.completedSets} of ${progress.totalSets} sets complete`}
        />
      </div>

      <div className="flex flex-col gap-4">
        {session.exercises.map((exercise, index) => {
          const templateExercise = template.exercises[index];
          return (
            <ExerciseSessionCard
              key={exercise.exerciseId}
              exercise={exercise}
              restSeconds={templateExercise?.restSeconds ?? 60}
              unit="kg"
              onLogSet={(setId, patch) => logSet(exercise.exerciseId, setId, patch)}
              onToggleSetCompleted={(setId) => toggleSetCompleted(exercise.exerciseId, setId)}
            />
          );
        })}
      </div>

      <Button size="lg" fullWidth onClick={finishSession}>
        Finish workout
      </Button>
    </PageContainer>
  );
}
