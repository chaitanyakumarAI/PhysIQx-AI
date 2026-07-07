/* eslint-disable @next/next/no-img-element -- avatars are small, user-supplied
   images; next/image optimization is unnecessary at this size. */
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold uppercase",
  {
    variants: {
      size: {
        xs: "size-8 text-xs",
        sm: "size-10 text-sm",
        md: "size-12 text-base",
        lg: "size-16 text-xl",
        xl: "size-24 text-3xl",
      },
      variant: {
        default: "bg-surface-elevated text-foreground-secondary",
        /** The current user's signature gradient: brand green sweeping into
            the violet accent — one of the few sanctioned violet moments. */
        brand: "bg-gradient-to-br from-brand via-brand to-legendary text-zinc-950",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

export interface AvatarProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof avatarVariants> {
  /** Person's name — used for initials and the accessible label. */
  name: string;
  src?: string;
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}

export function Avatar({
  className,
  size,
  variant,
  name,
  src,
  ...props
}: AvatarProps) {
  return (
    <div
      role="img"
      aria-label={name}
      className={cn(avatarVariants({ size, variant }), className)}
      {...props}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden>{initialsOf(name)}</span>
      )}
    </div>
  );
}
