"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Award, CheckCircle2, Lock, Pin, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";
import { useSessionStore } from "@/store/sessionStore";
import { evaluateAchievements, type EvaluationContext } from "@/lib/achievementEngine";
import { mockHistoricalSessions } from "@/features/profile/mocks/historyData";
import { AchievementBadge } from "@/features/profile/components/AchievementBadge";
import type { ProfileAchievement } from "@/features/profile/types";

export function AchievementsContent() {
  const showcaseIds = useProfileStore((state) => state.showcaseAchievementIds);
  const toggleShowcase = useProfileStore((state) => state.toggleShowcaseAchievement);
  const storeHistory = useSessionStore((state) => state.history);

  const history = storeHistory.length > 0 ? storeHistory : mockHistoricalSessions;
  const context: EvaluationContext = {
    history,
    streakDays: 27,
    totalVolumeKg: history.reduce((sum, s) => sum + (s.totalVolumeKg || 0), 0),
    prCount: 4,
  };

  const result = evaluateAchievements(context);
  const allBadges = result.achievements;
  const unlockedCount = result.unlockedCount;

  const [category, setCategory] = useState<"all" | "unlocked" | "locked">("all");

  const filteredBadges = allBadges.filter((b: ProfileAchievement) => {
    if (category === "unlocked") return b.state === "unlocked";
    if (category === "locked") return b.state === "locked";
    return true;
  });

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center gap-3 pt-4">
        <Link
          href="/profile"
          aria-label="Back to Profile"
          className="grid size-10 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Achievement Collection</h1>
          <p className="text-xs text-foreground-secondary">
            {unlockedCount} of {allBadges.length} badges unlocked
          </p>
        </div>
      </div>

      {/* Showcase Note Card */}
      <Card padding="md" variant="accent" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand" />
            <span className="font-semibold text-sm text-foreground">Top Showcase ({showcaseIds.length}/3)</span>
          </div>
          <span className="text-xs text-foreground-secondary">Featured on Profile</span>
        </div>
        <p className="text-xs leading-relaxed text-foreground-secondary">
          Tap any unlocked badge below to pin or unpin it from your main profile showcase.
        </p>
      </Card>

      {/* Category Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
            category === "all" ? "bg-brand text-background" : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
          )}
        >
          All ({allBadges.length})
        </button>
        <button
          type="button"
          onClick={() => setCategory("unlocked")}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
            category === "unlocked" ? "bg-brand text-background" : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
          )}
        >
          Unlocked ({unlockedCount})
        </button>
        <button
          type="button"
          onClick={() => setCategory("locked")}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
            category === "locked" ? "bg-brand text-background" : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
          )}
        >
          Locked ({allBadges.length - unlockedCount})
        </button>
      </div>

      {/* Badges Grid */}
      <div className="flex flex-col gap-3 pb-6">
        {filteredBadges.map((badge: ProfileAchievement) => {
          const isFeatured = showcaseIds.includes(badge.id);
          const isUnlocked = badge.state === "unlocked";

          return (
            <Card
              key={badge.id}
              padding="md"
              className={cn(
                "flex flex-col gap-3 transition-all",
                isUnlocked ? "border-brand/30 bg-surface" : "opacity-70 border-border/60 bg-surface/50"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AchievementBadge achievement={badge} className="p-2 w-16 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-foreground">
                        {badge.name}
                      </span>
                      {isFeatured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand uppercase tracking-wider bg-brand/15 px-2 py-0.5 rounded-full">
                          <Pin size={10} aria-hidden />
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground-secondary leading-relaxed mt-1">
                      Tier: <span className="capitalize font-semibold text-foreground">{badge.rarity}</span> milestone badge
                    </p>
                  </div>
                </div>

                {isUnlocked && (
                  <button
                    type="button"
                    onClick={() => toggleShowcase(badge.id)}
                    className={cn(
                      "grid size-8 place-items-center rounded-full border transition-colors shrink-0",
                      isFeatured
                        ? "border-brand bg-brand text-background"
                        : "border-border text-foreground-secondary hover:border-brand/60 hover:text-foreground"
                    )}
                    aria-label={isFeatured ? "Unpin badge" : "Pin badge"}
                  >
                    <Pin size={14} className={isFeatured ? "rotate-45" : ""} />
                  </button>
                )}
              </div>

              {/* Progress Meter */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[11px] text-foreground-secondary">Completion</span>
                  <span className={isUnlocked ? "text-brand" : "text-foreground-secondary"}>
                    {Math.round(badge.progress * 100)}%
                  </span>
                </div>
                <ProgressBar
                  value={Math.round(badge.progress * 100)}
                  max={100}
                  tone={isUnlocked ? "brand" : "neutral"}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
