import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Exercise } from "@/types/exercise";
import type { WorkoutTemplate } from "@/types/workoutTemplate";
import type { ExerciseSet, SessionExercise, WorkoutSession } from "@/types/workoutSession";

/**
 * The one piece of genuine offline-durability this mock phase actually
 * needs: an in-progress session must survive a refresh/app-kill (see
 * docs/DATA_MODELS.md's WorkoutSession note). This is frontend-only
 * persistence (localStorage), not the real backend/IndexedDB sync layer
 * that arrives with Phase 4's Database — it satisfies the requirement at
 * the layer this phase actually owns, and the store's action shape is the
 * natural place to add a real sync call later without reshaping state.
 */

interface StartSessionParams {
  missionId: string;
  title: string;
  template: WorkoutTemplate;
  exercises: Exercise[];
  xpReward: number;
}

interface SetPatch {
  weight?: number | null;
  reps?: number | null;
}

interface SessionStoreState {
  session: WorkoutSession | null;
  startSession: (params: StartSessionParams) => void;
  logSet: (exerciseId: string, setId: string, patch: SetPatch) => void;
  toggleSetCompleted: (exerciseId: string, setId: string) => void;
  /** Mid-workout set count is the athlete's call — any number of sets. */
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  finishSession: () => void;
  abandonSession: () => void;
  clearSession: () => void;
}

function buildSessionExercises(
  template: WorkoutTemplate,
  exercises: Exercise[],
): SessionExercise[] {
  return template.exercises.map((templateExercise) => {
    const exercise = exercises.find((item) => item.id === templateExercise.exerciseId);
    // One planned set per template entry — per-set reps, any count.
    const sets: ExerciseSet[] = templateExercise.sets.map((templateSet, index) => ({
      id: `${templateExercise.exerciseId}-set-${index + 1}`,
      setNumber: index + 1,
      targetReps: templateSet.targetReps,
      weight: null,
      reps: null,
      completed: false,
    }));
    return {
      exerciseId: templateExercise.exerciseId,
      exerciseName: exercise?.name ?? "Exercise",
      restSeconds: templateExercise.restSeconds,
      sets,
    };
  });
}

/** Re-derive 1-based setNumbers after an add/remove. */
function renumber(sets: ExerciseSet[]): ExerciseSet[] {
  return sets.map((exerciseSet, index) => ({ ...exerciseSet, setNumber: index + 1 }));
}

function updateSet(
  session: WorkoutSession,
  exerciseId: string,
  setId: string,
  updater: (exerciseSet: ExerciseSet) => ExerciseSet,
): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map((sessionExercise) =>
      sessionExercise.exerciseId !== exerciseId
        ? sessionExercise
        : {
            ...sessionExercise,
            sets: sessionExercise.sets.map((exerciseSet) =>
              exerciseSet.id === setId ? updater(exerciseSet) : exerciseSet,
            ),
          },
    ),
  };
}

export const useSessionStore = create<SessionStoreState>()(
  persist(
    (set, get) => ({
      session: null,

      startSession: ({ missionId, title, template, exercises, xpReward }) => {
        const current = get().session;
        // Resume rather than recreate if this mission's session is already active.
        if (current && current.missionId === missionId && current.status === "active") {
          return;
        }
        set({
          session: {
            id: `session-${missionId}-${Date.now()}`,
            missionId,
            title,
            status: "active",
            startedAt: new Date().toISOString(),
            completedAt: null,
            exercises: buildSessionExercises(template, exercises),
            xpReward,
          },
        });
      },

      addSet: (exerciseId) => {
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              exercises: state.session.exercises.map((sessionExercise) => {
                if (sessionExercise.exerciseId !== exerciseId) return sessionExercise;
                const lastSet = sessionExercise.sets.at(-1);
                const nextSet: ExerciseSet = {
                  // Time-based id: stays unique even after removals.
                  id: `${exerciseId}-set-${Date.now()}`,
                  setNumber: sessionExercise.sets.length + 1,
                  targetReps: lastSet?.targetReps ?? 10,
                  weight: null,
                  reps: null,
                  completed: false,
                };
                return { ...sessionExercise, sets: [...sessionExercise.sets, nextSet] };
              }),
            },
          };
        });
      },

      removeSet: (exerciseId, setId) => {
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              exercises: state.session.exercises.map((sessionExercise) => {
                if (sessionExercise.exerciseId !== exerciseId) return sessionExercise;
                // An exercise always keeps at least one set.
                if (sessionExercise.sets.length <= 1) return sessionExercise;
                return {
                  ...sessionExercise,
                  sets: renumber(
                    sessionExercise.sets.filter((exerciseSet) => exerciseSet.id !== setId),
                  ),
                };
              }),
            },
          };
        });
      },

      logSet: (exerciseId, setId, patch) => {
        set((state) => {
          if (!state.session) return state;
          return {
            session: updateSet(state.session, exerciseId, setId, (exerciseSet) => ({
              ...exerciseSet,
              ...patch,
            })),
          };
        });
      },

      toggleSetCompleted: (exerciseId, setId) => {
        set((state) => {
          if (!state.session) return state;
          return {
            session: updateSet(state.session, exerciseId, setId, (exerciseSet) => ({
              ...exerciseSet,
              completed: !exerciseSet.completed,
            })),
          };
        });
      },

      finishSession: () => {
        set((state) =>
          state.session
            ? {
                session: {
                  ...state.session,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                },
              }
            : state,
        );
      },

      abandonSession: () => {
        set((state) =>
          state.session ? { session: { ...state.session, status: "abandoned" } } : state,
        );
      },

      clearSession: () => set({ session: null }),
    }),
    {
      name: "physiqx-session",
      partialize: (state) => ({ session: state.session }),
      // skipHydration: rehydrating automatically at store-creation time
      // would make the client's first render disagree with the server's
      // (which never sees localStorage) — a real hydration-mismatch risk
      // for ResumeSessionBanner, shown on every tab screen. StoreHydrator
      // triggers the real rehydration explicitly, once, after mount.
      skipHydration: true,
    },
  ),
);
