import { Sparkles } from "lucide-react";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
}

/**
 * Wordmark. No design screenshot exists for this — built from the design
 * system's own tokens (brand color, display font), not a guess at an unseen
 * asset. Promoted from Auth once Onboarding needed the same brand moment at
 * its Welcome step — same promotion rule as AIInsightCard/StatChipRow.
 */
export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="grid size-9 place-items-center rounded-field bg-brand text-zinc-950">
        <Sparkles size={iconSize.sm} aria-hidden />
      </span>
      <span className="font-display text-xl font-bold">PhysIQx</span>
    </div>
  );
}
