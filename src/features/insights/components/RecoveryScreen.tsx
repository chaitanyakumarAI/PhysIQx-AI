"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { DemoBanner } from "@/features/shared/components/DemoBanner";
import { useAthleteState } from "@/features/shared/hooks/useAthlete";
import { addDaysIso, weekMondayIso } from "@/lib/dates";
import { BASELINE_DAYS } from "@/lib/trainingLoad";
import { TrainingLoadCard } from "./TrainingLoadCard";

const WEEKS_SHOWN = 8;

/**
 * Training Load (formerly "Recovery & readiness"): only what the log can
 * honestly support — lifting volume against your own 4-week average,
 * hard sessions, and days without rest. Readiness, HRV and sleep need a
 * wearable feed; until one exists, this screen doesn't pretend.
 */
export function RecoveryScreen() {
  const { load, ledger, todayIso, demo } = useAthleteState();
  const thisMonday = weekMondayIso(todayIso);
  const weeks = Array.from({ length: WEEKS_SHOWN }, (_, index) => {
    const start = addDaysIso(thisMonday, -(WEEKS_SHOWN - 1 - index) * 7);
    const end = addDaysIso(start, 6);
    const volume = ledger.sessions
      .filter((session) => session.date >= start && session.date <= end)
      .reduce((sum, session) => sum + Math.max(0, session.totalVolumeKg), 0);
    return { start, volume };
  });
  const peak = Math.max(1, ...weeks.map((week) => week.volume));

  return (
    <PageContainer>
      <div className="flex items-center gap-3 pt-6">
        <Link
          href="/insights"
          aria-label="Back to Insights"
          className="grid size-11 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Training load</h1>
          <p className="text-xs text-foreground-secondary">This week against your own baseline</p>
        </div>
      </div>

      {demo && <DemoBanner />}

      <TrainingLoadCard load={load} />

      <Section title="Weekly volume">
        <Card padding="md">
          <div className="flex h-36 items-end gap-2" role="img" aria-label="Lifting volume per week, last 8 weeks">
            {weeks.map((week, index) => (
              <div key={week.start} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={index === weeks.length - 1 ? "w-full rounded-md bg-brand" : "w-full rounded-md bg-white/[0.14]"}
                  style={{ height: `${Math.max(4, (week.volume / peak) * 100)}%` }}
                />
                <span className="text-[10px] tabular-nums text-foreground-muted">
                  {new Date(`${week.start}T00:00:00`).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="How it's measured">
        <Card padding="md">
          <ul className="flex list-disc flex-col gap-2 pl-4 text-sm text-foreground-secondary">
            <li>Volume is weight × reps across every completed set.</li>
            <li>
              The ratio compares the last 7 days with your average week over the 4 weeks before. It
              appears after {BASELINE_DAYS} days of training.
            </li>
            <li>Sessions averaging RPE 9 or higher count as hard and raise the status one step.</li>
            <li>Sleep, HRV and resting heart rate will join once a wearable can feed them in.</li>
          </ul>
        </Card>
      </Section>
    </PageContainer>
  );
}
