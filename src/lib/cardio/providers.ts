/**
 * Where cardio can come from, stated honestly. A web app cannot read Apple
 * Health or Health Connect (those need a native app); file export/import
 * works everywhere today; Strava's API is the next automatic source.
 */
export type ProviderStatus = "available" | "coming-soon" | "needs-app";

export interface CardioProvider {
  id: string;
  name: string;
  status: ProviderStatus;
  summary: string;
  /** How to get data in today, when there's a workaround. */
  howTo?: string;
}

export const providerStatusLabels: Record<ProviderStatus, string> = {
  available: "Available",
  "coming-soon": "Coming soon",
  "needs-app": "Needs the mobile app",
};

export const CARDIO_PROVIDERS: CardioProvider[] = [
  {
    id: "files",
    name: "GPX / TCX files",
    status: "available",
    summary: "Import exported activities from any watch or app. Duplicates are merged automatically.",
  },
  {
    id: "garmin",
    name: "Garmin Connect",
    status: "available",
    summary: "Via file export.",
    howTo: "In Garmin Connect, open an activity → ⚙ → Export to TCX, then import it here.",
  },
  {
    id: "strava",
    name: "Strava",
    status: "coming-soon",
    summary: "Automatic sync of new activities.",
    howTo: "Until then: open an activity on strava.com → ⋯ → Export GPX, then import it here.",
  },
  {
    id: "apple-health",
    name: "Apple Health",
    status: "needs-app",
    summary: "Apple Health can only be read by an iPhone app.",
    howTo: "Use an exporter such as HealthFit to save workouts as GPX/TCX, then import them.",
  },
  {
    id: "health-connect",
    name: "Health Connect",
    status: "needs-app",
    summary: "Health Connect can only be read by an Android app.",
    howTo: "Export from your watch's app (Garmin, Coros, Polar, Wahoo) as GPX/TCX instead.",
  },
];
