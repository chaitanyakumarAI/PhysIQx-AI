import type {
  BodyBalance,
  PhysIQScoreSnapshot,
  ScoreTrendPoint,
  ScoreTrendRange,
} from "@/types/score";
import type { Insight } from "@/types/insight";
import type { PersonalRecord } from "@/types/personalRecord";
import type { DayStatus } from "@/types/training";

/** Aggregate returned by getInsightsData() — the Insights screen's data contract. */
export interface InsightsData {
  /** Current score/delta/headline — the same snapshot shown on Home. */
  score: PhysIQScoreSnapshot;
  /** One point series per selectable range; the screen picks which to render. */
  trends: Record<ScoreTrendRange, ScoreTrendPoint[]>;
  /** "What the data says" cards. */
  insights: Insight[];
  bodyBalance: BodyBalance;
  personalRecords: PersonalRecord[];
  /** Outer array = weeks (oldest first), inner array = 7 days. */
  streakWeeks: DayStatus[][];
}
