import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppNotification } from "@/lib/notifications";

export type NotificationCategory = "all" | "alerts" | "training" | "social";

export interface CustomNotification extends AppNotification {
  category?: NotificationCategory;
}

export const SEED_NOTIFICATIONS: CustomNotification[] = [
  {
    id: "notif-seed-welcome-streak",
    type: "streak_risk",
    title: "🔥 7-Day Consistency Flame",
    body: "Your 7-day streak is blazing! Log today's planned session to extend your momentum.",
    deepLink: "/home",
    priority: "high",
    category: "alerts",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-seed-challenge-standings",
    type: "challenge_update",
    title: "⚡ Volume King Leaderboard",
    body: "You're in the Top 8% of the Volume King challenge with 24,800 kg logged!",
    deepLink: "/compete/challenges/challenge-volume-king",
    priority: "normal",
    category: "social",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-seed-mission-reminder",
    type: "mission_reminder",
    title: "🎯 Upper Body Hypertrophy Ready",
    body: "Coach Nyra prepared your workout: Bench Press, Incline DB, Lat Pulldowns. Tap to begin.",
    deepLink: "/train",
    priority: "normal",
    category: "training",
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-seed-recovery-ready",
    type: "score_recap",
    title: "🛡️ Optimal Readiness (88%)",
    body: "Systemic recovery is green across sleep and training impulse. Prime state for heavy sets.",
    deepLink: "/insights/recovery",
    priority: "low",
    category: "training",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

interface NotificationState {
  isOpen: boolean;
  filterCategory: NotificationCategory;
  readIds: string[];
  dismissedIds: string[];
  customNotifications: CustomNotification[];

  // Actions
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setFilterCategory: (category: NotificationCategory) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  addNotification: (notification: CustomNotification) => void;
  clearAll: () => void;

  // Computed helper
  getAllNotifications: () => CustomNotification[];
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      filterCategory: "all",
      readIds: [],
      dismissedIds: [],
      customNotifications: [],

      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),

      setFilterCategory: (category) => set({ filterCategory: category }),

      markAsRead: (id) =>
        set((state) => {
          if (state.readIds.includes(id)) return state;
          return { readIds: [...state.readIds, id] };
        }),

      markAllAsRead: () => {
        const all = get().getAllNotifications();
        const allIds = all.map((n) => n.id);
        set({ readIds: Array.from(new Set([...get().readIds, ...allIds])) });
      },

      dismissNotification: (id) =>
        set((state) => ({
          dismissedIds: state.dismissedIds.includes(id)
            ? state.dismissedIds
            : [...state.dismissedIds, id],
          readIds: state.readIds.includes(id) ? state.readIds : [...state.readIds, id],
        })),

      addNotification: (notification) =>
        set((state) => ({
          customNotifications: [
            notification,
            ...state.customNotifications.filter((n) => n.id !== notification.id),
          ],
        })),

      clearAll: () => {
        const all = get().getAllNotifications();
        set({
          dismissedIds: all.map((n) => n.id),
          readIds: all.map((n) => n.id),
        });
      },

      getAllNotifications: () => {
        const state = get();
        const combined = [...state.customNotifications, ...SEED_NOTIFICATIONS];
        // Deduplicate by ID and filter out dismissed
        const map = new Map<string, CustomNotification>();
        combined.forEach((n) => {
          if (!map.has(n.id) && !state.dismissedIds.includes(n.id)) {
            map.set(n.id, n);
          }
        });
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      },

      getUnreadCount: () => {
        const state = get();
        const all = state.getAllNotifications();
        return all.filter((n) => !state.readIds.includes(n.id)).length;
      },
    }),
    {
      name: "physiqx-notifications-store-v1",
      partialize: (state) => ({
        readIds: state.readIds,
        dismissedIds: state.dismissedIds,
        customNotifications: state.customNotifications,
      }),
    },
  ),
);
