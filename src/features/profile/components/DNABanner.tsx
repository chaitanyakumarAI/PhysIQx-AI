import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";

export interface DNABannerProps {
  archetype: string;
  className?: string;
}

/** The "PhysIQ DNA · <archetype>" banner. */
export function DNABanner({ archetype, className }: DNABannerProps) {
  return (
    <Card variant="accent" padding="sm" className={className}>
      <p className="flex items-center gap-2 text-sm font-semibold text-brand">
        <Sparkles size={iconSize.xs} aria-hidden />
        PhysIQ DNA <span className="font-normal text-foreground">· {archetype}</span>
      </p>
    </Card>
  );
}
