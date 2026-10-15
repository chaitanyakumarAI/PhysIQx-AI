import { RANKS, type RankId } from "./levels";

/**
 * The collection catalog (docs/GAMIFICATION_STUDY.md §3.4): 13 families ×
 * 4 tiers, 10 one-off milestones, and 8 rank insignia — 70 items.
 * Definitions only; what an athlete has earned is computed in progression.ts.
 */

export type Grade = "bronze" | "silver" | "gold" | "platinum" | "legendary";

export const GRADE_XP: Record<Grade, number> = {
  bronze: 50,
  silver: 100,
  gold: 250,
  platinum: 500,
  legendary: 1000,
};

export const gradeLabels: Record<Grade, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  legendary: "Legendary",
};

export type CollectionCategory =
  | "training"
  | "strength"
  | "cardio"
  | "consistency"
  | "body"
  | "milestone"
  | "rank";

export const categoryLabels: Record<CollectionCategory, string> = {
  training: "Training",
  strength: "Strength",
  cardio: "Cardio",
  consistency: "Consistency",
  body: "Body & score",
  milestone: "Milestones",
  rank: "Ranks",
};

/** Icon keys the UI maps to glyphs (kept serializable). */
export type CollectionIcon =
  | "dumbbell"
  | "weight"
  | "trophy"
  | "calendar-check"
  | "flame"
  | "heart-pulse"
  | "route"
  | "scale"
  | "medal"
  | "gauge"
  | "compass"
  | "layers"
  | "zap"
  | "sparkles"
  | "target"
  | "scan"
  | "file-up"
  | "rotate"
  | "grid"
  | "calendar-range"
  | "hammer"
  | "cake"
  | "mountain"
  | "shield";

/** Every measurable thing a collectible can be about. */
export type MetricKey =
  | "workouts"
  | "tonnageKg"
  | "personalRecords"
  | "perfectWeeks"
  | "longestStreak"
  | "cardioMinutes"
  | "cardioKm"
  | "weighIns"
  | "strengthTier"
  | "bestScore"
  | "distinctExercises"
  | "bestSessionSets"
  | "doubleDutyDays"
  | "firstWorkout"
  | "calibrated"
  | "bodyMap"
  | "firstImport"
  | "comeback"
  | "fullHouse"
  | "perfectMonth"
  | "ironYear"
  | "anniversary"
  | "consecutivePerfectWeeks";

/** Tier gates: progress always counts, but the badge seals until this level. */
export const TIER_MIN_LEVEL: Record<"bronze" | "silver" | "gold" | "platinum", number> = {
  bronze: 1,
  silver: 1,
  gold: 10,
  platinum: 25,
};

export interface FamilyDef {
  id: string;
  name: string;
  category: CollectionCategory;
  icon: CollectionIcon;
  metric: MetricKey;
  /** Bronze, Silver, Gold, Platinum targets. */
  targets: [number, number, number, number];
  /** "Complete {n} workouts" — {n} is the formatted target. */
  describe: (target: string) => string;
  format?: (value: number) => string;
}

const STRENGTH_TIERS = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
const thousands = (value: number) => value.toLocaleString("en-US");

