import { describe, expect, it } from "vitest";
import { addDaysIso } from "./dates";
import {
  CALIBRATION_DAYS,
  computeDailySnapshot,
  computeScoreSummary,
  computeScoreTrend,
  SCORE_VERSION,
} from "./scoreEngine";
import {
  baseProfile,
  makeCardio,
  makeLedger,
  makeSession,
  top,
  trainingBlock,
} from "@/test/fixtures";

// 2026-09-07 is a Monday.
const START = "2026-09-07";

/** Five weeks of Mon/Tue/Thu/Fri training with bench + squat top sets. */
function steadyBlock(weeks = 5) {
  return trainingBlock(START, weeks, [0, 1, 3, 4], (_date, week) => ({
    topSets: [
      top("ex-bench-press", 80 + week * 2.5, 6),
      top("ex-back-squat", 110 + week * 2.5, 5),
    ],
  }));
}

const TODAY = addDaysIso(START, 35); // Monday after the 5-week block

describe("computeScoreSummary — lifecycle", () => {
  it("calibrates from zero without ever showing a number", () => {
    const summary = computeScoreSummary(makeLedger(), TODAY);
    expect(summary.state).toBe("calibrating");
    expect(summary.calibrationDay).toBe(0);
    expect(summary.headline).toMatch(/first workout/i);
    expect(summary.scoreVersion).toBe(SCORE_VERSION);
  });

  it("counts calibration days from the first training day", () => {
    const ledger = makeLedger({ sessions: [makeSession(START)] });
    const summary = computeScoreSummary(ledger, addDaysIso(START, 2));
    expect(summary.state).toBe("calibrating");
    expect(summary.calibrationDay).toBe(3);
    expect(summary.headline).toContain(`Day 3 of ${CALIBRATION_DAYS}`);
  });

  it("becomes active after the calibration week", () => {
    const summary = computeScoreSummary(makeLedger({ sessions: steadyBlock() }), TODAY);
    expect(summary.state).toBe("active");
    expect(summary.score).toBeGreaterThan(0);
    expect(summary.score).toBeLessThanOrEqual(100);
  });

  it("pauses (stale) after 14 days without training, keeping the last value", () => {
    const ledger = makeLedger({ sessions: steadyBlock() });
    const lastDay = addDaysIso(START, 32);
    const before = computeDailySnapshot(ledger, lastDay);
    const later = computeScoreSummary(ledger, addDaysIso(lastDay, 20));
    expect(later.state).toBe("stale");
    expect(later.score).toBe(before.score);
    expect(later.headline).toMatch(/paused/i);
  });

  it("welcomes a comeback the day training resumes", () => {
    const sessions = steadyBlock();
    const returnDay = addDaysIso(START, 60);
    const summary = computeScoreSummary(
      makeLedger({ sessions: [...sessions, makeSession(returnDay)] }),
      returnDay,
    );
    expect(summary.state).toBe("active");
    expect(summary.headline).toMatch(/welcome back/i);
  });
});

describe("computeScoreSummary — finalization", () => {
  it("shows yesterday's finalized score and today's work as pending", () => {
    const sessions = steadyBlock();
    const withoutToday = computeScoreSummary(makeLedger({ sessions }), TODAY);
    const withToday = computeScoreSummary(
      makeLedger({ sessions: [...sessions, makeSession(TODAY)] }),
      TODAY,
    );
    expect(withToday.score).toBe(withoutToday.score);
    expect(withToday.pending ?? 0).toBeGreaterThanOrEqual(0);
  });

  it("is deterministic", () => {
    const ledger = makeLedger({ sessions: steadyBlock() });
    expect(computeScoreSummary(ledger, TODAY)).toEqual(computeScoreSummary(ledger, TODAY));
  });
});

