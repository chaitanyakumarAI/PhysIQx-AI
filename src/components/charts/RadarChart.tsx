import { useId } from "react";
import { cn } from "@/lib/utils";

export interface RadarChartPoint {
  id: string;
  label: string;
  /** 0–100 */
  value: number;
}

export interface RadarChartProps {
  points: RadarChartPoint[];
  size?: number;
  className?: string;
}

const RINGS = [0.5, 1];

function axisAngle(index: number, count: number): number {
  return -Math.PI / 2 + index * ((Math.PI * 2) / count);
}

function vertexAt(
  index: number,
  count: number,
  radiusRatio: number,
  center: number,
  radius: number,
): { x: number; y: number } {
  const angle = axisAngle(index, count);
  return {
    x: center + radius * radiusRatio * Math.cos(angle),
    y: center + radius * radiusRatio * Math.sin(angle),
  };
}

function toPolygonAttr(vertices: { x: number; y: number }[]): string {
  return vertices.map((v) => `${v.x},${v.y}`).join(" ");
}

/**
 * Generic N-axis radar/polygon chart (used with 6 axes for Body Balance).
 * A hidden text list carries the actual axis:value data for screen readers —
 * the SVG geometry itself conveys nothing a non-visual user could act on.
 */
export function RadarChart({ points, size = 220, className }: RadarChartProps) {
  const titleId = useId();
  const gradientId = useId();
  const center = size / 2;
  const radius = size / 2 - size * 0.22; // leave room for labels
  const count = points.length;

  if (count < 3) return null;

  const dataVertices = points.map((point, index) =>
    vertexAt(index, count, Math.max(point.value, 0) / 100, center, radius),
  );

  return (
    <div className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        role="img"
        aria-labelledby={titleId}
        className="mx-auto"
      >
        <title id={titleId}>{`Body balance across ${count} dimensions`}</title>

        <defs>
          {/* Top-lit gradient fill — matches the lit-from-above card system. */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0.06} />
          </linearGradient>
        </defs>

        {RINGS.map((ratio) => (
          <polygon
            key={ratio}
            points={toPolygonAttr(
              points.map((_, index) =>
                vertexAt(index, count, ratio, center, radius),
              ),
            )}
            className="fill-none stroke-border"
            strokeWidth={1}
          />
        ))}

        {points.map((_, index) => {
          const outer = vertexAt(index, count, 1, center, radius);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              className="stroke-border"
              strokeWidth={1}
            />
          );
        })}

        <polygon
          points={toPolygonAttr(dataVertices)}
          fill={`url(#${gradientId})`}
          className="stroke-brand drop-shadow-[0_0_6px_rgb(34_197_94/0.35)]"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {points.map((point, index) => {
          const labelPos = vertexAt(index, count, 1.28, center, radius);
          const anchor =
            labelPos.x > center + 4
              ? "start"
              : labelPos.x < center - 4
                ? "end"
                : "middle";
          const baseline =
            labelPos.y > center + 4
              ? "hanging"
              : labelPos.y < center - 4
                ? "auto"
                : "middle";

          return (
            <text
              key={point.id}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor={anchor}
              dominantBaseline={baseline}
              className="fill-foreground-secondary text-[11px]"
            >
              {point.label}
            </text>
          );
        })}
      </svg>

      <ul className="sr-only">
        {points.map((point) => (
          <li key={point.id}>
            {point.label}: {point.value} of 100
          </li>
        ))}
      </ul>
    </div>
  );
}
