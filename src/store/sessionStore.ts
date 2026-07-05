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
    const sets: ExerciseSet[] = Array.from(
      { length: templateExercise.targetSets },
      (_, index) => ({
        id: `${templateExercise.exerciseId}-set-${index + 1}`,
        setNumber: index + 1,
        targetReps: templateExercise.targetReps,
        weight: null,
        reps: null,
        completed: false,
      }),
    );
    return {
      exerciseId: templateExercise.exerciseId,
      exerciseName: exercise?.name ?? "Exercise",
      sets,
    };
  });
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

      startSession: ({ missionId, template, exercises, xpReward }) => {
        const current = get().session;
        // Resume rather than recreate if this mission's session is already active.
        if (current && current.missionId === missionId && current.status === "active") {
          return;
        }
        set({
          session: {
            id: `session-${missionId}-${Date.now()}`,
            missionId,
            status: "active",
            startedAt: new Date().toISOString(),
            completedAt: null,
            exercises: buildSessionExercises(template, exercises),
            xpReward,
          },
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
