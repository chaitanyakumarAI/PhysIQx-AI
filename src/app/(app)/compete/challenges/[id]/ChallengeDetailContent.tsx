"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Zap,
  Users,
  Clock,
  CheckCircle2,
  Dumbbell,
  Sparkles,
  ChevronRight,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/sessionStore";
import { mockHistoricalSessions } from "@/features/profile/mocks/historyData";
import type { Challenge, ChallengeParticipation } from "@/types/challenge";

const CHALLENGE_REGISTRY: Record<string, Challenge> = {
  "challenge-volume-king": {
    id: "challenge-volume-king",
    name: "Volume King",
    description: "Lift 40,000 kg across compound & isolation sets this week.",
    target: 40_000,
    unit: "kg",
    participantCount: 2842,
    daysLeft: 4,
    reward: { tierLabel: "Top 10% earns", badgeName: "Legendary Volume King" },
  },
  "challenge-century-club": {
    id: "challenge-century-club",
    name: "Century Club",
    description: "Log 100 high-intensity working sets across all sessions.",
    target: 100,
    unit: "sets",
    participantCount: 1954,
    daysLeft: 9,
    reward: { tierLabel: "Top 15% earns", badgeName: "Century Warrior Badge" },
  },
  "challenge-iron-streak": {
    id: "challenge-iron-streak",
    name: "Iron Streak",
    description: "Maintain 14 consecutive active training & rest-honored days.",
    target: 14,
    unit: "days",
    participantCount: 3410,
    daysLeft: 12,
    reward: { tierLabel: "All finishers earn", badgeName: "Iron Discipline Crest" },
  },
};

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Marcus Vance", avatar: "MV", progress: 44250, badge: "🥇" },
  { rank: 2, name: "Elena Rostova", avatar: "ER", progress: 41800, badge: "🥈" },
  { rank: 3, name: "David Kim", avatar: "DK", progress: 39950, badge: "🥉" },
  { rank: 4, name: "Sarah Connor", avatar: "SC", progress: 36200, badge: "4" },
  { rank: 5, name: "Liam O'Connor", avatar: "LO", progress: 34100, badge: "5" },
  { rank: 6, name: "Amara Okafor", avatar: "AO", progress: 32450, badge: "6" },
  { rank: 7, name: "Tariq Mansoor", avatar: "TM", progress: 31000, badge: "7" },
  { rank: 8, name: "Chloe Bennett", avatar: "CB", progress: 29850, badge: "8" },
];

