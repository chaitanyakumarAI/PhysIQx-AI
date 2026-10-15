import { describe, expect, it } from "vitest";
import { baseProfile, makeCardio, makeLedger, makeSession, top, trainingBlock } from "@/test/fixtures";
import { addDaysIso } from "../dates";
import { buildDemoData } from "../demo/demoLedger";
import { COLLECTIBLES, FAMILIES, MILESTONES } from "./catalog";
import { levelForXp, levelStatus, rankForLevel, xpForLevel } from "./levels";
import { computeProgression, XP_RULES } from "./progression";

const START = "2026-09-07"; // Monday

describe("levels", () => {
  it("gets harder every level", () => {
    let previousCost = 0;
    for (let level = 2; level <= 100; level++) {
      const cost = xpForLevel(level) - xpForLevel(level - 1);
      expect(cost).toBeGreaterThan(previousCost);
      previousCost = cost;
    }
  });

  it("matches the documented thresholds", () => {
    expect(xpForLevel(2)).toBe(500);
    expect(xpForLevel(5)).toBe(4000);
    expect(xpForLevel(10)).toBe(13500);
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(13_499)).toBe(9);
    expect(levelForXp(13_500)).toBe(10);
  });

  it("reports progress inside a level and the rank", () => {
    const status = levelStatus(xpForLevel(10) + 100);
    expect(status.level).toBe(10);
    expect(status.xpIntoLevel).toBe(100);
    expect(status.rank.name).toBe("Bronze");
    expect(status.nextRank?.name).toBe("Silver");
    expect(rankForLevel(1).name).toBe("Rookie");
    expect(rankForLevel(100).name).toBe("Legend");
  });
});

describe("catalog", () => {
  it("has 70 collectibles with unique ids", () => {
    expect(FAMILIES).toHaveLength(13);
    expect(MILESTONES).toHaveLength(10);
    expect(COLLECTIBLES).toHaveLength(70);
    expect(new Set(COLLECTIBLES.map((item) => item.id)).size).toBe(70);
  });

  it("gates gold and platinum tiers behind levels", () => {
    const gold = COLLECTIBLES.find((item) => item.id === "iron-ledger-gold")!;
    const platinum = COLLECTIBLES.find((item) => item.id === "iron-ledger-platinum")!;
    expect(gold.minLevel).toBe(10);
    expect(platinum.minLevel).toBe(25);
  });
});

describe("computeProgression", () => {
  it("starts at level 1 with nothing earned", () => {
    const state = computeProgression(makeLedger({ profile: { ...baseProfile, goal: null } }), START);
    expect(state.totalXp).toBe(0);
    expect(state.level.level).toBe(1);
    expect(state.earnedCount).toBe(0);
  });

  it("reaches level 2 with setup and a first workout", () => {
    const state = computeProgression(makeLedger({ sessions: [makeSession(START)] }), START);
    // 300 workout + 150 setup + 50 First Rep.
    expect(state.totalXp).toBe(500);
    expect(state.level.level).toBe(2);
    const firstRep = state.collectibles.find((item) => item.id === "first-rep")!;
    expect(firstRep).toMatchObject({ status: "earned", earnedOn: START });
  });

  it("dates tier badges by when the threshold was crossed", () => {
    const sessions = trainingBlock(START, 3, [0, 1, 3, 4]); // 12 workouts
    const state = computeProgression(makeLedger({ sessions }), addDaysIso(START, 21));
    const bronze = state.collectibles.find((item) => item.id === "iron-ledger-bronze")!;
    expect(bronze.status).toBe("earned");
    expect(bronze.earnedOn).toBe(sessions[9]!.date);
    const silver = state.collectibles.find((item) => item.id === "iron-ledger-silver")!;
    expect(silver.status).toBe("in-progress");
    expect(silver.hint).toBe("38 more workouts");
  });

  it("seals level-gated tiers until the level is reached", () => {
    const state = computeProgression(
      makeLedger({ sessions: [makeSession(START, { setsCompleted: 50 })] }),
      START,
    );
    const silver = state.collectibles.find((item) => item.id === "big-session-silver")!;
    const gold = state.collectibles.find((item) => item.id === "big-session-gold")!;
    const platinum = state.collectibles.find((item) => item.id === "big-session-platinum")!;
    expect(silver.status).toBe("earned");
    expect(gold).toMatchObject({ status: "sealed", hint: "Unlocks at level 10" });
    expect(platinum.status).toBe("sealed");
  });

  it("caps cardio XP per activity and ignores short strolls", () => {
    const state = computeProgression(
      makeLedger({
        profile: { ...baseProfile, goal: null },
        cardio: [makeCardio(START, 90, "run"), makeCardio(addDaysIso(START, 1), 10, "walk")],
      }),
      addDaysIso(START, 1),
    );
    expect(state.xpBySource.cardio).toBe(XP_RULES.maxCardioPerActivity);
  });

  it("pays weigh-ins at most once a week", () => {
    const weighIns = [0, 2, 7, 8].map((offset) => ({
      date: addDaysIso(START, offset),
      weightKg: 80,
    }));
    const state = computeProgression(
      makeLedger({ profile: { ...baseProfile, goal: null }, weighIns }),
      addDaysIso(START, 8),
    );
    expect(state.xpBySource.weighIns).toBe(2 * XP_RULES.weighIn);
  });

  it("caps record XP at three per workout day", () => {
    const sessions = [
      makeSession(START, {
        topSets: [top("a", 50, 5), top("b", 50, 5), top("c", 50, 5), top("d", 50, 5)],
      }),
      makeSession(addDaysIso(START, 2), {
        topSets: [top("a", 60, 5), top("b", 60, 5), top("c", 60, 5), top("d", 60, 5)],
      }),
    ];
    const state = computeProgression(makeLedger({ sessions }), addDaysIso(START, 2));
    expect(state.xpBySource.records).toBe(3 * XP_RULES.personalRecord);
  });

  it("earns rank insignia when levels are reached", () => {
    const state = computeProgression(buildDemoData("2026-10-14").ledger, "2026-10-14");
    expect(state.level.level).toBeGreaterThanOrEqual(5);
    const iron = state.collectibles.find((item) => item.id === "rank-iron")!;
    expect(iron.status).toBe("earned");
    const reachedFive = state.levelDates.find((entry) => entry.level === 5)!;
    expect(iron.earnedOn).toBe(reachedFive.date);
  });

  it("is deterministic and never double-pays", () => {
    const ledger = buildDemoData("2026-10-14").ledger;
    const a = computeProgression(ledger, "2026-10-14");
    const b = computeProgression(ledger, "2026-10-14");
    expect(a).toEqual(b);
    const collectionXp = a.collectibles
      .filter((item) => item.status === "earned")
      .reduce((sum, item) => sum + item.xp, 0);
    expect(a.xpBySource.collection).toBe(collectionXp);
  });
});
