import { beforeAll, describe, expect, it } from "vitest";
import {
  COACH_PROFILES,
  getAllFeatureExplainers,
  getCoachProfile,
  getFeatureInfo,
  getIntroBriefing,
} from "@/data/coachContent";
import {
  hasSeenCoachBriefing,
  markCoachBriefingSeen,
  resetCoachBriefing,
} from "./components/CoachBriefingModal";
import { deriveActiveRecommendation } from "./components/CoachRecommendationWidget";

const storageMock: Record<string, string> = {};

beforeAll(() => {
  (globalThis as unknown as { window: unknown }).window = globalThis;
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

describe("Coach Character Profiles & Expressions", () => {
  it("defines distinct thematic tokens and identities for Kix and Nyra", () => {
    const kix = getCoachProfile("kix");
    const nyra = getCoachProfile("nyra");

    expect(kix.name).toBe("Kix");
    expect(kix.callsign).toBe("Field Commander");
    expect(kix.themeColor).toBe("#10b981"); // Neon Emerald

    expect(nyra.name).toBe("Nyra");
    expect(nyra.callsign).toBe("Systems Architect");
    expect(nyra.themeColor).toBe("#06b6d4"); // Cyan Telemetry
  });

  it("provides valid webp asset paths for all coach emotional expressions", () => {
    const expressions = ["default", "intense", "confident", "analytical", "calm", "alert"] as const;

    for (const coachId of ["kix", "nyra"] as const) {
      const profile = COACH_PROFILES[coachId];
      for (const expr of expressions) {
        const framePath = profile.avatarFrames[expr];
        expect(framePath).toBeDefined();
        expect(framePath).toMatch(/^\/mascots\/(kix|nyra)-.*\.webp$/);
      }
    }
  });
});

describe("Dual-Dialogue Intro Briefing Telemetry", () => {
  it("delivers the complete 5-scene comms progression covering core app systems", () => {
    const briefing = getIntroBriefing();
    expect(briefing.length).toBe(5);

    const stepTopics = briefing.map((b) => b.topic);
    expect(stepTopics).toEqual([
      "The Welcome",
      "The PhysIQ Score",
      "Missions and The Ledger",
      "The 3-Pillar Recovery Engine",
      "Ready for Engagement",
    ]);

    // Ensure every scene has both Kix and Nyra active dialogue lines
    briefing.forEach((step) => {
      expect(step.lines.length).toBeGreaterThanOrEqual(2);
      const speakers = step.lines.map((l) => l.speaker);
      expect(speakers).toContain("kix");
      expect(speakers).toContain("nyra");
    });
  });

  it("tracks and persists briefing completion state in localStorage", () => {
    resetCoachBriefing();
    expect(hasSeenCoachBriefing()).toBe(false);

    markCoachBriefingSeen();
    expect(hasSeenCoachBriefing()).toBe(true);

    resetCoachBriefing();
    expect(hasSeenCoachBriefing()).toBe(false);
  });
});

describe("On-Demand Feature Explainers", () => {
  const REQUIRED_FEATURE_KEYS = [
    "INFO_PHYSIQ_SCORE",
    "INFO_RECOVERY_PILLARS",
    "INFO_RPE_RIR",
    "INFO_STRENGTH_STANDARDS",
    "INFO_BARBELL_PLATE_CALC",
    "INFO_CARDIO_SYNC",
  ];

  it("contains all 6 required interactive feature explainers", () => {
    const all = getAllFeatureExplainers();
    expect(all.length).toBeGreaterThanOrEqual(6);

    REQUIRED_FEATURE_KEYS.forEach((key) => {
      const explainer = getFeatureInfo(key);
      expect(explainer).toBeDefined();
      expect(explainer?.title.length).toBeGreaterThan(0);
      expect(explainer?.summary.length).toBeGreaterThan(0);
      expect(explainer?.tacticalTip.length).toBeGreaterThan(0);
    });
  });

  it("assigns appropriate domain-expert coaches to each feature explainer", () => {
    // Biomechanics & Telemetry -> Nyra
    expect(getFeatureInfo("INFO_PHYSIQ_SCORE")?.coach).toBe("nyra");
    expect(getFeatureInfo("INFO_RECOVERY_PILLARS")?.coach).toBe("nyra");
    expect(getFeatureInfo("INFO_CARDIO_SYNC")?.coach).toBe("nyra");

    // Barbell, Strength & Intensity -> Kix
    expect(getFeatureInfo("INFO_STRENGTH_STANDARDS")?.coach).toBe("kix");
    expect(getFeatureInfo("INFO_RPE_RIR")?.coach).toBe("kix");
    expect(getFeatureInfo("INFO_BARBELL_PLATE_CALC")?.coach).toBe("kix");
  });
});

describe("Preloaded Coach Recommendations Telemetry Logic", () => {
  it("triggers CNS Fatigue Alert when recovery drops below 60%", () => {
    const recLowRecovery = deriveActiveRecommendation(59, 10);
    expect(recLowRecovery.id).toBe("REC_CNS_FATIGUE");
    expect(recLowRecovery.coach).toBe("nyra");
    expect(recLowRecovery.badge).toBe("CNS ALERT");

    const recSeverelyDepleted = deriveActiveRecommendation(25, 0);
    expect(recSeverelyDepleted.id).toBe("REC_CNS_FATIGUE");
  });

  it("triggers PR Readiness Green Light when streak >= 5 and recovery >= 85%", () => {
    const recPrReady = deriveActiveRecommendation(90, 5);
    expect(recPrReady.id).toBe("REC_PR_READINESS");
    expect(recPrReady.coach).toBe("kix");
    expect(recPrReady.badge).toBe("GREEN LIGHT");

    const recHighStreakPeakRecovery = deriveActiveRecommendation(95, 14);
    expect(recHighStreakPeakRecovery.id).toBe("REC_PR_READINESS");
  });

  it("falls back to standard readiness advisory for intermediate ranges", () => {
    // High recovery but streak < 5
    const recHighRecLowStreak = deriveActiveRecommendation(88, 3);
    expect(recHighRecLowStreak.id).toBe("REC_PR_READINESS");

    // Moderate recovery (75%)
    const recModerate = deriveActiveRecommendation(75, 4);
    expect(recModerate).toBeDefined();
  });
});
