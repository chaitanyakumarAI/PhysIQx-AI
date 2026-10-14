import { describe, expect, it } from "vitest";
import {
  SET_LIMITS,
  computeEarnedXp,
  resolveCompletionValues,
  sanitizeReps,
  sanitizeRpe,
  sanitizeWeight,
} from "./setValidation";

describe("sanitizeWeight", () => {
  it("rejects negatives and caps absurd loads", () => {
    expect(sanitizeWeight(-20)).toBe(0);
    expect(sanitizeWeight(5000)).toBe(SET_LIMITS.maxWeightKg);
  });
  it("keeps empty as empty and rounds to 0.01 kg", () => {
    expect(sanitizeWeight(null)).toBeNull();
    expect(sanitizeWeight(Number.NaN)).toBeNull();
    expect(sanitizeWeight(62.5)).toBe(62.5);
    expect(sanitizeWeight(1.23456)).toBe(1.23);
  });
});

describe("sanitizeReps", () => {
  it("rounds to whole reps and caps", () => {
    expect(sanitizeReps(8.6)).toBe(9);
    expect(sanitizeReps(500)).toBe(SET_LIMITS.maxReps);
    expect(sanitizeReps(-3)).toBe(0);
  });
  it("allows longer values for timed sets", () => {
    expect(sanitizeReps(900, true)).toBe(900);
    expect(sanitizeReps(99999, true)).toBe(SET_LIMITS.maxSeconds);
  });
});

describe("sanitizeRpe", () => {
  it("clamps to 1–10 in half steps", () => {
    expect(sanitizeRpe(12)).toBe(10);
    expect(sanitizeRpe(0)).toBe(1);
    expect(sanitizeRpe(8.3)).toBe(8.5);
    expect(sanitizeRpe(null)).toBeNull();
  });
});

describe("resolveCompletionValues", () => {
  const blank = { weight: null, reps: null };

  it("refuses a set with no reps anywhere", () => {
    expect(resolveCompletionValues(blank)).toEqual({ ok: false, missing: "reps" });
    expect(resolveCompletionValues({ weight: 60, reps: 0 })).toEqual({
      ok: false,
      missing: "reps",
    });
  });

  it("accepts ghost values for empty fields", () => {
    expect(resolveCompletionValues(blank, { weight: 60, reps: 8 }, "barbell")).toEqual({
      ok: true,
      values: { weight: 60, reps: 8 },
    });
  });

  it("prefers typed values over ghosts", () => {
    expect(
      resolveCompletionValues({ weight: 70, reps: null }, { weight: 60, reps: 8 }, "barbell"),
    ).toEqual({ ok: true, values: { weight: 70, reps: 8 } });
  });

  it("requires a load on loaded equipment", () => {
    expect(resolveCompletionValues(blank, { weight: null, reps: 8 }, "barbell")).toEqual({
      ok: false,
      missing: "weight",
    });
    expect(resolveCompletionValues({ weight: 0, reps: 8 }, null, "dumbbell")).toEqual({
      ok: false,
      missing: "weight",
    });
  });

  it("allows bodyweight sets (and unknown equipment) with no load", () => {
    expect(resolveCompletionValues({ weight: null, reps: 12 }, null, "bodyweight")).toEqual({
      ok: true,
      values: { weight: null, reps: 12 },
    });
    expect(resolveCompletionValues({ weight: null, reps: 12 })).toEqual({
      ok: true,
      values: { weight: null, reps: 12 },
    });
  });

  it("allows timed sets without a load", () => {
    expect(
      resolveCompletionValues({ weight: null, reps: 45, durationSeconds: 45 }, null, "plate"),
    ).toEqual({ ok: true, values: { weight: null, reps: 45 } });
  });

  it("sanitizes what it accepts", () => {
    expect(resolveCompletionValues({ weight: -20, reps: 500 })).toEqual({
      ok: true,
      values: { weight: 0, reps: SET_LIMITS.maxReps },
    });
  });
});

describe("computeEarnedXp", () => {
  it("pays in proportion to completed sets", () => {
    expect(computeEarnedXp(320, 19, 19)).toBe(320);
    expect(computeEarnedXp(320, 3, 19)).toBe(51);
    expect(computeEarnedXp(320, 0, 19)).toBe(0);
  });
  it("never exceeds the reward or divides by zero", () => {
    expect(computeEarnedXp(320, 25, 19)).toBe(320);
    expect(computeEarnedXp(320, 0, 0)).toBe(0);
  });
});
