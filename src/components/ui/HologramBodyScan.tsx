"use client";

import Image from "next/image";
import { useState } from "react";
import { resolveBodyScanAsset } from "@/utils/bodyScanResolver";
import type { BodyScanQueryParams } from "@/types/bodyScan";

export interface HologramBodyScanProps extends BodyScanQueryParams {
  className?: string;
  showHudBrackets?: boolean;
  showStatureBadge?: boolean;
  aspectRatio?: "3/4" | "1/1";
}

/**
 * PhysIQx AI — Holographic Body Scan Preview Component
 *
 * Renders high-fidelity holographic body scans with cybernetic neon HUD brackets,
 * bioluminescent glow, and automatic fallback resolution.
 */
export function HologramBodyScan({
  heightTier = "average",
  bodyShape,
  gender = "male",
  viewAngle = "front",
  className = "",
  showHudBrackets = true,
  showStatureBadge = false,
  aspectRatio = "3/4",
}: HologramBodyScanProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Resolve the best available asset metadata
  const assetMeta = resolveBodyScanAsset({
    heightTier,
    bodyShape,
    gender,
    viewAngle,
  });

  const aspectClass = aspectRatio === "1/1" ? "aspect-square" : "aspect-[3/4]";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-black/90 p-4 border border-[#00E676]/20 shadow-[0_0_30px_rgba(0,230,118,0.12)] ${aspectClass} ${className}`}
    >
      {/* Corner Cyber HUD Brackets */}
      {showHudBrackets && (
        <>
          <div className="absolute top-2 left-2 h-3 w-3 border-t-2 border-l-2 border-[#00E676]/60" />
          <div className="absolute top-2 right-2 h-3 w-3 border-t-2 border-r-2 border-[#00E676]/60" />
          <div className="absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-[#00E676]/60" />
          <div className="absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-[#00E676]/60" />
        </>
      )}

      {/* Stature Badge */}
      {showStatureBadge && (
        <div className="absolute top-3 right-3 z-10 rounded-full bg-black/80 px-2.5 py-0.5 text-[10px] font-mono tracking-wider text-[#00E676] border border-[#00E676]/30 uppercase backdrop-blur-md">
          {heightTier} • {bodyShape}
        </div>
      )}

      {/* Radial Glow Effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,230,118,0.15)_0%,transparent_70%)]" />

      {/* Main Image */}
      <div className="relative h-full w-full flex items-center justify-center">
        <Image
          src={assetMeta.url}
          alt={`Holographic body scan for ${bodyShape} (${heightTier} height)`}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className={`object-contain transition-all duration-500 ${
            isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
          onLoad={() => setIsLoading(false)}
          priority
        />
      </div>

      {/* Loading Skeleton Pulse */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="h-8 w-8 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
