import { describe, expect, it } from "vitest";
import { cardioActivitySchema } from "./cardioSchema";

const run = {
  id: "gpx:2026-10-23T06:00:00.000Z",
  source: "gpx",
  externalId: "2026-10-23T06:00:00.000Z",
  type: "run",
  startedAt: "2026-10-23T06:00:00.000Z",
  date: "2026-10-23",
  durationMin: 31.5,
  distanceKm: 5.2,
  avgHeartRate: 151,
  importedAt: "2026-10-23T08:00:00.000Z",
};

describe("cardioActivitySchema", () => {
  it("accepts an imported activity", () => {
    expect(cardioActivitySchema.safeParse(run).success).toBe(true);
  });

  it("rejects impossible values and unknown sources", () => {
    expect(cardioActivitySchema.safeParse({ ...run, distanceKm: 5000 }).success).toBe(false);
    expect(cardioActivitySchema.safeParse({ ...run, avgHeartRate: 400 }).success).toBe(false);
    expect(cardioActivitySchema.safeParse({ ...run, durationMin: 0 }).success).toBe(false);
    expect(cardioActivitySchema.safeParse({ ...run, source: "fitbit" }).success).toBe(false);
  });
});
