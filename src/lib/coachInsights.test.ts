import { describe, expect, it } from "vitest";
import { generateCoachInsights } from "./coachInsights";
import type { CompletedSessionSummary } from "@/store/sessionStore";

describe("coachInsights", () => {
  it("generates baseline guidance when history has fewer than 2 workouts", () => {
    const insights = generateCoachInsights({
      history: [],
      streakDays: 0,
    });

    expect(insights.length).toBeGreaterThanOrEqual(2);
    expect(insights[0]?.headline).toBe("Building your baseline");
    expect(insights[0]?.actionHref).toBe("/train");

    for (const insight of insights) {
      const sentences = insight.body.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [];
      expect(sentences.length).toBeLessThanOrEqual(2);
    }
  });

  it("detects a volume surge and generates a celebration insight", () => {
    const history: CompletedSessionSummary[] = [
      {
        id: "s1",
        missionId: "m1",
        title: "Session 1",
        date: "2026-07-01",
        completedAt: "2026-07-01T10:00:00Z",
        durationSec: 3600,
        setsCompleted: 5,
        totalVolumeKg: 4000,
        xpEarned: 150,
        topSets: [],
      },
      {
        id: "s2",
        missionId: "m2",
        title: "Session 2",
        date: "2026-07-03",
        completedAt: "2026-07-03T10:00:00Z",
        durationSec: 3600,
        setsCompleted: 5,
        totalVolumeKg: 4600, // +15% volume increase
        xpEarned: 150,
        topSets: [],
      },
    ];

    const insights = generateCoachInsights({
      history,
      streakDays: 2,
      weakestPillarId: "strength",
    });

    const surge = insights.find((i) => i.headline === "Volume surging");
    expect(surge).toBeDefined();
    expect(surge?.severity).toBe("celebrate");
    expect(surge?.body).toContain("15%");
  });

  it("identifies cardio as the weakest pillar and prescribes a cardio session", () => {
    const history: CompletedSessionSummary[] = [
      {
        id: "s1",
        missionId: "m1",
        title: "Session 1",
        date: "2026-07-01",
        completedAt: "2026-07-01T10:00:00Z",
        durationSec: 3600,
        setsCompleted: 5,
        totalVolumeKg: 4000,
        xpEarned: 150,
        topSets: [],
      },
      {
        id: "s2",
        missionId: "m2",
        title: "Session 2",
        date: "2026-07-03",
        completedAt: "2026-07-03T10:00:00Z",
        durationSec: 3600,
        setsCompleted: 5,
        totalVolumeKg: 4000,
        xpEarned: 150,
        topSets: [],
      },
    ];

    const insights = generateCoachInsights({
      history,
      streakDays: 2,
      weakestPillarId: "cardio",
    });

    const cardioInsight = insights.find((i) => i.id === "insight-cardio-focus");
    expect(cardioInsight).toBeDefined();
    expect(cardioInsight?.headline).toBe("Cardio gap");
    expect(cardioInsight?.actionHref).toBe("/train/cardio");
  });

  it("celebrates long streaks (>= 7 days)", () => {
    const history: CompletedSessionSummary[] = [
      {
        id: "s1",
        missionId: "m1",
        title: "Session 1",
        date: "2026-07-01",
        completedAt: "2026-07-01T10:00:00Z",
        durationSec: 3600,
        setsCompleted: 5,
        totalVolumeKg: 4000,
        xpEarned: 150,
        topSets: [],
      },
      {
        id: "s2",
        missionId: "m2",
        title: "Session 2",
        date: "2026-07-03",
        completedAt: "2026-07-03T10:00:00Z",
        durationSec: 3600,
        setsCompleted: 5,
        totalVolumeKg: 4000,
        xpEarned: 150,
        topSets: [],
      },
    ];

    const insights = generateCoachInsights({
      history,
      streakDays: 14,
    });

    const streakInsight = insights.find((i) => i.id === "insight-streak-celebrate");
    expect(streakInsight).toBeDefined();
    expect(streakInsight?.severity).toBe("celebrate");
    expect(streakInsight?.body).toContain("14-day streak");
  });

  it("strictly enforces the <= 2 sentences contract on every generated insight", () => {
    const history: CompletedSessionSummary[] = [
      {
        id: "s1",
        missionId: "m1",
        title: "Session 1",
        date: "2026-07-01",
        completedAt: "2026-07-01T10:00:00Z",
        durationSec: 3600,
        setsCompleted: 5,
        totalVolumeKg: 4000,
        xpEarned: 150,
        topSets: [],
      },
      {
        id: "s2",
        missionId: "m2",
        title: "Session 2",
        date: "2026-07-03",
        completedAt: "2026-07-03T10:00:00Z",
        durationSec: 3600,
        setsCompleted: 5,
        totalVolumeKg: 3000,
        xpEarned: 150,
        topSets: [],
      },
    ];

    const insights = generateCoachInsights({
      history,
      streakDays: 0,
      weakestPillarId: "consistency",
    });

    for (const insight of insights) {
      const sentences = insight.body.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [];
      expect(sentences.length).toBeLessThanOrEqual(2);
    }
  });
});
