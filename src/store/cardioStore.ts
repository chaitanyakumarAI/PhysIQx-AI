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

export interface CardioSession {
  id: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  activity: CardioActivity;
  minutes: number;
}

/**
 * The Cardio pillar's input surface — manually logged sessions (type +
 * minutes), deliberately three taps to save. Fourth persisted store,
 * following the sessionStore SSR contract: `skipHydration` + explicit
 * rehydration from StoreHydrator.
 */
interface CardioStoreState {
  sessions: CardioSession[];
  logSession: (activity: CardioActivity, minutes: number, date: string) => void;
  removeSession: (id: string) => void;
}

export const useCardioStore = create<CardioStoreState>()(
  persist(
    (set) => ({
      sessions: [],
      logSession: (activity, minutes, date) =>
        set((state) => ({
          sessions: [
            ...state.sessions,
            { id: `cardio-${Date.now()}`, date, activity, minutes },
          ],
        })),
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
