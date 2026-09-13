import { describe, it, expect, beforeEach } from "vitest";
import { useNotificationStore, SEED_NOTIFICATIONS } from "./notificationStore";

describe("notificationStore", () => {
  beforeEach(() => {
    useNotificationStore.setState({
      isOpen: false,
      filterCategory: "all",
      readIds: [],
      dismissedIds: [],
      customNotifications: [],
    });
  });

  it("initializes with zero read IDs and calculates unread seed count", () => {
    const { getUnreadCount, getAllNotifications } = useNotificationStore.getState();
    const count = getUnreadCount();
    expect(count).toBe(SEED_NOTIFICATIONS.length);
    expect(getAllNotifications().length).toBe(SEED_NOTIFICATIONS.length);
  });

  it("marks a specific notification as read and decrements unread count", () => {
    const { markAsRead, getUnreadCount } = useNotificationStore.getState();
    const targetId = SEED_NOTIFICATIONS[0]!.id;

    markAsRead(targetId);

    const state = useNotificationStore.getState();
    expect(state.readIds).toContain(targetId);
    expect(state.getUnreadCount()).toBe(SEED_NOTIFICATIONS.length - 1);
  });

  it("marks all notifications as read", () => {
    const { markAllAsRead, getUnreadCount } = useNotificationStore.getState();

    markAllAsRead();

    const state = useNotificationStore.getState();
    expect(state.getUnreadCount()).toBe(0);
    expect(state.readIds.length).toBe(SEED_NOTIFICATIONS.length);
  });

  it("dismisses a notification and removes it from active list", () => {
    const { dismissNotification, getAllNotifications } = useNotificationStore.getState();
    const targetId = SEED_NOTIFICATIONS[0]!.id;

    dismissNotification(targetId);

    const remaining = useNotificationStore.getState().getAllNotifications();
    expect(remaining.some((n) => n.id === targetId)).toBe(false);
    expect(remaining.length).toBe(SEED_NOTIFICATIONS.length - 1);
  });

  it("adds and prioritizes a new dynamic notification", () => {
    const { addNotification, getAllNotifications } = useNotificationStore.getState();

    addNotification({
      id: "notif-pr-test",
      type: "score_recap",
      title: "New Bench 1RM!",
      body: "You pressed 102.5 kg.",
      deepLink: "/train/exercises/ex-bench-press",
      priority: "high",
      category: "training",
      createdAt: new Date(Date.now() + 1000).toISOString(),
    });

    const all = useNotificationStore.getState().getAllNotifications();
    expect(all[0]?.id).toBe("notif-pr-test");
  });

  it("controls drawer open and close states", () => {
    const store = useNotificationStore.getState();
    expect(store.isOpen).toBe(false);

    store.openDrawer();
    expect(useNotificationStore.getState().isOpen).toBe(true);

    store.closeDrawer();
    expect(useNotificationStore.getState().isOpen).toBe(false);

    store.toggleDrawer();
    expect(useNotificationStore.getState().isOpen).toBe(true);
  });
});
