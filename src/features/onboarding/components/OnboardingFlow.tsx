"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormSetValue } from "react-hook-form";
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
import { useProfileStore } from "@/store/profileStore";
import { BodyShapeStep } from "./steps/BodyShapeStep";
import { DNAResultStep } from "./steps/DNAResultStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { GoalStep } from "./steps/GoalStep";
import { RestDaysStep } from "./steps/RestDaysStep";
import { SessionFrequencyStep } from "./steps/SessionFrequencyStep";
import { SplitStep } from "./steps/SplitStep";
import { WelcomeStep } from "./steps/WelcomeStep";

interface StepConfig {
  id: string;
  render: (
    values: OnboardingValues,
    setValue: UseFormSetValue<OnboardingValues>,
  ) => React.ReactNode;
  /** Absent = always continuable. */
  canContinue?: (values: OnboardingValues) => boolean;
}

/**
 * Steps as a config array — inserting or removing a step is one splice, not
 * a renumbering of every index-keyed branch (the old ladder made adding the
 * body-shape question a 4-file diff; this made it one entry). Questions
 * first, the DNA reveal as the celebration and finale — entering the app
 * hands off to the guided walkthrough (/home?tour=1), which teaches on the
 * real interface instead of slides about it.
 */
const steps: StepConfig[] = [
  { id: "welcome", render: () => <WelcomeStep /> },
  {
    id: "goal",
    render: (values, setValue) => (
      <GoalStep value={values.goal} onChange={(value) => setValue("goal", value)} />
    ),
    canContinue: (values) => !!values.goal,
  },
  {
    id: "body-shape",
    render: (values, setValue) => (
      <BodyShapeStep
        value={values.goalBodyShape}
        onChange={(value) => setValue("goalBodyShape", value)}
      />
    ),
    canContinue: (values) => !!values.goalBodyShape,
  },
  {
    id: "experience",
    render: (values, setValue) => (
      <ExperienceStep
        value={values.experienceLevel}
        onChange={(value) => setValue("experienceLevel", value)}
      />
    ),
    canContinue: (values) => !!values.experienceLevel,
  },
  {
    id: "split",
    render: (values, setValue) => (
      <SplitStep
        value={values.activeSplit}
        onChange={(value) => setValue("activeSplit", value)}
      />
    ),
    canContinue: (values) => !!values.activeSplit,
  },
  {
    id: "rest-days",
    render: (values, setValue) => (
      <RestDaysStep
        trainingDaysPerWeek={values.trainingDaysPerWeek}
        onChange={(value) => setValue("trainingDaysPerWeek", value)}
      />
    ),
  },
  {
    id: "session-frequency",
    render: (values, setValue) => (
      <SessionFrequencyStep
        value={values.sessionFrequency}
        onChange={(value) => setValue("sessionFrequency", value)}
      />
    ),
    canContinue: (values) => !!values.sessionFrequency,
  },
  {
    id: "dna-result",
    render: (values) =>
      values.goal && values.activeSplit ? (
        <DNAResultStep
          goal={values.goal}
          activeSplit={values.activeSplit}
          trainingDaysPerWeek={values.trainingDaysPerWeek}
          goalBodyShape={values.goalBodyShape}
          sessionFrequency={values.sessionFrequency}
        />
      ) : null,
  },
];

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const setOnboardingProfile = useProfileStore((state) => state.setOnboardingProfile);
  const { watch, setValue } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: defaultOnboardingValues,
  });

  const values = watch();
  const current = steps[step]!;
  const isLast = step === steps.length - 1;
  const canContinue = current.canContinue?.(values) ?? true;

  function handleContinue() {
    if (isLast) {
      setOnboardingProfile(values);
      router.push("/home?tour=1");
      return;
    }
    setStep((index) => index + 1);
  }

  function handleBack() {
    setStep((index) => Math.max(0, index - 1));
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
          max={steps.length}
          className="flex-1"
          aria-label={`Step ${step + 1} of ${steps.length}`}
        />
      </div>

      {/* Re-keyed per step so each one gets its own entrance — the same
          fadeInUp variant every screen already uses, not a new transition. */}
      <m.div
        key={current.id}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        // Welcome floats centered (it's a moment, not a form); question
        // steps stay top-aligned where forms belong.
        className={
          current.id === "welcome"
            ? "flex flex-1 flex-col justify-center"
            : "flex-1"
        }
      >
        {current.render(values, setValue)}
      </m.div>

      <div className="flex flex-col gap-3">
        <Button size="lg" fullWidth disabled={!canContinue} onClick={handleContinue}>
          {isLast ? "Enter PhysIQx" : step === 0 ? "Get started" : "Continue"}
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
