import type { LucideIcon } from "lucide-react";
import type { Profile } from "@/types/profile";
import type { PhysIQScoreSnapshot } from "@/types/score";
import type { Mission, StreakSummary, WeeklySummary } from "@/types/training";
import type { FuelProgress } from "@/types/nutrition";
import type { LevelProgress } from "@/types/gamification";
import type { Insight } from "@/types/insight";

/**
 * Quick-log/navigation shortcut. UI-only concept (not a DATA_MODELS entity);
 * per docs/ROUTES.md, quick-log destinations are addressed via search params
 * on the owning tab (e.g. "/home?log=water") — hrefs here follow that rule.
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

/** Aggregate returned by getHomeData() — the Home screen's data contract. */
export interface HomeData {
  profile: Profile;
  streak: StreakSummary;
  score: PhysIQScoreSnapshot;
  /** null represents a rest day / no mission generated — a real state, not an error. */
  mission: Mission | null;
  week: WeeklySummary;
  fuel: FuelProgress[];
  /** null represents "no insight available yet" — must render gracefully. */
  insight: Insight | null;
  level: LevelProgress;
  quickActions: QuickAction[];
}
