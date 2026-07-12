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
  | "bodyweight";

export type ExerciseDifficulty = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  id: string;
  name: string;
  /**
   * Ordered by involvement: first entry is the primary muscle (drives
   * list-row subtitles), later entries are progressively more minor.
   * filterExercises ranks results by this order — a lift leads the filter
   * of its primary group and sinks in groups it only assists.
   */
  muscleGroups: MuscleGroup[];
  equipment: Equipment;
  /** The difficulty tier behind the letter badge in the catalog list. */
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

export const equipmentLabels: Record<Equipment, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  cable: "Cable",
  machine: "Machine",
  bodyweight: "Bodyweight",
};
