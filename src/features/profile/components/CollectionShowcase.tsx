"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/layout/Section";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";
import { countUnlockedAchievements } from "../lib/derive";
import { AchievementBadge } from "./AchievementBadge";
import type { ProfileAchievement } from "../types";

export interface CollectionShowcaseProps {
  achievements: ProfileAchievement[];
}

const SHOWCASE_SIZE = 3;

/**
 * The Collection section: a 3-badge showcase with the full grid behind
 * "View all". In the expanded grid, tapping an unlocked badge features it
 * in the showcase (max 3 — oldest pick rotates out, persisted in
 * profileStore); locked badges are not selectable.
 */
export function CollectionShowcase({ achievements }: CollectionShowcaseProps) {
  const [expanded, setExpanded] = useState(false);
  const showcaseIds = useProfileStore((state) => state.showcaseAchievementIds);
  const toggleShowcase = useProfileStore(
    (state) => state.toggleShowcaseAchievement,
  );

  const unlockedCount = countUnlockedAchievements(achievements);

  // User picks first (in pick order, unlocked only), padded with the first
  // unlocked non-picks so the showcase is always full when possible.
  const picked = showcaseIds
    .map((id) => achievements.find((achievement) => achievement.id === id))
    .filter(
      (achievement): achievement is ProfileAchievement =>
        achievement !== undefined && achievement.state === "unlocked",
    );
  const fillers = achievements.filter(
    (achievement) =>
      achievement.state === "unlocked" &&
      !picked.some((pick) => pick.id === achievement.id),
  );
  const showcase = [...picked, ...fillers].slice(0, SHOWCASE_SIZE);

  return (
    <Section
      title="Collection"
      action={
        <span className="text-sm text-foreground-secondary">
          {unlockedCount} / {achievements.length}
        </span>
      }
    >
      {!expanded && (
        <ul aria-label="Showcased achievements" className="grid grid-cols-3 gap-3">
          {showcase.map((achievement) => (
            <li key={achievement.id}>
              <AchievementBadge achievement={achievement} />
            </li>
          ))}
        </ul>
      )}

      {expanded && (
        <>
          <p className="text-xs text-foreground-secondary">
            Tap an unlocked badge to feature it in your top {SHOWCASE_SIZE}.
          </p>
          <div
            role="group"
            aria-label="Achievement collection"
            className="grid grid-cols-3 gap-3"
          >
            {achievements.map((achievement) => {
              const unlocked = achievement.state === "unlocked";
              const featured = showcase.some(
                (pick) => pick.id === achievement.id,
              );
              if (!unlocked) {
                return (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                  />
                );
              }
              return (
                <button
                  key={achievement.id}
                  type="button"
                  aria-pressed={featured}
                  aria-label={`${achievement.name} — ${featured ? "remove from" : "add to"} showcase`}
                  onClick={() => toggleShowcase(achievement.id)}
                  className={cn(
                    "rounded-card text-left transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    featured && "ring-2 ring-brand",
                  )}
                >
                  <AchievementBadge achievement={achievement} className="h-full" />
                </button>
              );
            })}
          </div>
        </>
      )}

      <Button
        variant="ghost"
        size="sm"
        fullWidth
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? "Show less" : `View all ${achievements.length}`}
        {expanded ? (
          <ChevronUp aria-hidden className="size-4" />
        ) : (
          <ChevronDown aria-hidden className="size-4" />
        )}
      </Button>
    </Section>
  );
}
