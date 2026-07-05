import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex h-10 select-none items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      /** Selected appearance: solid white (program/period filters) or
          brand-tinted (muscle-group filters), matching the designs. */
      variant: {
        solid: "",
        accent: "",
      },
      selected: {
        true: "",
        false:
          "bg-surface-elevated text-foreground-secondary hover:text-foreground",
      },
    },
    compoundVariants: [
      {
        variant: "solid",
        selected: true,
        class: "bg-foreground text-zinc-950",
      },
      {
        variant: "accent",
        selected: true,
        class: "bg-brand/15 text-brand",
      },
    ],
    defaultVariants: {
      variant: "solid",
      selected: false,
    },
  },
);

export interface ChipProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof chipVariants> {
  selected?: boolean;
}

/** Toggleable filter pill. Exposes state via aria-pressed. */
export function Chip({
  className,
  variant,
  selected = false,
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(chipVariants({ variant, selected }), className)}
      {...props}
    />
  );
}