export const FAMILIES: FamilyDef[] = [
  {
    id: "iron-ledger",
    name: "Iron Ledger",
    category: "training",
    icon: "dumbbell",
    metric: "workouts",
    targets: [10, 50, 150, 500],
    describe: (n) => `Complete ${n} workouts`,
  },
  {
    id: "tonnage",
    name: "Tonnage",
    category: "training",
    icon: "weight",
    metric: "tonnageKg",
    targets: [10_000, 100_000, 500_000, 2_000_000],
    describe: (n) => `Move ${n} in total`,
    format: (kg) => `${thousands(Math.round(kg / 1000))} t`,
  },
  {
    id: "record-breaker",
    name: "Record Breaker",
    category: "strength",
    icon: "trophy",
    metric: "personalRecords",
    targets: [5, 25, 75, 200],
    describe: (n) => `Set ${n} personal records`,
  },
  {
    id: "perfect-week",
    name: "Perfect Week",
    category: "consistency",
    icon: "calendar-check",
    metric: "perfectWeeks",
    targets: [1, 4, 12, 52],
    describe: (n) => `Hit your weekly target ${n === "1" ? "once" : `${n} times`}`,
  },
  {
    id: "unbroken",
    name: "Unbroken",
    category: "consistency",
    icon: "flame",
    metric: "longestStreak",
    targets: [7, 30, 90, 365],
    describe: (n) => `Keep a ${n}-day streak (planned rest counts)`,
  },
  {
    id: "cardio-engine",
    name: "Cardio Engine",
    category: "cardio",
    icon: "heart-pulse",
    metric: "cardioMinutes",
    targets: [300, 1_500, 5_000, 15_000],
    describe: (n) => `Log ${n} minutes of cardio`,
  },
  {
    id: "long-haul",
    name: "Long Haul",
    category: "cardio",
    icon: "route",
    metric: "cardioKm",
    targets: [25, 100, 500, 2_000],
    describe: (n) => `Cover ${n} km`,
  },
  {
    id: "steady-scale",
    name: "Steady Scale",
    category: "body",
    icon: "scale",
    metric: "weighIns",
    targets: [4, 12, 26, 52],
    describe: (n) => `Log ${n} weigh-ins`,
  },
  {
    id: "strength-standard",
    name: "Strength Standard",
    category: "strength",
    icon: "medal",
    metric: "strengthTier",
    targets: [1, 2, 3, 4],
    describe: (n) => `Reach ${STRENGTH_TIERS[Number(n)]} on a main lift`,
    format: (tier) => STRENGTH_TIERS[Math.max(0, Math.min(4, Math.floor(tier)))]!,
  },
  {
    id: "physiq-climber",
    name: "PhysIQ Climber",
    category: "body",
    icon: "gauge",
    metric: "bestScore",
    targets: [60, 70, 80, 90],
    describe: (n) => `Reach a PhysIQ Score of ${n}`,
  },
  {
    id: "explorer",
    name: "Explorer",
    category: "training",
    icon: "compass",
    metric: "distinctExercises",
    targets: [10, 25, 50, 100],
    describe: (n) => `Log ${n} different exercises`,
  },
  {
    id: "big-session",
    name: "Big Session",
    category: "training",
    icon: "layers",
    metric: "bestSessionSets",
    targets: [20, 30, 40, 50],
    describe: (n) => `Complete ${n} sets in one workout`,
  },
  {
    id: "double-duty",
    name: "Double Duty",
    category: "cardio",
    icon: "zap",
    metric: "doubleDutyDays",
    targets: [1, 10, 50, 150],
    describe: (n) => `Lift and do 20+ min of cardio on the same day${n === "1" ? "" : ` — ${n} times`}`,
  },
];

export interface MilestoneDef {
  id: string;
  name: string;
  category: CollectionCategory;
  icon: CollectionIcon;
  metric: MetricKey;
  grade: Grade;
  minLevel: number;
  description: string;
}

