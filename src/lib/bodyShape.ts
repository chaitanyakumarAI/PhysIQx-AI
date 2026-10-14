import type { BodyBuild, Sex } from "@/types/ledger";

/**
 * Body Shape pillar (docs/MASTER_BRIEF.md): the athlete SELECTS their build
 * from illustrated silhouettes; height, sex, and age adjust the percentage.
 * Never calculated from photos. Non-linear on purpose — the gap between
 * builds narrows near the top, where each step is harder to earn.
 */
export interface BodyBuildDefinition {
  id: BodyBuild;
  label: string;
  description: string;
  /** Pillar value (0–100) before adjustments. */
  basePercent: number;
  /** Muscle-forward builds get the tall-frame adjustment. */
  muscleForward: boolean;
}

export const BODY_BUILDS: BodyBuildDefinition[] = [
  {
    id: "apple",
    label: "Higher body fat",
    description: "Carrying weight around the middle",
    basePercent: 15,
    muscleForward: false,
  },
  {
    id: "endomorph",
    label: "Solid",
    description: "Broad frame, some extra fat",
    basePercent: 32,
    muscleForward: false,
  },
  {
    id: "skinnyfat",
    label: "Slim but soft",
    description: "Light frame, little muscle tone",
    basePercent: 48,
    muscleForward: false,
  },
  {
    id: "lean",
    label: "Lean",
    description: "Low body fat, light muscle",
    basePercent: 68,
    muscleForward: false,
  },
  {
    id: "athletic",
    label: "Athletic",
    description: "Visible tone, balanced proportions",
    basePercent: 80,
    muscleForward: true,
  },
  {
    id: "muscular",
    label: "Muscular",
    description: "Clearly built, defined",
    basePercent: 90,
    muscleForward: true,
  },
  {
    id: "powerful",
    label: "Powerful",
    description: "Heavily muscled and lean",
    basePercent: 96,
    muscleForward: true,
  },
];

const buildsById = new Map(BODY_BUILDS.map((build) => [build.id, build]));

export function getBodyBuild(id: BodyBuild): BodyBuildDefinition {
  return buildsById.get(id)!;
}

/** Height at which the tall-frame adjustment applies. */
const TALL_CM: Record<Sex, number> = { male: 185, female: 172 };
const TALL_BONUS = 4;
/** Age credit starts at 30 and grows 0.5/yr to a +12 cap (≈ age 54):
 *  a 50-year-old at Athletic scores like a 25-year-old at Muscular. */
const AGE_CREDIT_START = 30;
const AGE_CREDIT_PER_YEAR = 0.5;
const AGE_CREDIT_CAP = 12;

export interface BodyShapeInputs {
  build: BodyBuild;
  sex: Sex | null;
  heightCm: number | null;
  age: number | null;
}

export function computeBodyShapeValue({ build, sex, heightCm, age }: BodyShapeInputs): number {
  const definition = getBodyBuild(build);
  let value = definition.basePercent;
  if (definition.muscleForward && sex && heightCm !== null && heightCm >= TALL_CM[sex]) {
    value += TALL_BONUS;
  }
  if (age !== null && age > AGE_CREDIT_START) {
    value += Math.min(AGE_CREDIT_CAP, (age - AGE_CREDIT_START) * AGE_CREDIT_PER_YEAR);
  }
  return Math.round(Math.min(100, Math.max(0, value)));
}

/** Image for a build's silhouette (front view), by sex. */
export function bodyBuildImage(build: BodyBuild, sex: Sex | null): string {
  return `/body-shapes/${build}_${sex ?? "male"}_front.png`;
}
