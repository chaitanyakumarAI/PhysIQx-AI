import { describe, expect, it } from "vitest";
import { makeSession, trainingBlock } from "@/test/fixtures";
import { addDaysIso } from "./dates";
import { computeTrainingLoad } from "./trainingLoad";

const START = "2026-09-07"; // Monday

describe("computeTrainingLoad", () => {
  it("withholds the ratio until four weeks of history exist", () => {
    const load = computeTrainingLoad(trainingBlock(START, 2, [0, 2, 4]), addDaysIso(START, 13));
    expect(load.status).toBe("baseline");
    expect(load.loadRatio).toBeNull();
    expect(load.baselineDays).toBe(14);
    expect(load.headline).toContain("14 of 28");
  });

  it("calls a steady routine balanced", () => {
    const today = addDaysIso(START, 41);
    const load = computeTrainingLoad(trainingBlock(START, 6, [0, 2, 4]), today);
    expect(load.status).toBe("balanced");
    expect(load.loadRatio).toBe(1);
  });

  it("flags a volume spike", () => {
    const sessions = [
      ...trainingBlock(START, 5, [0, 2, 4]),
      ...trainingBlock(addDaysIso(START, 35), 1, [0, 1, 2, 3, 4], () => ({
        totalVolumeKg: 9000,
      })),
    ];
    const load = computeTrainingLoad(sessions, addDaysIso(START, 41));
    expect(load.status).toBe("high");
    expect(load.loadRatio).toBeGreaterThan(1.5);
  });

  it("escalates when most recent sessions were very hard", () => {
    const sessions = [
      ...trainingBlock(START, 5, [0, 2, 4]),
      ...trainingBlock(addDaysIso(START, 35), 1, [0, 2, 4], () => ({ avgRpe: 9.5 })),
    ];
    const load = computeTrainingLoad(sessions, addDaysIso(START, 41));
    expect(load.hardSessionsLast7Days).toBe(3);
    expect(load.status).toBe("building");
  });

  it("counts consecutive training days and suggests rest after six", () => {
    const today = addDaysIso(START, 40);
    const streak = [0, 1, 2, 3, 4, 5].map((offset) => makeSession(addDaysIso(today, -offset)));
    const load = computeTrainingLoad([...trainingBlock(START, 4, [0, 3]), ...streak], today);
    expect(load.consecutiveTrainingDays).toBe(6);
    expect(load.advice).toMatch(/rest day/);
  });

  it("ignores negative volume from legacy data", () => {
    const load = computeTrainingLoad(
      [makeSession(START, { totalVolumeKg: -9200 })],
      addDaysIso(START, 1),
    );
    expect(load.weekVolumeKg).toBe(0);
  });
});
