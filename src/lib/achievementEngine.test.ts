import { describe, expect, it } from "vitest";
import {
  evaluateAchievements,
  BASE_ACHIEVEMENTS_CATALOG,
} from "./achievementEngine";
import type { CompletedSessionSummary } from "@/store/sessionStore";

describe("achievementEngine", () => {
  it("initializes all achievements as locked when history and streak are empty", () => {
    const result = evaluateAchievements({
      history: [],
      streakDays: 0,
    });

    expect(result.totalCount).toBe(BASE_ACHIEVEMENTS_CATALOG.length);
    expect(result.unlockedCount).toBe(0);
    expect(result.newlyUnlocked.length).toBe(0);
    expect(result.totalXpEarned).toBe(0);

    for (const a of result.achievements) {
      expect(a.state).toBe("locked");
      expect(a.progress).toBe(0);
    }
  });

  it("unlocks 'First Rep' upon completing the first workout", () => {
    const history: CompletedSessionSummary[] = [
      {
        id: "s1",
        missionId: "m1",
        title: "Session 1",
        date: "2026-07-01",
        completedAt: "2026-07-01T10:00:00Z",
        durationSec: 2500,
        setsCompleted: 5,
        totalVolumeKg: 3000,
        xpEarned: 150,
        topSets: [],
      },
    ];

    const result = evaluateAchievements({
      history,
      streakDays: 1,
    });

    const firstRep = result.achievements.find((a) => a.id === "first-rep");
    expect(firstRep?.state).toBe("unlocked");
    expect(firstRep?.progress).toBe(1);

    expect(result.newlyUnlocked).toEqual([firstRep]);
    expect(result.totalXpEarned).toBe(100); // Common = 100 XP
  });

  it("does not report already-unlocked achievements as newly unlocked", () => {
    const history: CompletedSessionSummary[] = [
      {
        id: "s1",
        missionId: "m1",
        title: "Session 1",
        date: "2026-07-01",
        completedAt: "2026-07-01T10:00:00Z",
        durationSec: 2500,
        setsCompleted: 5,
        totalVolumeKg: 3000,
        xpEarned: 150,
        topSets: [],
      },
    ];

    const prevResult = evaluateAchievements({
      history,
      streakDays: 1,
    });

    // Run again with the same history and pass previous achievements
    const nextResult = evaluateAchievements(
      {
        history,
        streakDays: 1,
      },
      prevResult.achievements,
    );

    expect(nextResult.unlockedCount).toBe(1);
    expect(nextResult.newlyUnlocked.length).toBe(0); // None newly unlocked
  });

  it("unlocks 'Week Warrior' at 7-day streak and 'Consistency King' at 30-day streak", () => {
    const result7 = evaluateAchievements({
      history: [],
      streakDays: 7,
    });

    const weekWarrior = result7.achievements.find((a) => a.id === "week-warrior");
    expect(weekWarrior?.state).toBe("unlocked");

    const result30 = evaluateAchievements({
      history: [],
      streakDays: 30,
    });

    const consistencyKing = result30.achievements.find((a) => a.id === "consistency-king");
    expect(consistencyKing?.state).toBe("unlocked");
  });

  it("unlocks 'Strength Titan' when cumulative volume reaches 100,000 kg", () => {
    const history: CompletedSessionSummary[] = [
      {
        id: "s1",
        missionId: "m1",
        title: "Heavy Day",
        date: "2026-07-01",
        completedAt: "2026-07-01T10:00:00Z",
        durationSec: 3600,
        setsCompleted: 10,
        totalVolumeKg: 105_000,
        xpEarned: 300,
        topSets: [],
      },
    ];

    const result = evaluateAchievements({
      history,
      streakDays: 1,
    });

    const strengthTitan = result.achievements.find((a) => a.id === "strength-titan");
    expect(strengthTitan?.state).toBe("unlocked");
    expect(strengthTitan?.progress).toBe(1);
  });
});
