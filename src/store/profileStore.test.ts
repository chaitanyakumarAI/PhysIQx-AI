import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_USER_PREFERENCES,
  useProfileStore,
} from "./profileStore";

const storageMock: Record<string, string> = {};
beforeAll(() => {
  globalThis.localStorage = {
    getItem: (key: string) => storageMock[key] ?? null,
    setItem: (key: string, val: string) => {
      storageMock[key] = val;
    },
    removeItem: (key: string) => {
      delete storageMock[key];
    },
    clear: () => {
      Object.keys(storageMock).forEach((k) => delete storageMock[k]);
    },
    length: 0,
    key: () => null,
  } as unknown as Storage;
});

describe("useProfileStore preferences", () => {
  beforeEach(() => {
    useProfileStore.getState().resetPreferences();
  });

  it("initializes with default preferences (trackRpe disabled by default for clean set rows)", () => {
    const preferences = useProfileStore.getState().preferences;
    expect(preferences).toEqual(DEFAULT_USER_PREFERENCES);
    expect(preferences.trackRpe).toBe(false);
    expect(preferences.showGhostSuggestions).toBe(true);
    expect(preferences.autoRestTimer).toBe(true);
    expect(preferences.showMascots).toBe(true);
    expect(preferences.showAiInsights).toBe(true);
    expect(preferences.celebrationEffects).toBe(true);
  });

  it("updates individual preferences without mutating other fields", () => {
    const { updatePreferences } = useProfileStore.getState();

    updatePreferences({ trackRpe: true });

    let current = useProfileStore.getState().preferences;
    expect(current.trackRpe).toBe(true);
    expect(current.showMascots).toBe(true);
    expect(current.showGhostSuggestions).toBe(true);

    // Turn on Quiet Mode by disabling mascots and AI insights
    updatePreferences({ showMascots: false, showAiInsights: false });

    current = useProfileStore.getState().preferences;
    expect(current.trackRpe).toBe(true);
    expect(current.showMascots).toBe(false);
    expect(current.showAiInsights).toBe(false);
    expect(current.autoRestTimer).toBe(true);
  });

  it("resets all preferences back to defaults", () => {
    const { updatePreferences, resetPreferences } = useProfileStore.getState();

    updatePreferences({
      trackRpe: true,
      showMascots: false,
      autoRestTimer: false,
    });

    resetPreferences();

    const current = useProfileStore.getState().preferences;
    expect(current).toEqual(DEFAULT_USER_PREFERENCES);
    expect(current.trackRpe).toBe(false);
    expect(current.showMascots).toBe(true);
    expect(current.autoRestTimer).toBe(true);
  });
});
