import { describe, it, expect } from "vitest";
import {
  BIG_4_STANDARDS,
  evaluateLift,
  evaluateStrengthProfile,
  ratioToStrengthScore,
  standardsFor,
  type StrengthBenchmark,
} from "./strengthStandards";

describe("strengthStandards engine", () => {
  const benchBenchmark: StrengthBenchmark = BIG_4_STANDARDS[0]!; // Bench press

  it("classifies an untrained lifter as beginner", () => {
    // 75kg lifter benching 30kg (0.4x BW)
    const result = evaluateLift(benchBenchmark, 30, 75);
    expect(result.currentTier).toBe("beginner");
    expect(result.nextTier).toBe("novice");
    expect(result.kgToNextTier).toBeGreaterThan(0);
    expect(result.ratio).toBe(0.4);
  });

  it("classifies bodyweight bench press (86.25kg on 75kg BW) as intermediate", () => {
    // 75kg * 1.15 = 86.25kg
    const result = evaluateLift(benchBenchmark, 86.5, 75);
    expect(result.currentTier).toBe("intermediate");
    expect(result.nextTier).toBe("advanced");
    expect(result.kgToNextTier).toBeCloseTo(26, 0); // advanced is 112.5kg
  });

  it("classifies an elite bench press accurately", () => {
    // 75kg * 1.85 = 138.75kg
    const result = evaluateLift(benchBenchmark, 140, 75);
    expect(result.currentTier).toBe("elite");
    expect(result.nextTier).toBeNull();
    expect(result.kgToNextTier).toBe(0);
    expect(result.tierProgressPercent).toBe(100);
  });

  it("computes full Big 4 strength profile and total score", () => {
    const profile = evaluateStrengthProfile(
      {
        "ex-bench-press": 100, // 1.33x BW (intermediate)
        "ex-back-squat": 140,       // 1.86x BW (intermediate)
        "ex-deadlift": 180,    // 2.4x BW (advanced)
        "ex-overhead-press": 60, // 0.8x BW (intermediate)
      },
      75
    );

    expect(profile.big3TotalKg).toBe(420); // 100 + 140 + 180
    expect(profile.big4TotalKg).toBe(480); // 420 + 60
    expect(profile.evaluations).toHaveLength(4);
    expect(profile.overallTier).toBe("intermediate");
    expect(profile.totalScore).toBeGreaterThan(50);
    expect(profile.totalScore).toBeLessThanOrEqual(100);
  });

  it("handles zero lifts gracefully without NaN or negative values", () => {
    const profile = evaluateStrengthProfile({}, 75);
    expect(profile.big3TotalKg).toBe(0);
    expect(profile.big4TotalKg).toBe(0);
    expect(profile.totalScore).toBe(0);
    expect(profile.overallTier).toBe("beginner");
    profile.evaluations.forEach((evaluation) => {
      expect(evaluation.currentTier).toBe("beginner");
      expect(evaluation.kgToNextTier).toBeGreaterThan(0);
      expect(evaluation.tierProgressPercent).toBe(0);
    });
  });
});

describe("strength pillar scoring", () => {
  const bench = BIG_4_STANDARDS[0]!.tiers;

  it("rises monotonically with the bodyweight ratio", () => {
    const scores = [0.3, 0.55, 0.8, 1.15, 1.5, 1.85, 2.2].map((ratio) =>
      ratioToStrengthScore(ratio, bench),
    );
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
  });

  it("hits the tier anchors and caps at 100", () => {
    expect(ratioToStrengthScore(bench.novice, bench)).toBe(55);
    expect(ratioToStrengthScore(bench.elite, bench)).toBe(96);
    expect(ratioToStrengthScore(10, bench)).toBe(100);
    expect(ratioToStrengthScore(0, bench)).toBe(0);
  });

  it("gives diminishing returns near the top", () => {
    const lowGain = ratioToStrengthScore(bench.novice, bench) - ratioToStrengthScore(bench.beginner, bench);
    const highGain = ratioToStrengthScore(bench.elite, bench) - ratioToStrengthScore(bench.advanced, bench);
    expect(highGain).toBeLessThan(lowGain);
  });

  it("scales standards down for female athletes", () => {
    const female = standardsFor("female")[0]!.tiers;
    expect(female.intermediate).toBeLessThan(bench.intermediate);
    expect(standardsFor(null)).toBe(BIG_4_STANDARDS);
  });
});

