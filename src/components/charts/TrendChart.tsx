"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const toneVar = {
  brand: "var(--color-brand)",
  info: "var(--color-info)",
} as const;

export interface TrendPoint {
  value: number;
  /** ISO date — shown in the scrub tooltip when `interactive`. */
  date?: string;
}

export interface TrendChartProps {
  /** Sequential points, oldest first. */
  points: TrendPoint[];
  tone?: keyof typeof toneVar;
  height?: number;
  /**
   * Touch/drag scrubbing: moving a finger or pointer across the chart pins
   * the nearest point and shows its date + value. Leave off for tiny
   * sparklines where a tooltip would be bigger than the chart.
   */
  interactive?: boolean;
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

function formatTooltipDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Generic sparkline/area trend chart. Domain-agnostic (plain points in, no
 * knowledge of "score" or "PR") — reused by ScoreTrendCard,
 * PersonalRecordCard, and Home's score sparkline with different tones.
 * The SVG is exposed as a named image; when interactive, the full
 * date-by-date series is also available to screen readers as a list, since
 * pointer scrubbing is a sighted-pointer-only affordance.
 */
export function TrendChart({
  points,
  tone = "brand",
  height = 120,
  interactive = false,
  className,
  "aria-label": ariaLabel,
}: TrendChartProps) {
  const gradientId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (points.length < 2) return null;

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = VIEWBOX_WIDTH / (points.length - 1);
  const padding = height * 0.1;

  const coords = values.map((value, index) => ({
    x: index * stepX,
    y: height - padding - ((value - min) / range) * (height - padding * 2),
  }));

  const linePath = buildSmoothPath(coords);
  const areaPath = `${linePath} L ${VIEWBOX_WIDTH} ${height} L 0 ${height} Z`;
  const color = toneVar[tone];

  const active = activeIndex !== null ? points[activeIndex] : undefined;
  const activeCoord = activeIndex !== null ? coords[activeIndex] : undefined;

  function updateFromPointer(clientX: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    const index = Math.round(ratio * (points.length - 1));
    setActiveIndex(Math.min(Math.max(index, 0), points.length - 1));
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", interactive && "touch-none select-none", className)}
      onPointerMove={interactive ? (e) => updateFromPointer(e.clientX) : undefined}
      onPointerDown={interactive ? (e) => updateFromPointer(e.clientX) : undefined}
      onPointerLeave={interactive ? () => setActiveIndex(null) : undefined}
    >
      {/* Tooltip rides above the pinned point; clamped so it never clips
          at the chart's edges. */}
      {interactive && active && activeCoord && (
        <div
          className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-field border border-border/60 bg-surface-elevated px-2.5 py-1 text-xs shadow-card"
          style={{
            left: `clamp(2.5rem, ${(activeCoord.x / VIEWBOX_WIDTH) * 100}%, calc(100% - 2.5rem))`,
          }}
        >
          {active.date && (
            <span className="text-foreground-secondary">
              {formatTooltipDate(active.date)}{" · "}
            </span>
          )}
          <span className="font-display font-bold tabular-nums">{active.value}</span>
        </div>
      )}

      <svg
        role="img"
        aria-label={ariaLabel ?? "Trend chart"}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
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
        {interactive && activeCoord && (
          <line
            aria-hidden
            x1={activeCoord.x}
            y1={0}
            x2={activeCoord.x}
            y2={height}
            stroke={color}
            strokeOpacity={0.3}
            strokeWidth={1}
          />
        )}
      </svg>

      {/* The pinned dot is HTML, not SVG — the stretched viewBox
          (preserveAspectRatio="none") would distort a <circle> into an oval. */}
      {interactive && activeCoord && (
        <span
          aria-hidden
          className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background"
          style={{
            left: `${(activeCoord.x / VIEWBOX_WIDTH) * 100}%`,
            top: `${(activeCoord.y / height) * 100}%`,
            backgroundColor: color,
          }}
        />
      )}

      {interactive && (
        <ul className="sr-only">
          {points.map((point, index) => (
            <li key={point.date ?? index}>
              {point.date ? `${formatTooltipDate(point.date)}: ` : ""}
              {point.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
