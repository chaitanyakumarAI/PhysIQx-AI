import { describe, expect, it } from "vitest";
import { makeCardio, makeLedger, makeSession } from "@/test/fixtures";
import { addDaysIso } from "@/lib/dates";
import { computeProgression } from "./progression";
import { QUEST_XP, SWEEP_XP, questXpEvents, weeklyQuests } from "./quests";

const LAUNCH = "2026-11-02"; // a Monday

/** Four weeks before launch: three 6,000 kg / 16-set workouts a week. */
function trainedHistory() {
  const sessions = [];
  for (let week = 1; week <= 4; week += 1) {
    const monday = addDaysIso(LAUNCH, -7 * week);
    for (const offset of [0, 2, 4]) sessions.push(makeSession(addDaysIso(monday, offset), { missionId: `w${week}-${offset}` }));
  }
  return sessions;
}

describe("weeklyQuests", () => {
  it("gives a brand-new athlete the starter quests", () => {
    const week = weeklyQuests(makeLedger(), LAUNCH, LAUNCH);
    expect(week.quests.map((quest) => quest.id)).toEqual(["starter-workout", "starter-sets", "starter-weigh-in"]);
    expect(week).toMatchObject({ weekStart: LAUNCH, weekEnd: "2026-11-08", sweptOn: null });
  });

  it("sets targets a little above the athlete's own recent weeks", () => {
    const ledger = makeLedger({ sessions: trainedHistory() });
    const quests = weeklyQuests(ledger, LAUNCH, LAUNCH).quests;
    const byId = Object.fromEntries(quests.map((quest) => [quest.id, quest]));
    // 18,000 kg and 48 sets a week → +10%: 19,800 → 20,000 kg; 52.8 → 53 sets.
    expect(byId.volume?.target).toBe(20_000);
    expect(byId.sets?.target).toBe(53);
    expect(quests).toHaveLength(3);
  });

  it("fixes targets when the week starts, so a big day mid-week doesn't move them", () => {
    const sessions = trainedHistory();
    const before = weeklyQuests(makeLedger({ sessions }), LAUNCH, "2026-11-04");
    const after = weeklyQuests(
      makeLedger({ sessions: [...sessions, makeSession("2026-11-03", { totalVolumeKg: 50_000, setsCompleted: 60, missionId: "huge" })] }),
      LAUNCH,
      "2026-11-04",
    );
    expect(after.quests.map((quest) => quest.target)).toEqual(before.quests.map((quest) => quest.target));
  });

  it("picks the same three on every device and rotates them week to week", () => {
    const ledger = makeLedger({
      sessions: trainedHistory(),
      cardio: [makeCardio("2026-10-20", 40, "run")],
      weighIns: [{ date: "2026-10-25", weightKg: 80 }],
    });
    const thisWeek = weeklyQuests(ledger, LAUNCH, LAUNCH).quests.map((quest) => quest.id);
    expect(weeklyQuests(ledger, LAUNCH, LAUNCH).quests.map((quest) => quest.id)).toEqual(thisWeek);
    const nextWeek = weeklyQuests(ledger, addDaysIso(LAUNCH, 7), addDaysIso(LAUNCH, 7)).quests.map((quest) => quest.id);
    expect(nextWeek).not.toEqual(thisWeek);
  });

  it("records the day each quest is done, and the sweep when all three are", () => {
    const ledger = makeLedger({
      sessions: [makeSession("2026-11-03", { setsCompleted: 12 })],
      weighIns: [{ date: "2026-11-05", weightKg: 80 }],
    });
    const week = weeklyQuests(ledger, LAUNCH, "2026-11-06");
    expect(week.quests.map((quest) => [quest.id, quest.doneOn])).toEqual([
      ["starter-workout", "2026-11-03"],
      ["starter-sets", "2026-11-03"],
      ["starter-weigh-in", "2026-11-05"],
    ]);
    expect(week.sweptOn).toBe("2026-11-05");
  });
});

describe("quest XP", () => {
  const ledger = makeLedger({
    sessions: [makeSession("2026-10-27", { missionId: "before-launch" }), makeSession("2026-11-03", { setsCompleted: 12 })],
    weighIns: [{ date: "2026-11-05", weightKg: 80 }],
  });

  it("pays 50 per quest and 100 for a sweep, starting with the launch week", () => {
    const events = questXpEvents(ledger, "2026-11-06");
    expect(events.every((event) => event.date >= LAUNCH)).toBe(true);
    expect(events.reduce((sum, event) => sum + event.amount, 0)).toBe(3 * QUEST_XP + SWEEP_XP);
  });

  it("shows up as its own source in progression", () => {
    expect(computeProgression(ledger, "2026-11-06").xpBySource.quests).toBe(3 * QUEST_XP + SWEEP_XP);
  });
});
