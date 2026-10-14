import { describe, expect, it } from "vitest";
import { ingestActivities, normalizeActivity, type IncomingActivity } from "./ingest";

const NOW = "2026-10-14T12:00:00.000Z";

const run = (overrides: Partial<IncomingActivity> = {}): IncomingActivity => ({
  source: "gpx",
  externalId: "run-1",
  type: "run",
  startedAt: "2026-10-13T06:30:00.000Z",
  durationMin: 32,
  distanceKm: 6.04,
  ...overrides,
});

describe("normalizeActivity", () => {
  it("builds a stable id and local date", () => {
    const activity = normalizeActivity(run(), NOW)!;
    expect(activity.id).toBe("gpx:run-1");
    expect(activity.distanceKm).toBe(6);
    expect(activity.date).toMatch(/^2026-10-1[34]$/);
  });

  it("rejects impossible activities", () => {
    expect(normalizeActivity(run({ durationMin: 0 }), NOW)).toBeNull();
    expect(normalizeActivity(run({ durationMin: 2000 }), NOW)).toBeNull();
    expect(normalizeActivity(run({ startedAt: "not a date" }), NOW)).toBeNull();
    expect(normalizeActivity(run({ startedAt: "2026-10-20T00:00:00.000Z" }), NOW)).toBeNull();
  });
});

describe("ingestActivities", () => {
  it("adds new activities newest first", () => {
    const result = ingestActivities(
      [],
      [run(), run({ externalId: "run-2", startedAt: "2026-10-14T06:30:00.000Z" })],
      NOW,
    );
    expect(result.added).toBe(2);
    expect(result.activities[0]!.externalId).toBe("run-2");
  });

  it("treats a re-import of the same file as a no-op", () => {
    const first = ingestActivities([], [run()], NOW);
    const again = ingestActivities(first.activities, [run()], NOW);
    expect(again.added).toBe(0);
    expect(again.duplicates).toBe(1);
    expect(again.activities).toHaveLength(1);
  });

  it("merges the same run arriving from two sources, keeping the richer one", () => {
    const fromGpx = ingestActivities([], [run()], NOW).activities;
    const fromTcx = ingestActivities(
      fromGpx,
      [
        run({
          source: "tcx",
          externalId: "garmin-123",
          startedAt: "2026-10-13T06:31:00.000Z",
          durationMin: 31,
          avgHeartRate: 152,
          calories: 410,
          distanceKm: undefined,
        }),
      ],
      NOW,
    );
    expect(fromTcx.activities).toHaveLength(1);
    const merged = fromTcx.activities[0]!;
    expect(merged.source).toBe("tcx");
    expect(merged.avgHeartRate).toBe(152);
    expect(merged.distanceKm).toBe(6); // kept from the GPX copy
  });

  it("enriches rather than replaces when the newcomer is lower priority", () => {
    const fromTcx = ingestActivities([], [run({ source: "tcx" })], NOW).activities;
    const result = ingestActivities(
      fromTcx,
      [run({ source: "gpx", externalId: "other", calories: 300 })],
      NOW,
    );
    expect(result.activities).toHaveLength(1);
    expect(result.activities[0]!.source).toBe("tcx");
    expect(result.activities[0]!.calories).toBe(300);
  });

  it("keeps genuinely different workouts apart", () => {
    const result = ingestActivities(
      ingestActivities([], [run()], NOW).activities,
      [run({ externalId: "walk", type: "walk", startedAt: "2026-10-13T18:00:00.000Z" })],
      NOW,
    );
    expect(result.activities).toHaveLength(2);
  });

  it("counts rejected input", () => {
    expect(ingestActivities([], [run({ durationMin: -5 })], NOW).rejected).toBe(1);
  });
});
