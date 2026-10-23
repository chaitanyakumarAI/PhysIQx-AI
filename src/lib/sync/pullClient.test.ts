import { beforeAll, describe, expect, it, vi } from "vitest";
import { useCardioStore } from "@/store/cardioStore";
import { usePlansStore } from "@/store/plansStore";
import { useProfileStore } from "@/store/profileStore";
import { useSessionStore } from "@/store/sessionStore";
import { makeCardio } from "@/test/fixtures";

// The stores bind to localStorage when created (at import), so it must
// exist before the imports run.
const memory = vi.hoisted(() => {
  const memory = new Map<string, string>();
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => void memory.set(key, value),
    removeItem: (key: string) => void memory.delete(key),
    clear: () => memory.clear(),
    key: (index: number) => [...memory.keys()][index] ?? null,
    get length() {
      return memory.size;
    },
  };
  // Object.keys(localStorage) lists the stored keys, as in browsers.
  const proxy = new Proxy(storage, {
    ownKeys: () => [...memory.keys()],
    getOwnPropertyDescriptor: (target, key) =>
      typeof key === "string" && memory.has(key)
        ? { enumerable: true, configurable: true, value: memory.get(key) }
        : Reflect.getOwnPropertyDescriptor(target, key),
  });
  Object.assign(globalThis, { window: { localStorage: proxy, dispatchEvent: () => true }, localStorage: proxy });
  return memory;
});

beforeAll(async () => {
  for (const store of [useSessionStore, useCardioStore, useProfileStore, usePlansStore]) {
    await store.persist.rehydrate();
  }
});

describe("clearLocalData", () => {
  it("empties the ledger and forgets restore cursors, keeping other device settings", async () => {
    const { clearLocalData } = await import("./pullClient");
    useCardioStore.setState({ activities: [makeCardio("2026-10-20", 30, "run")] });
    useProfileStore.setState({ displayName: "Sam", weightEntries: [{ date: "2026-10-20", weightKg: 80 }] });
    usePlansStore.setState({ plans: [{ id: "p", name: "p", days: [] }], activePlanId: "p" });
    memory.set("physiqx-sync-cursor:user-a", "{}");
    memory.set("physiqx-sync-last-pull:user-a", "2026-10-23T10:00:00.000Z");
    memory.set("physiqx-sync-backfill-v1", "2026-10-23T10:00:00.000Z");

    await clearLocalData();

    expect(useCardioStore.getState().activities).toEqual([]);
    expect(useProfileStore.getState()).toMatchObject({ displayName: null, weightEntries: [] });
    expect(usePlansStore.getState()).toMatchObject({ plans: [], activePlanId: null });
    expect(typeof usePlansStore.getState().savePlan).toBe("function");
    expect(memory.has("physiqx-sync-cursor:user-a")).toBe(false);
    expect(memory.has("physiqx-sync-last-pull:user-a")).toBe(false);
    expect(memory.has("physiqx-sync-backfill-v1")).toBe(true);
  });
});
