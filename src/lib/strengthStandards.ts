/**
 * Strength Standards Engine
 *
 * Implements canonical strength benchmark standards (inspired by Kilgore, Rippetoe,
 * and ExRx strength tables) normalized by user bodyweight.
 *
 * Tiers:
 * 1. Beginner: Just started resistance training (~0-6 months).
 * 2. Novice: Consistent training with good form (~6-12 months).
 * 3. Intermediate: Experienced lifter (>1-2 years continuous progression).
 * 4. Advanced: Serious athlete with multiple years of focused training (>3-5 years).
 * 5. Elite: Top tier competitive strength athlete (<1% of lifters).
 */

export type StrengthTier = "beginner" | "novice" | "intermediate" | "advanced" | "elite";

export interface StrengthBenchmark {
  exerciseId: string;
  exerciseName: string;
  shortName: string;
  /** Multipliers relative to bodyweight for each tier */
  tiers: Record<StrengthTier, number>;
}

export interface LiftEvaluation {
  exerciseId: string;
  exerciseName: string;
  shortName: string;
  oneRepMaxKg: number;
  ratio: number;
  currentTier: StrengthTier;
  nextTier: StrengthTier | null;
  /** Kg needed to reach the next tier threshold (0 if elite) */
  kgToNextTier: number;
  /** Percent progress within current tier (0-100) */
  tierProgressPercent: number;
  tierThresholdKg: Record<StrengthTier, number>;
}

export interface StrengthOverview {
  bodyweightKg: number;
  evaluations: LiftEvaluation[];
  totalScore: number;
  overallTier: StrengthTier;
  big3TotalKg: number;
  big4TotalKg: number;
}

export const TIER_ORDER: StrengthTier[] = ["beginner", "novice", "intermediate", "advanced", "elite"];

export const TIER_LABELS: Record<StrengthTier, string> = {
  beginner: "Beginner",
  novice: "Novice",
  intermediate: "Intermediate",
  advanced: "Advanced",
  elite: "Elite",
};

