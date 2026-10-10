import type {
  CoachId,
  CoachProfile,
  DualDialogueStep,
  FeatureInfoExplainer,
  PreloadedRecommendation,
  PhysIQxCoachContent,
} from "@/types/coach";
import rawData from "../../physiqx_coach_content.json";

export const COACH_PROFILES: Record<CoachId, CoachProfile> = {
  kix: {
    id: "kix",
    name: "Kix",
    callsign: "Field Commander",
    role: "Kinetic Specialist & PR Driver",
    themeColor: "#10b981", // Neon Emerald
    accentBorder: "border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.25)]",
    glowClass: "from-emerald-500/20 to-emerald-500/0",
    avatarFrames: {
      default: "/mascots/kix-default.webp",
      intense: "/mascots/kix-determined.webp",
      confident: "/mascots/kix-proud.webp",
      analytical: "/mascots/kix-focus.webp",
      calm: "/mascots/kix-default.webp",
      alert: "/mascots/kix-worried.webp",
    },
  },
  nyra: {
    id: "nyra",
    name: "Nyra",
    callsign: "Systems Architect",
    role: "Biomechanics & Recovery Lead",
    themeColor: "#06b6d4", // Cyan Telemetry
    accentBorder: "border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]",
    glowClass: "from-cyan-500/20 to-cyan-500/0",
    avatarFrames: {
      default: "/mascots/nyra-nod.webp",
      intense: "/mascots/nyra-stare.webp",
      confident: "/mascots/nyra-narrowed.webp",
      analytical: "/mascots/nyra-tilt.webp",
      calm: "/mascots/nyra-nod.webp",
      alert: "/mascots/nyra-closed.webp",
    },
  },
};

export const COACH_CONTENT: PhysIQxCoachContent = rawData as unknown as PhysIQxCoachContent;

export function getIntroBriefing(): DualDialogueStep[] {
  return COACH_CONTENT.introBriefing;
}

export function getFeatureInfo(featureKey: string): FeatureInfoExplainer | undefined {
  return COACH_CONTENT.infoExplainers.find(
    (item) => item.featureKey === featureKey || item.id === featureKey
  );
}

export function getAllFeatureExplainers(): FeatureInfoExplainer[] {
  return COACH_CONTENT.infoExplainers;
}

export function getPreloadedRecommendations(): PreloadedRecommendation[] {
  return COACH_CONTENT.preloadedRecommendations;
}

export function getCoachProfile(id: CoachId): CoachProfile {
  return COACH_PROFILES[id];
}
