import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Exercise } from "@/types/exercise";
import type { WorkoutTemplate } from "@/types/workoutTemplate";
import type { ExerciseSet, SessionExercise, WorkoutSession } from "@/types/workoutSession";
import { computeOverloadSuggestion } from "@/lib/progression";
import { localIsoFromTimestamp } from "@/lib/dates";
import {
  computeEarnedXp,
  resolveCompletionValues,
  sanitizeReps,
  sanitizeRpe,
  sanitizeWeight,
  type CompletionResult,
  type SetValues,
} from "@/features/session/lib/setValidation";

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
  /** Average RPE across completed sets where RPE was logged. */
  avgRpe?: number;
  status?: "active" | "completed" | "abandoned";
}

/**
 * Bounded so localStorage can't overflow, but generous: a summary is ~1 KB,
 * so 1,000 workouts (years of training) is ~1 MB. Guests have no server
 * copy — trimming here would silently delete their PRs and streak history.
 */
export const HISTORY_LIMIT = 1000;

type FinalStatus = Exclude<CompletedSessionSummary["status"], "active" | undefined>;

export function summarize(
  session: WorkoutSession,
  completedAt: string,
  status: FinalStatus,
): CompletedSessionSummary {
  let setsCompleted = 0;
  let totalSets = 0;
  let totalVolumeKg = 0;
  let totalRpe = 0;
  let rpeCount = 0;
  const topSets: TopSet[] = [];
  for (const exercise of session.exercises) {
    let best: TopSet | null = null;
    for (const exerciseSet of exercise.sets) {
      totalSets += 1;
      if (!exerciseSet.completed) continue;
      const weight = Math.max(0, exerciseSet.weight ?? 0);
      const reps = Math.max(0, exerciseSet.reps ?? 0);
      // A "completed" set with no reps holds no work (legacy data could).
      if (reps === 0) continue;
      setsCompleted += 1;
      totalVolumeKg += weight * reps;
      if (exerciseSet.rpe && exerciseSet.rpe > 0) {
        totalRpe += exerciseSet.rpe;
        rpeCount += 1;
      }
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
    date: localIsoFromTimestamp(completedAt),
    completedAt,
    durationSec,
    setsCompleted,
    totalVolumeKg: Math.round(totalVolumeKg),
    xpEarned: computeEarnedXp(session.xpReward, setsCompleted, totalSets),
    topSets,
    avgRpe: rpeCount > 0 ? Math.round((totalRpe / rpeCount) * 10) / 10 : undefined,
    status,
  };
}

/** Appends a summary to the ledger, replacing any earlier entry for the
 *  same session id (a re-finish must never double-count). */
function appendToHistory(
  history: CompletedSessionSummary[],
  summary: CompletedSessionSummary,
): CompletedSessionSummary[] {
  return [...history.filter((entry) => entry.id !== summary.id), summary].slice(
    -HISTORY_LIMIT,
  );
}

interface SessionStoreState {
  session: WorkoutSession | null;
  /** Completed-workout ledger, newest last. */
  history: CompletedSessionSummary[];
  startSession: (params: StartSessionParams) => void;
  logSet: (exerciseId: string, setId: string, patch: SetPatch) => void;
  /**
   * Completes (or un-completes) a set. Empty fields take the `ghost` values
   * the row was showing. Fails, naming the missing field, when the set
   * still holds no real work.
   */
  toggleSetCompleted: (
    exerciseId: string,
    setId: string,
    ghost?: Partial<SetValues> | null,
  ) => CompletionResult;
  /** Mid-workout set count is the athlete's call — any number of sets. */
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  finishSession: () => void;
  abandonSession: () => void;
  clearSession: () => void;
}

/**
 * Computes progressive overload suggestion using equipment-aware double progression.
 */
function computeSuggestion(
  exerciseId: string,
  history: CompletedSessionSummary[],
  targetReps: number,
  exercise?: Exercise,
): SessionExercise["suggest"] {
  const suggestion = computeOverloadSuggestion({
    exerciseId,
    history,
    targetReps,
    equipment: exercise?.equipment,
    exerciseType: exercise?.type,
  });

  if (!suggestion) return null;
  return { weightKg: suggestion.weightKg, reps: suggestion.reps };
}

function buildSessionExercises(
  template: WorkoutTemplate,
  exercises: Exercise[],
  history: CompletedSessionSummary[],
): SessionExercise[] {
  return template.exercises.map((templateExercise) => {
    const exercise = exercises.find((item) => item.id === templateExercise.exerciseId);
    const firstTargetReps = templateExercise.sets[0]?.targetReps ?? 10;
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
      equipment: exercise?.equipment,
      sets,
      suggest: computeSuggestion(templateExercise.exerciseId, history, firstTargetReps, exercise),
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
          const abandoned = summarize(current, new Date().toISOString(), "abandoned");
          // Nothing logged = nothing to keep; an empty entry is just noise.
          if (abandoned.setsCompleted > 0) {
            set((state) => ({ history: appendToHistory(state.history, abandoned) }));
          }
        }
        set({
          session: {
            id: `session-${missionId}-${Date.now()}`,
            missionId,
            title,
            status: "active",
            startedAt: new Date().toISOString(),
            completedAt: null,
            exercises: buildSessionExercises(template, exercises, get().history),
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
            session: updateSet(state.session, exerciseId, setId, (exerciseSet) => {
              const next = { ...exerciseSet };
              if ("weight" in patch) next.weight = sanitizeWeight(patch.weight);
              if ("reps" in patch) {
                next.reps = sanitizeReps(patch.reps, Boolean(exerciseSet.durationSeconds));
              }
              if ("rpe" in patch) next.rpe = sanitizeRpe(patch.rpe);
              return next;
            }),
          };
        });
      },

      toggleSetCompleted: (exerciseId, setId, ghost) => {
        const session = get().session;
        const owner = session?.exercises.find(
          (sessionExercise) => sessionExercise.exerciseId === exerciseId,
        );
        const target = owner?.sets.find((exerciseSet) => exerciseSet.id === setId);
        if (!session || !owner || !target) return { ok: false, missing: "reps" };

        if (target.completed) {
          set({
            session: updateSet(session, exerciseId, setId, (exerciseSet) => ({
              ...exerciseSet,
              completed: false,
            })),
          });
          return { ok: true, values: { weight: target.weight, reps: target.reps } };
        }

        const result = resolveCompletionValues(target, ghost, owner.equipment);
        if (!result.ok) return result;
        set({
          session: updateSet(session, exerciseId, setId, (exerciseSet) => ({
            ...exerciseSet,
            ...result.values,
            completed: true,
          })),
        });
        return result;
      },

      finishSession: () => {
        set((state) => {
          if (!state.session) return state;
          const completedAt = new Date().toISOString();
          return {
            session: { ...state.session, status: "completed", completedAt },
            history: appendToHistory(
              state.history,
              summarize(state.session, completedAt, "completed"),
            ),
          };
        });
      },

      abandonSession: () => {
        set((state) => {
          if (!state.session) return state;
          // "Abandoned work is saved, never discarded" (DATA_MODELS.md).
          const abandoned = summarize(state.session, new Date().toISOString(), "abandoned");
          return {
            session: { ...state.session, status: "abandoned" },
            history:
              abandoned.setsCompleted > 0
                ? appendToHistory(state.history, abandoned)
                : state.history,
          };
        });
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