describe("pillars", () => {
  it("full adherence maxes consistency; logging more never lowers it", () => {
    // As of Sunday: the 28-day window holds four complete 4-session weeks.
    const snapshot = computeDailySnapshot(
      makeLedger({ sessions: steadyBlock() }),
      addDaysIso(TODAY, -1),
    );
    const consistency = snapshot.pillars.find((entry) => entry.id === "consistency")!;
    expect(consistency.value).toBe(100);

    const sparse = trainingBlock(START, 5, [0]);
    const sparser = computeDailySnapshot(makeLedger({ sessions: sparse }), TODAY);
    const denser = computeDailySnapshot(
      makeLedger({ sessions: [...sparse, makeSession(addDaysIso(START, 30))] }),
      TODAY,
    );
    const value = (snapshot: typeof sparser) =>
      snapshot.pillars.find((entry) => entry.id === "consistency")!.value;
    expect(value(denser)).toBeGreaterThan(value(sparser));
  });

  it("weights untracked pillars out instead of scoring them as failures", () => {
    const snapshot = computeDailySnapshot(makeLedger({ sessions: steadyBlock() }), TODAY);
    const status = Object.fromEntries(snapshot.pillars.map((entry) => [entry.id, entry.status]));
    expect(status.cardio).toBe("untracked");
    expect(status.bodyShape).toBe("untracked");
    // Composite = consistency + strength only.
    expect(snapshot.score).toBeGreaterThan(50);
  });

  it("scores strength against bodyweight standards once a weigh-in exists", () => {
    const sessions = steadyBlock();
    const withoutWeight = computeDailySnapshot(makeLedger({ sessions }), TODAY);
    const withWeight = computeDailySnapshot(
      makeLedger({ sessions, weighIns: [{ date: START, weightKg: 80 }] }),
      TODAY,
    );
    const strength = (snapshot: typeof withWeight) =>
      snapshot.pillars.find((entry) => entry.id === "strength")!;
    expect(strength(withoutWeight).detail).toMatch(/estimated 1RM/);
    expect(strength(withWeight).detail).toMatch(/main lifts vs\. your bodyweight/);
    expect(strength(withWeight).status).toBe("active");
  });

  it("credits vigorous cardio double and floors at neutral, not zero", () => {
    const sessions = steadyBlock();
    const runs = [1, 3, 5, 8, 10, 12].map((offset) =>
      makeCardio(addDaysIso(TODAY, -14 + offset), 25, "run"),
    );
    const active = computeDailySnapshot(makeLedger({ sessions, cardio: runs }), TODAY);
    const cardio = active.pillars.find((entry) => entry.id === "cardio")!;
    // 6 × 25 min vigorous over 2 weeks = 150 equivalent minutes a week.
    expect(cardio.value).toBe(100);

    const lapsed = computeDailySnapshot(
      makeLedger({ sessions, cardio: [makeCardio(START, 30, "walk")] }),
      TODAY,
    );
    const lapsedCardio = lapsed.pillars.find((entry) => entry.id === "cardio")!;
    expect(lapsedCardio.status).toBe("low-signal");
    expect(lapsedCardio.value).toBe(35);
  });

  it("includes body shape once a build is chosen", () => {
    const snapshot = computeDailySnapshot(
      makeLedger({
        sessions: steadyBlock(),
        profile: { ...baseProfile, currentBuild: "athletic" },
      }),
      TODAY,
    );
    const bodyShape = snapshot.pillars.find((entry) => entry.id === "bodyShape")!;
    expect(bodyShape.status).toBe("active");
    expect(bodyShape.value).toBe(80);
  });

  it("names the weakest scored pillar", () => {
    const snapshot = computeDailySnapshot(
      makeLedger({
        sessions: steadyBlock(),
        profile: { ...baseProfile, currentBuild: "apple" },
      }),
      TODAY,
    );
    expect(snapshot.weakestPillarId).toBe("bodyShape");
  });
});

describe("computeScoreTrend", () => {
  it("returns finalized points only for scored days", () => {
    const trend = computeScoreTrend(makeLedger({ sessions: steadyBlock() }), TODAY, 30);
    expect(trend.length).toBeGreaterThan(0);
    expect(trend.every((point) => point.date < TODAY)).toBe(true);
    expect(trend.every((point) => point.score >= 0 && point.score <= 100)).toBe(true);
  });
});
