/**
 * XP / Level — docs/DATA_MODELS.md "XPTransaction", "Level". Level is fully
 * derived from lifetime XP; this view model carries the already-derived
 * current-level window (currentXP/xpToNextLevel), not the lifetime total —
 * those are different scales and must never be conflated (see DATA_MODELS'
 * XPTransaction note on the lifetime-vs-window-sum inconsistency).
 */
export interface LevelProgress {
  level: number;
  title: string;
  currentXP: number;
  xpToNextLevel: number;
  /** Derived — always currentXP/xpToNextLevel, never hand-authored. */
  percent: number;
}
