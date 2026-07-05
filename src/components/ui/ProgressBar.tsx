import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const fillVariants = cva(
  "h-full rounded-full transition-[width] duration-[600ms] ease-out motion-reduce:transition-none",
  {
    variants: {
      tone: {
        brand: "bg-brand",
        info: "bg-info",
        warning: "bg-warning",
        danger: "bg-danger",
        neutral: "bg-foreground-secondary",
        /** Achievement rarity accent — see globals.css's --color-legendary. */
        legendary: "bg-legendary",
      },
    },
    defaultVariants: {
      tone: "brand",
    },
  },
);

const trackSizes = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
} as const;

export interface ProgressBarProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof fillVariants> {
  value: number;
  max?: number;
  size?: keyof typeof trackSizes;
}

export function ProgressBar({
  className,
  value,
  max = 100,
  tone,
  size = "md",
  ...props
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? (clamped / max) * 100 : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      className={cn(
        "w-full overflow-hidden rounded-full bg-foreground/10",
        trackSizes[size],
        className,
      )}
      {...props}
    >
      {/* Width is data-driven — the one justified inline style. */}
      <div className={fillVariants({ tone })} style={{ width: `${percent}%` }} />
    </div>
  );
}
