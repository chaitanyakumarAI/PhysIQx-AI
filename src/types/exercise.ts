/**
 * Exercise — docs/DATA_MODELS.md "Exercise". Catalog definition entity:
 * ships with the app, referenced by templates, sessions, and PRs. The mock
 * phase loads a subset of the full library.
 */

export type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "kettlebell"
  | "plate"
  | "sled";

export type ExerciseDifficulty = "beginner" | "intermediate" | "advanced";

/**
 * Movement classification (authored content, C/ISO/BW in the source file):
 * compound = multi-joint, isolation = single-joint, bodyweight =
 * bodyweight-loaded or functional/cardio-style movement.
 */
export type ExerciseType = "compound" | "isolation" | "bodyweight";

export interface Exercise {
  id: string;
  name: string;
  /**
   * Stimulus share per muscle group, 0–100, summing to ~100 — authored
   * EMG-informed content (content/muscle-involvement_filled.json). Drives
   * the hit-% badge in the catalog, the per-muscle bars on the detail
   * page, and filterExercises' relevance ranking.
   */
  muscleHit: Partial<Record<MuscleGroup, number>>;
  /**
   * Derived from muscleHit, highest share first: first entry is the
   * primary muscle (drives list-row subtitles).
   */
  muscleGroups: MuscleGroup[];
  equipment: Equipment;
  type: ExerciseType;
  /** The tier behind the detail page's level guide. */
  difficulty: ExerciseDifficulty;
}

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  legs: "Legs",
  shoulders: "Shoulders",
  arms: "Arms",
  core: "Core",
};

export const exerciseTypeLabels: Record<ExerciseType, string> = {
  compound: "Compound",
  isolation: "Isolation",
  bodyweight: "Bodyweight",
};

export const equipmentLabels: Record<Equipment, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  cable: "Cable",
  machine: "Machine",
  bodyweight: "Bodyweight",
  kettlebell: "Kettlebell",
  plate: "Plate",
  sled: "Sled",
};
