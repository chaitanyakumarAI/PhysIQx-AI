/**
 * Cardio — one normalized activity model for every source (file imports,
 * wearable/platform sync). Sources differ in what they can tell us; this
 * shape is the common denominator the Cardio pillar and screens read.
 */

export type CardioActivityType =
  | "walk"
  | "run"
  | "cycle"
  | "swim"
  | "row"
  | "hiit"
  | "sports"
  | "other";

export const cardioActivityLabels: Record<CardioActivityType, string> = {
  walk: "Walk",
  run: "Run",
  cycle: "Ride",
  swim: "Swim",
  row: "Row",
  hiit: "HIIT",
  sports: "Sports",
  other: "Cardio",
};

/**
 * Where an activity came from. File imports work in any browser; platform
 * sources need OAuth (Strava) or a native wrapper (Apple Health, Health
 * Connect) — see lib/cardio/providers.
 */
export type CardioSource =
  | "gpx"
  | "tcx"
  | "strava"
  | "apple_health"
  | "health_connect"
  | "garmin"
  | "manual";

export const cardioSourceLabels: Record<CardioSource, string> = {
  gpx: "GPX file",
  tcx: "TCX file",
  strava: "Strava",
  apple_health: "Apple Health",
  health_connect: "Health Connect",
  garmin: "Garmin",
  manual: "Manual",
};

export interface CardioActivity {
  /** Stable id: `${source}:${externalId}` for synced/imported activities. */
  id: string;
  source: CardioSource;
  /** The source's own id, when it has one (dedup key within a source). */
  externalId?: string;
  type: CardioActivityType;
  /** ISO timestamp the activity started. */
  startedAt: string;
  /** Local calendar day (yyyy-mm-dd) of `startedAt`. */
  date: string;
  /** Moving/elapsed duration in minutes. */
  durationMin: number;
  distanceKm?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  calories?: number;
  /** When it entered this device's ledger. */
  importedAt: string;
}
