"use client";

import { Suspense, useState } from "react";
import { m } from "framer-motion";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { fadeInUp, staggerChildren } from "@/lib/motion";
import { useEntranceOnce } from "@/lib/useEntranceOnce";
import { getGreeting } from "@/features/home/lib/greeting";
import { deriveRecoveryStatus } from "@/features/home/lib/derive";
import { AchievementSpotlight } from "@/features/home/components/AchievementSpotlight";
import { DailyMissionCard } from "@/features/home/components/DailyMissionCard";
import { GuidedTour } from "@/features/home/components/GuidedTour";
import { PhysIQScoreCard } from "@/features/home/components/PhysIQScoreCard";
import { StatusStrip } from "@/features/home/components/StatusStrip";
import { TodaysPriorities } from "@/features/home/components/TodaysPriorities";
import { WeeklyActivityCard } from "@/features/home/components/WeeklyActivityCard";
import { WelcomeHeader } from "@/features/home/components/WelcomeHeader";
import type { HomeData } from "@/features/home/types";

// Only the plain-data slices this screen renders — not the full HomeData —
// so nothing non-serializable (e.g. quickActions' icon components) has to
// cross the server/client boundary in a prop this screen doesn't even use.
export type HomeScreenProps = Pick<
  HomeData,
  "profile" | "streak" | "score" | "mission" | "week" | "priorities" | "spotlight"
>;

/**
 * Home answers ONE question in the first five seconds: "what should I do
 * next?" The morning flow is Mission → Priorities → Score → win → week —
 * a coach's opening, not a dashboard. Everything that used to compete for
 * attention here (pillar grid, fuel cards, AI insight card, XP bar) lives
 * one tap away on Insights/Profile instead — progressive disclosure, per
 * the first-principles Home rethink.
 */
export function HomeScreen({
  profile,
  streak,
  score,
  mission,
  week,
  priorities,
  spotlight,
}: HomeScreenProps) {
  const router = useRouter();
  // Client-side on purpose: the route is statically prerendered, so a
  // server-computed greeting would freeze at build time in the server's
  // timezone. useState pins it for the session; WelcomeHeader suppresses the
  // expected SSG-vs-client hydration text difference.
  const [greeting] = useState(() => getGreeting(new Date().getHours()));
  const recovery = deriveRecoveryStatus(week.days);

  return (
    <PageContainer>
      {/* display:contents keeps PageContainer's flex/gap acting directly on
          these items — this node exists only to orchestrate the stagger. */}
      <m.div
        variants={staggerChildren}
        initial={useEntranceOnce("home")}
        animate="visible"
        className="contents"
      >
        <m.div variants={fadeInUp} className="flex flex-col gap-4">
          <StatusStrip recovery={recovery} />
          <WelcomeHeader
            greeting={greeting}
            name={profile.displayName}
            streakDays={streak.currentStreakDays}
            archetype={profile.dnaArchetype}
            className="pt-0"
          />
        </m.div>

        <m.div variants={fadeInUp} data-tour="mission">
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
          <Section title="Today's priorities">
            <TodaysPriorities priorities={priorities} />
          </Section>
        </m.div>

        <m.div variants={fadeInUp} data-tour="score">
          <PhysIQScoreCard
            score={score.score}
            delta={score.delta}
            headline={score.headline}
            state={score.state}
            weekTrend={score.weekTrend}
            breakdownHref="/insights"
          />
        </m.div>

        <m.div variants={fadeInUp}>
          <AchievementSpotlight win={spotlight} />
        </m.div>

        <m.div variants={fadeInUp} data-tour="week">
          <WeeklyActivityCard
            completionPercent={week.completionPercent}
            days={week.days}
          />
        </m.div>
      </m.div>

      {/* Suspense: useSearchParams inside must not block static prerender. */}
      <Suspense fallback={null}>
        <GuidedTour />
      </Suspense>
    </PageContainer>
  );
}
