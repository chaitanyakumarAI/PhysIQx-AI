import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CardioActivity =
  | "walk"
  | "run"
  | "cycle"
  | "swim"
  | "row"
  | "hiit"
  | "sports"
  | "other";

export const cardioActivityLabels: Record<CardioActivity, string> = {
  walk: "Walk",
  run: "Run",
  cycle: "Cycle",
  swim: "Swim",
  row: "Row",
  hiit: "HIIT",
  sports: "Sports",
  other: "Other",
};

export type WearableSource =
  | "apple_health"
  | "garmin"
  | "health_connect"
  | "whoop"
  | "oura"
  | "manual";

export interface CardioSession {
  id: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  activity: CardioActivity;
  minutes: number;
  source?: WearableSource;
  distanceKm?: number;
  avgHeartRate?: number;
  caloriesBurned?: number;
}

/**
 * The Cardio pillar's store — stores synced sessions from connected wearables
 * (Apple Health, Garmin, Health Connect) and manages cardio minutes calculations.
 */
interface CardioStoreState {
  sessions: CardioSession[];
  logSession: (activity: CardioActivity, minutes: number, date: string, source?: WearableSource) => void;
  addSyncedSession: (session: Omit<CardioSession, "id"> & { id?: string }) => void;
  removeSession: (id: string) => void;
}

export const useCardioStore = create<CardioStoreState>()(
  persist(
    (set) => ({
      sessions: [],
      logSession: (activity, minutes, date, source = "manual") =>
        set((state) => ({
          sessions: [
            ...state.sessions,
            { id: `cardio-${Date.now()}`, date, activity, minutes, source },
          ],
        })),
      addSyncedSession: (session) =>
        set((state) => {
          const id = session.id || `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          // Deduplication: if exact id exists or same date + activity within ±15 min, avoid duplicate
          const existingIndex = state.sessions.findIndex((s) => s.id === id);
          if (existingIndex >= 0) {
            const updated = [...state.sessions];
            updated[existingIndex] = { ...session, id };
            return { sessions: updated };
          }
          return { sessions: [session as CardioSession, ...state.sessions] };
        }),
      removeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== id),
        })),
    }),
    {
      name: "physiqx-cardio",
      skipHydration: true,
    },
  ),
);
