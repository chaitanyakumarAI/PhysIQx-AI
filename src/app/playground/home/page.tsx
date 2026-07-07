import { getHomeData } from "@/features/home/api/getHomeData";
import { getGreeting } from "@/features/home/lib/greeting";
import { WelcomeHeader } from "@/features/home/components/WelcomeHeader";
import { PhysIQScoreCard } from "@/features/home/components/PhysIQScoreCard";
import { PillarGrid } from "@/features/shared/components/PillarGrid";
import { DailyMissionCard } from "@/features/home/components/DailyMissionCard";
import { WeeklyActivityCard } from "@/features/home/components/WeeklyActivityCard";
import { FuelStatCard } from "@/features/home/components/FuelStatCard";
import { AIInsightCard } from "@/features/shared/components/AIInsightCard";
import { XPProgress } from "@/features/home/components/XPProgress";
import { QuickActionGrid } from "@/features/home/components/QuickActionGrid";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Droplets, Beef } from "lucide-react";

/**
 * Dev-only verification harness for the Home feature layer — renders every
 * component wired to real mock data. This is not the Home screen: no final
 * layout, ordering, or motion decisions are made here.
 */
export default async function HomeFeaturePlaygroundPage() {
  const data = await getHomeData();
  const greeting = getGreeting(9);
  const [hydration, protein] = data.fuel;

  return (
    <PageContainer withBottomNav={false}>
      <Section title="Home feature — component preview">
        <WelcomeHeader
          greeting={greeting}
          name={data.profile.displayName}
          streakDays={data.streak.currentStreakDays}
          archetype={data.profile.dnaArchetype}
        />
        <PhysIQScoreCard
          score={data.score.score}
          delta={data.score.delta}
          headline={data.score.headline}
          state={data.score.state}
        />
        <PillarGrid
          pillars={data.score.pillars}
          weakestPillarId={data.score.weakestPillarId}
        />
        <DailyMissionCard mission={data.mission} />
        <WeeklyActivityCard
          completionPercent={data.week.completionPercent}
          days={data.week.days}
        />
        <div className="grid grid-cols-2 gap-3">
          {hydration && (
            <FuelStatCard fuel={hydration} icon={Droplets} tone="info" />
          )}
          {protein && <FuelStatCard fuel={protein} icon={Beef} tone="brand" />}
        </div>
        <AIInsightCard insight={data.insight} />
        <AIInsightCard insight={null} />
        <XPProgress level={data.level} />
        <QuickActionGrid actions={data.quickActions} />
        <DailyMissionCard mission={null} />
      </Section>
    </PageContainer>
  );
}
