import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Material } from "../../lib/materials";
import { raysPath } from "../../lib/medalGeometry";

/**
 * Shared layers for the vector medals and rank insignia (100 × 100 box).
 * Gradient ids are prefixed per instance: `${id}-rim`, `${id}-face`…
 */

export function MaterialDefs({ id, material }: { id: string; material: Material }) {
  return (
    <defs>
      {/* Brushed metal: highlight top-left, a dark band, a soft return. */}
      <linearGradient id={`${id}-rim`} x1="0.15" y1="0" x2="0.85" y2="1">
        <stop offset="0" stopColor={material.light} />
        <stop offset="0.38" stopColor={material.mid} />
        <stop offset="0.7" stopColor={material.deep} />
        <stop offset="1" stopColor={material.mid} />
      </linearGradient>
      {/* The face sits recessed: its edge is shadowed top-left, lit bottom-right. */}
      <linearGradient id={`${id}-bevel`} x1="0.15" y1="0" x2="0.85" y2="1">
        <stop offset="0" stopColor={material.deep} />
        <stop offset="1" stopColor={material.light} stopOpacity="0.85" />
      </linearGradient>
      <radialGradient id={`${id}-face`} cx="0.38" cy="0.3" r="0.85">
        <stop offset="0" stopColor={material.faceInner} />
        <stop offset="1" stopColor={material.faceOuter} />
      </radialGradient>
      {/* In the icon's own 24-unit space, so straight strokes still get paint. */}
      <linearGradient id={`${id}-emblem`} gradientUnits="userSpaceOnUse" x1="4" y1="2" x2="20" y2="23">
        <stop offset="0" stopColor={material.emblemLight} />
        <stop offset="1" stopColor={material.emblemDeep} />
      </linearGradient>
      <linearGradient id={`${id}-relief`} x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0" stopColor={material.emblemLight} />
        <stop offset="1" stopColor={material.emblemDeep} />
      </linearGradient>
      <linearGradient id={`${id}-spec`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="0.42" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-gem`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.45" stopColor={material.emblemDeep} />
        <stop offset="1" stopColor={material.deep} />
      </linearGradient>
    </defs>
  );
}

/** The emblem in relief: a drop shadow under a metal stroke (or engraved, when unearned). */
export function Emblem({
  Icon,
  id,
  size,
  engraved,
}: {
  Icon: LucideIcon;
  id: string;
  /** Box size in medal units, centred on the medal. */
  size: number;
  engraved: boolean;
}) {
  const at = 50 - size / 2;
  return (
    <>
      <Icon
        x={at}
        y={at + (engraved ? -0.9 : 1.4)}
        width={size}
        height={size}
        color={engraved ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.55)"}
        strokeWidth={3.2}
        aria-hidden
      />
      {engraved && (
        <Icon x={at} y={at + 0.8} width={size} height={size} color="rgba(255,255,255,0.06)" strokeWidth={2.7} aria-hidden />
      )}
      <Icon x={at} y={at} width={size} height={size} color={`url(#${id}-emblem)`} strokeWidth={2.6} aria-hidden />
    </>
  );
}

/** A glint along the top-left of the outline and a soft sheen on the face. */
export function Gloss({ id, outline, sheen = true }: { id: string; outline: React.ReactElement; sheen?: boolean }) {
  return (
    <g aria-hidden pointerEvents="none">
      <g fill="none" stroke={`url(#${id}-spec)`} strokeWidth="1.3">
        {outline}
      </g>
      {sheen && <ellipse cx="40" cy="30" rx="21" ry="9.5" fill="#ffffff" opacity="0.07" transform="rotate(-26 40 30)" />}
    </g>
  );
}

/** A cut jewel set into the top of the rim (platinum and legendary). */
export function TopGem({ id, y = 5.5 }: { id: string; y?: number }) {
  return (
    <g>
      <path d={`M50 ${y - 5}L55 ${y}L50 ${y + 6}L45 ${y}Z`} fill={`url(#${id}-gem)`} stroke="rgba(0,0,0,0.45)" strokeWidth="0.6" />
      <path d={`M45 ${y}H55M50 ${y - 5}V${y + 6}`} stroke="#ffffff" strokeOpacity="0.55" strokeWidth="0.5" />
    </g>
  );
}

/** The green track around a medal that's in progress (Apple Fitness-style). */
export function ProgressRing({ value }: { value: number }) {
  const radius = 47.5;
  const circumference = 2 * Math.PI * radius;
  const arc = Math.max(0, Math.min(1, value));
  return (
    <g>
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="3.4" />
      {arc > 0 && (
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeDasharray={`${circumference * arc} ${circumference}`}
          transform="rotate(-90 50 50)"
        />
      )}
    </g>
  );
}

/** A level-gated badge's padlock tag, with the level when there's room. */
export function SealedTag({ level, compact }: { level?: number; compact: boolean }) {
  const width = compact || level === undefined ? 20 : 38;
  const x = 50 - width / 2;
  const lockX = compact || level === undefined ? 45.5 : x + 6;
  return (
    <g>
      <rect x={x} y="78" width={width} height="17" rx="8.5" fill="#0b0e0c" stroke="#465049" strokeWidth="1.2" />
      <path
        d={`M${lockX + 2} 85.6V84a2.5 2.5 0 0 1 5 0v1.6`}
        fill="none"
        stroke="#c9d1cc"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x={lockX + 0.6} y="85.4" width="7.8" height="6" rx="1.3" fill="#c9d1cc" />
      {!compact && level !== undefined && (
        <text x={x + width - 11.5} y="90.6" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#c9d1cc">
          {level}
        </text>
      )}
    </g>
  );
}

/** Light behind an earned piece; top tiers also throw rays. */
export function Aura({ id, material, rays }: { id: string; material: Material; rays: number }) {
  if (!material.glow) return null;
  return (
    <>
      <div aria-hidden className="absolute inset-[12%] rounded-full blur-xl" style={{ background: material.glow }} />
      {rays > 0 && (
        <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-[-22%] size-[144%]" style={{ opacity: rays }}>
          <defs>
            <radialGradient id={`${id}-aura`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.3" stopColor={material.accent} stopOpacity="0.9" />
              <stop offset="1" stopColor={material.accent} stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d={raysPath(16, 18, 50, 0.07)} fill={`url(#${id}-aura)`} />
        </svg>
      )}
    </>
  );
}

export function medalBoxClass(locked: boolean, className?: string) {
  return cn("relative shrink-0", locked && "opacity-55", className);
}
