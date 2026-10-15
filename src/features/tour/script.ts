/**
 * The app tour as a conversation between Kix and Nyra
 * (docs/GAMIFICATION_STUDY.md §3.5). Each beat points at one real element
 * while the two talk about it. Voices follow docs/MASCOTS.md:
 * Kix — warm, eager, openly proud, a beat too early to celebrate;
 * Nyra — blunt, precise, never shaming, her slow nod saved for the end.
 */

export type Speaker = "kix" | "nyra";

export type KixExpression =
  | "default"
  | "focus"
  | "joy"
  | "sheepish"
  | "worried"
  | "proud"
  | "determined"
  | "asleep";

export type NyraExpression = "stare" | "narrowed" | "closed" | "nod" | "tilt";

export type TourLine =
  | { speaker: "kix"; expression: KixExpression; text: string }
  | { speaker: "nyra"; expression: NyraExpression; text: string };

export interface TourBeat {
  id: string;
  route: string;
  /** Element to spotlight; none = the two take centre stage. */
  target?: string;
  lines: TourLine[];
}

export const TOUR_SCRIPT: TourBeat[] = [
  {
    id: "intro",
    route: "/home",
    lines: [
      { speaker: "kix", expression: "joy", text: "Hey, you made it! I'm Kix. I'll be in your corner for every single rep." },
      { speaker: "nyra", expression: "stare", text: "Nyra. I keep the standard around here. Let's show you how this place works." },
    ],
  },
  {
    id: "mission",
    route: "/home",
    target: '[data-tour="mission"]',
    lines: [
      { speaker: "kix", expression: "determined", text: "This is today's workout, straight from your plan. Hit play and we're lifting." },
      { speaker: "nyra", expression: "narrowed", text: "Log what you actually lift. Your next session is built from it." },
    ],
  },
  {
    id: "coach",
    route: "/home",
    target: '[data-tour="coach"]',
    lines: [
      { speaker: "nyra", expression: "tilt", text: "This card is my read on your day: push, rest, or fix a lift that's stalled." },
      { speaker: "kix", expression: "sheepish", text: "Sometimes it tells me to rest. I'm… still working on that." },
    ],
  },
  {
    id: "score",
    route: "/home",
    target: '[data-tour="score"]',
    lines: [
      { speaker: "kix", expression: "proud", text: "Your PhysIQ Score. Consistency, strength, cardio and body shape — one number." },
      { speaker: "nyra", expression: "stare", text: "It calibrates for a week first. No guesses. No fake numbers." },
    ],
  },
  {
    id: "week",
    route: "/home",
    target: '[data-tour="week"]',
    lines: [
      { speaker: "nyra", expression: "stare", text: "Planned rest counts. Your streak only breaks if you skip more than you planned." },
      { speaker: "kix", expression: "joy", text: "So rest days are wins too. Best rule in here." },
    ],
  },
  {
    id: "plans",
    route: "/train",
    target: '[data-tour="train-plans"]',
    lines: [
      { speaker: "kix", expression: "focus", text: "Your plans live on Train. Adopt a program, or build your own split." },
      { speaker: "nyra", expression: "narrowed", text: "Then stay with it for weeks. Programs work when you stop hopping." },
    ],
  },
  {
    id: "cardio",
    route: "/train",
    target: '[data-tour="train-cardio"]',
    lines: [
      { speaker: "nyra", expression: "stare", text: "Cardio is a quarter of your score. Import your runs and rides from your watch." },
      { speaker: "kix", expression: "joy", text: "Runs count double. Just saying." },
    ],
  },
  {
    id: "insights",
    route: "/insights",
    target: '[data-tour="insights-trend"]',
    lines: [
      { speaker: "nyra", expression: "tilt", text: "Insights is where the numbers talk: your score, your records, your training load." },
      { speaker: "kix", expression: "proud", text: "And your PRs. I live for the PRs." },
    ],
  },
  {
    id: "consistency",
    route: "/insights",
    target: '[data-tour="insights-heatmap"]',
    lines: [
      { speaker: "kix", expression: "determined", text: "Every green square is a day you showed up. Brighter means a bigger day." },
      { speaker: "nyra", expression: "stare", text: "Tap any day to see exactly what you did." },
    ],
  },
  {
    id: "level",
    route: "/profile",
    target: '[data-tour="profile-level"]',
    lines: [
      { speaker: "kix", expression: "joy", text: "Everything you do earns XP. Level up, climb the ranks, unlock new badges." },
      { speaker: "nyra", expression: "narrowed", text: "Each level costs more than the last. As it should." },
    ],
  },
  {
    id: "finale",
    route: "/home",
    lines: [
      { speaker: "kix", expression: "joy", text: "That's the tour. Let's go earn some green!" },
      { speaker: "nyra", expression: "nod", text: "…Good. Start with today." },
    ],
  },
];

export const SPEAKERS: Record<Speaker, { name: string; role: string }> = {
  kix: { name: "Kix", role: "The Contender" },
  nyra: { name: "Nyra", role: "The Standard" },
};

export function portraitFor(line: TourLine): string {
  return `/mascots/${line.speaker}-${line.expression}.webp`;
}
