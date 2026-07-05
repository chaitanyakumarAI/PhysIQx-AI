"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { fadeInUp, staggerChildren } from "@/lib/motion";
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
  bodyBalance,
  personalRecords,
  streakWeeks,
}: InsightsScreenProps) {
  const [range, setRange] = useState<ScoreTrendRange>("30d");

  return (
    <PageContainer>
      {/* display:contents keeps PageContainer's flex/gap acting directly on
          these items — this node exists only to orchestrate the stagger. */}
      <m.div
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
        className="contents"
      >
        <m.div variants={fadeInUp}>
          <ScreenHeader title="Insights" subtitle="Signal, not noise." />
        </m.div>

        <m.div variants={fadeInUp}>
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
            <BodyBalanceCard bodyBalance={bodyBalance} />
          </Section>
        </m.div>

        <m.div variants={fadeInUp}>
          <Section title="Personal records">
            {personalRecords.map((record) => (
              <PersonalRecordCard key={record.id} record={record} />
            ))}
          </Section>
        </m.div>

        <m.div variants={fadeInUp}>
          <Section title="12 week streak">
            <StreakHeatmapCard weeks={streakWeeks} />
          </Section>
        </m.div>
      </m.div>
    </PageContainer>
  );
}
