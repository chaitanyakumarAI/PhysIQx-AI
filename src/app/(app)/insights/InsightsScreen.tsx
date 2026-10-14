"use client";

import { useMemo, useState } from "react";
import { m } from "framer-motion";
import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { FilterChipRow } from "@/components/ui/FilterChipRow";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { BodyBalanceCard } from "@/features/insights/components/BodyBalanceCard";
import { PersonalRecordCard } from "@/features/insights/components/PersonalRecordCard";
import { ScoreTrendCard } from "@/features/insights/components/ScoreTrendCard";
import { StreakHeatmapCard } from "@/features/insights/components/StreakHeatmapCard";
import { StrengthStandardsCard } from "@/features/insights/components/StrengthStandardsCard";
import { TrainingLoadCard } from "@/features/insights/components/TrainingLoadCard";
import { AIInsightCard } from "@/features/shared/components/AIInsightCard";
import { DemoBanner } from "@/features/shared/components/DemoBanner";
import { useAthleteState, useScoreTrend } from "@/features/shared/hooks/useAthlete";
import type { CoachRecommendation } from "@/lib/coachEngine";
import { fadeInUp, staggerChildren } from "@/lib/motion";
import { derivePersonalRecords } from "@/lib/prEngine";
import { CALIBRATION_DAYS } from "@/lib/scoreEngine";
import { generateHeatmapWeeks } from "@/lib/streakEngine";
import { useEntranceOnce } from "@/lib/useEntranceOnce";
import type { Insight } from "@/types/insight";
import type { ScoreTrendRange } from "@/types/score";

const RANGE_DAYS: Record<ScoreTrendRange, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };

/** Coach items that are about the data (not "start your workout" prompts). */
const DATA_INSIGHT_EXCLUDES = new Set(["resume-session", "first-workout", "calibration"]);

function toInsight(recommendation: CoachRecommendation): Insight {
  return {
    id: recommendation.id,
    category: "training",
    severity:
      recommendation.tone === "celebrate"
        ? "celebrate"
        : recommendation.tone === "caution"
          ? "warn"
          : "suggest",
    headline: recommendation.title,
    body: recommendation.body,
    state: "fresh",
    actionLabel: recommendation.action?.label,
    actionHref: recommendation.action?.href,
  };
}

/** Insights answers "what does the data say?" — all of it from the ledger. */
export function InsightsScreen() {
  const athlete = useAthleteState();
  const [range, setRange] = useState<ScoreTrendRange>("30d");
  const trend = useScoreTrend(RANGE_DAYS[range]);
  const entrance = useEntranceOnce("insights");
  const { ledger, score, todayIso } = athlete;

  const records = useMemo(
    () => derivePersonalRecords(ledger.sessions, todayIso),
    [ledger.sessions, todayIso],
  );
  const heatmap = useMemo(
    () =>
      generateHeatmapWeeks({
        sessions: ledger.sessions,
        cardio: ledger.cardio,
        trainingDaysPerWeek: ledger.profile.trainingDaysPerWeek,
        todayIso,
      }),
    [ledger, todayIso],
  );
  const insights = athlete.coach
    .filter((recommendation) => !DATA_INSIGHT_EXCLUDES.has(recommendation.id))
    .slice(0, 3)
    .map(toInsight);
  const [selectedPRId, setSelectedPRId] = useState<string | null>(null);
  const selectedRecord = records.find((record) => record.id === selectedPRId) ?? records[0];

  if (!athlete.hydrated) {
    return (
      <PageContainer aria-busy="true">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </PageContainer>
    );
  }

  const scoredPillars = score.pillars.filter((pillar) => pillar.status !== "untracked");

  return (
    <PageContainer>
      <m.div variants={staggerChildren} initial={entrance} animate="visible" className="contents">
        {athlete.demo && (
          <m.div variants={fadeInUp}>
            <DemoBanner />
          </m.div>
        )}

        <m.div variants={fadeInUp}>
          <ScreenHeader title="Insights" subtitle="Signal, not noise." />
        </m.div>

        <m.div variants={fadeInUp} data-tour="insights-trend">
          {score.state === "calibrating" ? (
            <Card padding="lg" className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary">
                PhysIQ Score
              </p>
              <h3 className="font-display text-2xl font-bold">Calibrating</h3>
              <ProgressBar
                value={score.calibrationDay ?? 0}
                max={CALIBRATION_DAYS}
                aria-label={`Day ${score.calibrationDay ?? 0} of ${CALIBRATION_DAYS}`}
              />
              <p className="text-sm text-foreground-secondary">{score.headline}</p>
            </Card>
          ) : (
            <ScoreTrendCard
              score={score.score}
              delta={score.delta}
              headline={score.headline}
              range={range}
              onRangeChange={setRange}
              points={trend}
            />
          )}
        </m.div>

        {insights.length > 0 && (
          <m.div variants={fadeInUp}>
            <Section title="What the data says">
              {insights.map((insight) => (
                <AIInsightCard key={insight.id} insight={insight} />
              ))}
            </Section>
          </m.div>
        )}

        {scoredPillars.length > 0 && (
          <m.div variants={fadeInUp}>
            <Section title="Body balance">
              <BodyBalanceCard pillars={score.pillars} weakestPillarId={score.weakestPillarId} />
            </Section>
          </m.div>
        )}

        <m.div variants={fadeInUp}>
          <Section title="Training load">
            <TrainingLoadCard load={athlete.load} href="/insights/recovery" />
          </Section>
        </m.div>

        <m.div variants={fadeInUp}>
          <Section title="Strength standards">
            <StrengthStandardsCard ledger={ledger} />
          </Section>
        </m.div>

        <m.div variants={fadeInUp}>
          <Section title="Personal records">
            {records.length === 0 || !selectedRecord ? (
              <Card padding="none">
                <EmptyState
                  icon={Trophy}
                  title="No records yet"
                  description="Log a loaded lift and your best estimated 1RM starts here."
                />
              </Card>
            ) : (
              <>
                <FilterChipRow
                  options={records.map((record) => ({ id: record.id, label: record.exerciseName }))}
                  selectedId={selectedRecord.id}
                  onSelect={setSelectedPRId}
                  variant="accent"
                  label="Personal record exercise"
                />
                <m.div key={selectedRecord.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <PersonalRecordCard record={selectedRecord} />
                </m.div>
              </>
            )}
          </Section>
        </m.div>

        <m.div variants={fadeInUp} data-tour="insights-heatmap">
          <Section title="12-week streak">
            <StreakHeatmapCard weeks={heatmap} />
          </Section>
        </m.div>
      </m.div>
    </PageContainer>
  );
}
