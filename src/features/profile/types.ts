/** Lifetime totals shown on Profile. */
export interface ProfileStats {
  sessions: number;
  totalXP: number;
}

export type SettingsIconId =
  | "bell"
  | "moon"
  | "shield"
  | "download"
  | "user"
  | "play"
  | "ruler"
  | "sliders"
  | "camera"
  | "activity"
  | "log-out";

export interface SettingsItem {
  id: string;
  label: string;
  value?: string;
  iconId: SettingsIconId;
  href: string;
  /** When true, renders with brand accent styling to draw attention (e.g. tour replay). */
  accent?: boolean;
}
