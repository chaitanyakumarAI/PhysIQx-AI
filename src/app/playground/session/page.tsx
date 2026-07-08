"use client";

import { useEffect } from "react";
import { mockExercises } from "@/data/exercises";
import { mockTodayMission } from "@/data/mission";
import { mockPushDayATemplate } from "@/data/workoutTemplates";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { ExerciseSessionCard } from "@/features/session/components/ExerciseSessionCard";
import { SessionSummaryCard } from "@/features/session/components/SessionSummaryCard";
import { SessionTimer } from "@/features/session/components/SessionTimer";
import { useElapsedSeconds } from "@/features/session/hooks/useElapsedSeconds";
import { computeSessionProgress, computeSessionVolume } from "@/features/session/lib/derive";
import { useSessionStore } from "@/store/sessionStore";

/**
 * Dev-only verification harness for the Session feature layer — starts a
 * real session against the Zustand store and renders every state (active
 * logging, rest timers, completed summary). Not the session screen: no
 * route param, no leave-guard, no resume-banner integration.
 */
export default function SessionPlaygroundPage() {
  const { session, startSession, logSet, toggleSetCompleted, finishSession, clearSession } =
    useSessionStore();

  useEffect(() => {
    // See SessionScreen for why this rehydrates locally before starting
    // rather than relying on the root StoreHydrator's timing.
    let cancelled = false;
    void Promise.resolve(useSessionStore.persist.rehydrate()).then(() => {
      if (!cancelled) {
        startSession({
          missionId: mockTodayMission.id,
          title: mockTodayMission.title,
          template: mockPushDayATemplate,
          exercises: mockExercises,
          xpReward: mockTodayMission.xpReward,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [startSession]);

  const elapsedSeconds = useElapsedSeconds(
    session?.startedAt ?? null,
    session?.status === "active",
  );

  if (!session) return null;

  const progress = computeSessionProgress(session);
  const volume = computeSessionVolume(session);

  return (
    <PageContainer withBottomNav={false}>
      <Section title="Session feature — component preview">
        {session.status === "completed" ? (
          <SessionSummaryCard
            durationSeconds={elapsedSeconds}
            volume={volume}
            unit="kg"
            xpReward={session.xpReward}
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <SessionTimer seconds={elapsedSeconds} />
              <span className="text-sm text-foreground-secondary">
                {progress.completedSets}/{progress.totalSets} sets
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {session.exercises.map((exercise, index) => {
                const templateExercise = mockPushDayATemplate.exercises[index];
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
          </>
        )}
        <Button variant="ghost" fullWidth onClick={clearSession}>
          Reset demo session
        </Button>
      </Section>
    </PageContainer>
  );
}
