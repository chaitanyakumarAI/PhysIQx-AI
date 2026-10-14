import { beforeEach, describe, expect, it } from "vitest";
import type { Exercise } from "@/types/exercise";
import type { WorkoutTemplate } from "@/types/workoutTemplate";
import { useSessionStore } from "./sessionStore";

const bench: Exercise = {
  id: "bench",
  name: "Barbell Bench Press",
  muscleHit: { chest: 70, arms: 30 },
  muscleGroups: ["chest", "arms"],
  equipment: "barbell",
  type: "compound",
  difficulty: "intermediate",
};

const fly: Exercise = {
  id: "fly",
  name: "Cable Fly",
  muscleHit: { chest: 100 },
  muscleGroups: ["chest"],
  equipment: "cable",
  type: "isolation",
  difficulty: "beginner",
};

const template: WorkoutTemplate = {
  id: "t",
  missionId: "m",
  exercises: [
    { exerciseId: "bench", sets: [{ targetReps: 8 }, { targetReps: 8 }], restSeconds: 120 },
    { exerciseId: "fly", sets: [{ targetReps: 12 }, { targetReps: 12 }], restSeconds: 60 },
  ],
};

function start() {
  useSessionStore.getState().startSession({
    missionId: "m",
    title: "Push",
    template,
    exercises: [bench, fly],
    xpReward: 400,
  });
  return useSessionStore.getState().session!;
}

beforeEach(() => {
  useSessionStore.setState({ session: null, history: [] });
});

describe("sessionStore", () => {
  it("denormalizes equipment onto session exercises", () => {
    const session = start();
    expect(session.exercises.map((exercise) => exercise.equipment)).toEqual([
      "barbell",
      "cable",
    ]);
  });

  it("sanitizes logged values", () => {
    const session = start();
    const setId = session.exercises[0]!.sets[0]!.id;
    useSessionStore.getState().logSet("bench", setId, { weight: -20, reps: 500 });
    const logged = useSessionStore.getState().session!.exercises[0]!.sets[0]!;
    expect(logged.weight).toBe(0);
    expect(logged.reps).toBe(300);
  });

  it("completes an empty set with its ghost values", () => {
    const session = start();
    const setId = session.exercises[0]!.sets[0]!.id;
    const result = useSessionStore
      .getState()
      .toggleSetCompleted("bench", setId, { weight: 60, reps: 8 });
    expect(result.ok).toBe(true);
    const done = useSessionStore.getState().session!.exercises[0]!.sets[0]!;
    expect(done).toMatchObject({ completed: true, weight: 60, reps: 8 });
  });

  it("refuses to complete a set that holds no real work", () => {
    const session = start();
    const setId = session.exercises[0]!.sets[0]!.id;
    const { toggleSetCompleted } = useSessionStore.getState();
    expect(toggleSetCompleted("bench", setId)).toEqual({ ok: false, missing: "reps" });
    // Reps alone on a barbell lift are not a set.
    expect(toggleSetCompleted("bench", setId, { weight: null, reps: 8 })).toEqual({
      ok: false,
      missing: "weight",
    });
    expect(useSessionStore.getState().session!.exercises[0]!.sets[0]!.completed).toBe(false);
  });

  it("files a finished workout as completed, dated locally, with proportional XP", () => {
    const session = start();
    const setId = session.exercises[0]!.sets[0]!.id;
    useSessionStore.getState().toggleSetCompleted("bench", setId, { weight: 100, reps: 5 });
    useSessionStore.getState().finishSession();

    const { history } = useSessionStore.getState();
    expect(history).toHaveLength(1);
    const entry = history[0]!;
    expect(entry.status).toBe("completed");
    const completed = new Date(entry.completedAt);
    const localDay = `${completed.getFullYear()}-${String(completed.getMonth() + 1).padStart(2, "0")}-${String(completed.getDate()).padStart(2, "0")}`;
    expect(entry.date).toBe(localDay);
    // 1 of 4 planned sets → a quarter of the reward.
    expect(entry.xpEarned).toBe(100);
    expect(entry.totalVolumeKg).toBe(500);
    expect(entry.setsCompleted).toBe(1);
  });

  it("never double-counts a session finished twice", () => {
    const session = start();
    const setId = session.exercises[0]!.sets[0]!.id;
    useSessionStore.getState().toggleSetCompleted("bench", setId, { weight: 100, reps: 5 });
    useSessionStore.getState().finishSession();
    useSessionStore.getState().finishSession();
    expect(useSessionStore.getState().history).toHaveLength(1);
  });

  it("keeps logged work when a session is abandoned, and drops empty ones", () => {
    start();
    useSessionStore.getState().abandonSession();
    expect(useSessionStore.getState().history).toHaveLength(0);

    useSessionStore.setState({ session: null });
    const session = start();
    const setId = session.exercises[0]!.sets[0]!.id;
    useSessionStore.getState().toggleSetCompleted("bench", setId, { weight: 80, reps: 5 });
    useSessionStore.getState().abandonSession();
    const [entry] = useSessionStore.getState().history;
    expect(entry?.status).toBe("abandoned");
    expect(entry?.setsCompleted).toBe(1);
  });
});
