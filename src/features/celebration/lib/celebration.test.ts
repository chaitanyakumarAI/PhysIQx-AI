import { describe, expect, it } from "vitest";
import { addDaysIso } from "@/lib/dates";
import { computeProgression } from "@/lib/gamification/progression";
import { makeLedger, makeSession, top, trainingBlock } from "@/test/fixtures";
import { aroundWorkout, celebrationLine, describeWorkoutCelebration, hasHighlights } from "./celebration";

// 2026-09-07 is a Monday.
const START = "2026-09-07";

describe("describeWorkoutCelebration", () => {
  it("credits the setup-free first workout and its first badge", () => {
    const first = makeSession(START, { topSets: [top("ex-bench-press", 60, 8)] });
    const ledger = makeLedger({ sessions: [first] });
    const celebration = describeWorkoutCelebration(ledger, first, START);

    expect(celebration.xpGained).toBeGreaterThan(0);
    expect(celebration.xpSources[0]!.source).toBe("workouts");
    expect(celebration.newBadges.map((badge) => badge.id)).toContain("first-rep");
    // The first-ever lift is a baseline, not a record.
    expect(celebration.records).toEqual([]);
  });

  it("reports a new record only when it beats an earlier best", () => {
    const earlier = makeSession(START, { topSets: [top("ex-bench-press", 80, 5, "Bench Press")] });
    const today = addDaysIso(START, 3);
    const better = makeSession(today, { topSets: [top("ex-bench-press", 85, 5, "Bench Press")] });
    const celebration = describeWorkoutCelebration(makeLedger({ sessions: [earlier, better] }), better, today);

    expect(celebration.records).toHaveLength(1);
    expect(celebration.records[0]).toMatchObject({ exerciseName: "Bench Press", previousBest: 93.3 });
    expect(celebration.records[0]!.e1rm).toBeGreaterThan(93.3);
  });

  it("matches the progression engine exactly (no promises Profile won't show)", () => {
    const sessions = trainingBlock(START, 3, [0, 2, 4]);
    const last = sessions.at(-1)!;
    const today = last.date;
    const ledger = makeLedger({ sessions });
    const celebration = describeWorkoutCelebration(ledger, last, today);
    const { before } = aroundWorkout(ledger, last);

    expect(celebration.xpGained).toBe(
      computeProgression(ledger, today).totalXp - computeProgression(before, today).totalXp,
    );
    expect(celebration.levelAfter).toEqual(computeProgression(ledger, today).level);
  });

  it("works when the session isn't in the ledger yet (sample-data mode)", () => {
    const demo = makeLedger({ sessions: trainingBlock(START, 2, [0, 3]) });
    const today = addDaysIso(START, 14);
    const fresh = makeSession(today, { id: "fresh" });
    const celebration = describeWorkoutCelebration(demo, fresh, today);
    expect(celebration.xpGained).toBeGreaterThan(0);
  });

  it("leads with a new rank, then lists the rarest badges first", () => {
    const sessions = trainingBlock(START, 6, [0, 1, 3, 4], (_date, week) => ({
      topSets: [top("ex-bench-press", 80 + week * 5, 5)],
    }));
    const last = sessions.at(-1)!;
    const celebration = describeWorkoutCelebration(makeLedger({ sessions }), last, last.date);
    const firstNonRank = celebration.newBadges.findIndex((badge) => !badge.rankId);
    expect(celebration.newBadges.slice(firstNonRank === -1 ? 0 : firstNonRank).every((badge) => !badge.rankId)).toBe(true);
    const order = ["legendary", "platinum", "gold", "silver", "bronze"];
    const grades = celebration.newBadges.filter((badge) => !badge.rankId).map((badge) => order.indexOf(badge.grade));
    expect([...grades].sort((a, b) => a - b)).toEqual(grades);
  });
});

describe("celebrationLine", () => {
  const base = describeWorkoutCelebration(
    makeLedger({ sessions: [makeSession(START)] }),
    makeSession(START),
    START,
  );

  it("lets the biggest moment speak", () => {
    const levelUp = { ...base, newBadges: [], records: [], levelAfter: { ...base.levelBefore, level: base.levelBefore.level + 1 } };
    expect(celebrationLine(levelUp, "x")).toMatchObject({ speaker: "kix", expression: "joy" });

    const legendary = {
      ...levelUp,
      newBadges: [{ ...base.newBadges[0]!, grade: "legendary" as const, name: "Anniversary" }],
    };
    expect(celebrationLine(legendary, "x")).toMatchObject({ speaker: "nyra", expression: "nod" });
  });

  it("names a single new record", () => {
    const quiet = { ...base, newBadges: [], levelAfter: base.levelBefore };
    const line = celebrationLine(
      { ...quiet, records: [{ exerciseId: "b", exerciseName: "Bench Press", e1rm: 100, previousBest: 95 }] },
      "x",
    );
    expect(line.text).toContain("Bench Press");
  });

  it("varies the quiet-day line deterministically", () => {
    const quiet = { ...base, newBadges: [], records: [], levelAfter: base.levelBefore };
    expect(hasHighlights(quiet)).toBe(false);
    expect(celebrationLine(quiet, "a")).toEqual(celebrationLine(quiet, "a"));
    const speakers = new Set(["a", "b"].map((seed) => celebrationLine(quiet, seed).speaker));
    expect(speakers.size).toBe(2);
  });
});
