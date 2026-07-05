import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-field font-semibold transition duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        primary: "bg-brand text-zinc-950 hover:bg-brand-strong",
        secondary:
          "border border-border bg-transparent text-foreground hover:bg-surface-elevated",
        ghost:
          "text-foreground-secondary hover:bg-surface-elevated hover:text-foreground",
        danger: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm: "h-11 px-4 text-sm",
        md: "h-12 px-5 text-base",
        lg: "h-14 px-6 text-base",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  /** Render styles onto the child element (e.g. a next/link). */
  asChild?: boolean;
  /** Shows a spinner, sets aria-busy, and disables interaction. */
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  // Slot (asChild) requires exactly one child element — even a `false`
  // JSX expression counts as a second array entry and makes it throw
  // ("Expected a single React element child"). So the two render paths
  // are fully separate rather than sharing one conditional spinner branch.
  if (asChild) {
    return (
      <Slot
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 aria-hidden className="size-5 animate-spin" />}
      {children}
    </button>
  );
}

export { buttonVariants };
