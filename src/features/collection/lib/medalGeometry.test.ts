import { describe, expect, it } from "vitest";
import { RANKS } from "@/lib/gamification/levels";
import { COLLECTIBLES } from "@/lib/gamification/catalog";
import { MATERIALS, RANK_MATERIAL, accentFor } from "./materials";
import { arcPoints, chevronPath, facets, polar, polygonPath, rosettePath, starPath } from "./medalGeometry";

const vertexCount = (d: string) => d.split(/[MLQ]/).filter(Boolean).length;
const distance = ([x, y]: [number, number]) => Math.hypot(x - 50, y - 50);

describe("medal geometry", () => {
  it("draws regular polygons and stars with the right number of points", () => {
    expect(vertexCount(polygonPath(12, 48))).toBe(12);
    expect(vertexCount(starPath(8, 49, 39.5))).toBe(16);
  });

  it("peaks each rosette scallop exactly at the outer radius", () => {
    const d = rosettePath(18, 43.5, 47.5);
    // First scallop: start, control, end. The quadratic's midpoint is the peak.
    const numbers = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
    const [x0, y0, qx, qy, x1, y1] = numbers as [number, number, number, number, number, number];
    const peak: [number, number] = [0.25 * x0 + 0.5 * qx + 0.25 * x1, 0.25 * y0 + 0.5 * qy + 0.25 * y1];
    expect(distance(peak)).toBeCloseTo(47.5, 1);
    expect(distance([x0, y0])).toBeCloseTo(43.5, 1);
  });

  it("lights facets facing the top-left and shades the ones facing away", () => {
    const shades = facets(12, 48, 41.5).map((facet) => facet.shade);
    expect(Math.max(...shades)).toBeGreaterThan(0.9);
    expect(Math.min(...shades)).toBeLessThan(-0.9);
  });

  it("spaces arc points evenly between the two angles", () => {
    const points = arcPoints(3, 40, 0, Math.PI / 2);
    expect(points[0]).toMatchObject({ x: 90, y: 50 });
    expect(points[2]).toMatchObject({ x: 50, y: 90 });
    expect(polar(40, Math.PI / 4)).toEqual([points[1]!.x, points[1]!.y]);
  });

  it("keeps chevrons symmetric about the centre", () => {
    expect(chevronPath(40)).toBe("M36 40L50 48L64 40L64 45L50 53L36 45Z");
  });
});

describe("medal materials", () => {
  it("gives every rank a finish of its own above Rookie", () => {
    const finishes = RANKS.filter((rank) => rank.id !== "rookie").map((rank) => RANK_MATERIAL[rank.id]);
    // Iron and Bronze, Platinum and Diamond, Obsidian and Legend used to share grades.
    expect(new Set(finishes).size).toBe(finishes.length);
  });

  it("colours rank labels by the rank's finish and medal labels by grade", () => {
    const legend = COLLECTIBLES.find((item) => item.rankId === "legend")!;
    const obsidian = COLLECTIBLES.find((item) => item.rankId === "obsidian")!;
    expect(accentFor(obsidian)).toBe(MATERIALS.obsidian.accent);
    expect(accentFor(legend)).toBe(MATERIALS.legendary.accent);
    expect(accentFor({ grade: "gold" })).toBe(MATERIALS.gold.accent);
  });
});
