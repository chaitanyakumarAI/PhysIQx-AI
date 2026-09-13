export interface PlateConfig {
  weight: number;
  color: string;
  label: string;
}

export interface PlateCount {
  weight: number;
  count: number;
  color: string;
  label: string;
}

export interface BarbellLoadResult {
  targetWeight: number;
  barWeight: number;
  weightPerSide: number;
  actualTotalWeight: number;
  remainder: number;
  platesPerSide: PlateCount[];
}

export interface WarmupSet {
  setNumber: number;
  percent: number;
  weight: number;
  reps: number;
  purpose: string;
  platesPerSide: string;
}

export const STANDARD_OLYMPIC_PLATES: PlateConfig[] = [
  { weight: 25, color: "bg-rose-600", label: "25kg" },
  { weight: 20, color: "bg-blue-600", label: "20kg" },
  { weight: 15, color: "bg-amber-500", label: "15kg" },
  { weight: 10, color: "bg-emerald-600", label: "10kg" },
  { weight: 5, color: "bg-zinc-100 text-zinc-950", label: "5kg" },
  { weight: 2.5, color: "bg-zinc-700", label: "2.5kg" },
  { weight: 1.25, color: "bg-zinc-400 text-zinc-950", label: "1.25kg" },
];

/**
 * Calculates plate distribution per barbell side using a greedy loading algorithm.
 */
export function calculatePlates(
  targetWeight: number,
  barWeight = 20,
  availablePlates = STANDARD_OLYMPIC_PLATES,
): BarbellLoadResult {
  if (targetWeight <= barWeight) {
    return {
      targetWeight,
      barWeight,
      weightPerSide: 0,
      actualTotalWeight: barWeight,
      remainder: 0,
      platesPerSide: [],
    };
  }

  let neededPerSide = (targetWeight - barWeight) / 2;
  const platesPerSide: PlateCount[] = [];

  // Sort plates descending
  const sorted = [...availablePlates].sort((a, b) => b.weight - a.weight);

  for (const plate of sorted) {
    if (neededPerSide >= plate.weight) {
      const count = Math.floor(neededPerSide / plate.weight);
      neededPerSide = Math.round((neededPerSide - count * plate.weight) * 100) / 100;
      platesPerSide.push({
        weight: plate.weight,
        count,
        color: plate.color,
        label: plate.label,
      });
    }
  }

  const loadedPerSide = platesPerSide.reduce(
    (sum, p) => sum + p.weight * p.count,
    0,
  );
  const actualTotalWeight = barWeight + loadedPerSide * 2;
  const remainder = Math.round((targetWeight - actualTotalWeight) * 100) / 100;

  return {
    targetWeight,
    barWeight,
    weightPerSide: loadedPerSide,
    actualTotalWeight,
    remainder,
    platesPerSide,
  };
}

/**
 * Generates scientific warmup progression sets based on target working weight.
 */
export function generateWarmupSets(
  workingWeight: number,
  barWeight = 20,
): WarmupSet[] {
  if (workingWeight <= barWeight) {
    return [
      {
        setNumber: 1,
        percent: 100,
        weight: barWeight,
        reps: 10,
        purpose: "Bar warmup & joint mobilization",
        platesPerSide: "Empty Bar",
      },
    ];
  }

  const steps = [
    { percent: 0, reps: 10, purpose: "Movement grooving & joint lubrication" },
    { percent: 0.45, reps: 6, purpose: "Neuromuscular coordination" },
    { percent: 0.65, reps: 4, purpose: "Force acceleration ramp" },
    { percent: 0.85, reps: 2, purpose: "Post-activation potentiation" },
  ];

  const results: WarmupSet[] = [];

  steps.forEach((step, index) => {
    let weight: number;
    if (step.percent === 0) {
      weight = barWeight;
    } else {
      // Round to nearest 2.5kg
      const raw = workingWeight * step.percent;
      weight = Math.max(barWeight, Math.round(raw / 2.5) * 2.5);
    }

    // Only include if lighter than working weight or if it's the empty bar
    if (weight < workingWeight || index === 0) {
      const load = calculatePlates(weight, barWeight);
      const platesStr =
        load.platesPerSide.length === 0
          ? "Empty Bar"
          : load.platesPerSide.map((p) => `${p.count}×${p.label}`).join(", ");

      results.push({
        setNumber: index + 1,
        percent: Math.round((weight / workingWeight) * 100),
        weight,
        reps: step.reps,
        purpose: step.purpose,
        platesPerSide: platesStr,
      });
    }
  });

  return results;
}

/**
 * Calculates estimated One-Rep Max using Epley and Brzycki formulas.
 */
export function calculateOneRepMax(weight: number, reps: number): {
  epley: number;
  brzycki: number;
  average: number;
} {
  if (reps <= 1) {
    return { epley: weight, brzycki: weight, average: weight };
  }

  const epley = Math.round(weight * (1 + reps / 30));
  const brzycki = Math.round(weight * (36 / (37 - reps)));
  const average = Math.round((epley + brzycki) / 2);

  return { epley, brzycki, average };
}

/**
 * Generates percentage training table (65% - 100%) for a given 1RM.
 */
export function generatePercentageTable(oneRepMax: number): {
  percent: number;
  weight: number;
  targetReps: number;
}[] {
  const tiers = [
    { percent: 100, targetReps: 1 },
    { percent: 95, targetReps: 2 },
    { percent: 90, targetReps: 3 },
    { percent: 85, targetReps: 5 },
    { percent: 80, targetReps: 7 },
    { percent: 75, targetReps: 9 },
    { percent: 70, targetReps: 11 },
    { percent: 65, targetReps: 13 },
  ];

  return tiers.map((tier) => ({
    percent: tier.percent,
    weight: Math.round((oneRepMax * (tier.percent / 100)) / 2.5) * 2.5,
    targetReps: tier.targetReps,
  }));
}
