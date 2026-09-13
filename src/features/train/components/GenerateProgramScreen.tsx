"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  Dumbbell,
  Layers,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { exercises } from "@/data/exercises";
import {
  generateAdaptiveProgram,
  type GeneratedAdaptiveProgram,
} from "@/lib/aiProgramEngine";
import { describeSets } from "@/types/workoutTemplate";
import type { ProfileGoal, ExperienceLevel, GoalBodyShape } from "@/types/profile";
import type { ProgramType } from "@/types/training";
import { usePlansStore } from "@/store/plansStore";
import { useSessionStore } from "@/store/sessionStore";
import { playCelebrationFanfare, playScanSuccess } from "@/lib/audioEngine";

export function GenerateProgramScreen() {
  const router = useRouter();
  const sessionHistory = useSessionStore((state) => state.history);
  const savePlan = usePlansStore((state) => state.savePlan);

  // Form selections
  const [goal, setGoal] = useState<ProfileGoal>("bulk");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("intermediate");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [preferredSplit, setPreferredSplit] = useState<ProgramType>("upper-lower");
  const [targetBodyShape, setTargetBodyShape] = useState<GoalBodyShape>("athletic");

  const [activeDayTab, setActiveDayTab] = useState(0);
  const [adopted, setAdopted] = useState(false);

  // Generated program
  const generated: GeneratedAdaptiveProgram = useMemo(() => {
    return generateAdaptiveProgram({
      goal,
      experienceLevel,
      daysPerWeek,
      targetBodyShape,
      preferredSplit,
      sessionHistory,
    });
  }, [goal, experienceLevel, daysPerWeek, targetBodyShape, preferredSplit, sessionHistory]);

  const handleAdoptPlan = () => {
    savePlan(generated.userPlan);
    playCelebrationFanfare();
    setAdopted(true);
    setTimeout(() => {
      router.push("/train");
    }, 1200);
  };

  return (
    <PageContainer className="pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4">
        <Link
          href="/train"
          aria-label="Back to Train"
          className="grid size-11 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            AI Program Architect
          </h1>
          <p className="text-xs text-foreground-secondary">
            Synthesizes split, volume sets, and progressive stimulus
          </p>
        </div>
      </div>

      {/* Configuration Matrix */}
      <Card className="flex flex-col gap-4 border-border/80 bg-surface/90">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
          <Sparkles size={iconSize.xs} />
          <span>Biometric & Goal Parameters</span>
        </div>

        {/* Primary Goal */}
        <div>
          <label className="block text-xs font-medium text-foreground-secondary mb-1.5">
            Primary Training Goal
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "bulk", label: "Hypertrophy (Bulk & Size)" },
              { id: "cut", label: "Fat Loss (Cut & Density)" },
              { id: "maintain", label: "Athletic Maintenance" },
              { id: "endurance", label: "Endurance & Conditioning" },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.id as ProfileGoal)}
                className={`rounded-xl py-2 px-3 text-xs font-semibold text-left transition-colors ${
                  goal === g.id
                    ? "bg-brand text-zinc-950 font-bold"
                    : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Frequency */}
        <div>
          <label className="block text-xs font-medium text-foreground-secondary mb-1.5">
            Weekly Frequency ({daysPerWeek} days / week)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { days: 3, label: "3 Days", split: "full-body" as ProgramType },
              { days: 4, label: "4 Days", split: "upper-lower" as ProgramType },
              { days: 5, label: "5 Days", split: "push-pull-legs" as ProgramType },
              { days: 6, label: "6 Days", split: "push-pull-legs" as ProgramType },
            ].map((d) => (
              <button
                key={d.days}
                type="button"
                onClick={() => {
                  setDaysPerWeek(d.days);
                  setPreferredSplit(d.split);
                }}
                className={`rounded-xl py-2 text-xs font-semibold text-center transition-colors ${
                  daysPerWeek === d.days
                    ? "bg-brand text-zinc-950 font-bold"
                    : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-xs font-medium text-foreground-secondary mb-1.5">
            Training Experience
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["beginner", "intermediate", "advanced"] as ExperienceLevel[]).map(
              (lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setExperienceLevel(lvl)}
                  className={`rounded-xl py-2 text-xs font-semibold capitalize transition-colors ${
                    experienceLevel === lvl
                      ? "bg-brand text-zinc-950 font-bold"
                      : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  {lvl}
                </button>
              ),
            )}
          </div>
        </div>
      </Card>

      {/* Generated Program Output Card */}
      <Card className="flex flex-col gap-4 border-brand/30 bg-surface/90">
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded-md bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
              AI Tailored Plan
            </span>
            <h2 className="mt-1 font-display text-xl font-bold">
              {generated.program.name}
            </h2>
            <p className="mt-1 text-xs text-foreground-secondary leading-relaxed">
              {generated.rationale}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="font-display text-2xl font-black text-brand">
              {generated.weeklyVolumeSets}
            </span>
            <span className="block text-[10px] text-foreground-secondary">
              Sets / week
            </span>
          </div>
        </div>

        {/* Days Navigation Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border/40">
          {generated.userPlan.days.map((day, idx) => (
            <button
              key={day.id}
              type="button"
              onClick={() => setActiveDayTab(idx)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeDayTab === idx
                  ? "bg-brand text-zinc-950"
                  : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
              }`}
            >
              Day {idx + 1}: {day.name.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Active Day Exercises Preview */}
        {generated.userPlan.days[activeDayTab] && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs text-foreground-secondary">
              <span className="font-semibold text-foreground">
                {generated.userPlan.days[activeDayTab].name}
              </span>
              <span>
                {generated.userPlan.days[activeDayTab].exercises.length} movements prescribed
              </span>
            </div>

            <div className="divide-y divide-border/40">
              {generated.userPlan.days[activeDayTab].exercises.map((ex, exIdx) => {
                const exData = exercises.find((e) => e.id === ex.exerciseId);
                const exName =
                  exData?.name ??
                  ex.exerciseId.replace(/^ex-/, "").replace(/-/g, " ");

                return (
                  <div
                    key={`${ex.exerciseId}-${exIdx}`}
                    className="flex items-center justify-between py-2 first:pt-0 last:pb-0 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="grid size-6 place-items-center rounded-md bg-surface-elevated text-[11px] font-bold text-foreground-secondary shrink-0">
                        {exIdx + 1}
                      </span>
                      <span className="font-medium truncate capitalize">
                        {exName}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-semibold text-brand">
                        {describeSets(ex.sets)}
                      </span>
                      <span className="block text-[10px] text-foreground-secondary">
                        {ex.restSeconds}s rest
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Adopt Button */}
        <button
          type="button"
          onClick={handleAdoptPlan}
          disabled={adopted}
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-bold text-zinc-950 transition-transform active:scale-95 disabled:opacity-50"
        >
          {adopted ? (
            <>
              <Check size={iconSize.sm} />
              <span>Program Adopted & Saved!</span>
            </>
          ) : (
            <>
              <Dumbbell size={iconSize.sm} />
              <span>Adopt This Plan & Start Training</span>
            </>
          )}
        </button>
      </Card>
    </PageContainer>
  );
}
