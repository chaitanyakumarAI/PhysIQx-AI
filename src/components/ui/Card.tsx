import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-card border", {
  variants: {
    variant: {
      default: "border-border/60 bg-surface shadow-card",
      elevated: "border-border/60 bg-surface-elevated shadow-card",
      /** The signature green-washed card (missions, AI insights). */
      accent:
        "border-brand/20 bg-gradient-to-b from-brand/10 to-surface shadow-card",
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
