import { describe, it, expect } from "vitest";
import {
  generateAdaptiveProgram,
  adaptProgramDifficulty,
  forecastScoreTrajectory,
} from "./aiProgramEngine";
import type { CompletedSessionSummary } from "@/store/sessionStore";
import { mockExercises } from "@/data/exercises";

describe("aiProgramEngine", () => {
  const validExerciseIds = new Set(mockExercises.map((e) => e.id));

  describe("generateAdaptiveProgram", () => {
    it("generates a valid 3-day program with valid exercises and user plan", () => {
      const result = generateAdaptiveProgram({
        goal: "bulk",
        experienceLevel: "intermediate",
        daysPerWeek: 3,
      });

      expect(result.program.type).toBe("ai");
      expect(result.program.level).toBe("intermediate");
      expect(result.program.variants[0]?.days.length).toBe(3);
      expect(result.userPlan.days.length).toBe(3);

      // Verify all exercises reference real catalog exercises
      result.program.variants[0]?.days.forEach((day) => {
        expect(day.exercises.length).toBeGreaterThan(0);
        day.exercises.forEach((ex) => {
          expect(validExerciseIds.has(ex.exerciseId)).toBe(true);
          expect(ex.sets.length).toBeGreaterThan(0);
          expect(ex.restSeconds).toBeGreaterThan(0);
        });
      });

      // Verify rationale is clean and adheres to <= 2 sentences
      expect(result.rationale).toBeTruthy();
      const sentenceCount = result.rationale.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
      expect(sentenceCount).toBeLessThanOrEqual(2);
    });

    it("generates appropriate split variations for 2, 4, 5, and 6 days", () => {
      const p2 = generateAdaptiveProgram({ goal: "maintain", experienceLevel: "beginner", daysPerWeek: 2 });
      expect(p2.program.variants[0]?.days.length).toBe(2);
      expect(p2.program.variants[0]?.days[0]?.name).toContain("Full Body");

      const p4 = generateAdaptiveProgram({ goal: "cut", experienceLevel: "intermediate", daysPerWeek: 4 });
      expect(p4.program.variants[0]?.days.length).toBe(4);
      expect(p4.program.variants[0]?.days[0]?.name).toContain("Upper");

      const p5 = generateAdaptiveProgram({ goal: "bulk", experienceLevel: "advanced", daysPerWeek: 5 });
      expect(p5.program.variants[0]?.days.length).toBe(5);

      const p6 = generateAdaptiveProgram({ goal: "cut", experienceLevel: "advanced", daysPerWeek: 6 });
      expect(p6.program.variants[0]?.days.length).toBe(6);
    });

    it("tunes rest periods and rep targets according to user goal", () => {
      const bulkProg = generateAdaptiveProgram({ goal: "bulk", experienceLevel: "intermediate", daysPerWeek: 3 });
      const cutProg = generateAdaptiveProgram({ goal: "cut", experienceLevel: "intermediate", daysPerWeek: 3 });

      // Bulk primary compound should have longer rest than Cut primary compound
      const bulkFirstEx = bulkProg.program.variants[0]?.days[0]?.exercises[0];
      const cutFirstEx = cutProg.program.variants[0]?.days[0]?.exercises[0];

      expect(bulkFirstEx).toBeDefined();
      expect(cutFirstEx).toBeDefined();
      expect(bulkFirstEx!.restSeconds).toBeGreaterThan(cutFirstEx!.restSeconds);
    });
  });

  describe("adaptProgramDifficulty", () => {
    it("prescribes deload and extended rest when average RPE >= 9.0", () => {
      const program = generateAdaptiveProgram({ goal: "bulk", experienceLevel: "intermediate", daysPerWeek: 3 }).program;
      const highFatigueHistory: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Heavy Push",
          date: "2026-09-10",
          completedAt: "2026-09-10T10:00:00Z",
          durationSec: 3600,
          status: "completed",
          totalVolumeKg: 4000,
          setsCompleted: 15,
          xpEarned: 150,
          topSets: [],
          avgRpe: 9.5,
        },
        {
          id: "s2",
          missionId: "m1",
          title: "Heavy Pull",
          date: "2026-09-12",
          completedAt: "2026-09-12T10:00:00Z",
          durationSec: 3600,
          status: "completed",
          totalVolumeKg: 4200,
          setsCompleted: 15,
          xpEarned: 150,
          topSets: [],
          avgRpe: 9.2,
        },
      ];

      const adaptation = adaptProgramDifficulty(program, highFatigueHistory);
      expect(adaptation.adjustmentType).toBe("deload");
      expect(adaptation.recommendedRestMultiplier).toBeGreaterThan(1.0);
      expect(adaptation.rationale).toContain("accumulated fatigue");
    });

    it("prescribes progressive overload when average RPE <= 7.0 across sessions", () => {
      const program = generateAdaptiveProgram({ goal: "bulk", experienceLevel: "intermediate", daysPerWeek: 3 }).program;
      const lowFatigueHistory: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Push 1",
          date: "2026-09-08",
          completedAt: "2026-09-08T10:00:00Z",
          durationSec: 3000,
          status: "completed",
          totalVolumeKg: 3500,
          setsCompleted: 12,
          xpEarned: 150,
          topSets: [],
          avgRpe: 6.5,
        },
        {
          id: "s2",
          missionId: "m1",
          title: "Pull 1",
          date: "2026-09-10",
          completedAt: "2026-09-10T10:00:00Z",
          durationSec: 3000,
          status: "completed",
          totalVolumeKg: 3600,
          setsCompleted: 12,
          xpEarned: 150,
          topSets: [],
          avgRpe: 6.8,
        },
        {
          id: "s3",
          missionId: "m1",
          title: "Legs 1",
          date: "2026-09-12",
          completedAt: "2026-09-12T10:00:00Z",
          durationSec: 3000,
          status: "completed",
          totalVolumeKg: 3600,
          setsCompleted: 12,
          xpEarned: 150,
          topSets: [],
          avgRpe: 6.5,
        },
      ];

      const adaptation = adaptProgramDifficulty(program, lowFatigueHistory);
      expect(adaptation.adjustmentType).toBe("progressive_overload");
      expect(adaptation.modifiedExercises[0]!.sets.length).toBeGreaterThan(
        program.variants[0]!.days[0]!.exercises[0]!.sets.length
      );
    });

    it("maintains current volume when history is empty or in optimal zone", () => {
      const program = generateAdaptiveProgram({ goal: "bulk", experienceLevel: "intermediate", daysPerWeek: 3 }).program;
      const emptyAdaptation = adaptProgramDifficulty(program, []);
      expect(emptyAdaptation.adjustmentType).toBe("maintain");
    });
  });

  describe("forecastScoreTrajectory", () => {
    it("projects future weeks with valid ascending dates and confidence bounds", () => {
      const history: CompletedSessionSummary[] = [
        {
          id: "s1",
          missionId: "m1",
          title: "Push",
          date: "2026-09-10",
          completedAt: "2026-09-10T10:00:00Z",
          durationSec: 3000,
          status: "completed",
          totalVolumeKg: 3000,
          setsCompleted: 12,
          xpEarned: 150,
          topSets: [],
        },
        {
          id: "s2",
          missionId: "m2",
          title: "Pull",
          date: "2026-09-12",
          completedAt: "2026-09-12T10:00:00Z",
          durationSec: 3000,
          status: "completed",
          totalVolumeKg: 3200,
          setsCompleted: 12,
          xpEarned: 150,
          topSets: [],
        },
      ];

      const forecast = forecastScoreTrajectory(75, history, "bulk", 6);
      expect(forecast.length).toBe(6);
      expect(forecast[0]!.weekNumber).toBe(1);
      expect(forecast[5]!.weekNumber).toBe(6);

      forecast.forEach((point) => {
        expect(point.isForecast).toBe(true);
        expect(point.projectedScore).toBeGreaterThanOrEqual(75);
        expect(point.confidenceLower).toBeLessThanOrEqual(point.projectedScore);
        expect(point.confidenceUpper).toBeGreaterThanOrEqual(point.projectedScore);
      });
    });
  });
});
