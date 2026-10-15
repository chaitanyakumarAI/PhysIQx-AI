"use client";

import { useId } from "react";
import Image from "next/image";
import {
  Cake,
  CalendarCheck,
  CalendarRange,
  Compass,
  Dumbbell,
  FileUp,
  Flame,
  Gauge,
  Hammer,
  HeartPulse,
  Layers,
  LayoutGrid,
  Lock,
  Medal as MedalIcon,
  Mountain,
  RotateCcw,
  Route,
  Scale,
  ScanLine,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Weight,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CollectionIcon, Grade } from "@/lib/gamification/catalog";
import { artFor } from "../lib/badgeArt";

export const collectionIcons: Record<CollectionIcon, LucideIcon> = {
  dumbbell: Dumbbell,
  weight: Weight,
  trophy: Trophy,
  "calendar-check": CalendarCheck,
  flame: Flame,
  "heart-pulse": HeartPulse,
  route: Route,
  scale: Scale,
  medal: MedalIcon,
  gauge: Gauge,
  compass: Compass,
  layers: Layers,
  zap: Zap,
  sparkles: Sparkles,
  target: Target,
  scan: ScanLine,
  "file-up": FileUp,
  rotate: RotateCcw,
  grid: LayoutGrid,
  "calendar-range": CalendarRange,
  hammer: Hammer,
  cake: Cake,
  mountain: Mountain,
  shield: Shield,
};

/** Metallic ramps (light → mid → deep) and the glyph colour per grade. */
export const GRADE_STYLE: Record<Grade, { stops: [string, string, string]; glyph: string; glow: string }> = {
  bronze: { stops: ["#f3c093", "#c07a43", "#6e3d1c"], glyph: "#f0b27a", glow: "rgba(192,122,67,0.45)" },
  silver: { stops: ["#f6f8fa", "#b9c2cb", "#5d6873"], glyph: "#e3e8ee", glow: "rgba(185,194,203,0.4)" },
  gold: { stops: ["#fff0b8", "#e2b23c", "#8a5f10"], glyph: "#f6d36b", glow: "rgba(226,178,60,0.45)" },
  platinum: { stops: ["#effdff", "#9fdbe6", "#3f7f8c"], glyph: "#bff0f7", glow: "rgba(159,219,230,0.45)" },
  legendary: { stops: ["#f1e6ff", "#a78bfa", "#4c2f9c"], glyph: "#cdb8ff", glow: "rgba(167,139,250,0.55)" },
};

export type MedalState = "earned" | "progress" | "sealed" | "locked";

export interface MedalProps {
  grade: Grade;
  icon: CollectionIcon;
  state: MedalState;
  /** 0–1, drawn as an arc while in progress. */
  progress?: number;
  /** Shape: rank insignia are shields, everything else round. */
  shape?: "round" | "shield";
  /** Collectible id — looks up generated art when it exists. */
  artId?: string;
  size?: number;
  className?: string;
}

const SHIELD_PATH = "M50 4 L88 18 V48 C88 72 71 88 50 96 C29 88 12 72 12 48 V18 Z";

/**
 * A collection medal. Earned medals are metal (bronze → legendary violet)
 * with a soft glow; in-progress medals are dark with a green arc showing
 * how close they are; sealed ones show a lock (level-gated); locked ones
 * are quiet silhouettes. When generated art exists for this item it
 * replaces the vector face.
 */
export function Medal({
  grade,
  icon,
  state,
  progress = 0,
  shape = "round",
  artId,
  size = 72,
  className,
}: MedalProps) {
  const id = useId().replace(/:/g, "");
  const style = GRADE_STYLE[grade];
  const earned = state === "earned";
  const Icon = state === "sealed" ? Lock : collectionIcons[icon];
  const art = earned && artId ? artFor(artId) : null;
  const ring = earned ? `url(#ring-${id})` : "#2a302c";
  const arc = Math.max(0, Math.min(1, progress));
  const circumference = 2 * Math.PI * 44;

  return (
    <div
      className={cn("relative shrink-0", !earned && state !== "progress" && "opacity-60", className)}
      style={{ width: size, height: size }}
    >
      {earned && (
        <div
          aria-hidden
          className="absolute inset-[12%] rounded-full blur-xl"
          style={{ background: style.glow }}
        />
      )}
      {art ? (
        <Image src={art} alt="" fill sizes={`${size}px`} className="relative object-contain" />
      ) : (
        <svg viewBox="0 0 100 100" className="relative size-full" aria-hidden>
          <defs>
            <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={style.stops[0]} />
              <stop offset="45%" stopColor={style.stops[1]} />
              <stop offset="100%" stopColor={style.stops[2]} />
            </linearGradient>
            <radialGradient id={`face-${id}`} cx="35%" cy="28%" r="75%">
              <stop offset="0%" stopColor={earned ? "#1f2622" : "#161a17"} />
              <stop offset="100%" stopColor="#0b0e0c" />
            </radialGradient>
          </defs>
          {shape === "shield" ? (
            <>
              <path d={SHIELD_PATH} fill={ring} />
              <path d={SHIELD_PATH} fill={`url(#face-${id})`} transform="translate(50 52) scale(0.82) translate(-50 -52)" />
            </>
          ) : (
            <>
              <circle cx="50" cy="50" r="47" fill={ring} />
              <circle cx="50" cy="50" r="38" fill={`url(#face-${id})`} />
              {earned && (
                <circle cx="50" cy="50" r="42.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
              )}
              {state === "progress" && arc > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference * arc} ${circumference}`}
                  transform="rotate(-90 50 50)"
                />
              )}
            </>
          )}
          {earned && (
            <ellipse cx="38" cy="26" rx="20" ry="9" fill="rgba(255,255,255,0.10)" transform="rotate(-24 38 26)" />
          )}
        </svg>
      )}
      {!art && (
        <Icon
          aria-hidden
          strokeWidth={2.2}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: size * 0.34,
            height: size * 0.34,
            color: earned ? style.glyph : "#6b746e",
            marginTop: shape === "shield" ? size * 0.02 : 0,
          }}
        />
      )}
    </div>
  );
}
