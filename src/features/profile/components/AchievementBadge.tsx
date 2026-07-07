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

/** One collection grid tile. Locked/in-progress shows a lock + progress bar; unlocked shows the real icon. */
export function AchievementBadge({ achievement, className }: AchievementBadgeProps) {
  const unlocked = achievement.state === "unlocked";
  const Icon = achievementIcon[achievement.iconId];
  const tone = rarityTone[achievement.rarity];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-card border p-3 text-center",
        unlocked ? "border-brand/20 bg-brand/10" : "border-border/60 bg-surface",
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
        <p className="text-sm font-semibold">{achievement.name}</p>
        <p className={cn("text-xs font-semibold uppercase tracking-[0.08em]", tone.text)}>
          {rarityLabel[achievement.rarity]}
        </p>
      </div>
      {!unlocked && (
        <ProgressBar
          value={achievement.progress * 100}
          size="sm"
          tone={tone.bar}
          aria-label={`${achievement.name} progress ${Math.round(achievement.progress * 100)}%`}
        />
      )}
    </div>
  );
}
