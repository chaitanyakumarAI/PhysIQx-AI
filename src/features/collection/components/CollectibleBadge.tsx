import type { CollectibleState } from "@/lib/gamification/progression";
import { medalState } from "../lib/groups";
import { Medal, type MedalState } from "./Medal";
import type { ShineMode } from "./medal/parts";
import { RankInsignia } from "./RankInsignia";

type BadgeItem = Pick<CollectibleState, "id" | "grade" | "icon" | "minLevel" | "progress" | "status" | "rankId">;

interface CollectibleBadgeProps {
  item: BadgeItem;
  /** Overrides the item's own state (a family tile shows its best tier as earned). */
  state?: MedalState;
  /** Overrides the item's own progress (a family tile shows the next tier's). */
  progress?: number;
  shine?: ShineMode;
  size: number;
  className?: string;
}

/** Any collectible as its badge: an insignia for ranks, a medal for the rest. */
export function CollectibleBadge({ item, state, progress, shine, size, className }: CollectibleBadgeProps) {
  const shown = state ?? medalState(item);
  if (item.rankId) {
    return (
      <RankInsignia rank={item.rankId} state={shown} artId={item.id} shine={shine} size={size} className={className} />
    );
  }
  return (
    <Medal
      grade={item.grade}
      icon={item.icon}
      state={shown}
      progress={progress ?? item.progress}
      sealedLevel={item.minLevel}
      artId={item.id}
      shine={shine}
      size={size}
      className={className}
    />
  );
}
