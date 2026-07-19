"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
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
import type { SessionSetup } from "@/features/session/api/getSessionSetup";
import { useSessionStore } from "@/store/sessionStore";

export interface SessionScreenProps {
  missionId: string;
  /**
   * null for user-plan sessions ("plan-*" ids): those are launched
   * client-side by Train's Start button (user plans live in localStorage,
   * which the server can't resolve), so this screen only ever *resumes*
   * them from the persisted store.
   */
  setup: SessionSetup | null;
}

/**
 * One route, two states, keyed off session.status — per docs/ROUTES.md.
 * "Leave" navigates freely rather than confirming first: per that doc's
 * "pause and keep" wording, the leave-guard means preserving state (already
 * handled by the persisted store), not blocking navigation with a prompt.
 */
export function SessionScreen({ missionId, setup }: SessionScreenProps) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const {
    session,
    history,
    startSession,
    logSet,
    toggleSetCompleted,
    addSet,
    removeSet,
    finishSession,
    clearSession,
  } = useSessionStore();

  // Ghost of the previous performance per exercise — the newest history
  // entry that has a top set for it ("beat this" is the whole game).
  function lastTimeFor(exerciseId: string): string | undefined {
    for (let index = history.length - 1; index >= 0; index--) {
      if (history[index]!.id === session?.id) continue;
      const top = history[index]!.topSets.find(
        (topSet) => topSet.exerciseId === exerciseId,
      );
      if (top) return `Last time: ${top.weightKg} kg × ${top.reps}`;
    }
    return undefined;
  }

  useEffect(() => {
    // Explicitly rehydrate before deciding whether to resume or start fresh
    // — the store uses skipHydration (see sessionStore.ts), and React fires
    // effects bottom-up on mount, so the root-level StoreHydrator's
    // rehydration would otherwise race with (and could clobber) this call.
    // rehydrate() types as `Promise<void> | void` (localStorage reads are
    // synchronous) — Promise.resolve() normalizes both so .then() always runs.
    let cancelled = false;
    void Promise.resolve(useSessionStore.persist.rehydrate()).then(() => {
      if (cancelled) return;
      if (setup) {
        startSession({
          missionId,
          title: setup.mission.title,
          template: setup.template,
          exercises: setup.exercises,
          xpReward: setup.mission.xpReward,
        });
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [missionId, setup, startSession]);

  const elapsedSeconds = useElapsedSeconds(
    session?.startedAt ?? null,
    session?.status === "active",
  );

  // Plan sessions can only resume what the Start button already created —
  // a stale/shared URL with nothing in the store gets an honest state.
  const sessionMatches = session?.missionId === missionId;
  if (!session || !sessionMatches) {
    if (!hydrated || setup) return null;
    return (
      <PageContainer withBottomNav={false}>
        <div className="flex flex-1 flex-col justify-center">
          <EmptyState
            mascot="kix-asleep"
            title="No active session"
            description="This workout isn't running — start it from your plan on Train."
            action={
              <Button onClick={() => router.push("/train")}>Go to Train</Button>
            }
          />
        </div>
      </PageContainer>
    );
  }

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
        <p className="text-sm font-semibold text-foreground-secondary">{session.title}</p>
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
        <p className="text-xs font-semibold tabular-nums text-foreground-secondary">
          {progress.completedSets} of {progress.totalSets} sets
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {session.exercises.map((exercise) => (
          <ExerciseSessionCard
            key={exercise.exerciseId}
            exercise={exercise}
            restSeconds={exercise.restSeconds}
            unit="kg"
            lastTime={lastTimeFor(exercise.exerciseId)}
            suggest={exercise.suggest}
            onLogSet={(setId, patch) => logSet(exercise.exerciseId, setId, patch)}
            onToggleSetCompleted={(setId) => toggleSetCompleted(exercise.exerciseId, setId)}
            onAddSet={() => addSet(exercise.exerciseId)}
            onRemoveSet={(setId) => removeSet(exercise.exerciseId, setId)}
          />
        ))}
      </div>

      {/* Finish is earned, not ambient: enabled once a set is actually
          logged — an all-zero "workout" would pollute the ledger the live
          derivations read. Bailing out entirely is the Leave (X) button. */}
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          fullWidth
          disabled={progress.completedSets === 0}
          onClick={finishSession}
        >
          Finish workout
        </Button>
        {progress.completedSets === 0 && (
          <p className="text-center text-xs text-foreground-secondary">
            Complete a set to finish — or leave with ✕ and resume anytime.
          </p>
        )}
      </div>
    </PageContainer>
  );
}
