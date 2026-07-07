import { useId } from "react";
import { cn } from "@/lib/utils";

const toneVar = {
  brand: "var(--color-brand)",
  info: "var(--color-info)",
} as const;

export interface TrendChartProps {
  /** Sequential values, oldest first. */
  values: number[];
  tone?: keyof typeof toneVar;
  height?: number;
  className?: string;
  "aria-label"?: string;
}

const VIEWBOX_WIDTH = 300;

/** Lightweight quadratic smoothing — no charting library needed for a shape this simple. */
function buildSmoothPath(coords: { x: number; y: number }[]): string {
  const first = coords[0];
  if (!first) return "";
  if (coords.length === 1) return `M ${first.x} ${first.y}`;

  let d = `M ${first.x} ${first.y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i]!;
    const next = coords[i + 1]!;
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    d += ` Q ${curr.x} ${curr.y} ${midX} ${midY}`;
  }
  const last = coords[coords.length - 1]!;
  d += ` L ${last.x} ${last.y}`;
  return d;
}

/**
 * Generic sparkline/area trend chart. Domain-agnostic (plain numbers in, no
 * knowledge of "score" or "PR") — reused by ScoreTrendCard and
 * PersonalRecordCard with different tones. Exposed as a named image
 * (role="img") rather than hidden entirely, but the path data itself isn't
 * meaningful to a screen reader — callers must already state the current
 * value and delta in adjacent text.
 */
export function TrendChart({
  values,
  tone = "brand",
  height = 120,
  className,
  "aria-label": ariaLabel,
}: TrendChartProps) {
  const gradientId = useId();

  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = VIEWBOX_WIDTH / (values.length - 1);
  const padding = height * 0.1;

  const coords = values.map((value, index) => ({
    x: index * stepX,
    y: height - padding - ((value - min) / range) * (height - padding * 2),
  }));

  const linePath = buildSmoothPath(coords);
  const areaPath = `${linePath} L ${VIEWBOX_WIDTH} ${height} L 0 ${height} Z`;
  const color = toneVar[tone];

  return (
    <svg
      role="img"
      aria-label={ariaLabel ?? "Trend chart"}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          {/* Kept faint on purpose: at 0.35 the fill rendered as a solid
              slab over the dark ground (verified in screenshots). */}
          <stop offset="0%" stopColor={color} stopOpacity={0.16} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
