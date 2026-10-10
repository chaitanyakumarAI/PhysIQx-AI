"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, ChevronRight, Watch, CheckCircle2, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { iconSize } from "@/constants/icons";
import {
  cardioActivityLabels,
  useCardioStore,
  type WearableSource,
} from "@/store/cardioStore";
import { CoachInfoButton } from "@/features/coach/components/CoachInfoButton";

/** WHO guideline: 150 min of moderate cardio per week. */
const WEEKLY_TARGET_MINUTES = 150;

const sourceLabels: Record<WearableSource, string> = {
  apple_health: "Apple Watch",
  garmin: "Garmin",
  health_connect: "Health Connect",
  whoop: "WHOOP",
  oura: "Oura Ring",
  manual: "Device Sync",
};

function formatSessionDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Cardio Sync — dedicated exclusively to wearable synced activities.
 * Manual logging forms removed per October 2026 product directive.
 */
export function CardioContent() {
  const router = useRouter();
  const sessions = useCardioStore((state) => state.sessions);
  const removeSession = useCardioStore((state) => state.removeSession);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAgoIso = weekAgo.toISOString().slice(0, 10);
  const weekSessions = sessions.filter((session) => session.date >= weekAgoIso);
  const weekMinutes = weekSessions.reduce((sum, session) => sum + session.minutes, 0);

  const recent = [...sessions].reverse().slice(0, 10);

  return (
    <PageContainer>
      <div className="flex items-center gap-3 pt-6">
        <IconButton label="Back to Train" variant="ghost" onClick={() => router.push("/train")}>
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </IconButton>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold">Cardio Sync</h1>
            <CoachInfoButton
              featureKey="INFO_CARDIO_SYNC"
              label="Explain cardio auto-sync"
            />
          </div>
          <p className="text-xs text-foreground-secondary">
            Wearable activity imports &amp; aerobic capacity
          </p>
        </div>
      </div>

      {/* Weekly Progress Meter */}
      <Card padding="md" className="flex flex-col gap-2 border border-border/70">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">Weekly Aerobic Target</span>
          <span className="text-sm text-foreground-secondary tabular-nums">
            {weekMinutes} / {WEEKLY_TARGET_MINUTES} min · {weekSessions.length}{" "}
            {weekSessions.length === 1 ? "activity" : "activities"}
          </span>
        </div>
        <ProgressBar
          value={Math.min(100, (weekMinutes / WEEKLY_TARGET_MINUTES) * 100)}
          tone="brand"
          aria-label={`${weekMinutes} of ${WEEKLY_TARGET_MINUTES} weekly cardio minutes`}
        />
        <p className="text-[11px] text-foreground-secondary mt-1">
          Synced minutes feed your Cardio pillar (20% of your PhysIQ Score).
        </p>
      </Card>

      {/* Connected Wearable Device Sync Card */}
      <Card variant="accent" padding="md" className="flex flex-col gap-3 border border-brand/30 bg-surface/80">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
            <Watch size={18} aria-hidden />
          </span>
          <div className="flex flex-col gap-0.5 min-w-0">
            <h3 className="text-xs font-bold text-foreground">
              Automatic Wearable Sync
            </h3>
            <p className="text-[11px] text-foreground-secondary leading-relaxed">
              Cardio activities are automatically imported from Apple Health, Garmin Connect, and Google Health Connect. Outdoor runs, rides, walks, and HIIT sessions appear here in real time.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-brand">
            <CheckCircle2 size={13} />
            <span>Sync active in background</span>
          </div>
          <Link
            href="/profile/integrations"
            className="flex items-center gap-1 font-bold text-brand hover:underline"
          >
            <span>Manage integrations</span>
            <ChevronRight size={13} aria-hidden />
          </Link>
        </div>
      </Card>

      {/* Synced Activities Feed */}
      <Section title="Synced activities">
        {recent.length === 0 ? (
          <Card padding="md" className="flex flex-col items-center justify-center py-8 text-center border-dashed">
            <Activity size={32} className="text-foreground-secondary mb-2" />
            <h4 className="text-sm font-semibold text-foreground">No synced activities yet</h4>
            <p className="text-xs text-foreground-secondary max-w-[260px] mt-1">
              Workouts recorded on your smartwatch or connected fitness apps will stream here automatically.
            </p>
            <Link
              href="/profile/integrations"
              className="mt-4 inline-flex items-center gap-1 rounded-full bg-brand/10 px-3.5 py-1.5 text-xs font-bold text-brand hover:bg-brand/20 transition-colors"
            >
              <span>Connect your wearable</span>
              <ChevronRight size={13} />
            </Link>
          </Card>
        ) : (
          <Card padding="md">
            <ul aria-label="Recent synced cardio sessions" className="divide-y divide-border/60">
              {recent.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {cardioActivityLabels[session.activity]}
                      </span>
                      <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] font-medium text-foreground-secondary border border-border/40">
                        {sourceLabels[session.source || "apple_health"]}
                      </span>
                    </div>
                    <span className="text-[11px] text-foreground-secondary">
                      {formatSessionDate(session.date)}
                      {session.distanceKm ? ` · ${session.distanceKm} km` : ""}
                      {session.avgHeartRate ? ` · ${session.avgHeartRate} bpm` : ""}
                    </span>
                  </div>

                  <span className="font-display text-sm font-bold tabular-nums text-foreground">
                    {session.minutes} min
                  </span>

                  <IconButton
                    label={`Remove ${cardioActivityLabels[session.activity]} session`}
                    variant="ghost"
                    onClick={() => removeSession(session.id)}
                  >
                    <X size={iconSize.xs} aria-hidden />
                  </IconButton>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Section>
    </PageContainer>
  );
}
