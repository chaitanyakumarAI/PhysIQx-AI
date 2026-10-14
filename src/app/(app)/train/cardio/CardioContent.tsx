"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, HeartPulse, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";
import { CardioImportCard } from "@/features/train/components/CardioImportCard";
import { DemoBanner } from "@/features/shared/components/DemoBanner";
import { useLedger, useTodayIso } from "@/features/shared/hooks/useAthlete";
import { WHO_WEEKLY_CARDIO_MIN, isVigorous, weeklyEquivalentMinutes } from "@/lib/cardio/minutes";
import { useCardioStore } from "@/store/cardioStore";
import { cardioActivityLabels, cardioSourceLabels } from "@/types/cardio";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * The Cardio pillar's home: this week against the WHO target, imports,
 * and every activity on record. No manual logging (product directive) —
 * activities come from files or synced sources.
 */
export function CardioContent() {
  const router = useRouter();
  const { ledger, demo } = useLedger();
  const today = useTodayIso();
  const removeActivity = useCardioStore((state) => state.removeActivity);
  const age = ledger.profile.birthYear ? Number(today.slice(0, 4)) - ledger.profile.birthYear : null;
  const weekMinutes = weeklyEquivalentMinutes(ledger.cardio, today, age);
  const activities = [...ledger.cardio].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return (
    <PageContainer>
      <div className="flex items-center gap-3 pt-6">
        <IconButton label="Back to Train" variant="ghost" onClick={() => router.push("/train")}>
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </IconButton>
        <div>
          <h1 className="font-display text-2xl font-bold">Cardio</h1>
          <p className="text-sm text-foreground-secondary">Feeds 25% of your PhysIQ Score</p>
        </div>
      </div>

      {demo && <DemoBanner />}

      <Card padding="lg" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary">
            Last 7 days
          </p>
          <p className="text-xs text-foreground-muted">Goal {WHO_WEEKLY_CARDIO_MIN} min</p>
        </div>
        <p className="font-display text-4xl font-bold tabular-nums">
          {weekMinutes}
          <span className="ml-1 text-base font-semibold text-foreground-secondary">min</span>
        </p>
        <ProgressBar
          value={Math.min(weekMinutes, WHO_WEEKLY_CARDIO_MIN)}
          max={WHO_WEEKLY_CARDIO_MIN}
          aria-label={`${weekMinutes} of ${WHO_WEEKLY_CARDIO_MIN} weekly minutes`}
        />
        <p className="text-xs text-foreground-secondary">
          Runs, rows, swims and HIIT count double — the WHO treats vigorous minutes as worth two
          moderate ones.
        </p>
      </Card>

      {!demo && <CardioImportCard />}

      <Link
        href="/profile/integrations"
        className="flex items-center justify-between rounded-card border border-border/60 bg-surface px-4 py-3 text-sm hover:bg-surface-elevated"
      >
        <span>Sources & automatic sync</span>
        <ChevronRight size={iconSize.xs} className="text-foreground-secondary" aria-hidden />
      </Link>

      <Section title="Activities">
        {activities.length === 0 ? (
          <Card padding="none">
            <EmptyState
              icon={HeartPulse}
              title="No cardio yet"
              description="Import a GPX or TCX export above and it counts toward this week right away."
            />
          </Card>
        ) : (
          <Card padding="none" className="divide-y divide-white/[0.06]">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/[0.06] text-foreground">
                  <HeartPulse size={iconSize.sm} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {cardioActivityLabels[activity.type]} · {Math.round(activity.durationMin)} min
                    {isVigorous(activity, age) && (
                      <span className="ml-1.5 text-xs font-semibold text-brand">×2</span>
                    )}
                  </p>
                  <p className="text-xs text-foreground-secondary">
                    {formatDate(activity.date)}
                    {activity.distanceKm ? ` · ${activity.distanceKm} km` : ""}
                    {activity.avgHeartRate ? ` · ${activity.avgHeartRate} bpm` : ""}
                    {` · ${cardioSourceLabels[activity.source]}`}
                  </p>
                </div>
                {!demo && (
                  <IconButton
                    label={`Remove ${cardioActivityLabels[activity.type]} on ${formatDate(activity.date)}`}
                    variant="ghost"
                    onClick={() => removeActivity(activity.id)}
                  >
                    <Trash2 size={iconSize.xs} aria-hidden />
                  </IconButton>
                )}
              </div>
            ))}
          </Card>
        )}
      </Section>
    </PageContainer>
  );
}
