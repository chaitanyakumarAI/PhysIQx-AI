import { Dumbbell, Gauge, Target, Users, type LucideIcon } from "lucide-react";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import type { TourSlide } from "../lib/tourSlides";
import { tourSlides } from "../lib/tourSlides";

const slideIcon: Record<TourSlide["iconId"], LucideIcon> = {
  target: Target,
  gauge: Gauge,
  dumbbell: Dumbbell,
  users: Users,
};

export interface TourSlideViewProps {
  slide: TourSlide;
  className?: string;
}

/** One feature-tour slide: big tinted icon, title, two-line story, dots. */
export function TourSlideView({ slide, className }: TourSlideViewProps) {
  const Icon = slideIcon[slide.iconId];
  const slideIndex = tourSlides.findIndex((entry) => entry.id === slide.id);

  return (
    <div className={cn("flex flex-col items-center gap-6 pt-10 text-center", className)}>
      <span className="grid size-24 place-items-center rounded-full bg-brand/15 text-brand [box-shadow:var(--shadow-glow-brand)]">
        <Icon size={iconSize.xl} aria-hidden />
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-bold">{slide.title}</h2>
        <p className="max-w-xs text-sm text-foreground-secondary">{slide.body}</p>
      </div>
      <div className="flex items-center gap-1.5" aria-label={`Slide ${slideIndex + 1} of ${tourSlides.length}`}>
        {tourSlides.map((entry, index) => (
          <span
            key={entry.id}
            aria-hidden
            className={cn(
              "size-1.5 rounded-full transition-colors",
              index === slideIndex ? "bg-brand" : "bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}
