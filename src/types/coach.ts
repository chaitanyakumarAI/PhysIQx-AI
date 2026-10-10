export type CoachId = "kix" | "nyra";

export type CoachExpression =
  | "default"
  | "intense"
  | "calm"
  | "confident"
  | "analytical"
  | "alert";

export interface CoachProfile {
  id: CoachId;
  name: string;
  callsign: string;
  role: string;
  themeColor: string; // Tailwind hex e.g. #10b981 (Kix) or #06b6d4 (Nyra)
  accentBorder: string;
  glowClass: string;
  avatarFrames: Record<CoachExpression, string>;
}

export interface DualDialogueLine {
  speaker: CoachId;
  expression: CoachExpression;
  text: string;
}

export interface DualDialogueStep {
  step: number;
  topic: string;
  lines: DualDialogueLine[];
}

export interface FeatureInfoExplainer {
  id: string;
  featureKey: string;
  coach: CoachId;
  title: string;
  summary: string;
  tacticalTip: string;
}

export interface PreloadedRecommendation {
  id: string;
  coach: CoachId;
  triggerCondition: string;
  title: string;
  badge: string;
  body: string;
  ctaLabel: string;
}

export interface PhysIQxCoachContent {
  introBriefing: DualDialogueStep[];
  infoExplainers: FeatureInfoExplainer[];
  preloadedRecommendations: PreloadedRecommendation[];
}
