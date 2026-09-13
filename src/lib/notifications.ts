import type { WorkoutSession } from "@/types/workoutSession";
import type { CompletedSessionSummary } from "@/store/sessionStore";

export type NotificationType =
  | "streak_risk"
  | "mission_reminder"
  | "session_resume"
  | "challenge_update"
  | "score_recap";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  deepLink: string;
  priority: "high" | "normal" | "low";
  createdAt: string;
}

export interface NotificationEvaluationContext {
  session?: WorkoutSession | null;
  history: CompletedSessionSummary[];
  streakDays: number;
  currentHour?: number;
  preferences?: Record<string, boolean>;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: Record<string, boolean> = {
  "mission-reminders": true,
  "streak-risk": true,
  "challenge-results": true,
  "circle-activity": false,
  "ai-coach": true,
};

function localIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Evaluates pending high-priority notifications with deep-links per docs/ROUTES.md.
 * Respects user notification toggles from Settings.
 */
export function evaluatePendingNotifications(
  context: NotificationEvaluationContext,
): AppNotification[] {
  const {
    session,
    history,
    streakDays,
    currentHour = new Date().getHours(),
    preferences = DEFAULT_NOTIFICATION_PREFERENCES,
  } = context;

  const notifications: AppNotification[] = [];
  const nowIso = new Date().toISOString();
  const todayDate = localIso(new Date());

  // 1. Session Resume — Highest priority (in-flight workout must never be lost)
  if (session && session.status === "active") {
    notifications.push({
      id: `notif-resume-${session.id}`,
      type: "session_resume",
      title: "Workout in Progress",
      body: `Resume "${session.title}" — your logged sets are saved and waiting.`,
      deepLink: `/session/${session.id}`,
      priority: "high",
      createdAt: nowIso,
    });
    // While an active session is in progress, leave the athlete focused on resuming
    return notifications;
  }

  const hasLoggedToday = history.some((s) => s.date === todayDate);

  // 2. Streak Risk Alert — evening reminder before streak breaks
  const streakRiskEnabled = preferences["streak-risk"] ?? true;
  if (streakRiskEnabled && streakDays > 0 && !hasLoggedToday && currentHour >= 17) {
    notifications.push({
      id: `notif-streak-risk-${todayDate}`,
      type: "streak_risk",
      title: "Streak at Risk",
      body: `Your ${streakDays}-day streak will expire at midnight. Log a quick workout or cardio session to keep the flame alive.`,
      deepLink: "/home",
      priority: "high",
      createdAt: nowIso,
    });
  }

  // 3. Mission Reminder — morning / midday prompt
  const missionRemindersEnabled = preferences["mission-reminders"] ?? true;
  if (missionRemindersEnabled && !hasLoggedToday && currentHour >= 9 && currentHour < 17) {
    notifications.push({
      id: `notif-mission-${todayDate}`,
      type: "mission_reminder",
      title: "Today's Mission Ready",
      body: "Your daily training prescription is prepared. Tap to review your sets and start.",
      deepLink: "/home",
      priority: "normal",
      createdAt: nowIso,
    });
  }

  // 4. Challenge Standings Update
  const challengeEnabled = preferences["challenge-results"] ?? true;
  if (challengeEnabled && currentHour >= 12 && currentHour < 14) {
    notifications.push({
      id: `notif-challenge-${todayDate}`,
      type: "challenge_update",
      title: "Weekly Challenge Standings",
      body: "Check your position on the leaderboard and claim earned challenge XP.",
      deepLink: "/compete",
      priority: "low",
      createdAt: nowIso,
    });
  }

  return notifications;
}
