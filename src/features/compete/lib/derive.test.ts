import { describe, expect, it } from "vitest";
import type { LeaderboardEntry } from "@/types/leaderboard";
import { rankWithUser } from "./derive";

function entry(
  id: string,
  xp: number,
  rank: number,
  previousRank: number,
  isCurrentUser?: boolean,
): LeaderboardEntry {
  return { id, name: id, xp, rank, previousRank, ...(isCurrentUser && { isCurrentUser }) };
}

const circle: LeaderboardEntry[] = [
  entry("sarah", 1_840, 1, 1),
  entry("marcus", 1_710, 2, 3),
  entry("fixture-you", 1_590, 3, 5, true),
  entry("priya", 1_420, 4, 3),
];

describe("rankWithUser", () => {
  it("replaces the fixture row with the real athlete's id, name and XP", () => {
    const ranked = rankWithUser(circle, { id: "real-id", name: "GSK", xp: 300 });
    const me = ranked.find((row) => row.isCurrentUser)!;
    expect(me.id).toBe("real-id");
    expect(me.name).toBe("GSK");
    // Real XP replaces the fixture's — never fixture + real.
    expect(me.xp).toBe(300);
  });

  it("re-ranks everyone by XP, sequentially from 1", () => {
    const ranked = rankWithUser(circle, { id: "u", name: "U", xp: 2_000 });
    expect(ranked.map((row) => row.rank)).toEqual([1, 2, 3, 4]);
    expect(ranked[0]!.id).toBe("u");
    expect(ranked[1]!.id).toBe("sarah");
  });

  it("puts an athlete with no XP last", () => {
    const ranked = rankWithUser(circle, { id: "u", name: "U", xp: 0 });
    expect(ranked.at(-1)!.id).toBe("u");
    expect(ranked.at(-1)!.rank).toBe(4);
  });

  it("shows no rank movement for the athlete, keeps the circle's", () => {
    const ranked = rankWithUser(circle, { id: "u", name: "U", xp: 2_000 });
    const me = ranked.find((row) => row.isCurrentUser)!;
    expect(me.previousRank).toBe(me.rank);
    expect(ranked.find((row) => row.id === "marcus")!.previousRank).toBe(3);
  });

  it("never mutates the fixture entries", () => {
    const before = structuredClone(circle);
    rankWithUser(circle, { id: "u", name: "U", xp: 2_000 });
    expect(circle).toEqual(before);
  });
});
