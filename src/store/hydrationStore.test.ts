import { describe, it, expect, beforeEach } from "vitest";
import { useHydrationStore, getTodayHydrationTotal, type HydrationEntry } from "./hydrationStore";

describe("hydrationStore", () => {
  beforeEach(() => {
    useHydrationStore.setState({
      entries: [],
      dailyGoalMl: 3000,
    });
  });

  it("initializes with zero entries when cleared and target of 3000ml", () => {
    const state = useHydrationStore.getState();
    expect(state.entries).toEqual([]);
    expect(state.dailyGoalMl).toBe(3000);
    expect(getTodayHydrationTotal(state.entries)).toBe(0);
  });

  it("appends water entries and computes today's sum accurately", () => {
    const store = useHydrationStore.getState();
    store.addWater(250);
    store.addWater(500);

    const updated = useHydrationStore.getState();
    expect(updated.entries.length).toBe(2);
    expect(getTodayHydrationTotal(updated.entries)).toBe(750);
  });

  it("filters out past dates when computing today's intake total", () => {
    const today = new Date().toISOString().split("T")[0]!;
    const pastEntries: HydrationEntry[] = [
      { id: "old-1", amountMl: 1000, timestamp: "2026-01-01T10:00:00Z", date: "2026-01-01" },
      { id: "today-1", amountMl: 750, timestamp: new Date().toISOString(), date: today },
    ];

    expect(getTodayHydrationTotal(pastEntries)).toBe(750);
  });

  it("resets today's entries without removing past days", () => {
    const today = new Date().toISOString().split("T")[0]!;
    useHydrationStore.setState({
      entries: [
        { id: "old-1", amountMl: 1000, timestamp: "2026-01-01T10:00:00Z", date: "2026-01-01" },
        { id: "today-1", amountMl: 500, timestamp: new Date().toISOString(), date: today },
      ],
    });

    useHydrationStore.getState().resetToday();

    const remaining = useHydrationStore.getState().entries;
    expect(remaining.length).toBe(1);
    expect(remaining[0]?.id).toBe("old-1");
  });
});
