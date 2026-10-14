import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ingestActivities, type IncomingActivity, type IngestResult } from "@/lib/cardio/ingest";
import type { CardioActivity, CardioActivityType, CardioSource } from "@/types/cardio";

export { cardioActivityLabels } from "@/types/cardio";
export type { CardioActivity } from "@/types/cardio";

/**
 * The Cardio pillar's ledger: activities imported from files or synced from
 * platforms (no manual logging — product directive). Every write goes
 * through lib/cardio/ingest, which validates and de-duplicates across
 * sources.
 */
interface CardioStoreState {
  activities: CardioActivity[];
  /** Validates, de-duplicates, and stores; returns what happened. */
  ingest: (incoming: IncomingActivity[]) => Omit<IngestResult, "activities">;
  removeActivity: (id: string) => void;
}

/** The pre-v1 shape (minutes per day, no timestamps). */
interface LegacyCardioSession {
  id: string;
  date: string;
  activity: CardioActivityType;
  minutes: number;
  source?: string;
  distanceKm?: number;
  avgHeartRate?: number;
  caloriesBurned?: number;
}

const LEGACY_SOURCES = new Set<CardioSource>(["apple_health", "garmin", "health_connect"]);

function migrateLegacy(session: LegacyCardioSession): CardioActivity {
  const startedAt = new Date(`${session.date}T12:00:00`).toISOString();
  const source = LEGACY_SOURCES.has(session.source as CardioSource)
    ? (session.source as CardioSource)
    : "manual";
  return {
    id: `${source}:${session.id}`,
    source,
    externalId: session.id,
    type: session.activity,
    startedAt,
    date: session.date,
    durationMin: session.minutes,
    distanceKm: session.distanceKm,
    avgHeartRate: session.avgHeartRate,
    calories: session.caloriesBurned,
    importedAt: startedAt,
  };
}

export const useCardioStore = create<CardioStoreState>()(
  persist(
    (set, get) => ({
      activities: [],
      ingest: (incoming) => {
        const { activities, ...summary } = ingestActivities(
          get().activities,
          incoming,
          new Date().toISOString(),
        );
        set({ activities });
        return summary;
      },
      removeActivity: (id) =>
        set((state) => ({
          activities: state.activities.filter((activity) => activity.id !== id),
        })),
    }),
    {
      name: "physiqx-cardio",
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as { sessions?: LegacyCardioSession[]; activities?: CardioActivity[] };
        if (version < 1) {
          return {
            activities: (state.sessions ?? [])
              .filter((session) => session.minutes > 0)
              .map(migrateLegacy),
          } as CardioStoreState;
        }
        return state as CardioStoreState;
      },
      skipHydration: true,
    },
  ),
);
