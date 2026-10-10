import { describe, expect, it } from "vitest";
import {
  getIntroBriefing,
  getFeatureInfo,
  getAllFeatureExplainers,
  getPreloadedRecommendations,
  getCoachProfile,
} from "./coachContent";

describe("coachContent Data Module", () => {
  it("loads 5 dual-dialogue briefing steps with valid speakers", () => {
    const briefing = getIntroBriefing();
    expect(briefing).toHaveLength(5);

    briefing.forEach((step, idx) => {
      expect(step.step).toBe(idx + 1);
      expect(step.topic).toBeTruthy();
      expect(step.lines).toHaveLength(2);
      expect(step.lines[0]?.speaker).toBe("kix");
      expect(step.lines[1]?.speaker).toBe("nyra");
      expect(step.lines[0]?.text.length).toBeGreaterThan(10);
      expect(step.lines[1]?.text.length).toBeGreaterThan(10);
    });
  });

  it("retrieves all 6 on-demand feature explainers with correct coach assignments", () => {
    const allExplainers = getAllFeatureExplainers();
    expect(allExplainers).toHaveLength(6);

    const scoreInfo = getFeatureInfo("INFO_PHYSIQ_SCORE");
    expect(scoreInfo).toBeDefined();
    expect(scoreInfo?.coach).toBe("nyra");
    expect(scoreInfo?.tacticalTip).toBeTruthy();

    const rpeInfo = getFeatureInfo("INFO_RPE_RIR");
    expect(rpeInfo).toBeDefined();
    expect(rpeInfo?.coach).toBe("kix");

    const plateInfo = getFeatureInfo("INFO_BARBELL_PLATE_CALC");
    expect(plateInfo).toBeDefined();
    expect(plateInfo?.coach).toBe("kix");

    const cardioInfo = getFeatureInfo("INFO_CARDIO_SYNC");
    expect(cardioInfo).toBeDefined();
    expect(cardioInfo?.coach).toBe("nyra");
  });

  it("loads all 4 preloaded recommendations with valid trigger conditions and badges", () => {
    const recs = getPreloadedRecommendations();
    expect(recs).toHaveLength(4);

    const cnsRec = recs.find((r) => r.id === "REC_CNS_FATIGUE");
    expect(cnsRec).toBeDefined();
    expect(cnsRec?.coach).toBe("nyra");
    expect(cnsRec?.badge).toBe("CNS ALERT");

    const prRec = recs.find((r) => r.id === "REC_PR_READINESS");
    expect(prRec).toBeDefined();
    expect(prRec?.coach).toBe("kix");
    expect(prRec?.badge).toBe("GREEN LIGHT");

    const plateauRec = recs.find((r) => r.id === "REC_PLATEAU_DETECTED");
    expect(plateauRec).toBeDefined();
    expect(plateauRec?.coach).toBe("kix");
    expect(plateauRec?.badge).toBe("PLATEAU");

    const spikeRec = recs.find((r) => r.id === "REC_VOLUME_SPIKE");
    expect(spikeRec).toBeDefined();
    expect(spikeRec?.coach).toBe("nyra");
    expect(spikeRec?.badge).toBe("TISSUE STRAIN");
  });

  it("defines complete profiles and avatar frames for Kix and Nyra", () => {
    const kix = getCoachProfile("kix");
    expect(kix.name).toBe("Kix");
    expect(kix.themeColor).toBe("#10b981");
    expect(kix.avatarFrames.default).toBe("/mascots/kix-default.webp");
    expect(kix.avatarFrames.intense).toBe("/mascots/kix-determined.webp");

    const nyra = getCoachProfile("nyra");
    expect(nyra.name).toBe("Nyra");
    expect(nyra.themeColor).toBe("#06b6d4");
    expect(nyra.avatarFrames.default).toBe("/mascots/nyra-nod.webp");
    expect(nyra.avatarFrames.analytical).toBe("/mascots/nyra-tilt.webp");
  });
});
