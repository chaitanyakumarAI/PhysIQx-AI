import { describe, it, expect } from "vitest";
import { calculateReadiness, type SessionRecord } from "./recoveryEngine";

describe("recoveryEngine", () => {
  it("computes peak readiness when user is well-rested and hydrated", () => {
    // Balanced training: 1-2 moderate sessions in past week with solid 4-week base
    const sessions: SessionRecord[] = [
      { date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), totalVolumeKg: 6000, avgRpe: 7.0 },
      { date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), totalVolumeKg: 6000, avgRpe: 7.0 },
      // Past weeks baseline
      { date: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(), totalVolumeKg: 7000, avgRpe: 7.0 },
      { date: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(), totalVolumeKg: 7000, avgRpe: 7.0 },
      { date: new Date(Date.now() - 16 * 24 * 3600 * 1000).toISOString(), totalVolumeKg: 7000, avgRpe: 7.0 },
      { date: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(), totalVolumeKg: 7000, avgRpe: 7.0 },
      { date: new Date(Date.now() - 23 * 24 * 3600 * 1000).toISOString(), totalVolumeKg: 7000, avgRpe: 7.0 },
      { date: new Date(Date.now() - 26 * 24 * 3600 * 1000).toISOString(), totalVolumeKg: 7000, avgRpe: 7.0 },
    ];

    const readiness = calculateReadiness(sessions, 3000, 3000, 2);
    expect(readiness.score).toBeGreaterThanOrEqual(80);
    expect(readiness.pillars.neuromuscular).toBeGreaterThan(80);
    expect(readiness.pillars.autonomicNervous).toBeGreaterThan(80);
    expect(["peak", "optimal"]).toContain(readiness.tier);
    expect(readiness.suggestedAction.href).toBeDefined();
  });

  it("detects elevated fatigue when acute volume spikes heavily (high ACWR)", () => {
    // Sudden massive volume spike in the last 7 days compared to baseline
    const sessions: SessionRecord[] = [
      { date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), totalVolumeKg: 16000, avgRpe: 9.5 },
      { date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), totalVolumeKg: 14000, avgRpe: 9.0 },
      { date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), totalVolumeKg: 15000, avgRpe: 9.0 },
      { date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), totalVolumeKg: 13000, avgRpe: 9.0 },
    ];

    const readiness = calculateReadiness(sessions, 1500, 3000, 10);
    expect(readiness.acwrRatio).toBeGreaterThan(1.4);
    expect(readiness.score).toBeLessThan(65);
    expect(["fatigued", "overreached"]).toContain(readiness.tier);
    expect(readiness.pillars.neuromuscular).toBeLessThan(75);
  });

  it("penalizes score when dehydration is significant", () => {
    const sessions: SessionRecord[] = [
      { date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), totalVolumeKg: 7000, avgRpe: 7.0 },
    ];

    const hydrated = calculateReadiness(sessions, 3000, 3000, 2);
    const dehydrated = calculateReadiness(sessions, 500, 3000, 2);

    expect(hydrated.pillars.glycogenHydration).toBeGreaterThan(dehydrated.pillars.glycogenHydration);
    expect(hydrated.score).toBeGreaterThan(dehydrated.score);
  });

  it("handles zero sessions gracefully without NaN or division by zero", () => {
    const readiness = calculateReadiness([], 0, 3000, 0);
    expect(readiness.score).toBeGreaterThan(0);
    expect(readiness.score).toBeLessThanOrEqual(100);
    expect(isNaN(readiness.score)).toBe(false);
    expect(isNaN(readiness.acwrRatio)).toBe(false);
  });
});
