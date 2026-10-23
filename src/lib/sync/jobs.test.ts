import { describe, expect, it } from "vitest";
import { buildProfileSnapshot } from "@/features/profile/lib/profileSnapshot";
import { useProfileStore } from "@/store/profileStore";
import type { UserPlan } from "@/types/plan";
import { backfillJobs, jobForEvent } from "./jobs";

const pristine = useProfileStore.getState();
const plan: UserPlan = { id: "plan-1", name: "Upper Lower", days: [] };
const snapshot = () => buildProfileSnapshot(pristine, null, "2026-10-23T08:00:00.000Z");

describe("jobForEvent", () => {
  it("maps each change to the record it uploads", () => {
    const weighIn = { date: "2026-10-23", weightKg: 81.4 };
    expect(jobForEvent({ type: "weighInLogged", weighIn }, snapshot)).toEqual({
      kind: "weighIn",
      id: "2026-10-23",
      weighIn,
    });
    expect(jobForEvent({ type: "planSaved", plan }, snapshot)).toEqual({ kind: "plan", id: "plan-1", plan });
    expect(jobForEvent({ type: "planDeleted", planId: "plan-1" }, snapshot)).toEqual({
      kind: "planDelete",
      id: "plan-1",
    });
    expect(jobForEvent({ type: "cardioRemoved", activityId: "gpx:1" }, snapshot)).toEqual({
      kind: "cardioDelete",
      id: "gpx:1",
    });
  });

  it("reads the profile when the change is queued", () => {
    expect(jobForEvent({ type: "profileChanged" }, snapshot)).toMatchObject({
      kind: "profile",
      id: "me",
      profile: { updatedAt: "2026-10-23T08:00:00.000Z" },
    });
  });
});

describe("backfillJobs", () => {
  it("skips a profile nobody filled in, so defaults never overwrite an account", () => {
    expect(backfillJobs({ profile: pristine, plans: [], activePlanId: null })).toEqual([]);
  });

  it("queues every weigh-in, every plan and the profile", () => {
    const profile = {
      ...pristine,
      displayName: "Sam",
      weightEntries: [
        { date: "2026-10-01", weightKg: 82 },
        { date: "2026-10-08", weightKg: 81.5 },
      ],
    };
    const jobs = backfillJobs({ profile, plans: [plan], activePlanId: plan.id });
    expect(jobs.map((job) => `${job.kind}:${job.id}`)).toEqual([
      "weighIn:2026-10-01",
      "weighIn:2026-10-08",
      "plan:plan-1",
      "profile:me",
    ]);
  });

  it("dates a backfilled profile no later than onboarding, so a newer device wins", () => {
    const onboarded = {
      ...pristine,
      onboardingProfile: { goal: "cut" as const, completedAt: "2026-09-01T10:00:00.000Z" },
    };
    const [fromOnboarding] = backfillJobs({ profile: onboarded, plans: [], activePlanId: null });
    expect(fromOnboarding).toMatchObject({ profile: { updatedAt: "2026-09-01T10:00:00.000Z" } });

    const [undated] = backfillJobs({ profile: { ...pristine, heightCm: 180 }, plans: [], activePlanId: null });
    expect(undated).toMatchObject({ profile: { updatedAt: "1970-01-01T00:00:00.000Z" } });
  });
});
