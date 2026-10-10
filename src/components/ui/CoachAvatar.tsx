"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { m } from "framer-motion";
import { Flame, Activity } from "lucide-react";
import { getCoachProfile } from "@/data/coachContent";
import type { CoachId, CoachExpression } from "@/types/coach";
import { cn } from "@/lib/utils";

export interface CoachAvatarProps {
  coachId: CoachId;
  expression?: CoachExpression;
  isSpeaking?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  showWaveform?: boolean;
  showGlow?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { container: "size-10", image: 40, icon: 12 },
  md: { container: "size-14", image: 56, icon: 14 },
  lg: { container: "size-20", image: 80, icon: 18 },
  xl: { container: "size-28", image: 112, icon: 22 },
};

/**
 * Animated Tactical Coach Avatar for Kix and Nyra.
 * Implements low-FPS (~3-5 FPS) expression frame-flipping,
 * subtle conversational gesturing (head bob, breathing float),
 * and an active comms waveform pulse.
 */
export function CoachAvatar({
  coachId,
  expression = "default",
  isSpeaking = false,
  size = "md",
  showWaveform = false,
  showGlow = true,
  className,
}: CoachAvatarProps) {
  const profile = getCoachProfile(coachId);
  const sizeConfig = SIZE_MAP[size];

  // Alternating expression frame for low-FPS talking animation
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (!isSpeaking) {
      setFrameIndex(0);
      return;
    }

    // Low-FPS frame cycle (~3.5 FPS = 350ms tick)
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % 3);
    }, 380);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Determine which expression frame to show
  let currentExpression: CoachExpression = expression;
  if (isSpeaking) {
    if (coachId === "kix") {
      const speechCycle: CoachExpression[] = [expression, "intense", "analytical"];
      currentExpression = speechCycle[frameIndex] ?? expression;
    } else {
      const speechCycle: CoachExpression[] = [expression, "analytical", "calm"];
      currentExpression = speechCycle[frameIndex] ?? expression;
    }
  }

  const imageSrc =
    profile.avatarFrames[currentExpression] ??
    profile.avatarFrames[expression] ??
    profile.avatarFrames.default;

  const isKix = coachId === "kix";
  const accentColor = isKix ? "border-emerald-500/70" : "border-cyan-500/70";
  const glowShadow = isKix
    ? "shadow-[0_0_18px_rgba(16,185,129,0.35)]"
    : "shadow-[0_0_18px_rgba(6,182,212,0.35)]";

  return (
    <div className={cn("relative inline-flex flex-col items-center select-none", className)}>
      {/* Outer Tactical Bracket Frame with Gestural Physics */}
      <m.div
        animate={
          isSpeaking
            ? {
                y: [0, -3.5, 0.5, -2, 0],
                rotate: isKix ? [0, -2, 1.5, -0.5, 0] : [0, 2, -1.5, 0.5, 0],
                scale: [1, 1.03, 0.99, 1.02, 1],
              }
            : {
                y: [0, -1.5, 0],
                rotate: 0,
                scale: 1,
              }
        }
        transition={{
          duration: isSpeaking ? 1.5 : 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 bg-surface-elevated transition-colors",
          sizeConfig.container,
          accentColor,
          showGlow && isSpeaking && glowShadow,
        )}
      >
        {/* Subtle scanline / holographic background overlay */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 opacity-20 bg-gradient-to-b",
            profile.glowClass,
          )}
        />

        {/* Coach Portrait */}
        <Image
          src={imageSrc}
          alt={`${profile.name} - ${profile.role}`}
          width={sizeConfig.image}
          height={sizeConfig.image}
          className="size-full object-cover object-top"
          priority={size === "lg" || size === "xl"}
        />

        {/* Tactical HUD Corner Brackets */}
        <span
          className={cn(
            "absolute top-1 left-1 size-1.5 border-t border-l",
            isKix ? "border-emerald-400" : "border-cyan-400",
          )}
        />
        <span
          className={cn(
            "absolute bottom-1 right-1 size-1.5 border-b border-r",
            isKix ? "border-emerald-400" : "border-cyan-400",
          )}
        />
      </m.div>

      {/* Floating Tactical Gesture Badge (Bobs when speaking) */}
      {isSpeaking && (size === "md" || size === "lg" || size === "xl") && (
        <m.div
          animate={{
            scale: [0.9, 1.15, 0.95, 1],
            rotate: isKix ? [-5, 5, -3, 0] : [0, 4, -4, 0],
            y: [0, -2, 1, 0],
          }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "absolute -bottom-1 -right-1 z-20 flex items-center justify-center rounded-full border shadow-md",
            isKix
              ? "border-emerald-400/80 bg-emerald-950/90 text-emerald-400"
              : "border-cyan-400/80 bg-cyan-950/90 text-cyan-400",
            size === "md" ? "size-5" : "size-6",
          )}
          title={isKix ? "Kinetic Drive Active" : "Telemetry Telecast Active"}
        >
          {isKix ? (
            <Flame size={sizeConfig.icon} aria-hidden />
          ) : (
            <Activity size={sizeConfig.icon} aria-hidden />
          )}
        </m.div>
      )}

      {/* Comms Audio Waveform Equalizer */}
      {showWaveform && isSpeaking && (
        <div className="mt-1.5 flex items-center gap-0.5" aria-hidden>
          {[0.4, 0.9, 0.6, 1, 0.5].map((scale, i) => (
            <m.span
              key={i}
              animate={{
                height: ["4px", `${Math.round(14 * scale)}px`, "4px"],
              }}
              transition={{
                duration: 0.5 + i * 0.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={cn(
                "w-0.5 rounded-full",
                isKix ? "bg-emerald-400" : "bg-cyan-400",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
