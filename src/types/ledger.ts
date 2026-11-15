import type { CardioActivity } from "./cardio";
import type { ExperienceLevel, GoalBodyShape, ProfileGoal } from "./profile";
import type { CompletedSessionSummary } from "./workoutSession";

/** The sexes the published strength tables and silhouettes exist for. */
export type TableSex = "male" | "female";

/**
 * What the athlete answered — gender options beyond the two table sexes
 * (owner decision 2026-11-15). Engines never branch on the extra values:
 * they map through `tableSexFor` to the tables that actually exist.
 */
export type Sex = TableSex | "nonbinary" | "unspecified";

export const sexLabels: Record<Sex, string> = {
  female: "Female",
  male: "Male",
  nonbinary: "Non-binary",
  unspecified: "Prefer not to say",
};

/**
 * The published tables an answer maps to. Non-binary, prefer-not-to-say
 * and unknown all return null, and every consumer falls back to the men's
 * tables — the stricter standard, same behavior as before the answer existed.
 */
export function tableSexFor(sex: Sex | null): TableSex | null {
  return sex === "male" || sex === "female" ? sex : null;
}

/**
 * The athlete's current build, picked from illustrated silhouettes (never
 * computed from photos). Ordered from most to least body fat; drives the
 * Body Shape pillar — see lib/bodyShape.
 */
export type BodyBuild =
  | "apple"
  | "endomorph"
  | "skinnyfat"
  | "lean"
  | "athletic"
  | "muscular"
  | "powerful";

/** One dated weigh-in (local calendar day, kg). */
export interface WeighIn {
  date: string;
  weightKg: number;
}

/**
 * Everything the engines need to know about the athlete. Every field the
 * user hasn't told us yet is null — engines must degrade honestly (exclude
 * a pillar, say "add your bodyweight"), never invent a default identity.
 */
export interface AthleteProfile {
  displayName: string | null;
  sex: Sex | null;
  birthYear: number | null;
  heightCm: number | null;
  currentBuild: BodyBuild | null;
  goal: ProfileGoal | null;
  experienceLevel: ExperienceLevel | null;
  goalBodyShape: GoalBodyShape | null;
  /** Planned training days per week (rest days are the rest of the week). */
  trainingDaysPerWeek: number;
  /** Local day setup (onboarding) was completed; null if never. */
  onboardedOn?: string | null;
}

/**
 * The local-first ledger: the single source of truth every screen derives
 * from. Supabase is a sync target for it, never a second source.
 */
export interface Ledger {
  sessions: CompletedSessionSummary[];
  cardio: CardioActivity[];
  weighIns: WeighIn[];
  profile: AthleteProfile;
}

export const DEFAULT_TRAINING_DAYS_PER_WEEK = 3;
