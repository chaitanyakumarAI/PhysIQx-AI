import { describe, expect, it } from "vitest";
import { computeLevel, levelCost } from "./levels";

describe("computeLevel", () => {
  it("starts at level 1 with nothing earned", () => {
    expect(computeLevel(0)).toMatchObject({ level: 1, title: "Rookie", currentXP: 0 });
  });

  it("carries leftover XP into the current level", () => {
    const result = computeLevel(levelCost(1) + 50);
    expect(result.level).toBe(2);
    expect(result.currentXP).toBe(50);
    expect(result.xpToNextLevel).toBe(levelCost(2));
  });

  it("makes each level cost more than the last", () => {
    expect(levelCost(10)).toBeGreaterThan(levelCost(9));
  });

  it("titles levels by band", () => {
    let xp = 0;
    for (let level = 1; level < 10; level++) xp += levelCost(level);
    expect(computeLevel(xp)).toMatchObject({ level: 10, title: "Committed" });
  });
});
