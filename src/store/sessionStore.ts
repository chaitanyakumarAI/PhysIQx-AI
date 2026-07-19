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
  /** RPE 1–10 logged on the completed set. */
  rpe?: number | null;
}

/** The best (heaviest) logged set of one exercise in one session. */
export interface TopSet {
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
}

/**
 * What a finished workout leaves behind — the ledger that live progress
 * derivations (Home spotlight, coach insights) and the strength formula
 * read. Computed once at finish time from the completed sets.
 */
export interface CompletedSessionSummary {
  id: string;
  missionId: string;
  title: string;
  /** ISO date (yyyy-mm-dd) of completion. */
  date: string;
  completedAt: string;
  durationSec: number;
  setsCompleted: number;
  totalVolumeKg: number;
  xpEarned: number;
  topSets: TopSet[];
}

/** Keep the ledger bounded — localStorage, not a database. */
const HISTORY_LIMIT = 60;

function summarize(session: WorkoutSession, completedAt: string): CompletedSessionSummary {
  let setsCompleted = 0;
  let totalVolumeKg = 0;
  const topSets: TopSet[] = [];
  for (const exercise of session.exercises) {
    let best: TopSet | null = null;
    for (const exerciseSet of exercise.sets) {
      if (!exerciseSet.completed) continue;
      setsCompleted += 1;
      const weight = exerciseSet.weight ?? 0;
      const reps = exerciseSet.reps ?? 0;
      totalVolumeKg += weight * reps;
      if (weight > 0 && reps > 0 && (!best || weight > best.weightKg)) {
        best = {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          weightKg: weight,
          reps,
        };
      }
    }
    if (best) topSets.push(best);
  }
  const durationSec = Math.max(
    0,
    Math.round(
      (new Date(completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000,
    ),
  );
  return {
    id: session.id,
    missionId: session.missionId,
    title: session.title,
    date: completedAt.slice(0, 10),
    completedAt,
    durationSec,
    setsCompleted,
    totalVolumeKg: Math.round(totalVolumeKg),
    xpEarned: session.xpReward,
    topSets,
  };
}

interface SessionStoreState {
  session: WorkoutSession | null;
  /** Completed-workout ledger, newest last. */
  history: CompletedSessionSummary[];
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
      toFailure: templateSet.toFailure,
      durationSeconds: templateSet.durationSeconds,
      weight: null,
      reps: null,
      rpe: null,
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
      history: [],

      startSession: ({ missionId, title, template, exercises, xpReward }) => {
        const current = get().session;
        // Resume rather than recreate if this mission's session is already active.
        if (current && current.missionId === missionId && current.status === "active") {
          return;
        }
        // A *different* mission was started while one is active — abandon the
        // current one so its data lands in history rather than being silently
        // overwritten. DATA_MODELS.md: "abandoned work is saved, never discarded."
        if (current && current.status === "active") {
          const abandonedAt = new Date().toISOString();
          set((state) => ({
            history: [
              ...state.history,
              summarize(current, abandonedAt),
            ].slice(-HISTORY_LIMIT),
          }));
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
                  rpe: null,
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
        set((state) => {
          if (!state.session) return state;
          const completedAt = new Date().toISOString();
          return {
            session: { ...state.session, status: "completed", completedAt },
            history: [
              ...state.history,
              summarize(state.session, completedAt),
            ].slice(-HISTORY_LIMIT),
          };
        });
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
      partialize: (state) => ({ session: state.session, history: state.history }),
      // skipHydration: rehydrating automatically at store-creation time
      // would make the client's first render disagree with the server's
      // (which never sees localStorage) — a real hydration-mismatch risk
      // for ResumeSessionBanner, shown on every tab screen. StoreHydrator
      // triggers the real rehydration explicitly, once, after mount.
      skipHydration: true,
    },
  ),
);
