import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Every variant layers a faint top-down luminance gradient over its surface
// and pairs it with the lit-from-above shadow tokens (globals.css) — flat
// fills on flat black were the single biggest "cheap" tell in the old pass.
const cardVariants = cva("rounded-card border", {
  variants: {
    variant: {
      default:
        "border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-transparent bg-surface shadow-card",
      elevated:
        "border-white/[0.09] bg-gradient-to-b from-white/[0.06] to-transparent bg-surface-elevated [box-shadow:var(--shadow-card-elevated)]",
      /** The signature green-washed card (missions, AI insights). */
      accent:
        "border-brand/25 bg-gradient-to-b from-brand/[0.13] via-brand/[0.04] to-transparent bg-surface [box-shadow:var(--shadow-card),var(--shadow-glow-brand)]",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  );
}

export { cardVariants };
