import { describe, expect, it } from "vitest";
import { mockExercises } from "@/data/exercises";
import { deriveAthleteState } from "@/lib/athleteState";
import { buildDemoData } from "./demoLedger";

describe("buildDemoData", () => {
  const today = "2026-10-14";
  const demo = buildDemoData(today);

  it("is deterministic", () => {
    expect(buildDemoData(today)).toEqual(demo);
  });

  it("produces ten weeks of real-looking training ending before today", () => {
    expect(demo.ledger.sessions.length).toBeGreaterThan(30);
    expect(demo.ledger.sessions.every((session) => session.date < today)).toBe(true);
    expect(demo.ledger.cardio.length).toBeGreaterThan(10);
    expect(demo.ledger.weighIns.length).toBe(10);
  });

  it("drives every engine into an active, coherent state", () => {
    const state = deriveAthleteState({
      ledger: demo.ledger,
      todayIso: today,
      activePlan: demo.plan,
      activeSession: null,
      catalog: mockExercises,
    });
    expect(state.score.state).toBe("active");
    expect(state.score.score).toBeGreaterThan(50);
    expect(state.score.pillars.every((pillar) => pillar.status !== "untracked")).toBe(true);
    expect(state.todaysWorkout?.status).toBe("ready");
    expect(state.coach.length).toBeGreaterThan(0);
    expect(state.load.status).not.toBe("baseline");
  });
});
