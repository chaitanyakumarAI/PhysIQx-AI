import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { onSyncEvent, type SyncEvent } from "@/lib/sync/syncEvents";
import { makeCardio } from "@/test/fixtures";
import type { UserPlan } from "@/types/plan";
import { useCardioStore } from "./cardioStore";
import { usePlansStore } from "./plansStore";
import { useProfileStore } from "./profileStore";

/** The stores tell the sync client about user changes — and only those. */
let events: string[] = [];
const plan = (id: string): UserPlan => ({ id, name: id, days: [] });

beforeEach(() => {
  events = [];
  onSyncEvent((event: SyncEvent) => events.push(event.type));
  usePlansStore.setState({ plans: [], activePlanId: null });
  useCardioStore.setState({ activities: [makeCardio("2026-10-20", 30, "run", { id: "gpx:1" })] });
});

afterEach(() => onSyncEvent(null));

describe("plans", () => {
  it("announces saves, deletes and active-plan changes", () => {
    usePlansStore.getState().savePlan(plan("a")); // first plan becomes active
    usePlansStore.getState().savePlan(plan("b"));
    usePlansStore.getState().setActivePlan("b");
    usePlansStore.getState().setActivePlan("b"); // no change
    usePlansStore.getState().deletePlan("b"); // active moves back to "a"
    usePlansStore.getState().deletePlan("missing");
    expect(events).toEqual([
      "planSaved",
      "profileChanged",
      "planSaved",
      "profileChanged",
      "planDeleted",
      "profileChanged",
    ]);
  });
});

describe("profile", () => {
  it("announces synced fields and weigh-ins, not device-only state", () => {
    const profile = useProfileStore.getState();
    profile.logWeight(80, "2026-10-23");
    profile.setHeight(180);
    profile.updatePreferences({ trackRpe: true });
    profile.setDemoMode(true);
    profile.addPhoto({ date: "2026-10-23", angle: "front", dataUrl: "data:image/png;base64," });
    expect(events).toEqual(["weighInLogged", "profileChanged", "profileChanged"]);
    profile.setDemoMode(false);
  });
});

describe("cardio", () => {
  it("announces removals so they reach other devices", () => {
    useCardioStore.getState().removeActivity("gpx:1");
    expect(events).toEqual(["cardioRemoved"]);
    expect(useCardioStore.getState().activities).toEqual([]);
  });
});
