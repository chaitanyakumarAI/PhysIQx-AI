import { useId } from "react";
import { cn } from "@/lib/utils";

const tones = {
  brand: "stroke-brand",
  info: "stroke-info",
  warning: "stroke-warning",
  danger: "stroke-danger",
} as const;

/** Brand rings sweep light→deep green; a flat single-color stroke reads flat.
 *  (A violet tail was tried and reverted — it read as odd, per user review.) */
const brandGradientStops = [
  { offset: "0%", color: "var(--color-brand)" },
  { offset: "100%", color: "var(--color-brand-strong)" },
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
  /**
   * Brand only: the colour sweeps along the arc, deep at the start to a
   * bright head, instead of one gradient across the box (which reads as a
   * flat block). Used by the PhysIQ Score gauge.
   */
  sweep?: boolean;
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
  sweep = false,
  children,
  ...props
}: CircularProgressProps) {
  const gradientId = useId();
  const clamped = Math.min(Math.max(value, 0), max);
  const progress = max > 0 ? clamped / max : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const center = size / 2;
  const useSweep = sweep && tone === "brand";
  const useGradient = tone === "brand" && !useSweep;

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
        {!useSweep && (
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
        )}
      </svg>
      {useSweep && (
        <SweepArc progress={progress} size={size} strokeWidth={strokeWidth} glow={glow} />
      )}
      {children && (
        <div className="absolute inset-0 grid place-items-center">
          {children}
        </div>
      )}
    </div>
  );
}

interface SweepArcProps {
  progress: number;
  size: number;
  strokeWidth: number;
  glow: boolean;
}

/**
 * The swept arc, drawn in HTML: a conic gradient (deep → brand → bright
 * head) masked to the ring's band, with round caps as discs. An SVG stroke
 * can't take a gradient along an arc, and an SVG glow is clipped to the
 * svg's box — that clipping showed as a square behind the score gauge.
 */
function SweepArc({ progress, size, strokeWidth, glow }: SweepArcProps) {
  if (progress <= 0) return null;
  const band = `radial-gradient(farthest-side, transparent calc(100% - ${strokeWidth}px - 0.5px), #000 calc(100% - ${strokeWidth}px + 0.5px))`;
  // Caps sit on the band's centre line at the top; the head's wrapper
  // rotates with progress. Sizes are data-driven — justified inline style.
  const cap = { width: strokeWidth, height: strokeWidth, left: (size - strokeWidth) / 2 };

  return (
    <div
      aria-hidden
      className={cn(
        "ring-sweep pointer-events-none absolute inset-0",
        glow && "drop-shadow-[0_0_8px_rgb(34_197_94/0.35)]",
      )}
      style={{ "--ring-progress": progress } as React.CSSProperties}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(var(--color-brand-deep) 0turn, var(--color-brand) calc(var(--ring-progress) * 0.6turn), var(--color-brand-highlight) calc(var(--ring-progress) * 1turn), transparent 0)",
          mask: band,
          WebkitMask: band,
        }}
      />
      <span className="absolute top-0 rounded-full bg-brand-deep" style={cap} />
      <div className="absolute inset-0 rotate-[calc(var(--ring-progress)*1turn)]">
        <span
          className={cn(
            "absolute top-0 rounded-full bg-brand-highlight",
            glow && "shadow-[0_0_10px_2px_color-mix(in_srgb,var(--color-brand-highlight)_50%,transparent)]",
          )}
          style={cap}
        />
      </div>
    </div>
  );
}