export const TIER_COLORS: Record<StrengthTier, { text: string; bg: string; border: string }> = {
  beginner: { text: "text-foreground-secondary", bg: "bg-surface-elevated", border: "border-border" },
  novice: { text: "text-info", bg: "bg-info/10", border: "border-info/30" },
  intermediate: { text: "text-brand", bg: "bg-brand/10", border: "border-brand/30" },
  advanced: { text: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  elite: { text: "text-legendary", bg: "bg-legendary/10", border: "border-legendary/30" },
};

/**
 * Canonical Big 4 Multipliers relative to bodyweight.
 * Calibrated for adult standard weight classes (~75-85kg).
 */
export const BIG_4_STANDARDS: StrengthBenchmark[] = [
  {
    exerciseId: "ex-bench-press",
    exerciseName: "Barbell Bench Press",
    shortName: "Bench Press",
    tiers: {
      beginner: 0.55,
      novice: 0.8,
      intermediate: 1.15,
      advanced: 1.5,
      elite: 1.85,
    },
  },
  {
    exerciseId: "ex-back-squat",
    exerciseName: "Barbell Back Squat",
    shortName: "Back Squat",
    tiers: {
      beginner: 0.75,
      novice: 1.1,
      intermediate: 1.5,
      advanced: 2.0,
      elite: 2.45,
    },
  },
  {
    exerciseId: "ex-deadlift",
    exerciseName: "Barbell Conventional Deadlift",
    shortName: "Deadlift",
    tiers: {
      beginner: 1.0,
      novice: 1.4,
      intermediate: 1.85,
      advanced: 2.4,
      elite: 2.9,
    },
  },
  {
    exerciseId: "ex-overhead-press",
    exerciseName: "Overhead Press",
    shortName: "Overhead Press",
    tiers: {
      beginner: 0.35,
      novice: 0.55,
      intermediate: 0.75,
      advanced: 0.95,
      elite: 1.15,
    },
  },
];

/**
 * Computes exact lift evaluation against standards for a specific weight and 1RM.
 */
export function evaluateLift(
  benchmark: StrengthBenchmark,
  oneRepMaxKg: number,
  bodyweightKg: number
): LiftEvaluation {
  const safeBW = Math.max(30, bodyweightKg);
  const ratio = Math.round((oneRepMaxKg / safeBW) * 100) / 100;

  const thresholds: Record<StrengthTier, number> = {
    beginner: Math.round(benchmark.tiers.beginner * safeBW * 2) / 2,
    novice: Math.round(benchmark.tiers.novice * safeBW * 2) / 2,
    intermediate: Math.round(benchmark.tiers.intermediate * safeBW * 2) / 2,
    advanced: Math.round(benchmark.tiers.advanced * safeBW * 2) / 2,
    elite: Math.round(benchmark.tiers.elite * safeBW * 2) / 2,
  };

  let currentTier: StrengthTier = "beginner";
  let nextTier: StrengthTier | null = "novice";

  if (oneRepMaxKg >= thresholds.elite) {
    currentTier = "elite";
    nextTier = null;
  } else if (oneRepMaxKg >= thresholds.advanced) {
    currentTier = "advanced";
    nextTier = "elite";
  } else if (oneRepMaxKg >= thresholds.intermediate) {
    currentTier = "intermediate";
    nextTier = "advanced";
  } else if (oneRepMaxKg >= thresholds.novice) {
    currentTier = "novice";
    nextTier = "intermediate";
  } else {
    currentTier = "beginner";
    nextTier = "novice";
  }

  let kgToNextTier = 0;
  let tierProgressPercent = 100;

  if (nextTier) {
    const nextTargetKg = thresholds[nextTier];
    const currentBaseKg = thresholds[currentTier];
    kgToNextTier = Math.max(0, Math.round((nextTargetKg - oneRepMaxKg) * 2) / 2);
    const tierSpan = nextTargetKg - currentBaseKg;
    if (tierSpan > 0) {
      const progress = ((oneRepMaxKg - currentBaseKg) / tierSpan) * 100;
      tierProgressPercent = Math.min(100, Math.max(0, Math.round(progress)));
    }
  }

  return {
    exerciseId: benchmark.exerciseId,
    exerciseName: benchmark.exerciseName,
    shortName: benchmark.shortName,
    oneRepMaxKg,
    ratio,
    currentTier,
    nextTier,
    kgToNextTier,
    tierProgressPercent,
    tierThresholdKg: thresholds,
  };
}

/**
 * Evaluates the full Big 4 strength profile for a user.
 */
export function evaluateStrengthProfile(
  lifts: Record<string, number>,
  bodyweightKg: number = 75
): StrengthOverview {
  const evaluations = BIG_4_STANDARDS.map((benchmark) => {
    const lift1RM = lifts[benchmark.exerciseId] || lifts[benchmark.shortName.toLowerCase()] || 0;
    return evaluateLift(benchmark, lift1RM, bodyweightKg);
  });

  const tierScores: Record<StrengthTier, number> = {
    beginner: 1,
    novice: 2,
    intermediate: 3,
    advanced: 4,
    elite: 5,
  };

  const avgScore =
    evaluations.reduce((acc, curr) => acc + tierScores[curr.currentTier], 0) /
    evaluations.length;

  let overallTier: StrengthTier = "beginner";
  if (avgScore >= 4.5) overallTier = "elite";
  else if (avgScore >= 3.5) overallTier = "advanced";
  else if (avgScore >= 2.5) overallTier = "intermediate";
  else if (avgScore >= 1.5) overallTier = "novice";

  const benchKg = evaluations.find((e) => e.exerciseId === "ex-bench-press")?.oneRepMaxKg || 0;
  const squatKg = evaluations.find((e) => e.exerciseId === "ex-back-squat")?.oneRepMaxKg || 0;
  const deadliftKg = evaluations.find((e) => e.exerciseId === "ex-deadlift")?.oneRepMaxKg || 0;
  const ohpKg = evaluations.find((e) => e.exerciseId === "ex-overhead-press")?.oneRepMaxKg || 0;

  const big3TotalKg = benchKg + squatKg + deadliftKg;
  const big4TotalKg = big3TotalKg + ohpKg;

  // Normalized score 0 - 100 based on bodyweight ratios
  const totalRatio = big3TotalKg / Math.max(30, bodyweightKg);
  // 6.25x BW is an elite powerlifting total (~100 score)
  const totalScore = Math.min(100, Math.round((totalRatio / 6.25) * 100));

  return {
    bodyweightKg,
    evaluations,
    totalScore,
    overallTier,
    big3TotalKg,
    big4TotalKg,
  };
}

// ---------------------------------------------------------------------------
// Strength pillar scoring
// ---------------------------------------------------------------------------

/**
 * Female standards as a fraction of the (male-calibrated) multipliers above,
 * from published strength tables: upper-body lifts sit lower relative to
 * bodyweight than lower-body lifts.
 */
const FEMALE_STANDARD_FACTOR: Record<string, number> = {
  "ex-bench-press": 0.57,
  "ex-back-squat": 0.7,
  "ex-deadlift": 0.7,
  "ex-overhead-press": 0.6,
};

/** The Big 4 standards for an athlete's sex (male tables when unknown). */
export function standardsFor(sex: "male" | "female" | null): StrengthBenchmark[] {
  if (sex !== "female") return BIG_4_STANDARDS;
  return BIG_4_STANDARDS.map((benchmark) => {
    const factor = FEMALE_STANDARD_FACTOR[benchmark.exerciseId] ?? 0.65;
    const tiers = Object.fromEntries(
      TIER_ORDER.map((tier) => [tier, Math.round(benchmark.tiers[tier] * factor * 100) / 100]),
    ) as Record<StrengthTier, number>;
    return { ...benchmark, tiers };
  });
}

/**
 * Pillar value at each tier threshold. Diminishing returns: the climb from
 * nothing to Novice is worth more points than Advanced to Elite, so
 * beginners are rewarded quickly and the top stays hard to earn.
 */
const TIER_SCORE_ANCHORS: Record<StrengthTier, number> = {
  beginner: 35,
  novice: 55,
  intermediate: 72,
  advanced: 86,
  elite: 96,
};

/** Maps a lift's e1RM-to-bodyweight ratio onto the 0–100 pillar scale. */
export function ratioToStrengthScore(ratio: number, tiers: Record<StrengthTier, number>): number {
  if (ratio <= 0) return 0;
  const anchors: [number, number][] = [
    [0, 10],
    ...TIER_ORDER.map((tier): [number, number] => [tiers[tier], TIER_SCORE_ANCHORS[tier]]),
    [tiers.elite * 1.15, 100],
  ];
  for (let index = 1; index < anchors.length; index++) {
    const [x1, y1] = anchors[index]!;
    if (ratio <= x1) {
      const [x0, y0] = anchors[index - 1]!;
      return Math.round(y0 + ((ratio - x0) / (x1 - x0)) * (y1 - y0));
    }
  }
  return 100;
}