export const MILESTONES: MilestoneDef[] = [
  { id: "first-rep", name: "First Rep", category: "milestone", icon: "sparkles", metric: "firstWorkout", grade: "bronze", minLevel: 1, description: "Finish your first workout" },
  { id: "calibrated", name: "Calibrated", category: "milestone", icon: "target", metric: "calibrated", grade: "bronze", minLevel: 1, description: "Train through your first week and unlock your PhysIQ Score" },
  { id: "body-map", name: "Body Map", category: "body", icon: "scan", metric: "bodyMap", grade: "bronze", minLevel: 1, description: "Pick your build and log your first weigh-in" },
  { id: "first-import", name: "First Import", category: "cardio", icon: "file-up", metric: "firstImport", grade: "bronze", minLevel: 1, description: "Import your first cardio activity" },
  { id: "comeback-kid", name: "Comeback Kid", category: "consistency", icon: "rotate", metric: "comeback", grade: "silver", minLevel: 1, description: "Come back and train after 14+ days away" },
  { id: "full-house", name: "Full House", category: "body", icon: "grid", metric: "fullHouse", grade: "gold", minLevel: 1, description: "Get all four pillars to 70 or higher on the same day" },
  { id: "perfect-month", name: "Perfect Month", category: "consistency", icon: "calendar-range", metric: "perfectMonth", grade: "gold", minLevel: 1, description: "Hit your weekly target every week of a month" },
  { id: "iron-year", name: "Iron Year", category: "training", icon: "hammer", metric: "ironYear", grade: "platinum", minLevel: 25, description: "Complete 100 workouts within 365 days" },
  { id: "anniversary", name: "Anniversary", category: "milestone", icon: "cake", metric: "anniversary", grade: "legendary", minLevel: 30, description: "Still training one year after your first workout" },
  { id: "unshakeable", name: "Unshakeable", category: "consistency", icon: "mountain", metric: "consecutivePerfectWeeks", grade: "legendary", minLevel: 40, description: "Hit your weekly target 52 weeks in a row" },
];

const TIER_GRADES = ["bronze", "silver", "gold", "platinum"] as const;
export const RANK_GRADES: Record<RankId, Grade> = {
  rookie: "bronze",
  iron: "bronze",
  bronze: "bronze",
  silver: "silver",
  gold: "gold",
  platinum: "platinum",
  diamond: "platinum",
  obsidian: "legendary",
  legend: "legendary",
};

/** One collectible as the UI and the progression engine see it. */
export interface CollectibleDef {
  id: string;
  name: string;
  /** "Gold" for family tiers; absent for milestones and ranks. */
  tierLabel?: string;
  familyId?: string;
  tierIndex?: number;
  grade: Grade;
  category: CollectionCategory;
  icon: CollectionIcon;
  description: string;
  minLevel: number;
  xp: number;
  /** What earns it. Ranks are earned by level instead (rankLevel). */
  metric?: MetricKey;
  target?: number;
  rankLevel?: number;
}

export const COLLECTIBLES: CollectibleDef[] = [
  ...FAMILIES.flatMap((family) =>
    family.targets.map((target, tierIndex): CollectibleDef => {
      const grade = TIER_GRADES[tierIndex]!;
      const shown = family.metric === "strengthTier" ? String(target) : (family.format?.(target) ?? thousands(target));
      return {
        id: `${family.id}-${grade}`,
        name: family.name,
        tierLabel: grade[0]!.toUpperCase() + grade.slice(1),
        familyId: family.id,
        tierIndex,
        grade,
        category: family.category,
        icon: family.icon,
        description: family.describe(shown),
        minLevel: TIER_MIN_LEVEL[grade],
        xp: GRADE_XP[grade],
        metric: family.metric,
        target,
      };
    }),
  ),
  ...MILESTONES.map(
    (milestone): CollectibleDef => ({
      id: milestone.id,
      name: milestone.name,
      grade: milestone.grade,
      category: milestone.category,
      icon: milestone.icon,
      description: milestone.description,
      minLevel: milestone.minLevel,
      xp: GRADE_XP[milestone.grade],
      metric: milestone.metric,
      target: 1,
    }),
  ),
  ...RANKS.filter((rank) => rank.id !== "rookie").map(
    (rank): CollectibleDef => ({
      id: `rank-${rank.id}`,
      name: `${rank.name} Rank`,
      grade: RANK_GRADES[rank.id],
      category: "rank",
      icon: "shield",
      description: `Reach level ${rank.minLevel}`,
      minLevel: rank.minLevel,
      // Rank insignia mark a level reached; they don't pay XP themselves.
      xp: 0,
      rankLevel: rank.minLevel,
    }),
  ),
];

export function familyById(id: string): FamilyDef | undefined {
  return FAMILIES.find((family) => family.id === id);
}
