"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Play } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { iconSize } from "@/constants/icons";
import { mockExercises } from "@/data/exercises";
import { buildPlanDayLaunch, estimateDayMinutes } from "@/lib/workoutPlan";
import { selectActivePlan, usePlansStore } from "@/store/plansStore";
import { useSessionStore } from "@/store/sessionStore";

export interface SwapWorkoutSheetProps {
  /** The plan day the rotation picked for today — badged in the list. */
  currentMissionId: string;
}

/**
 * Not feeling today's pick? Start any day of the active plan instead.
 * Launching mirrors Train's My Plans (seed the session store, navigate),
 * and the rotation re-anchors to whatever day gets completed
 * (resolveTodaysWorkout follows the last trained day), so choosing freely
 * still advances the plan. Hidden when there is nothing to choose between.
 */
export function SwapWorkoutSheet({ currentMissionId }: SwapWorkoutSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const plan = usePlansStore(selectActivePlan);
  const startSession = useSessionStore((state) => state.startSession);

  if (!plan || plan.days.length < 2) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-foreground-secondary transition-colors hover:text-brand focus-visible:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
      >
        <ArrowLeftRight size={iconSize.xs} aria-hidden />
        Train a different day
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Choose your workout">
        <ul aria-label={`${plan.name} days`} className="flex flex-col divide-y divide-border/60">
          {plan.days.map((day) => {
            const launch = buildPlanDayLaunch(plan, day);
            const isTodaysPick = launch.missionId === currentMissionId;
            return (
              <li key={day.id}>
                <button
                  type="button"
                  onClick={() => {
                    startSession({ ...launch, exercises: mockExercises });
                    setOpen(false);
                    router.push(`/session/${launch.missionId}`);
                  }}
                  className="flex min-h-14 w-full items-center gap-3 py-3 text-left transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{day.name}</span>
                      {isTodaysPick && <Badge tone="brand">Today&apos;s pick</Badge>}
                    </span>
                    <span className="block text-xs text-foreground-secondary">
                      {day.exercises.length} exercises · ~{estimateDayMinutes(day)} min · +
                      {launch.xpReward} XP
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-brand/30 text-brand"
                  >
                    <Play size={iconSize.xs} fill="currentColor" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </>
  );
}
