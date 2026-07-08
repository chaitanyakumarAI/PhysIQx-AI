"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Section } from "@/components/layout/Section";
import { iconSize } from "@/constants/icons";
import { mockExercises } from "@/data/exercises";
import { buildPlanDayLaunch } from "../lib/planLaunch";
import { usePlansStore } from "@/store/plansStore";
import { useSessionStore } from "@/store/sessionStore";

/**
 * The user's own plans on Train: each day is directly startable. Starting
 * happens client-side (plans live in localStorage, so no server setup
 * exists): build the launch, seed the session store, then navigate — the
 * session route's "plan-*" branch resumes what we created here.
 */
export function MyPlansSection() {
  const router = useRouter();
  const plans = usePlansStore((state) => state.plans);
  const startSession = useSessionStore((state) => state.startSession);

  return (
    <Section
      title="My plans"
      action={
        <Link
          href="/train/plans/new"
          className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-brand transition-colors hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <Plus size={iconSize.xs} aria-hidden />
          New plan
        </Link>
      }
    >
      {plans.length === 0 ? (
        <Card padding="md">
          <p className="text-sm text-foreground-secondary">
            Build your own split — days, exercises, and any sets × reps you
            want. Presets are a starting point; your plan is yours.
          </p>
          <Button asChild variant="secondary" size="sm" className="mt-3">
            <Link href="/train/plans/new">Create your first plan</Link>
          </Button>
        </Card>
      ) : (
        plans.map((plan) => (
          <Card key={plan.id} padding="md" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">{plan.name}</h3>
              <IconButton
                label={`Edit ${plan.name}`}
                variant="ghost"
                onClick={() => router.push(`/train/plans/${plan.id}`)}
              >
                <Pencil size={iconSize.sm} aria-hidden />
              </IconButton>
            </div>
            <ul className="flex flex-col divide-y divide-border/60">
              {plan.days.map((day) => {
                const launch = buildPlanDayLaunch(plan, day);
                return (
                  <li key={day.id} className="flex items-center gap-3 py-2">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{day.name}</span>
                      <span className="block text-xs text-foreground-secondary">
                        {day.exercises.length} exercises · +{launch.xpReward} XP
                      </span>
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        startSession({
                          missionId: launch.missionId,
                          title: launch.title,
                          template: launch.template,
                          exercises: mockExercises,
                          xpReward: launch.xpReward,
                        });
                        router.push(`/session/${launch.missionId}`);
                      }}
                    >
                      <Play size={iconSize.xs} aria-hidden />
                      Start
                    </Button>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))
      )}
    </Section>
  );
}
