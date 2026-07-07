"use client";

import { useState } from "react";
import { Beef, Droplets } from "lucide-react";
import { m } from "framer-motion";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { fadeInUp, staggerChildren } from "@/lib/motion";
import { getGreeting } from "@/features/home/lib/greeting";
import { AIInsightCard } from "@/features/shared/components/AIInsightCard";
import { DailyMissionCard } from "@/features/home/components/DailyMissionCard";
import { FuelStatCard } from "@/features/home/components/FuelStatCard";
import { PillarGrid } from "@/features/shared/components/PillarGrid";
import { PhysIQScoreCard } from "@/features/home/components/PhysIQScoreCard";
import { TodaysPriorities } from "@/features/home/components/TodaysPriorities";
import { WeeklyActivityCard } from "@/features/home/components/WeeklyActivityCard";
import { WelcomeHeader } from "@/features/home/components/WelcomeHeader";
import { XPProgress } from "@/features/home/components/XPProgress";
import type { HomeData } from "@/features/home/types";

// Only the plain-data slices this screen renders — not the full HomeData —
// so nothing non-serializable (e.g. quickActions' icon components) has to
// cross the server/client boundary in a prop this screen doesn't even use.
export type HomeScreenProps = Pick<
  HomeData,
  | "profile"
  | "streak"
  | "score"
  | "mission"
  | "week"
  | "fuel"
  | "insight"
  | "level"
  | "priorities"
>;

/**
 * Pure composition: every visual, state, and business decision (calibrating
 * score, rest-day mission, no-insight fallback) already lives in the Home
 * feature components. This file only arranges them and orchestrates entrance
 * motion with the shared fadeInUp/staggerChildren variants.
 */
export function HomeScreen({
  profile,
  streak,
  score,
  mission,
  week,
  fuel,
  insight,
  level,
  priorities,
}: HomeScreenProps) {
  const router = useRouter();
  // Client-side on purpose: the route is statically prerendered, so a
  // server-computed greeting would freeze at build time in the server's
  // timezone. useState pins it for the session; WelcomeHeader suppresses the
  // expected SSG-vs-client hydration text difference.
  const [greeting] = useState(() => getGreeting(new Date().getHours()));
  const [hydration, protein] = fuel;
  const insightActionHref = insight?.actionHref;

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
          <WelcomeHeader
            greeting={greeting}
            name={profile.displayName}
            streakDays={streak.currentStreakDays}
            archetype={profile.dnaArchetype}
            avatarUrl={profile.avatarUrl}
          />
        </m.div>

        <m.div variants={fadeInUp} className="flex flex-col gap-4">
          <PhysIQScoreCard
            score={score.score}
            delta={score.delta}
            headline={score.headline}
            state={score.state}
            weekTrend={score.weekTrend}
            breakdownHref="/insights"
          />
          <PillarGrid
            pillars={score.pillars}
            weakestPillarId={score.weakestPillarId}
          />
        </m.div>

        <m.div variants={fadeInUp}>
          <Section title="Today's priorities">
            <TodaysPriorities priorities={priorities} />
          </Section>
        </m.div>

        <m.div variants={fadeInUp}>
          <Section title="Today's mission">
            <DailyMissionCard
              mission={mission}
              onStart={
                mission ? () => router.push(`/session/${mission.id}`) : undefined
              }
            />
          </Section>
        </m.div>

        <m.div variants={fadeInUp}>
          <WeeklyActivityCard
            completionPercent={week.completionPercent}
            days={week.days}
          />
        </m.div>

        <m.div variants={fadeInUp}>
          <Section title="Fuel">
            <div className="grid grid-cols-2 gap-3">
              {hydration && (
                <FuelStatCard fuel={hydration} icon={Droplets} tone="info" />
              )}
              {protein && (
                <FuelStatCard fuel={protein} icon={Beef} tone="brand" />
              )}
            </div>
          </Section>
        </m.div>

        <m.div variants={fadeInUp}>
          <AIInsightCard
            insight={insight}
            onAction={
              insightActionHref ? () => router.push(insightActionHref) : undefined
            }
          />
        </m.div>

        <m.div variants={fadeInUp}>
          <XPProgress level={level} />
        </m.div>
      </m.div>
    </PageContainer>
  );
}
