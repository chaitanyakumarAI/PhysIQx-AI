"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { mockExercises } from "@/data/exercises";
import { CoachCard, CoachList } from "@/features/coach/components/CoachCard";
import { DailyMissionCard } from "@/features/home/components/DailyMissionCard";
import { PhysIQScoreCard } from "@/features/home/components/PhysIQScoreCard";
import { WeeklyActivityCard } from "@/features/home/components/WeeklyActivityCard";
import { WelcomeHeader } from "@/features/home/components/WelcomeHeader";
import { getGreeting } from "@/features/home/lib/greeting";
import { generateArchetype } from "@/features/onboarding/lib/generateArchetype";
import { DemoBanner } from "@/features/shared/components/DemoBanner";
import { useActiveSessionInfo, useAthleteState } from "@/features/shared/hooks/useAthlete";
import { fadeInUp, staggerChildren } from "@/lib/motion";
import { useEntranceOnce } from "@/lib/useEntranceOnce";
import { missionFromPlanDay } from "@/lib/workoutPlan";
import { useProfileStore } from "@/store/profileStore";

/**
 * Home answers ONE question in the first five seconds: "what should I do
 * next?" Today's workout (from the active plan) leads, the coach explains
 * the day in one card, then score and week. Everything is derived from
 * the local ledger — there is no fixture fallback, only honest first-run
 * and loading states.
 */
export function HomeScreen() {
  const router = useRouter();
  const athlete = useAthleteState();
  const activeSession = useActiveSessionInfo();
  const onboarded = useProfileStore((state) => Boolean(state.onboardingProfile?.completedAt));
  const split = useProfileStore((state) => state.onboardingProfile?.activeSplit);
  // Client-side on purpose: the route is statically prerendered, so a
  // server-computed greeting would freeze at build time.
  const [greeting] = useState(() => getGreeting(new Date().getHours()));
  const entrance = useEntranceOnce("home");

  const { todaysWorkout, coach, ledger, demo } = athlete;
  const mission = useMemo(() => {
    if (!todaysWorkout) return null;
    const inProgress = !demo && activeSession?.missionId === todaysWorkout.missionId;
    return missionFromPlanDay(
      todaysWorkout.plan,
      todaysWorkout.day,
      mockExercises,
      todaysWorkout.status === "done" ? "completed" : inProgress ? "started" : "pending",
    );
  }, [todaysWorkout, activeSession, demo]);

  if (!athlete.hydrated) return <HomeSkeleton />;
  if (!onboarded && !demo && ledger.sessions.length === 0) return <FirstRun />;

  // The mission card already offers "start"; the coach card shouldn't repeat it.
  const missionHref = mission ? `/session/${mission.id}` : null;
  const [lead, ...rest] = coach;
  const leadDuplicatesMission = lead?.action?.href === missionHref;
  const archetype =
    ledger.profile.goal && split ? generateArchetype(ledger.profile.goal, split) : "";

  return (
    <PageContainer>
      <m.div variants={staggerChildren} initial={entrance} animate="visible" className="contents">
        {demo && (
          <m.div variants={fadeInUp}>
            <DemoBanner />
          </m.div>
        )}

        <m.div variants={fadeInUp}>
          <WelcomeHeader
            greeting={greeting}
            name={ledger.profile.displayName ?? "Athlete"}
            streakDays={athlete.streak.currentStreakDays}
            archetype={archetype}
            className="pt-0"
          />
        </m.div>

        <m.div variants={fadeInUp} data-tour="mission">
          <Section title="Today's workout">
            {mission ? (
              <DailyMissionCard
                mission={mission}
                upNext={todaysWorkout?.nextDay.name}
                onStart={() => router.push(`/session/${mission.id}`)}
              />
            ) : (
              <Card padding="lg" className="flex flex-col gap-3">
                <h3 className="font-display text-xl font-bold">No active plan</h3>
                <p className="text-sm text-foreground-secondary">
                  Pick a program or build your own split, and your workouts will line up here.
                </p>
                <Button asChild size="sm" className="self-start">
                  <Link href="/train">Choose a plan</Link>
                </Button>
              </Card>
            )}
          </Section>
        </m.div>

        {lead && (
          <m.div variants={fadeInUp}>
            <CoachCard
              recommendation={
                leadDuplicatesMission ? { ...lead, action: undefined } : lead
              }
            />
          </m.div>
        )}

        {rest.length > 0 && (
          <m.div variants={fadeInUp}>
            <Section title="Also today">
              <CoachList recommendations={rest.slice(0, 2)} />
            </Section>
          </m.div>
        )}

        <m.div variants={fadeInUp} data-tour="score">
          <PhysIQScoreCard
            score={athlete.score.score}
            delta={athlete.score.delta}
            headline={athlete.score.headline}
            state={athlete.score.state}
            weekTrend={athlete.score.weekTrend}
            breakdownHref="/insights"
          />
        </m.div>

        <m.div variants={fadeInUp} data-tour="week">
          <WeeklyActivityCard
            completionPercent={athlete.week.completionPercent}
            days={athlete.week.days}
          />
        </m.div>
      </m.div>
    </PageContainer>
  );
}

function HomeSkeleton() {
  return (
    <PageContainer aria-busy="true">
      <Skeleton className="h-16 w-2/3" />
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-56 w-full" />
    </PageContainer>
  );
}

/** Before onboarding: set up, or look around with sample data first. */
function FirstRun() {
  const setDemoMode = useProfileStore((state) => state.setDemoMode);
  return (
    <PageContainer>
      <div className="flex flex-1 flex-col justify-center gap-6 py-10">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">PhysIQx</p>
          <h1 className="font-display text-3xl font-bold leading-tight">
            Every rep feeds your PhysIQ Score.
          </h1>
          <p className="text-foreground-secondary">
            Two minutes of setup and your first workout is ready.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild size="lg" fullWidth>
            <Link href="/onboarding">Set up my training</Link>
          </Button>
          <Button variant="secondary" size="lg" fullWidth onClick={() => setDemoMode(true)}>
            <Sparkles size={18} aria-hidden />
            Explore with sample data
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
