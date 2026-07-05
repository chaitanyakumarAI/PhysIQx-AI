import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "grid size-11 shrink-0 place-items-center rounded-full transition duration-150 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        ghost:
          "text-foreground-secondary hover:bg-surface-elevated hover:text-foreground",
        surface:
          "bg-surface-elevated text-foreground-secondary hover:text-foreground",
        brand: "bg-brand text-zinc-950 hover:bg-brand-strong",
      },
    },
    defaultVariants: {
      variant: "ghost",
    },
  },
);

export interface IconButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof iconButtonVariants> {
  /** Accessible name — icon-only buttons must always describe their action. */
  label: string;
}

export function IconButton({
  className,
  variant,
  label,
  type = "button",
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(iconButtonVariants({ variant }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
