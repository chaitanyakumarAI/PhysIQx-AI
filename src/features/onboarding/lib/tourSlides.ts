/**
 * The feature tour — shown as the final onboarding sequence and replayable
 * from Profile → Settings. Content as data so the onboarding flow and the
 * standalone tour page render the exact same slides. Icon ids (not
 * components) so slides stay serializable.
 */
export interface TourSlide {
  id: string;
  iconId: "target" | "gauge" | "dumbbell" | "users";
  title: string;
  body: string;
}

export const tourSlides: TourSlide[] = [
  {
    id: "tour-mission",
    iconId: "target",
    title: "One mission a day",
    body: "Every morning you get a single clear workout. Complete it, earn XP, keep your streak alive. Honored rest days count too.",
  },
  {
    id: "tour-score",
    iconId: "gauge",
    title: "Your PhysIQ Score",
    body: "One number from six pillars — consistency matters most, and it's computed from what you actually do, never self-reported guesses.",
  },
  {
    id: "tour-train",
    iconId: "dumbbell",
    title: "Train and log",
    body: "Start a session, log your sets, and rest timers run themselves. An in-progress workout survives closing the app.",
  },
  {
    id: "tour-compete",
    iconId: "users",
    title: "Climb with your circle",
    body: "Weekly challenges and XP leaderboards with friends. XP is the social game — your score stays personal.",
  },
];
