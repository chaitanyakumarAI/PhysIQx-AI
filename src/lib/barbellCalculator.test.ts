import { describe, expect, it } from "vitest";
import {
  calculateOneRepMax,
  calculatePlates,
  generatePercentageTable,
  generateWarmupSets,
} from "./barbellCalculator";

describe("barbellCalculator", () => {
  describe("calculatePlates", () => {
    it("returns empty plates for empty bar (20kg)", () => {
      const result = calculatePlates(20, 20);
      expect(result.actualTotalWeight).toBe(20);
      expect(result.platesPerSide).toHaveLength(0);
      expect(result.remainder).toBe(0);
    });

    it("correctly calculates 100kg on 20kg bar (40kg per side)", () => {
      const result = calculatePlates(100, 20);
      expect(result.actualTotalWeight).toBe(100);
      expect(result.weightPerSide).toBe(40);
      // 40kg = 1x25kg + 1x15kg
      expect(result.platesPerSide).toEqual([
        { weight: 25, count: 1, color: "bg-rose-600", label: "25kg" },
        { weight: 15, count: 1, color: "bg-amber-500", label: "15kg" },
      ]);
      expect(result.remainder).toBe(0);
    });

    it("correctly calculates fractional weights (e.g. 102.5kg = 41.25kg per side)", () => {
      const result = calculatePlates(102.5, 20);
      expect(result.actualTotalWeight).toBe(102.5);
      expect(result.weightPerSide).toBe(41.25);
      // 41.25kg = 1x25 + 1x15 + 1x1.25
      expect(result.platesPerSide.map((p) => `${p.count}x${p.weight}`)).toEqual([
        "1x25",
        "1x15",
        "1x1.25",
      ]);
      expect(result.remainder).toBe(0);
    });

    it("handles weights with non-standard remainder", () => {
      const result = calculatePlates(61, 20);
      // 61kg -> needed 20.5kg per side -> 1x20kg = 20kg, remainder 1kg total
      expect(result.actualTotalWeight).toBe(60);
      expect(result.remainder).toBe(1);
    });
  });

  describe("generateWarmupSets", () => {
    it("generates 4 progression sets for 100kg working weight", () => {
      const warmups = generateWarmupSets(100, 20);
      expect(warmups.length).toBeGreaterThanOrEqual(3);
      expect(warmups[0]!.weight).toBe(20); // Empty bar
      expect(warmups[0]!.reps).toBe(10);
      expect(warmups[warmups.length - 1]!.weight).toBeLessThan(100);
    });

    it("handles working weights below or equal to bar weight", () => {
      const warmups = generateWarmupSets(20, 20);
      expect(warmups).toHaveLength(1);
      expect(warmups[0]!.weight).toBe(20);
    });
  });

  describe("calculateOneRepMax", () => {
    it("returns exact weight for 1 rep", () => {
      const result = calculateOneRepMax(100, 1);
      expect(result.average).toBe(100);
      expect(result.epley).toBe(100);
    });

    it("calculates accurate 1RM for multi-rep sets (100kg x 5 reps)", () => {
      const result = calculateOneRepMax(100, 5);
      expect(result.epley).toBe(117); // 100 * (1 + 5/30) = 116.67 -> 117
      expect(result.average).toBeGreaterThan(110);
    });
  });

  describe("generatePercentageTable", () => {
    it("generates 8 percentage tiers rounded to nearest 2.5kg", () => {
      const table = generatePercentageTable(100);
      expect(table).toHaveLength(8);
      expect(table[0]!.percent).toBe(100);
      expect(table[0]!.weight).toBe(100);
      expect(table[table.length - 1]!.percent).toBe(65);
      expect(table[table.length - 1]!.weight).toBe(65);
    });
  });
});
