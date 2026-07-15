import type { Mission } from "@/types/training";

/**
 * Today's mission — the one fixture shown on BOTH Home and Train, so it is
 * defined once here (src/data is the shared mock-data layer) rather than per
 * feature, keeping the two screens arithmetically and textually consistent.
 */
export const mockTodayMission: Mission = {
  id: "mission-push-a",
  // Descriptive day naming (user direction): what the day IS, not an index.
  title: "Heavy Push",
  muscleGroups: ["Chest", "Shoulders", "Triceps"],
  durationMinutes: 52,
  liftCount: 6,
  intensity: "high",
  xpReward: 320,
  aiProgrammed: true,
  state: "pending",
};
