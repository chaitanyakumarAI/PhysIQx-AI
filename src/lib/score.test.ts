import { describe, expect, it } from "vitest";
import {
  computeWeightedScore,
  findWeakestPillar,
  orderPillarsByWeight,
  pillarWeights,
  scoreBand,
} from "./score";
import type { PillarScore } from "@/types/score";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fullPillars: PillarScore[] = [
  { id: "consistency", label: "Consistency", value: 80 },
  { id: "strength",    label: "Strength",    value: 60 },
  { id: "cardio",      label: "Cardio",      value: 40 },
  { id: "bodyShape",   label: "Body Shape",  value: 70 },
];

// ---------------------------------------------------------------------------
// pillarWeights
// ---------------------------------------------------------------------------

describe("pillarWeights", () => {
  it("all four pillars are present", () => {
    expect(Object.keys(pillarWeights)).toEqual(
      expect.arrayContaining(["consistency", "strength", "cardio", "bodyShape"]),
    );
  });

  it("weights sum to exactly 1", () => {
    const total = Object.values(pillarWeights).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it("consistency has the highest weight", () => {
    const max = Math.max(...Object.values(pillarWeights));
    expect(pillarWeights.consistency).toBe(max);
  });
});

// ---------------------------------------------------------------------------
// computeWeightedScore
// ---------------------------------------------------------------------------

describe("computeWeightedScore", () => {
  it("returns 0 for an empty pillar list", () => {
    expect(computeWeightedScore([])).toBe(0);
  });

  it("returns the value itself when only one pillar is present", () => {
    const single: PillarScore[] = [
      { id: "consistency", label: "Consistency", value: 72 },
    ];
    expect(computeWeightedScore(single)).toBe(72);
  });

  it("returns 100 when all pillars are at 100", () => {
    const perfect: PillarScore[] = fullPillars.map((p) => ({
      ...p,
      value: 100,
    }));
    expect(computeWeightedScore(perfect)).toBe(100);
  });

  it("returns 0 when all pillars are at 0", () => {
    const zero: PillarScore[] = fullPillars.map((p) => ({ ...p, value: 0 }));
    expect(computeWeightedScore(zero)).toBe(0);
  });

  it("normalizes correctly for a partial pillar list (calibration scenario)", () => {
    // Only consistency + strength present — total weight is 0.3 + 0.25 = 0.55.
    // Weighted sum: 80×0.3 + 60×0.25 = 24 + 15 = 39. Normalized: 39/0.55 ≈ 70.9 → 71.
    const partial: PillarScore[] = [
      { id: "consistency", label: "Consistency", value: 80 },
      { id: "strength",    label: "Strength",    value: 60 },
    ];
    expect(computeWeightedScore(partial)).toBe(71);
  });

  it("produces a weighted result, not a simple average", () => {
    // Simple average of fullPillars = (80+60+40+70)/4 = 62.5 → 63.
    // Weighted (consistency 30%, strength 25%, cardio 25%, body 20%):
    //   80×0.3 + 60×0.25 + 40×0.25 + 70×0.20 = 24+15+10+14 = 63 → still 63 here by coincidence.
    // Use extreme values to make the difference obvious.
    const skewed: PillarScore[] = [
      { id: "consistency", label: "Consistency", value: 100 }, // 30% weight
      { id: "strength",    label: "Strength",    value: 0   }, // 25%
      { id: "cardio",      label: "Cardio",      value: 0   }, // 25%
      { id: "bodyShape",   label: "Body Shape",  value: 0   }, // 20%
    ];
    // Simple average would be 25. Weighted: 100×0.3 / 1.0 = 30.
    expect(computeWeightedScore(skewed)).toBe(30);
    expect(computeWeightedScore(skewed)).not.toBe(25);
  });

  it("rounds to the nearest integer", () => {
    // Force a value that rounds: e.g. 80×0.3 + 55×0.25 + 45×0.25 + 70×0.2
    //   = 24 + 13.75 + 11.25 + 14 = 63.0 — round number, adjust to get a fraction.
    const fractional: PillarScore[] = [
      { id: "consistency", label: "Consistency", value: 80 },
      { id: "strength",    label: "Strength",    value: 55 },
      { id: "cardio",      label: "Cardio",      value: 46 },
      { id: "bodyShape",   label: "Body Shape",  value: 70 },
    ];
    const result = computeWeightedScore(fractional);
    expect(Number.isInteger(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// findWeakestPillar
// ---------------------------------------------------------------------------

describe("findWeakestPillar", () => {
  it("returns the pillar with the lowest value", () => {
    expect(findWeakestPillar(fullPillars)).toBe("cardio"); // value 40
  });

  it("works with a single pillar", () => {
    const single: PillarScore[] = [
      { id: "bodyShape", label: "Body Shape", value: 55 },
    ];
    expect(findWeakestPillar(single)).toBe("bodyShape");
  });

  it("returns one of the tied pillars when values are equal (no crash)", () => {
    const tied: PillarScore[] = [
      { id: "consistency", label: "Consistency", value: 50 },
      { id: "strength",    label: "Strength",    value: 50 },
      { id: "cardio",      label: "Cardio",      value: 50 },
      { id: "bodyShape",   label: "Body Shape",  value: 50 },
    ];
    const result = findWeakestPillar(tied);
    expect(["consistency", "strength", "cardio", "bodyShape"]).toContain(result);
  });

  it("does not return a pillar with value 0 if another pillar is lower (impossible edge)", () => {
    // All at 100 except one at 0 — weakest must be the 0.
    const oneZero: PillarScore[] = [
      { id: "consistency", label: "Consistency", value: 100 },
      { id: "strength",    label: "Strength",    value: 0   },
      { id: "cardio",      label: "Cardio",      value: 100 },
      { id: "bodyShape",   label: "Body Shape",  value: 100 },
    ];
    expect(findWeakestPillar(oneZero)).toBe("strength");
  });
});

// ---------------------------------------------------------------------------
// scoreBand
// ---------------------------------------------------------------------------

describe("scoreBand", () => {
  it("90 and above → Elite", () => {
    expect(scoreBand(90)).toBe("Elite");
    expect(scoreBand(100)).toBe("Elite");
    expect(scoreBand(95)).toBe("Elite");
  });

  it("80–89 → Excellent", () => {
    expect(scoreBand(80)).toBe("Excellent");
    expect(scoreBand(89)).toBe("Excellent");
  });

  it("65–79 → Solid", () => {
    expect(scoreBand(65)).toBe("Solid");
    expect(scoreBand(79)).toBe("Solid");
  });

  it("50–64 → Building", () => {
    expect(scoreBand(50)).toBe("Building");
    expect(scoreBand(64)).toBe("Building");
  });

  it("below 50 → Getting started", () => {
    expect(scoreBand(49)).toBe("Getting started");
    expect(scoreBand(0)).toBe("Getting started");
  });

  it("threshold boundaries are exact (no off-by-one)", () => {
    expect(scoreBand(89)).toBe("Excellent"); // not Elite
    expect(scoreBand(79)).toBe("Solid");     // not Excellent
    expect(scoreBand(64)).toBe("Building");  // not Solid
    expect(scoreBand(49)).toBe("Getting started"); // not Building
  });
});

// ---------------------------------------------------------------------------
// orderPillarsByWeight
// ---------------------------------------------------------------------------

describe("orderPillarsByWeight", () => {
  it("returns pillars in descending weight order", () => {
    const ordered = orderPillarsByWeight(fullPillars);
    const ids = ordered.map((p) => p.id);
    // Expected: consistency(0.3) → strength(0.25) → cardio(0.25) → bodyShape(0.20)
    expect(ids[0]).toBe("consistency");
    expect(ids[ids.length - 1]).toBe("bodyShape");
  });

  it("does not mutate the original array", () => {
    const original = [...fullPillars];
    orderPillarsByWeight(fullPillars);
    expect(fullPillars).toEqual(original);
  });

  it("handles a single pillar without crashing", () => {
    const single: PillarScore[] = [
      { id: "cardio", label: "Cardio", value: 70 },
    ];
    expect(orderPillarsByWeight(single)).toHaveLength(1);
  });
});
