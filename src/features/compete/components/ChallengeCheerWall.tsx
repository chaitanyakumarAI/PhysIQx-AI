"use client";

import { useState } from "react";
import { Sparkles, MessageSquareHeart, Heart, Flame, Zap, Crown, Dumbbell } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { playSetComplete, triggerHaptic } from "@/lib/audioEngine";
import { enforceTwoSentences } from "@/types/insight";

export interface CheerReaction {
  id: string;
  emoji: string;
  label: string;
  initialCount: number;
}

const DEFAULT_REACTIONS: CheerReaction[] = [
  { id: "fist", emoji: "👊", label: "Respect", initialCount: 342 },
  { id: "fire", emoji: "🔥", label: "On Fire", initialCount: 518 },
  { id: "lightning", emoji: "⚡", label: "Light Weight", initialCount: 289 },
  { id: "crown", emoji: "👑", label: "King", initialCount: 194 },
  { id: "muscle", emoji: "💪", label: "Beast", initialCount: 421 },
];

interface ActivityItem {
  id: string;
  name: string;
  avatar: string;
  activity: string;
  timeAgo: string;
  highFives: number;
}

const SEED_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    name: "Marcus Vance",
    avatar: "MV",
    activity: "Logged 4,200 kg Barbell Bench volume across 4 heavy sets.",
    timeAgo: "3m ago",
    highFives: 24,
  },
  {
    id: "act-2",
    name: "Elena Rostova",
    avatar: "ER",
    activity: "Crushed 5,100 kg Leg Press & Romanian Deadlift workout.",
    timeAgo: "14m ago",
    highFives: 19,
  },
  {
    id: "act-3",
    name: "David Kim",
    avatar: "DK",
    activity: "Hit a new 8-rep Squat PR (145 kg) to secure Top 3% standing.",
    timeAgo: "32m ago",
    highFives: 38,
  },
  {
    id: "act-4",
    name: "Amara Okafor",
    avatar: "AO",
    activity: "Completed Day 5 of the Iron Streak Challenge with perfect form.",
    timeAgo: "1h ago",
    highFives: 15,
  },
];

export function ChallengeCheerWall({ challengeName }: { challengeName: string }) {
  const [reactions, setReactions] = useState(DEFAULT_REACTIONS);
  const [activeReactions, setActiveReactions] = useState<Record<string, boolean>>({});
  const [activities, setActivities] = useState(SEED_ACTIVITIES);
  const [highFivedIds, setHighFivedIds] = useState<Record<string, boolean>>({});

  function handleCheer(id: string) {
    triggerHaptic("light");
    playSetComplete();

    const isAlreadyActive = !!activeReactions[id];
    setActiveReactions((prev) => ({ ...prev, [id]: !isAlreadyActive }));
    setReactions((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            initialCount: isAlreadyActive ? r.initialCount - 1 : r.initialCount + 1,
          };
        }
        return r;
      }),
    );
  }

  function handleHighFive(actId: string) {
    triggerHaptic("light");
    playSetComplete();

    const isAlreadyFived = !!highFivedIds[actId];
    setHighFivedIds((prev) => ({ ...prev, [actId]: !isAlreadyFived }));
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === actId) {
          return {
            ...act,
            highFives: isAlreadyFived ? act.highFives - 1 : act.highFives + 1,
          };
        }
        return act;
      }),
    );
  }

  const coachCue = enforceTwoSentences(
    "Cheering on peer lifters builds athletic accountability and momentum. Send high-fives to athletes hitting heavy volume targets.",
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold flex items-center gap-2">
          <MessageSquareHeart size={18} className="text-brand" />
          Community Cheer Wall
        </h3>
        <span className="text-xs text-foreground-secondary">Live Circle Reactions</span>
      </div>

      {/* Reactive Kudos Bar */}
      <Card padding="md" className="flex flex-col gap-3 border-border/60">
        <p className="text-xs text-foreground-secondary">
          Drop a reaction for all athletes competing in {challengeName}:
        </p>

        <div className="grid grid-cols-5 gap-2">
          {reactions.map((r) => {
            const isActive = !!activeReactions[r.id];
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleCheer(r.id)}
                aria-label={`${r.label}, ${r.initialCount} cheers`}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border p-2 transition-all active:scale-95",
                  isActive
                    ? "border-brand bg-brand/15 text-brand shadow-sm"
                    : "border-border/60 bg-surface-elevated/60 text-foreground hover:bg-surface-elevated hover:border-border",
                )}
              >
                <span className="text-xl select-none">{r.emoji}</span>
                <span className="mt-1 font-display text-xs font-bold tabular-nums">
                  {r.initialCount}
                </span>
                <span className="text-[10px] text-foreground-secondary truncate max-w-full">
                  {r.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Peer Feed */}
      <Card padding="none" className="divide-y divide-border/60 overflow-hidden border-border/60">
        <div className="p-3 bg-surface-elevated/40 flex items-center justify-between text-xs">
          <span className="font-bold text-foreground">Recent Feats</span>
          <span className="text-foreground-secondary text-[11px]">Auto-verified lifts</span>
        </div>

        {activities.map((act) => {
          const isFived = !!highFivedIds[act.id];
          return (
            <div key={act.id} className="flex items-start justify-between p-3 gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-elevated font-semibold text-xs text-foreground border border-border/60 mt-0.5">
                  {act.avatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-foreground truncate">{act.name}</p>
                    <span className="text-[10px] text-foreground-secondary shrink-0">
                      {act.timeAgo}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-secondary mt-0.5 leading-relaxed">
                    {act.activity}
                  </p>
                </div>
              </div>

              {/* High Five Button */}
              <button
                type="button"
                onClick={() => handleHighFive(act.id)}
                aria-label={`Give high-five (${act.highFives})`}
                className={cn(
                  "shrink-0 flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all active:scale-95",
                  isFived
                    ? "border-brand bg-brand/15 text-brand"
                    : "border-border/60 text-foreground-secondary hover:text-foreground hover:bg-surface-elevated",
                )}
              >
                <span>🙌</span>
                <span className="tabular-nums font-bold text-[11px]">{act.highFives}</span>
              </button>
            </div>
          );
        })}
      </Card>

      {/* Coach Nyra Note */}
      <div className="rounded-card border border-brand/25 bg-brand/5 p-3 flex items-center gap-2.5 text-xs text-foreground-secondary">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand/20 text-brand">
          <Sparkles size={14} />
        </span>
        <p className="leading-snug">{coachCue}</p>
      </div>
    </div>
  );
}
