import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isSpeechSynthesisAvailable,
  getRestMilestoneCue,
  speakVoiceCue,
  cancelVoiceCues,
} from "./voiceCoach";

describe("voiceCoach", () => {
  const originalWindow = (globalThis as unknown as { window?: unknown }).window;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalWindow !== undefined) {
      (globalThis as unknown as { window: unknown }).window = originalWindow;
    } else {
      delete (globalThis as unknown as { window?: unknown }).window;
    }
  });

  it("identifies milestone cues at key time intervals", () => {
    expect(getRestMilestoneCue(60)).toBe("One minute remaining. Control your breathing.");
    expect(getRestMilestoneCue(30)).toBe("Thirty seconds left. Chalk up and get locked in.");
    expect(getRestMilestoneCue(10)).toBe("Ten seconds. Take your stance.");
    expect(getRestMilestoneCue(0)).toBe("Rest complete. Time to lift!");
    expect(getRestMilestoneCue(45)).toBeNull();
    expect(getRestMilestoneCue(5)).toBeNull();
  });

  it("handles environment where window or speechSynthesis is not defined safely", () => {
    delete (globalThis as unknown as { window?: unknown }).window;

    expect(isSpeechSynthesisAvailable()).toBe(false);
    expect(speakVoiceCue("Test")).toBe(false);
  });

  it("speaks utterance when window.speechSynthesis is available", () => {
    const speakMock = vi.fn();
    const cancelMock = vi.fn();
    const getVoicesMock = vi.fn().mockReturnValue([]);

    const mockSynth = {
      speak: speakMock,
      cancel: cancelMock,
      getVoices: getVoicesMock,
      paused: false,
      pending: false,
      speaking: false,
    };

    (globalThis as unknown as { window: { speechSynthesis: typeof mockSynth } }).window = {
      speechSynthesis: mockSynth,
    };

    globalThis.SpeechSynthesisUtterance = class {
      text: string;
      rate = 1;
      pitch = 1;
      volume = 1;
      voice = null;
      constructor(text: string) {
        this.text = text;
      }
    } as unknown as typeof SpeechSynthesisUtterance;

    expect(isSpeechSynthesisAvailable()).toBe(true);

    const result = speakVoiceCue("Hello athlete");
    expect(result).toBe(true);
    expect(cancelMock).toHaveBeenCalled();
    expect(speakMock).toHaveBeenCalled();

    cancelVoiceCues();
    expect(cancelMock).toHaveBeenCalledTimes(2);
  });
});
