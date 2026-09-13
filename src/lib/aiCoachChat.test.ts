import { describe, it, expect } from "vitest";
import { generateCoachResponse } from "./aiCoachChat";

describe("aiCoachChat engine", () => {
  it("enforces <= 2 sentences contract on all responses", () => {
    const queries = [
      "How do I break a bench press plateau?",
      "I feel sore and tired from lack of sleep",
      "Give me form cues for Romanian Deadlift",
      "What is my weakest pillar?",
      "How much protein should I consume?",
      "When should I take a deload?",
      "What is the best way to train?",
    ];

    for (const q of queries) {
      const respKix = generateCoachResponse(q, "kix", { goal: "bulk", currentStreakDays: 12 });
      const respNyra = generateCoachResponse(q, "nyra", { goal: "cut", weakestPillarId: "strength" });

      const sentencesKix = respKix.text.split(/(?<=[.!?])\s+/).filter(Boolean);
      const sentencesNyra = respNyra.text.split(/(?<=[.!?])\s+/).filter(Boolean);

      expect(sentencesKix.length).toBeLessThanOrEqual(2);
      expect(sentencesNyra.length).toBeLessThanOrEqual(2);
    }
  });

  it("links directly to exercise detail when matching exercise cues", () => {
    const response = generateCoachResponse("Form cues for bench press please", "kix");
    expect(response.suggestedAction).toBeDefined();
    expect(response.suggestedAction?.href).toContain("/train/exercises/ex-bench-press");
  });

  it("tailors plateau response based on selected persona", () => {
    const kix = generateCoachResponse("stuck on bench plateau", "kix");
    const nyra = generateCoachResponse("stuck on bench plateau", "nyra");

    expect(kix.text).toContain("overload");
    expect(nyra.text).toContain("rep bracket");
  });

  it("provides tailored weakest pillar advice", () => {
    const response = generateCoachResponse("How do I raise my weakest pillar?", "kix", {
      weakestPillarId: "cardio",
    });
    expect(response.text.toLowerCase()).toContain("cardio");
    expect(response.suggestedAction?.href).toBe("/insights");
  });

  it("generates distinct timestamps and message IDs", () => {
    const m1 = generateCoachResponse("hello", "kix");
    const m2 = generateCoachResponse("hello again", "nyra");
    expect(m1.id).not.toBe(m2.id);
    expect(m1.timestamp).toBeDefined();
  });
});
