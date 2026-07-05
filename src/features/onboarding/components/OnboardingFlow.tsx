"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";
import { fadeInUp } from "@/lib/motion";
import {
  defaultOnboardingValues,
  onboardingSchema,
  type OnboardingValues,
} from "../schemas";
import { DNAResultStep } from "./steps/DNAResultStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { GoalStep } from "./steps/GoalStep";
import { ProteinGoalStep } from "./steps/ProteinGoalStep";
import { RestDaysStep } from "./steps/RestDaysStep";
import { SplitStep } from "./steps/SplitStep";
import { WaterGoalStep } from "./steps/WaterGoalStep";
import { WelcomeStep } from "./steps/WelcomeStep";

const STEP_COUNT = 8;

/**
 * Owns the whole wizard: one RHF instance (via watch/setValue, not
 * register() — none of the step UIs are native inputs) so values persist
 * across steps without prop-drilling a parallel state object, plus the
 * current step index and step-specific "can continue" gating. No data
 * fetching, no backend write — this mirrors Auth's structure (pure client
 * flow), not the tab screens' server-fetch pattern.
 */
export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const { watch, setValue } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: defaultOnboardingValues,
  });

  const values = watch();

  const canContinue =
    step === 1 ? !!values.goal
    : step === 2 ? !!values.experienceLevel
    : step === 3 ? !!values.activeSplit
    : true;

  function handleContinue() {
    if (step === STEP_COUNT - 1) {
      // No backend yet — nothing is persisted. This is the seam where a
      // real profile-creation call would go before entering the app.
      router.push("/home");
      return;
    }
    setStep((current) => current + 1);
  }

  function handleBack() {
    setStep((current) => Math.max(0, current - 1));
  }

  return (
    <div className="flex min-h-[70dvh] flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        {step > 0 && (
          <IconButton label="Back" variant="ghost" onClick={handleBack}>
            <ArrowLeft size={iconSize.sm} aria-hidden />
          </IconButton>
        )}
        <ProgressBar
          value={step + 1}
          max={STEP_COUNT}
          className="flex-1"
          aria-label={`Step ${step + 1} of ${STEP_COUNT}`}
        />
      </div>

      {/* Re-keyed per step so each one gets its own entrance — the same
          fadeInUp variant every screen already uses, not a new transition. */}
      <m.div key={step} initial="hidden" animate="visible" variants={fadeInUp} className="flex-1">
        {step === 0 && <WelcomeStep />}
        {step === 1 && (
          <GoalStep value={values.goal} onChange={(value) => setValue("goal", value)} />
        )}
        {step === 2 && (
          <ExperienceStep
            value={values.experienceLevel}
            onChange={(value) => setValue("experienceLevel", value)}
          />
        )}
        {step === 3 && (
          <SplitStep
            value={values.activeSplit}
            onChange={(value) => setValue("activeSplit", value)}
          />
        )}
        {step === 4 && (
          <RestDaysStep
            trainingDaysPerWeek={values.trainingDaysPerWeek}
            onChange={(value) => setValue("trainingDaysPerWeek", value)}
          />
        )}
        {step === 5 && (
          <ProteinGoalStep
            value={values.proteinGoalGrams}
            onChange={(value) => setValue("proteinGoalGrams", value)}
          />
        )}
        {step === 6 && (
          <WaterGoalStep
            value={values.hydrationGoalLiters}
            onChange={(value) => setValue("hydrationGoalLiters", value)}
          />
        )}
        {step === 7 && values.goal && values.activeSplit && (
          <DNAResultStep
            goal={values.goal}
            activeSplit={values.activeSplit}
            trainingDaysPerWeek={values.trainingDaysPerWeek}
            proteinGoalGrams={values.proteinGoalGrams}
            hydrationGoalLiters={values.hydrationGoalLiters}
          />
        )}
      </m.div>

      <div className="flex flex-col gap-3">
        <Button size="lg" fullWidth disabled={!canContinue} onClick={handleContinue}>
          {step === STEP_COUNT - 1 ? "Enter PhysIQx" : step === 0 ? "Get started" : "Continue"}
        </Button>
        {step === 0 && (
          <Link
            href="/home"
            className="text-center text-sm text-foreground-secondary hover:underline"
          >
            Skip for now
          </Link>
        )}
      </div>
    </div>
  );
}
