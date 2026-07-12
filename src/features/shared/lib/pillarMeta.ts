import {
  CalendarCheck,
  Dumbbell,
  HeartPulse,
  PersonStanding,
  type LucideIcon,
} from "lucide-react";
import type { PillarId } from "@/types/score";

/**
 * Icon/tone per pillar — shared by PillarGrid and any standalone pillar
 * callout (e.g. Home's weakest-pillar tile), so the mapping can't drift
 * between the two.
 */
export const pillarIcon: Record<PillarId, LucideIcon> = {
  consistency: CalendarCheck,
  strength: Dumbbell,
  cardio: HeartPulse,
  bodyShape: PersonStanding,
};

export const pillarTone: Record<PillarId, "brand" | "warning" | "info" | "neutral"> = {
  consistency: "brand",
  strength: "brand",
  cardio: "info",
  bodyShape: "neutral",
};
