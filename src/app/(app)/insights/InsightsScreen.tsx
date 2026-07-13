"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { FilterChipRow } from "@/components/ui/FilterChipRow";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { fadeInUp, staggerChildren } from "@/lib/motion";
import { useEntranceOnce } from "@/lib/useEntranceOnce";
import { AIInsightCard } from "@/features/shared/components/AIInsightCard";
import { BodyBalanceCard } from "@/features/insights/components/BodyBalanceCard";
import { PersonalRecordCard } from "@/features/insights/components/PersonalRecordCard";
import { ScoreTrendCard } from "@/features/insights/components/ScoreTrendCard";
import { StreakHeatmapCard } from "@/features/insights/components/StreakHeatmapCard";
import type { InsightsData } from "@/features/insights/types";
import type { ScoreTrendRange } from "@/types/score";

export type InsightsScreenProps = InsightsData;

/**
 * Pure composition + range-selector state: every visual/state decision
 * (no-insight fallback, weakest-axis caption, trend shape) already lives in
 * the Insights feature components. This file only arranges them, holds the
 * selected trend range, and orchestrates entrance motion.
 */
export function InsightsScreen({
  score,
  trends,
  insights,
  personalRecords,
  streakWeeks,
}: InsightsScreenProps) {
  const [range, setRange] = useState<ScoreTrendRange>("30d");
  // PR switcher: one exercise's chart at a time, chip row to change lift.
  const [selectedPRId, setSelectedPRId] = useState(personalRecords[0]?.id ?? "");
  const selectedRecord =
    personalRecords.find((record) => record.id === selectedPRId) ??
    personalRecords[0];

  return (
    <PageContainer>
      {/* display:contents keeps PageContainer's flex/gap acting directly on
          these items — this node exists only to orchestrate the stagger. */}
      <m.div
        variants={staggerChildren}
        initial={useEntranceOnce("insights")}
        animate="visible"
        className="contents"
      >
        <m.div variants={fadeInUp}>
          <ScreenHeader title="Insights" subtitle="Signal, not noise." />
        </m.div>

        <m.div variants={fadeInUp} data-tour="insights-trend">
          <ScoreTrendCard
            score={score.score}
            delta={score.delta}
            headline={score.headline}
            range={range}
            onRangeChange={setRange}
            points={trends[range]}
          />
        </m.div>

        <m.div variants={fadeInUp}>
          <Section title="What the data says">
            {insights.map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} />
            ))}
          </Section>
        </m.div>

        <m.div variants={fadeInUp}>
          <Section title="Body balance">
            <BodyBalanceCard pillars={score.pillars} weakestPillarId={score.weakestPillarId} />
          </Section>
        </m.div>

        <m.div variants={fadeInUp}>
          <Section title="Personal records">
            <FilterChipRow
              options={personalRecords.map((record) => ({
                id: record.id,
                label: record.exerciseName,
              }))}
              selectedId={selectedPRId}
              onSelect={setSelectedPRId}
              variant="accent"
              label="Personal record exercise"
            />
            {selectedRecord && (
              /* Re-keyed so switching lifts cross-fades the chart, matching
                 the range selector's existing behavior above. */
              <m.div
                key={selectedRecord.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <PersonalRecordCard record={selectedRecord} />
              </m.div>
            )}
          </Section>
        </m.div>

        <m.div variants={fadeInUp} data-tour="insights-heatmap">
          <Section title="12 week streak">
            <StreakHeatmapCard weeks={streakWeeks} />
          </Section>
        </m.div>
      </m.div>
    </PageContainer>
  );
}
