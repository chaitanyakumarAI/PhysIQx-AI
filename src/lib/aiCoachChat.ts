import type { ProfileGoal, ExperienceLevel } from "@/types/profile";
import type { PillarId } from "@/types/score";
import { mockExercises } from "@/data/exercises";
import { enforceTwoSentences } from "@/types/insight";

export type CoachPersona = "kix" | "nyra";

export interface CoachContext {
  displayName?: string;
  goal?: ProfileGoal;
  experienceLevel?: ExperienceLevel;
  currentStreakDays?: number;
  physiqScore?: number;
  weakestPillarId?: PillarId;
}

export interface CoachMessage {
  id: string;
  sender: "user" | "coach";
  persona?: CoachPersona;
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    href: string;
  };
}

export interface QuickPrompt {
  id: string;
  text: string;
  category: "progression" | "recovery" | "form" | "nutrition" | "score";
}

export const defaultQuickPrompts: QuickPrompt[] = [
  { id: "qp-plateau", text: "How do I break a bench press plateau?", category: "progression" },
  { id: "qp-recovery", text: "I only slept 5 hours. Should I train today?", category: "recovery" },
  { id: "qp-score", text: "How can I raise my weakest PhysIQ pillar?", category: "score" },
  { id: "qp-rdl-cues", text: "What are the best form cues for Romanian Deadlifts?", category: "form" },
  { id: "qp-protein", text: "How much daily protein should I target?", category: "nutrition" },
  { id: "qp-deload", text: "When do I know it is time for a deload week?", category: "recovery" },
];

/**
 * Searches the exercise catalog for matches to provide specific movement cues.
 */
function findMentionedExercise(query: string) {
  const normalized = query.toLowerCase();
  return mockExercises.find((ex) =>
    normalized.includes(ex.name.toLowerCase()) ||
    ex.name.toLowerCase().split(" ").some((word) => word.length > 3 && normalized.includes(word)) ||
    (ex.muscleGroups && ex.muscleGroups.some((m) => normalized.includes(m.toLowerCase())))
  );
}

/**
 * Generates an intelligent, profile-grounded coach response adhering to the <= 2 sentence contract.
 */
export function generateCoachResponse(
  userQuery: string,
  persona: CoachPersona = "kix",
  context: CoachContext = {}
): CoachMessage {
  const q = userQuery.toLowerCase().trim();
  const goal = context.goal || "bulk";
  const exp = context.experienceLevel || "intermediate";
  const streak = context.currentStreakDays || 0;
  const weakest = context.weakestPillarId || "cardio";

  let responseText = "";
  let action: CoachMessage["suggestedAction"] | undefined;

  // 1. Matched specific exercise form / cues
  const matchedExercise = findMentionedExercise(q);
  if (matchedExercise && (q.includes("form") || q.includes("cue") || q.includes("how to") || q.includes("tips"))) {
    if (persona === "kix") {
      responseText = `Lock your brace and explode through the concentric phase on ${matchedExercise.name}. Drive with intent and keep your target reps locked without hitching momentum.`;
    } else {
      responseText = `Focus on controlled eccentric lowering and a stable joint angle for ${matchedExercise.name}. Keep full tension across your ${matchedExercise.muscleGroups.slice(0, 2).join(" and ")} through the entire excursion.`;
    }
    action = {
      label: `View ${matchedExercise.name} details`,
      href: `/train/exercises/${matchedExercise.id}`,
    };
  }

  // 2. Plateau & Overload
  else if (q.includes("plateau") || q.includes("stuck") || q.includes("progress")) {
    if (persona === "kix") {
      responseText = `Micro-load with 1.0–2.5 kg increments and add a dedicated heavy top set at RPE 8.5. Relentless progressive overload always breaks through stubborn strength plateaus.`;
    } else {
      responseText = `Rotate your rep bracket from 6–8 reps to 10–12 reps for two weeks to stimulate novel motor units. Alternatively, implement a 4-day deload to clear accumulated central nervous system fatigue.`;
    }
    action = { label: "Review progressive overload", href: "/profile/settings/preferences" };
  }

  // 3. Sleep & Fatigue
  else if (q.includes("sleep") || q.includes("tired") || q.includes("fatigue") || q.includes("sore")) {
    if (persona === "kix") {
      responseText = `Scale back working sets by 25% today but maintain movement quality to protect your ${streak}-day streak momentum. Sub-maximal volume keeps the habit alive without crushing your recovery.`;
    } else {
      responseText = `With reduced sleep, sympathetic stress is already elevated so keep exertion capped at RPE 7. Prioritize hydration and 20 minutes of light mobility instead of heavy maximal singles.`;
    }
    action = { label: "Log light cardio instead", href: "/train/cardio" };
  }

  // 4. PhysIQ Score & Weakest Pillar
  else if (q.includes("pillar") || q.includes("score") || q.includes("raise") || q.includes("weakest")) {
    const pillarAdvice: Record<PillarId, string> = {
      cardio: "Adding two 20-minute low-intensity Zone-2 cardio sessions this week will immediately elevate your lowest pillar.",
      strength: "Consistently advancing weight or reps across your compound foundation lifts will drive your strength score higher.",
      consistency: "Completing your target weekly training frequency without missed sessions provides the highest score leverage.",
      bodyShape: "Logging regular weigh-ins and keeping your goal physique archetype calibrated keeps your shape pillar climbing.",
    };
    const advice = pillarAdvice[weakest];
    if (persona === "kix") {
      responseText = `Your primary score bottleneck right now is ${weakest}. ${advice}`;
    } else {
      responseText = `Calibrating your ${weakest} pillar delivers the steepest algorithmic score uplift. ${advice}`;
    }
    action = { label: "View Insights breakdown", href: "/insights" };
  }

  // 5. Nutrition & Protein
  else if (q.includes("protein") || q.includes("food") || q.includes("eat") || q.includes("nutrition")) {
    const multiplier = goal === "bulk" ? "1.8–2.2" : goal === "cut" ? "2.2–2.5" : "1.6–2.0";
    if (persona === "kix") {
      responseText = `Aim for ${multiplier} grams of protein per kilogram of bodyweight distributed evenly across 3–4 daily meals. Fuel the recovery engine and muscles will follow.`;
    } else {
      responseText = `Target ${multiplier}g/kg of dietary protein paired with nutrient-dense carbs around your training window. Consistent protein synthesis pacing maximizes recovery for your ${goal} target.`;
    }
  }

  // 6. Deload
  else if (q.includes("deload") || q.includes("rest week")) {
    if (persona === "kix") {
      responseText = `Take a deload whenever average session RPE exceeds 9.0 across two consecutive weeks. Cut volume in half, maintain bar speed, and bounce back stronger.`;
    } else {
      responseText = `Scheduled deloads every 5 to 8 weeks dissipate joint wear and reset neurological fatigue. Keep the weight moderate and focus on movement trajectory.`;
    }
    action = { label: "Check AI split suggestions", href: "/train/programs/ai" };
  }

  // 7. General fallback
  else {
    if (persona === "kix") {
      responseText = `Stay disciplined to your ${goal} program and treat every working set as an opportunity for mastery. What specific lift or metric do you want to conquer next?`;
    } else {
      responseText = `Your current ${exp} training plan is calibrated for sustainable adaptation and joint longevity. Feel free to ask about specific exercise cues, recovery strategies, or score optimization.`;
    }
  }

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender: "coach",
    persona,
    text: enforceTwoSentences(responseText),
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    suggestedAction: action,
  };
}
