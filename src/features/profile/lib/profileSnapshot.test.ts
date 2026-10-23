import { describe, expect, it } from "vitest";
import { DEFAULT_USER_PREFERENCES, useProfileStore } from "@/store/profileStore";
import { buildProfileSnapshot, profileSnapshotSchema, toProfileRow } from "./profileSnapshot";

const pristine = useProfileStore.getState();
const AT = "2026-10-23T13:30:00+05:30";

describe("buildProfileSnapshot", () => {
  it("produces what the server accepts, for a new and a filled-in athlete", () => {
    expect(profileSnapshotSchema.safeParse(buildProfileSnapshot(pristine, null, AT)).success).toBe(true);
    const filled = {
      ...pristine,
      displayName: "  Sam ",
      sex: "female" as const,
      birthYear: 1996,
      heightCm: 168,
      currentBuild: "athletic" as const,
      avatarPresetId: "gen-z-girl",
      showcaseAchievementIds: ["first-workout"],
      onboardingProfile: {
        goal: "bulk" as const,
        experienceLevel: "intermediate" as const,
        activeSplit: "ppl" as const,
        trainingDaysPerWeek: 4,
        completedAt: "2026-09-01T10:00:00.000Z",
      },
    };
    expect(profileSnapshotSchema.parse(buildProfileSnapshot(filled, "plan-1", AT))).toMatchObject({
      displayName: "Sam",
      activePlanId: "plan-1",
    });
  });

  it("fills preferences an older saved state is missing", () => {
    const old = { ...pristine, preferences: { trackRpe: true } as typeof pristine.preferences };
    expect(buildProfileSnapshot(old, null, AT).settings.preferences).toEqual({
      ...DEFAULT_USER_PREFERENCES,
      trackRpe: true,
    });
  });

  it("rejects impossible values", () => {
    const snapshot = buildProfileSnapshot({ ...pristine, heightCm: 900 }, null, AT);
    expect(profileSnapshotSchema.safeParse(snapshot).success).toBe(false);
  });
});

describe("toProfileRow", () => {
  it("never writes nulls over what another device told the server", () => {
    const row = toProfileRow(buildProfileSnapshot({ ...pristine, heightCm: 180 }, null, AT));
    expect(row).toEqual({
      height_cm: 180,
      settings: expect.any(Object),
      client_updated_at: "2026-10-23T08:00:00.000Z",
    });
  });

  it("maps onboarding answers to their columns", () => {
    const onboarded = {
      ...pristine,
      onboardingProfile: { goal: "cut" as const, trainingDaysPerWeek: 5, completedAt: "2026-09-01T10:00:00.000Z" },
    };
    const row = toProfileRow(buildProfileSnapshot(onboarded, "plan-1", AT));
    expect(row).toMatchObject({
      goal: "cut",
      training_days_per_week: 5,
      onboarding_completed_at: "2026-09-01T10:00:00.000Z",
      active_plan_ref: "plan-1",
    });
    expect(row).not.toHaveProperty("experience_level");
  });
});
