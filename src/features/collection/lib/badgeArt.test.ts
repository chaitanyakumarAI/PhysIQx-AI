import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COLLECTIBLES } from "@/lib/gamification/catalog";
import { artFor } from "./badgeArt";

describe("badge art", () => {
  it("has generated art for every collectible", () => {
    const missing = COLLECTIBLES.filter((item) => !artFor(item.id)).map((item) => item.id);
    expect(missing).toEqual([]);
  });

  it("only registers art whose file exists", () => {
    for (const item of COLLECTIBLES) {
      const art = artFor(item.id);
      if (art) expect(fs.existsSync(path.join("public", art)), art).toBe(true);
    }
  });
});
