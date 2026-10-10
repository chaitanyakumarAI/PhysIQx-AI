"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import { CoachAvatar } from "@/components/ui/CoachAvatar";
import { getPreloadedRecommendations, getCoachProfile } from "@/data/coachContent";
import { Button } from "@/components/ui/Button";
import type { PreloadedRecommendation } from "@/types/coach";
import { cn } from "@/lib/utils";

export interface CoachRecommendationWidgetProps {
  recoveryScore?: number; // 0 - 100
  streakDays?: number;
  className?: string;
  onAction?: (recommendationId: string) => void;
}

/**
 * Derives the active preloaded recommendation based on athlete telemetry.
 */
export function deriveActiveRecommendation(
  recoveryScore: number = 80,
  streakDays: number = 0,
): PreloadedRecommendation {
  const allRecs = getPreloadedRecommendations();

  // 1. CNS Fatigue Alert (Recovery < 60%)
  if (recoveryScore < 60) {
    return allRecs.find((r) => r.id === "REC_CNS_FATIGUE") ?? allRecs[0]!;
  }

  // 2. PR Readiness Green Light (Streak >= 5 & Recovery >= 85%)
  if (streakDays >= 5 && recoveryScore >= 85) {
    return allRecs.find((r) => r.id === "REC_PR_READINESS") ?? allRecs[1]!;
  }

  // 3. Fallback to PR Readiness or Plateau Advisory
  return allRecs.find((r) => r.id === "REC_PR_READINESS") ?? allRecs[0]!;
}

const BADGE_CONFIG = {
  "CNS ALERT": {
    icon: AlertTriangle,
    badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    borderClass: "border-amber-500/30 bg-amber-950/10",
  },
  "GREEN LIGHT": {
    icon: CheckCircle2,
    badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    borderClass: "border-emerald-500/30 bg-emerald-950/10",
  },
  PLATEAU: {
    icon: TrendingUp,
    badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    borderClass: "border-blue-500/30 bg-blue-950/10",
  },
  "TISSUE STRAIN": {
    icon: Zap,
    badgeBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    borderClass: "border-rose-500/30 bg-rose-950/10",
  },
} as const;

export function CoachRecommendationWidget({
  recoveryScore = 82,
  streakDays = 1,
  className,
  onAction,
}: CoachRecommendationWidgetProps) {
  const router = useRouter();

  const rec = useMemo(
    () => deriveActiveRecommendation(recoveryScore, streakDays),
    [recoveryScore, streakDays],
  );

  const profile = getCoachProfile(rec.coach);
  const isKix = rec.coach === "kix";
  const badgeStyle = BADGE_CONFIG[rec.badge as keyof typeof BADGE_CONFIG] ?? BADGE_CONFIG["GREEN LIGHT"];
  const BadgeIcon = badgeStyle.icon;

  function handleCtaClick() {
    if (onAction) {
      onAction(rec.id);
      return;
    }

    if (rec.id === "REC_PR_READINESS") {
      router.push("/train");
    } else if (rec.id === "REC_CNS_FATIGUE") {
      router.push("/insights");
    } else {
      router.push("/train");
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 sm:p-5 backdrop-blur-md transition-all",
        badgeStyle.borderClass,
        className,
      )}
    >
      {/* Background Ambient Glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 size-36 rounded-full blur-3xl opacity-20",
          isKix ? "bg-emerald-500" : "bg-cyan-500",
        )}
      />

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase",
              badgeStyle.badgeBg,
            )}
          >
            <BadgeIcon size={11} aria-hidden />
            {rec.badge}
          </span>
          <span className="text-[11px] text-foreground-muted font-mono">
            {"//"} {profile.name} Advisory
          </span>
        </div>
      </div>

      {/* Body: Coach Avatar + Recommendation Directive */}
      <div className="my-3.5 flex items-start gap-3.5">
        <CoachAvatar
          coachId={rec.coach}
          expression={isKix ? "intense" : "analytical"}
          isSpeaking={true}
          size="md"
          showWaveform={false}
        />
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-sm sm:text-base font-bold text-foreground">
            {rec.title}
          </h4>
          <p className="mt-1 text-xs text-foreground-secondary leading-relaxed">
            {rec.body}
          </p>
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-4 flex items-center justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCtaClick}
          className="gap-1.5 text-xs font-semibold"
        >
          {rec.ctaLabel}
          <ArrowRight size={13} aria-hidden />
        </Button>
      </div>
    </div>
  );
}
