import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  playCountdownTick,
  playRestComplete,
  playSetComplete,
  playCelebrationFanfare,
  playWaterDrop,
  playScanSuccess,
  playSyncSuccess,
  triggerHaptic,
} from "./audioEngine";

describe("audioEngine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("safely handles non-browser environments without errors", () => {
    expect(() => playCountdownTick()).not.toThrow();
    expect(() => playRestComplete()).not.toThrow();
    expect(() => playSetComplete()).not.toThrow();
    expect(() => playCelebrationFanfare()).not.toThrow();
    expect(() => playWaterDrop()).not.toThrow();
    expect(() => playScanSuccess()).not.toThrow();
    expect(() => playSyncSuccess()).not.toThrow();
    expect(() => triggerHaptic("light")).not.toThrow();
  });

  it("triggers navigator.vibrate when available", () => {
    const vibrateMock = vi.fn();
    vi.stubGlobal("navigator", { vibrate: vibrateMock });

    triggerHaptic("light");
    expect(vibrateMock).toHaveBeenCalledWith(15);

    triggerHaptic("medium");
    expect(vibrateMock).toHaveBeenCalledWith(35);

    triggerHaptic("heavy");
    expect(vibrateMock).toHaveBeenCalledWith(60);

    triggerHaptic("success");
    expect(vibrateMock).toHaveBeenCalledWith([30, 40, 50]);
  });
});
