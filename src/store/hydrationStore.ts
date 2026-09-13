import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HydrationEntry {
  id: string;
  amountMl: number;
  timestamp: string;
  date: string;
}

export interface HydrationStoreState {
  entries: HydrationEntry[];
  dailyGoalMl: number;
  addWater: (amountMl: number) => void;
  resetToday: () => void;
  setDailyGoalMl: (goal: number) => void;
}

const todayStr = () => new Date().toISOString().split("T")[0]!;

const SEED_HYDRATION_ENTRIES: HydrationEntry[] = [
  {
    id: "hydra-seed-1",
    amountMl: 500,
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    date: todayStr(),
  },
  {
    id: "hydra-seed-2",
    amountMl: 750,
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    date: todayStr(),
  },
  {
    id: "hydra-seed-3",
    amountMl: 550,
    timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
    date: todayStr(),
  },
];

export const useHydrationStore = create<HydrationStoreState>()(
  persist(
    (set, get) => ({
      entries: SEED_HYDRATION_ENTRIES,
      dailyGoalMl: 3000,
      addWater: (amountMl: number) => {
        const today = todayStr();
        const newEntry: HydrationEntry = {
          id: `hydra-${Date.now()}`,
          amountMl,
          timestamp: new Date().toISOString(),
          date: today,
        };
        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));
      },
      resetToday: () => {
        const today = todayStr();
        set((state) => ({
          entries: state.entries.filter((e) => e.date !== today),
        }));
      },
      setDailyGoalMl: (goal: number) => set({ dailyGoalMl: goal }),
    }),
    {
      name: "physiqx-hydration",
      skipHydration: true,
    }
  )
);

export function getTodayHydrationTotal(entries: HydrationEntry[]): number {
  const today = todayStr();
  return entries
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.amountMl, 0);
}
