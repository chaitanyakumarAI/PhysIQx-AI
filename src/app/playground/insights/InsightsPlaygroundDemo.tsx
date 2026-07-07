"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { AIInsightCard } from "@/features/shared/components/AIInsightCard";
import { BodyBalanceCard } from "@/features/insights/components/BodyBalanceCard";
import { PersonalRecordCard } from "@/features/insights/components/PersonalRecordCard";
import { ScoreTrendCard } from "@/features/insights/components/ScoreTrendCard";
import { StreakHeatmapCard } from "@/features/insights/components/StreakHeatmapCard";
import type { ScoreTrendRange } from "@/types/score";
import type { InsightsData } from "@/features/insights/types";

export function InsightsPlaygroundDemo({
  score,
  trends,
  insights,
  personalRecords,
  streakWeeks,
}: InsightsData) {
  const [range, setRange] = useState<ScoreTrendRange>("30d");

  return (
    <PageContainer withBottomNav={false}>
      <Section title="Insights feature — component preview">
        <ScoreTrendCard
          score={score.score}
          delta={score.delta}
          headline={score.headline}
          range={range}
          onRangeChange={setRange}
          points={trends[range]}
        />
      </Section>

      <Section title="What the data says">
        {insights.map((insight) => (
          <AIInsightCard key={insight.id} insight={insight} />
        ))}
        <AIInsightCard insight={null} />
      </Section>

      <Section title="Body balance">
        <BodyBalanceCard pillars={score.pillars} weakestPillarId={score.weakestPillarId} />
      </Section>

      <Section title="Personal records">
        {personalRecords.map((record) => (
          <PersonalRecordCard key={record.id} record={record} />
        ))}
      </Section>

      <Section title="Streak heatmap">
        <StreakHeatmapCard weeks={streakWeeks} />
      </Section>
    </PageContainer>
  );
}
