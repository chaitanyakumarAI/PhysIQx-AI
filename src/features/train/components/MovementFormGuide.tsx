"use client";

import Link from "next/link";
import { CheckCircle2, AlertTriangle, Sparkles, Dumbbell, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { iconSize } from "@/constants/icons";
import type { Exercise } from "@/types/exercise";

export interface MovementFormGuideProps {
  exercise: Exercise;
}

interface FormStep {
  title: string;
  cue: string;
}

export function MovementFormGuide({ exercise }: MovementFormGuideProps) {
  const isBarbell = exercise.equipment === "barbell";

  // Dynamic coaching cues based on movement characteristics
  const primaryGroup = exercise.muscleGroups[0] ?? "chest";
  
  let setupCue = "Plant feet firmly, engage core with 360° intra-abdominal brace, and set shoulders back and down.";
  let eccentricCue = "Control the lowering phase over 2–3 seconds, preserving continuous muscle tension without loose bouncing.";
  let concentricCue = "Drive forcefully through the full range of motion, exhaling at the sticking point without hyperextending.";
  let commonPitfall = "Rushing the eccentric phase or losing spinal neutrality under heavier working loads.";
  let coachTip = "Prioritize pristine joint trajectory and bar path over adding weight too quickly.";

  if (primaryGroup === "chest") {
    setupCue = "Retract scapulae tightly into the bench, arch moderately, and maintain 5-point contact (head, shoulders, glutes, both feet).";
    eccentricCue = "Tuck elbows to approximately 45–70 degrees, lowering the weight smoothly to touch mid-to-lower sternum.";
    concentricCue = "Drive up and slightly back toward the face, thinking about bending the bar inwards to maximize pectoral recruitment.";
    commonPitfall = "Flaring elbows out to 90 degrees, which places shear stress on the anterior shoulder capsule.";
    coachTip = "Keep wrists stacked directly over elbows throughout the entire pressing motion.";
  } else if (primaryGroup === "legs") {
    setupCue = "Set feet shoulder-width apart with toes flared 15–30 degrees. Root big toe, pinky toe, and heel into the floor.";
    eccentricCue = "Break simultaneously at hips and knees, sitting down between heels while keeping chest upright.";
    concentricCue = "Drive floor away through mid-foot, pushing knees out against the imaginary floor screw.";
    commonPitfall = "Knee valgus (knees caving inward) or rounding lower back at the bottom of the movement.";
    coachTip = "Take a deep diaphragmatic breath into the belt and brace hard before starting each rep.";
  } else if (primaryGroup === "back") {
    setupCue = "Hinge hips back with soft knees, maintain flat spine, and grip securely with packed lats.";
    eccentricCue = "Allow lats and upper back to fully stretch under controlled tension without letting the spine round.";
    concentricCue = "Pull elbows back toward the hip crease, driving shoulder blades together at peak contraction.";
    commonPitfall = "Using excessive momentum or jerking torso to heave the weight upward.";
    coachTip = "Initiate the pull with scapular retraction before bending the elbows.";
  } else if (primaryGroup === "shoulders") {
    setupCue = "Brace glutes and abs to avoid lumbar hyperextension. Grip just outside shoulder width with elbows slightly forward.";
    eccentricCue = "Lower with control in front of the chin, keeping forearms perpendicular to the ground.";
    concentricCue = "Press vertically in a slight arc around the chin, pushing head forward under the bar at full lockout.";
    commonPitfall = "Over-arching the lower back into a pseudo-incline bench press.";
    coachTip = "Squeeze glutes tight on every single rep to build a rock-solid platform.";
  }

  const steps: FormStep[] = [
    { title: "1. Setup & Stance", cue: setupCue },
    { title: "2. Eccentric Descent", cue: eccentricCue },
    { title: "3. Concentric Drive", cue: concentricCue },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* 3-Step Execution Card */}
      <Card padding="md" className="flex flex-col gap-4 border border-border/70">
        <div className="flex items-center gap-2">
          <ShieldCheck size={iconSize.sm} className="text-brand" />
          <h3 className="text-sm font-bold text-foreground">Biomechanics & Execution</h3>
        </div>

        <div className="flex flex-col gap-3">
          {steps.map((step) => (
            <div key={step.title} className="flex items-start gap-3 rounded-xl bg-surface-elevated/60 p-3 border border-border/40">
              <CheckCircle2 size={iconSize.xs} className="text-brand shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">{step.title}</span>
                <p className="mt-0.5 text-xs text-foreground-secondary leading-relaxed">{step.cue}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pitfall & Cue */}
        <div className="flex items-start gap-3 rounded-xl bg-warning/10 p-3 border border-warning/20">
          <AlertTriangle size={iconSize.xs} className="text-warning shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-warning">Avoid Common Fault</span>
            <p className="mt-0.5 text-xs text-foreground-secondary leading-relaxed">{commonPitfall}</p>
            <p className="mt-1.5 text-xs font-medium text-foreground">
              <span className="text-brand font-bold">Pro Cue:</span> {coachTip}
            </p>
          </div>
        </div>
      </Card>

      {/* Barbell Plate Helper Button (if barbell) */}
      {isBarbell && (
        <Card padding="sm" className="flex items-center justify-between gap-3 bg-brand/5 border border-brand/20">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-brand/15 text-brand">
              <Dumbbell size={iconSize.sm} />
            </span>
            <div>
              <p className="text-xs font-bold text-foreground">Olympic Plate Calculator</p>
              <p className="text-[11px] text-foreground-secondary">Calculate exact plate sleeves & warmup ladder</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" asChild>
            <Link href={`/train/calculator?weight=60&bar=olympic`}>
              Open Lab
            </Link>
          </Button>
        </Card>
      )}

      {/* Ask AI Coach Nyra Cues Banner */}
      <Card padding="sm" className="flex items-center justify-between gap-3 bg-surface-elevated/70 border border-border/60">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-info/15 text-info">
            <Sparkles size={iconSize.sm} />
          </span>
          <div>
            <p className="text-xs font-bold text-foreground">Ask Coach Nyra for Form Feedback</p>
            <p className="text-[11px] text-foreground-secondary">Real-time biomechanical cues for {exercise.name}</p>
          </div>
        </div>
        <Button size="sm" variant="secondary" asChild>
          <Link href={`/coach?q=What are the best form cues for ${encodeURIComponent(exercise.name)}?`}>
            Ask Coach
          </Link>
        </Button>
      </Card>
    </div>
  );
}
