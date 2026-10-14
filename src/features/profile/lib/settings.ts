import type { SettingsItem } from "../types";

/** Profile's settings menu — navigation config, not user data. */
export const PROFILE_SETTINGS: SettingsItem[] = [
  { id: "body-stats", label: "Body stats", iconId: "ruler", href: "/profile/body" },
  { id: "photos", label: "Progress photos", iconId: "camera", href: "/profile/photos" },
  { id: "integrations", label: "Cardio sync & imports", iconId: "activity", href: "/profile/integrations" },
  { id: "preferences", label: "Preferences & logging", iconId: "sliders", href: "/profile/settings/preferences" },
  { id: "avatar", label: "Avatar", iconId: "user", href: "/profile/settings/avatar" },
  { id: "notifications", label: "Notifications", iconId: "bell", href: "/profile/settings/notifications" },
  { id: "appearance", label: "Appearance", iconId: "moon", href: "/profile/settings/appearance" },
  { id: "privacy", label: "Privacy", iconId: "shield", href: "/profile/settings/privacy" },
  { id: "export-data", label: "Export data", iconId: "download", href: "/profile/settings/export" },
  // The guided walkthrough teaches on the live interface.
  { id: "tour", label: "Replay app tour", iconId: "play", href: "/home?tour=1", accent: true },
  { id: "logout", label: "Log out", iconId: "log-out", href: "/login" },
];
