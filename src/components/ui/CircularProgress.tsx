import { useId } from "react";
import { cn } from "@/lib/utils";

const tones = {
  brand: "stroke-brand",
  info: "stroke-info",
  warning: "stroke-warning",
  danger: "stroke-danger",
} as const;

/** Brand rings sweep green into a violet tail — the score ring is the
 *  product's signature moment, one of the few sanctioned violet uses. */
const brandGradientStops = [
  { offset: "0%", color: "var(--color-brand)" },
  { offset: "65%", color: "var(--color-brand-strong)" },
  { offset: "100%", color: "var(--color-legendary)" },
];

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
  const gradientId = useId();
  const clamped = Math.min(Math.max(value, 0), max);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - (max > 0 ? clamped / max : 0));
  const center = size / 2;
  const useGradient = tone === "brand";

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
        {useGradient && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              {brandGradientStops.map((stop) => (
                <stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={stop.color}
                />
              ))}
            </linearGradient>
          </defs>
        )}
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
          stroke={useGradient ? `url(#${gradientId})` : undefined}
          className={cn(
            "fill-none transition-[stroke-dashoffset] duration-[600ms] ease-out motion-reduce:transition-none",
            !useGradient && tones[tone],
            // Half-opacity glow: the full-color shadow made the ring read
            // neon-sticker rather than lit (verified in screenshots).
            glow && "drop-shadow-[0_0_10px_rgb(34_197_94/0.5)]",
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
