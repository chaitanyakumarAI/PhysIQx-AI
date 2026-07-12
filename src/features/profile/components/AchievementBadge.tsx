import { Crown, Droplet, Dumbbell, Flame, Lock, Trophy, type LucideIcon } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import type { AchievementIconId, AchievementRarity } from "@/types/achievement";
import type { ProfileAchievement } from "../types";

export interface AchievementBadgeProps {
  achievement: ProfileAchievement;
  className?: string;
}

const achievementIcon: Record<AchievementIconId, LucideIcon> = {
  trophy: Trophy,
  flame: Flame,
  droplet: Droplet,
  dumbbell: Dumbbell,
  crown: Crown,
};

const rarityTone: Record<AchievementRarity, { text: string; bar: "neutral" | "info" | "brand" | "legendary" }> = {
  common: { text: "text-foreground-secondary", bar: "neutral" },
  rare: { text: "text-info", bar: "info" },
  epic: { text: "text-brand", bar: "brand" },
  legendary: { text: "text-legendary", bar: "legendary" },
};

const rarityLabel: Record<AchievementRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

/**
 * One collection grid tile. Unlocked shows the real icon in its rarity
 * color; locked renders as a muted gray "not yet revealed" tile — dimmed,
 * colorless (rarity withheld), just a lock, the name, and progress.
 */
export function AchievementBadge({ achievement, className }: AchievementBadgeProps) {
  const unlocked = achievement.state === "unlocked";
  const Icon = achievementIcon[achievement.iconId];
  const tone = rarityTone[achievement.rarity];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-card border p-3 text-center",
        unlocked
          ? "border-brand/20 bg-brand/10"
          : "border-border/40 bg-surface opacity-55 saturate-0",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-11 place-items-center rounded-full",
          unlocked ? "bg-surface-elevated" : "bg-foreground/5",
        )}
      >
        {unlocked ? (
          <Icon size={iconSize.md} className={tone.text} />
        ) : (
          <Lock size={iconSize.sm} className="text-foreground-secondary" />
        )}
      </span>
      <div>
        <p
          className={cn(
            "text-sm font-semibold",
            !unlocked && "text-foreground-secondary",
          )}
        >
          {achievement.name}
        </p>
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.08em]",
            unlocked ? tone.text : "text-foreground-secondary",
          )}
        >
          {unlocked ? rarityLabel[achievement.rarity] : "Locked"}
        </p>
      </div>
      {!unlocked && (
        <ProgressBar
          value={achievement.progress * 100}
          size="sm"
          tone="neutral"
          aria-label={`${achievement.name} progress ${Math.round(achievement.progress * 100)}%`}
        />
      )}
    </div>
  );
}
