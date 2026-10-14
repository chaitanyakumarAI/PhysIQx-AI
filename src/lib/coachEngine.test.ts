import { describe, expect, it } from "vitest";
import { mockExercises } from "@/data/exercises";
import { baseProfile, makeCardio, makeLedger, makeSession, top, trainingBlock } from "@/test/fixtures";
import type { Ledger } from "@/types/ledger";
import type { UserPlan } from "@/types/plan";
import { deriveAthleteState } from "./athleteState";
import type { ActiveSessionInfo } from "./coachEngine";
import { addDaysIso } from "./dates";

const plan: UserPlan = {
  id: "p1",
  name: "Upper/Lower",
  days: [
    {
      id: "upper",
      name: "Upper",
      exercises: [{ exerciseId: "ex-bench-press", sets: [{ targetReps: 8 }], restSeconds: 120 }],
    },
    {
      id: "lower",
      name: "Lower",
      exercises: [{ exerciseId: "ex-back-squat", sets: [{ targetReps: 8 }], restSeconds: 150 }],
    },
  ],
};

const START = "2026-09-07"; // Monday

function coachFor(
  ledger: Ledger,
  todayIso: string,
  activeSession: ActiveSessionInfo | null = null,
) {
  return deriveAthleteState({
    ledger,
    todayIso,
    activePlan: plan,
    activeSession,
    catalog: mockExercises,
  }).coach;
}

const ids = (recommendations: { id: string }[]) => recommendations.map((entry) => entry.id);

describe("generateCoachRecommendations", () => {
  it("leads a brand-new athlete to their first workout", () => {
    const [lead] = coachFor(makeLedger(), START);
    expect(lead!.id).toBe("first-workout");
    expect(lead!.action?.href).toBe("/session/plan-p1-upper");
  });

  it("always puts an unfinished workout first", () => {
    const [lead] = coachFor(makeLedger(), START, {
      missionId: "plan-p1-upper",
      title: "Upper",
      completedSets: 3,
      totalSets: 12,
    });
    expect(lead!.id).toBe("resume-session");
    expect(lead!.body).toContain("3 of 12");
  });

  it("never suggests a first workout while one is already running", () => {
    const recommendations = coachFor(makeLedger(), START, {
      missionId: "plan-p1-upper",
      title: "Upper",
      completedSets: 0,
      totalSets: 12,
    });
    expect(ids(recommendations)).not.toContain("first-workout");
  });

  it("welcomes a comeback after a week away", () => {
    const ledger = makeLedger({ sessions: [makeSession(START)] });
    expect(coachFor(ledger, addDaysIso(START, 10))[0]!.id).toBe("comeback");
  });

  it("calls a rest day after enough consecutive days, and drops train-now advice", () => {
    const today = addDaysIso(START, 4);
    const sessions = [0, 1, 2, 3].map((offset) => makeSession(addDaysIso(START, offset)));
    const recommendations = coachFor(makeLedger({ sessions }), today);
    expect(recommendations[0]!.id).toBe("rest-day");
    expect(recommendations.some((entry) => entry.stance === "train")).toBe(false);
  });

  it("celebrates today's finished workout and names what's next", () => {
    const today = addDaysIso(START, 2);
    const session = makeSession(today, {
      missionId: "plan-p1-upper",
      totalVolumeKg: 4200,
      xpEarned: 175,
    });
    const [lead] = coachFor(makeLedger({ sessions: [makeSession(START), session] }), today);
    expect(lead!.id).toBe("done-today");
    expect(lead!.body).toContain("Next up: Lower");
  });

  it("celebrates a fresh personal record", () => {
    const today = addDaysIso(START, 7);
    const sessions = [
      makeSession(START, { missionId: "plan-p1-upper", topSets: [top("ex-bench-press", 80, 8, "Bench")] }),
      makeSession(addDaysIso(today, -1), {
        missionId: "plan-p1-lower",
        topSets: [top("ex-bench-press", 85, 8, "Bench")],
      }),
    ];
    expect(ids(coachFor(makeLedger({ sessions }), today))).toContain("pr-ex-bench-press-" + addDaysIso(today, -1));
  });

  it("suggests the next load when every rep was hit last time", () => {
    const sessions = [
      makeSession(START, { missionId: "plan-p1-lower", topSets: [top("ex-bench-press", 80, 8)] }),
    ];
    const recommendations = coachFor(makeLedger({ sessions }), addDaysIso(START, 2));
    const progress = recommendations.find((entry) => entry.id === "progress-ex-bench-press");
    expect(progress?.body).toContain("82.5 kg × 8");
  });

  it("flags a stalled lift", () => {
    const today = "2026-10-20";
    const sessions = ["2026-09-25", "2026-10-06", "2026-10-13", "2026-10-17"].map((date, index) =>
      makeSession(date, { topSets: [top("ex-bench-press", index === 0 ? 90 : 87.5, 8, "Bench")] }),
    );
    expect(ids(coachFor(makeLedger({ sessions }), today))).toContain("stalled-ex-bench-press");
  });

  it("asks for a weigh-in and a build when they're missing", () => {
    const recommendations = coachFor(makeLedger({ sessions: [makeSession(START)] }), addDaysIso(START, 1));
    expect(ids(recommendations)).toEqual(expect.arrayContaining(["weigh-in", "pick-build"]));
  });

  it("keeps every body to two sentences", () => {
    const ledger = makeLedger({
      sessions: trainingBlock(START, 5, [0, 2, 4]),
      cardio: [makeCardio(START, 30)],
      profile: { ...baseProfile, currentBuild: "skinnyfat" },
    });
    for (const recommendation of coachFor(ledger, addDaysIso(START, 36))) {
      const sentences = recommendation.body.match(/[^.!?]+[.!?]+/g) ?? [];
      expect(sentences.length).toBeLessThanOrEqual(2);
    }
  });
});
