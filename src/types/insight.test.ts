import { describe, expect, it } from "vitest";
import { enforceTwoSentences } from "./insight";

describe("enforceTwoSentences", () => {
  it("returns empty string for empty input", () => {
    expect(enforceTwoSentences("")).toBe("");
  });

  it("leaves single sentence unchanged", () => {
    const single = "You hit a new personal record on bench press today!";
    expect(enforceTwoSentences(single)).toBe(single);
  });

  it("leaves two sentences unchanged", () => {
    const double = "Great work on your push session. Your total volume increased by 12%.";
    expect(enforceTwoSentences(double)).toBe(double);
  });

  it("truncates 3 or more sentences down to exactly 2 sentences", () => {
    const longInput = "First sentence here. Second sentence here! Third sentence should be removed? Fourth sentence also removed.";
    const expected = "First sentence here. Second sentence here!";
    expect(enforceTwoSentences(longInput)).toBe(expected);
  });

  it("handles whitespace trimming cleanly", () => {
    const messy = "   Sentence one.   Sentence two.   Sentence three.   ";
    expect(enforceTwoSentences(messy)).toBe("Sentence one.   Sentence two.");
  });
});
