import { cn } from "@/lib/utils";

const tones = {
  brand: "stroke-brand",
  info: "stroke-info",
  warning: "stroke-warning",
  danger: "stroke-danger",
} as const;

export interface CircularProgressProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  value: number;
  max?: number;
  /** Outer diameter in px. */
  size?: number;
  strokeWidth?: number;
  tone?: keyof typeof tones;
  /** Adds the soft brand glow used by the PhysIQ Score gauge. */
  glow?: boolean;
  /** Centered content (score number, label, etc.). */
  children?: React.ReactNode;
}

export function CircularProgress({
  className,
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  tone = "brand",
  glow = false,
  children,
  ...props
}: CircularProgressProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - (max > 0 ? clamped / max : 0));
  const center = size / 2;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      className={cn("relative inline-flex", className)}
      // Size is data-driven — justified inline style.
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-foreground/10"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "fill-none transition-[stroke-dashoffset] duration-[600ms] ease-out motion-reduce:transition-none",
            tones[tone],
            glow && "drop-shadow-[0_0_12px_var(--color-brand)]",
          )}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 grid place-items-center">
          {children}
        </div>
      )}
    </div>
  );
}