export function ChallengeDetailContent({ challengeId }: { challengeId: string }) {
  const challenge = CHALLENGE_REGISTRY[challengeId] || CHALLENGE_REGISTRY["challenge-volume-king"]!;
  const sessionHistory = useSessionStore((state) => state.history);
  const allSessions = sessionHistory.length > 0 ? sessionHistory : mockHistoricalSessions;

  // Calculate real volume from user's sessions
  const userVolume = useMemo(() => {
    return allSessions.reduce((sum, s) => sum + (s.totalVolumeKg || 0), 0);
  }, [allSessions]);

  // Scale or cap progress
  const progress = Math.min(challenge.target, Math.max(24800, userVolume));
  const percent = Math.min(100, Math.round((progress / challenge.target) * 100));

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center gap-3 pt-6">
        <Link
          href="/compete"
          aria-label="Back to Compete"
          className="grid size-11 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">{challenge.name}</h1>
          <p className="text-xs text-foreground-secondary">
            Global Community Challenge · {challenge.daysLeft} days remaining
          </p>
        </div>
      </div>

      {/* Challenge Hero Progress Card */}
      <Card variant="accent" padding="lg" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
            <Zap size={14} />
            Live Competition
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-foreground-secondary">
            <Users size={14} />
            {challenge.participantCount.toLocaleString()} athletes
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
            Objective
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{challenge.description}</p>
        </div>

        {/* Progress Bar & Stats */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>
              {progress.toLocaleString()} / {challenge.target.toLocaleString()} {challenge.unit}
            </span>
            <span className="font-bold text-brand">{percent}%</span>
          </div>
          <ProgressBar value={percent} className="h-2.5" tone="brand" />
          <div className="flex items-center justify-between text-[11px] text-foreground-secondary">
            <span>Current standing: <strong className="text-foreground">Top 8%</strong></span>
            <span>{challenge.daysLeft}d left to finalize</span>
          </div>
        </div>

        {/* Reward Tier */}
        <div className="flex items-center justify-between rounded-card border border-legendary/30 bg-legendary/10 p-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-legendary/20 text-legendary">
              <Trophy size={16} />
            </span>
            <div>
              <p className="font-bold text-legendary">{challenge.reward.badgeName}</p>
              <p className="text-[11px] text-foreground-secondary">{challenge.reward.tierLabel}</p>
            </div>
          </div>
          <span className="rounded-full bg-surface/80 px-2.5 py-1 text-[11px] font-bold text-legendary">
            +500 XP
          </span>
        </div>
      </Card>

      {/* Rules & Eligibility */}
      <Card padding="md" className="flex flex-col gap-3 border-border/60">
        <h3 className="font-display text-sm font-bold flex items-center gap-2">
          <ShieldCheck size={16} className="text-brand" />
          Challenge Rules & Scoring
        </h3>
        <ul className="space-y-2 text-xs text-foreground-secondary">
          <li className="flex items-start gap-2">
            <span className="size-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
            <span>
              <strong>Eligible movements:</strong> All completed workout sets across Barbell, Dumbbell, Machine, and Cable exercises count toward volume.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="size-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
            <span>
              <strong>Auto-verification:</strong> Sets are scored and validated immediately upon tapping "Finish Workout" in active sessions.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="size-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
            <span>
              <strong>Anti-cheat guard:</strong> Volume caps enforce realistic progression curves based on Epley 1RM estimates.
            </span>
          </li>
        </ul>
      </Card>

      {/* Challenge Standings Leaderboard */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold">Challenge Leaderboard</h3>
          <span className="text-xs text-foreground-secondary">Global Division</span>
        </div>

        <Card padding="none" className="divide-y divide-border/60 overflow-hidden border-border/60">
          {MOCK_LEADERBOARD.map((athlete) => (
            <div
              key={athlete.rank}
              className="flex items-center justify-between px-4 py-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-center font-bold text-sm">
                  {athlete.badge}
                </span>
                <div className="grid size-8 place-items-center rounded-full bg-surface-elevated font-semibold text-foreground">
                  {athlete.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{athlete.name}</p>
                  <p className="text-[10px] text-foreground-secondary">Verified Ledger</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-display font-bold text-foreground">
                  {athlete.progress.toLocaleString()} {challenge.unit}
                </p>
                <p className="text-[10px] text-brand">Target Complete</p>
              </div>
            </div>
          ))}

          {/* Pinned Current User Standing */}
          <div className="flex items-center justify-between bg-brand/10 px-4 py-3 text-xs border-t-2 border-brand/40">
            <div className="flex items-center gap-3">
              <span className="w-5 text-center font-bold text-brand">#228</span>
              <div className="grid size-8 place-items-center rounded-full bg-brand text-background font-bold">
                YOU
              </div>
              <div>
                <p className="font-semibold text-foreground">Alex (You)</p>
                <p className="text-[10px] text-brand">Top 8% Tier</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-display font-bold text-brand">
                {progress.toLocaleString()} {challenge.unit}
              </p>
              <p className="text-[10px] text-foreground-secondary">{percent}% of target</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Button */}
      <div className="pt-2 pb-8">
        <Button size="lg" fullWidth asChild>
          <Link href="/train" className="flex items-center justify-center gap-2">
            <Dumbbell size={iconSize.sm} />
            Log Workout for Challenge
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}
