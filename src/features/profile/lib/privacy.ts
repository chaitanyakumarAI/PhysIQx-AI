/**
 * Profile › Privacy switches. Stored in the profile store and synced with
 * the athlete's settings. The Compete switches describe features that need
 * real users before anything enforces them.
 */
export interface PrivacyPreference {
  id: string;
  label: string;
  description: string;
}

/** Opt-in (owner decision 2026-11-02): progress photos are body photos. */
export const PHOTO_BACKUP = "photo-backup";

export const PRIVACY_PREFERENCES: PrivacyPreference[] = [
  {
    id: PHOTO_BACKUP,
    label: "Back up progress photos",
    description:
      "Keep a private copy in your account so photos come back on a new phone. Turning this off deletes the copies.",
  },
  {
    id: "leaderboard-visibility",
    label: "Show me on leaderboards",
    description: "Appear in Compete's XP leaderboards",
  },
  {
    id: "circle-activity-sharing",
    label: "Share activity with circle",
    description: "PRs and achievements show up in your circle's feed",
  },
  {
    id: "friend-requests",
    label: "Allow friend requests",
    description: "Let other athletes send you circle invites",
  },
];

export const DEFAULT_PRIVACY_PREFERENCES: Record<string, boolean> = {
  "leaderboard-visibility": true,
  "circle-activity-sharing": true,
  "friend-requests": true,
  [PHOTO_BACKUP]: false,
};
