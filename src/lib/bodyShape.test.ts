import { describe, expect, it } from "vitest";
import { BODY_BUILDS, computeBodyShapeValue } from "./bodyShape";

describe("BODY_BUILDS", () => {
  it("is ordered by rising value with narrowing gaps near the top", () => {
    const values = BODY_BUILDS.map((build) => build.basePercent);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(values[0]).toBe(15);
    expect(values.at(-1)).toBe(96);
    const lastGap = values.at(-1)! - values.at(-2)!;
    const firstGap = values[1]! - values[0]!;
    expect(lastGap).toBeLessThan(firstGap);
  });
});

describe("computeBodyShapeValue", () => {
  const base = { sex: "male" as const, heightCm: 178, age: 25 };

  it("uses the build's base value for a young, average-height athlete", () => {
    expect(computeBodyShapeValue({ ...base, build: "athletic" })).toBe(80);
  });

  it("credits age: 50 at Athletic equals 25 at Muscular", () => {
    expect(computeBodyShapeValue({ ...base, build: "athletic", age: 50 })).toBe(
      computeBodyShapeValue({ ...base, build: "muscular" }),
    );
  });

  it("caps the age credit at +12", () => {
    expect(computeBodyShapeValue({ ...base, build: "lean", age: 80 })).toBe(68 + 12);
  });

  it("adds the tall-frame bonus only to muscle-forward builds", () => {
    expect(computeBodyShapeValue({ ...base, build: "athletic", heightCm: 190 })).toBe(84);
    expect(computeBodyShapeValue({ ...base, build: "lean", heightCm: 190 })).toBe(68);
    expect(
      computeBodyShapeValue({ build: "athletic", sex: "female", heightCm: 174, age: 25 }),
    ).toBe(84);
  });

  it("never exceeds 100 and tolerates unknown sex/height/age", () => {
    expect(computeBodyShapeValue({ build: "powerful", sex: "male", heightCm: 195, age: 70 })).toBe(
      100,
    );
    expect(computeBodyShapeValue({ build: "lean", sex: null, heightCm: null, age: null })).toBe(68);
  });
});
