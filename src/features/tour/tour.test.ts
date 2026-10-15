import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MAX_LINE_LENGTH, TOUR_IMAGES, TOUR_SCRIPT } from "./script";
import { computeStageMetrics } from "./stage";

describe("tour script", () => {
  it("keeps every line inside one bubble", () => {
    for (const beat of TOUR_SCRIPT) {
      for (const line of beat.lines) expect(line.text.length).toBeLessThanOrEqual(MAX_LINE_LENGTH);
    }
  });

  it("has a stage cut on disk for every pose it shows", () => {
    for (const src of TOUR_IMAGES) expect(existsSync(join(process.cwd(), "public", src)), src).toBe(true);
  });

  it("gives every beat a unique id and at least one line", () => {
    const ids = TOUR_SCRIPT.map((beat) => beat.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const beat of TOUR_SCRIPT) expect(beat.lines.length).toBeGreaterThan(0);
  });

  it("opens and closes on Home with both characters centre stage", () => {
    const first = TOUR_SCRIPT[0]!;
    const last = TOUR_SCRIPT.at(-1)!;
    expect([first.route, last.route]).toEqual(["/home", "/home"]);
    expect(first.target).toBeUndefined();
    expect(last.target).toBeUndefined();
    // Nyra's slow nod is saved for the very end.
    const nods = TOUR_SCRIPT.flatMap((beat) => beat.lines).filter((line) => line.expression === "nod");
    expect(nods).toEqual([last.lines.at(-1)]);
  });
});

describe("stage metrics", () => {
  const phones = [
    { width: 360, height: 640 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
  ];

  it("fits both characters across the screen, overlapping only slightly", () => {
    for (const viewport of phones) {
      for (const scene of [false, true]) {
        const { cast, width } = computeStageMetrics(viewport, scene);
        const kixRight = cast.kix.inset + cast.kix.width;
        const nyraLeft = width - cast.nyra.inset - cast.nyra.width;
        expect(kixRight - nyraLeft).toBeLessThanOrEqual(30);
      }
    }
  });

  it("keeps the bubble above both heads", () => {
    for (const viewport of phones) {
      const { cast, bubbleBottom } = computeStageMetrics(viewport, false);
      // Ear tips sit ~5% below the top of Kix's frame.
      expect(bubbleBottom).toBeGreaterThanOrEqual(cast.kix.height * 0.95);
      // Nyra's ears start ~10% below the top of hers.
      expect(bubbleBottom).toBeGreaterThanOrEqual(cast.nyra.bottom + cast.nyra.height * 0.9);
    }
  });

  it("puts Nyra's eye-line just above Kix's (MASCOTS.md)", () => {
    const { cast } = computeStageMetrics({ width: 390, height: 844 }, false);
    // Eyes sit 43% down Kix's frame and 47% down Nyra's (scripts/crop_mascot_stage.py).
    const kixEyes = cast.kix.height * (1 - 0.43);
    const nyraEyes = cast.nyra.bottom + cast.nyra.height * (1 - 0.47);
    expect(nyraEyes).toBeGreaterThan(kixEyes);
    expect(nyraEyes - kixEyes).toBeLessThan(20);
  });

  it("brings the cast forward for the intro and finale", () => {
    const viewport = { width: 390, height: 844 };
    expect(computeStageMetrics(viewport, true).cast.kix.height).toBeGreaterThan(
      computeStageMetrics(viewport, false).cast.kix.height,
    );
  });

  it("stays inside the app column on wide screens", () => {
    expect(computeStageMetrics({ width: 1440, height: 900 }, false).width).toBe(448);
  });
});
