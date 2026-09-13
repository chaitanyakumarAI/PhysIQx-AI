import { describe, expect, it } from "vitest";
import { evaluatePendingNotifications } from "./notifications";
import type { WorkoutSession } from "@/types/workoutSession";
import type { CompletedSessionSummary } from "@/store/sessionStore";

describe("notifications scaffolding", () => {
  it("generates a session_resume notification when an active workout is in-flight", () => {
    const activeSession: WorkoutSession = {
      id: "session-123",
      missionId: "mission-push-a",
      title: "Push Power A",
      startedAt: "2026-07-04T10:00:00Z",
      completedAt: null,
      status: "active",
      exercises: [],
      xpReward: 150,
    };

    const notifications = evaluatePendingNotifications({
      session: activeSession,
      history: [],
      streakDays: 5,
      currentHour: 18,
    });

    expect(notifications.length).toBe(1);
    expect(notifications[0]!.type).toBe("session_resume");
    expect(notifications[0]!.priority).toBe("high");
    expect(notifications[0]!.deepLink).toBe("/session/session-123");
    expect(notifications[0]!.body).toContain("Push Power A");
  });

  it("generates a streak_risk notification in the evening if workout not yet logged", () => {
    const notifications = evaluatePendingNotifications({
      session: null,
      history: [],
      streakDays: 12,
      currentHour: 19, // 7 PM
    });

    const streakNotif = notifications.find((n) => n.type === "streak_risk");
    expect(streakNotif).toBeDefined();
    expect(streakNotif?.priority).toBe("high");
    expect(streakNotif?.deepLink).toBe("/home");
    expect(streakNotif?.body).toContain("12-day streak");
  });

  it("does not generate a streak_risk notification if a workout was already logged today", () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayIso = `${today.getFullYear()}-${month}-${day}`;

    const history: CompletedSessionSummary[] = [
      {
        id: "s1",
        missionId: "m1",
        title: "Morning Pull",
        date: todayIso,
        completedAt: new Date().toISOString(),
        durationSec: 3600,
        setsCompleted: 5,
        totalVolumeKg: 4000,
        xpEarned: 150,
        topSets: [],
      },
    ];

    const notifications = evaluatePendingNotifications({
      session: null,
      history,
      streakDays: 12,
      currentHour: 20,
    });

    const streakNotif = notifications.find((n) => n.type === "streak_risk");
    expect(streakNotif).toBeUndefined();
  });

  it("suppresses notifications when disabled in user preferences", () => {
    const notifications = evaluatePendingNotifications({
      session: null,
      history: [],
      streakDays: 10,
      currentHour: 19,
      preferences: {
        "streak-risk": false,
        "mission-reminders": false,
      },
    });

    expect(notifications.find((n) => n.type === "streak_risk")).toBeUndefined();
    expect(notifications.find((n) => n.type === "mission_reminder")).toBeUndefined();
  });

  it("generates mission reminders in the morning/afternoon", () => {
    const notifications = evaluatePendingNotifications({
      session: null,
      history: [],
      streakDays: 0,
      currentHour: 10, // 10 AM
    });

    const missionNotif = notifications.find((n) => n.type === "mission_reminder");
    expect(missionNotif).toBeDefined();
    expect(missionNotif?.deepLink).toBe("/home");
  });
});
