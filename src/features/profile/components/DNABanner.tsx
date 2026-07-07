import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";

export interface DNABannerProps {
  archetype: string;
  className?: string;
}

/** The "PhysIQ DNA · <archetype>" banner. DNA is one of the sanctioned
 *  violet moments — the identity metaphor gets the special-accent treatment. */
export function DNABanner({ archetype, className }: DNABannerProps) {
  return (
    <Card variant="accent" padding="sm" className={className}>
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles size={iconSize.xs} aria-hidden className="text-legendary" />
        <span className="bg-gradient-to-r from-brand to-legendary bg-clip-text text-transparent">
          PhysIQ DNA
        </span>
        <span className="font-normal text-foreground">· {archetype}</span>
      </p>
    </Card>
  );
}
