import type { Speaker } from "./script";

/**
 * Stage geometry for the character tour: two big chest-up characters at
 * the bottom corners (Clash of Clans-style), the speech bubble above them,
 * and the spotlit UI in the space that's left. Pure, so it's testable.
 */

/** Stage cuts are 3:4 (scripts/crop_mascot_stage.py). */
export const FRAME_RATIO = 3 / 4;
/** The app column — PageContainer's max-w-md. */
const STAGE_MAX_WIDTH = 448;
/** How far the two may overlap in the middle; the listener stands behind. */
const CAST_OVERLAP = 28;
/** A three-line bubble plus its footer, for parking targets above it. */
const BUBBLE_ESTIMATE = 150;
/** The bubble's bottom edge sits just above Kix's ear tips. */
const BUBBLE_LIFT = 0.96;

interface CastLayout {
  side: "left" | "right";
  /**
   * Height relative to Kix's. Nyra's grid is framed tighter, so she renders
   * smaller to keep the two heads in proportion.
   */
  heightScale: number;
  /**
   * Lift off the stage floor, as a share of Kix's height. Nyra's chest
   * dissolves into the dark below her, and her eye-line lands just above
   * his (MASCOTS.md).
   */
  lift: number;
  /** Share of the frame allowed to run past the screen edge. */
  bleed: number;
}

export const CAST: Record<Speaker, CastLayout> = {
  kix: { side: "left", heightScale: 1, lift: 0, bleed: 0.06 },
  nyra: { side: "right", heightScale: 0.8, lift: 0.16, bleed: 0.04 },
};

const SIZE = {
  /** Pointing at the UI: the cast keeps to the bottom ~30%. */
  dialogue: { share: 0.3, min: 170, max: 290 },
  /** Intro and finale: the cast takes centre stage. */
  scene: { share: 0.4, min: 210, max: 380 },
};

export interface Viewport {
  width: number;
  height: number;
}

export interface CastBox {
  width: number;
  height: number;
  /** Distance from the stage floor. */
  bottom: number;
  /** Distance from the stage's side edge (negative bleeds off-screen). */
  inset: number;
  /** Centre of the face, from the stage's left edge. */
  faceX: number;
}

export interface StageMetrics {
  width: number;
  cast: Record<Speaker, CastBox>;
  /** The bubble's bottom edge, above the floor. */
  bubbleBottom: number;
  /** Height the stage needs from the screen bottom; targets park above it. */
  reserve: number;
}

export function computeStageMetrics(viewport: Viewport, scene: boolean): StageMetrics {
  const width = Math.min(viewport.width, STAGE_MAX_WIDTH);
  const size = scene ? SIZE.scene : SIZE.dialogue;
  const widthPerKixHeight =
    FRAME_RATIO *
    (CAST.kix.heightScale * (1 - CAST.kix.bleed) + CAST.nyra.heightScale * (1 - CAST.nyra.bleed));
  const fitsAcross = (width + CAST_OVERLAP) / widthPerKixHeight;
  const kixHeight = Math.round(
    Math.max(size.min, Math.min(size.max, viewport.height * size.share, fitsAcross)),
  );

  const box = (speaker: Speaker): CastBox => {
    const layout = CAST[speaker];
    const height = Math.round(kixHeight * layout.heightScale);
    const memberWidth = Math.round(height * FRAME_RATIO);
    const inset = -Math.round(memberWidth * layout.bleed);
    const faceX = layout.side === "left" ? inset + memberWidth / 2 : width - inset - memberWidth / 2;
    return { width: memberWidth, height, bottom: Math.round(kixHeight * layout.lift), inset, faceX };
  };
  const cast = { kix: box("kix"), nyra: box("nyra") };

  const tallest = Math.max(cast.kix.bottom + cast.kix.height, cast.nyra.bottom + cast.nyra.height);
  const bubbleBottom = Math.round(tallest * BUBBLE_LIFT);
  return { width, cast, bubbleBottom, reserve: bubbleBottom + BUBBLE_ESTIMATE };
}
