"use client";

import { useState } from "react";
import { HologramBodyScan } from "@/components/ui/HologramBodyScan";
import type { BodyShapeCategory, HeightTier, ViewAngle, GenderVariant } from "@/types/bodyScan";
import { REGISTERED_BODY_SCANS } from "@/data/bodyScanRegistry";

export default function HologramDemoPage() {
  const [heightTier, setHeightTier] = useState<HeightTier>("average");
  const [bodyShape, setBodyShape] = useState<BodyShapeCategory>("athletic");
  const [gender, setGender] = useState<GenderVariant>("male");
  const [viewAngle, setViewAngle] = useState<ViewAngle>("front");

  const heightOptions: HeightTier[] = ["short", "average", "tall"];
  const genderOptions: GenderVariant[] = ["male", "female", "neutral"];
  const viewAngleOptions: ViewAngle[] = ["front", "side", "45deg", "icon"];
  const shapeOptions: BodyShapeCategory[] = [
    "lean",
    "athletic",
    "muscular",
    "powerful",
    "skinnyfat",
    "dadbod",
    "apple",
    "pear",
    "hourglass",
    "rectangular",
    "endomorph",
    "underweight",
    "average",
    "overweight",
  ];

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 font-sans flex flex-col items-center">
      {/* Header */}
      <header className="max-w-4xl w-full mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] via-emerald-400 to-teal-300">
          PhysIQx AI — Hologram Body Scan Scanner
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-400">
          Dynamic Asset Registry ({REGISTERED_BODY_SCANS.size} Certified AI Assets Loaded) • Smart Fallback Architecture
        </p>
      </header>

      {/* Main Grid */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Controls Panel */}
        <div className="md:col-span-6 bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl backdrop-blur-xl shadow-xl flex flex-col gap-6">
          {/* Height Tier Selection */}
          <div>
            <label className="block text-xs font-mono tracking-wider text-[#00E676] uppercase mb-2">
              1. Stature / Height Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {heightOptions.map((h) => (
                <button
                  key={h}
                  onClick={() => setHeightTier(h)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold capitalize border transition-all ${
                    heightTier === h
                      ? "bg-[#00E676] text-black border-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.4)]"
                      : "bg-zinc-800/80 text-gray-300 border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Variant */}
          <div>
            <label className="block text-xs font-mono tracking-wider text-[#00E676] uppercase mb-2">
              2. Gender Variant
            </label>
            <div className="grid grid-cols-3 gap-2">
              {genderOptions.map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold capitalize border transition-all ${
                    gender === g
                      ? "bg-[#00E676] text-black border-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.4)]"
                      : "bg-zinc-800/80 text-gray-300 border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* View Angle */}
          <div>
            <label className="block text-xs font-mono tracking-wider text-[#00E676] uppercase mb-2">
              3. Scanner View Angle
            </label>
            <div className="grid grid-cols-4 gap-2">
              {viewAngleOptions.map((v) => (
                <button
                  key={v}
                  onClick={() => setViewAngle(v)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold uppercase border transition-all ${
                    viewAngle === v
                      ? "bg-[#00E676] text-black border-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.4)]"
                      : "bg-zinc-800/80 text-gray-300 border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Body Shape / Starting Point */}
          <div>
            <label className="block text-xs font-mono tracking-wider text-[#00E676] uppercase mb-2">
              4. Body Shape Archetype
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {shapeOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setBodyShape(s)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize border transition-all text-left truncate ${
                    bodyShape === s
                      ? "bg-[#00E676] text-black border-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.4)]"
                      : "bg-zinc-800/80 text-gray-300 border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Hologram Scanner Screen */}
        <div className="md:col-span-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm">
            <HologramBodyScan
              heightTier={heightTier}
              bodyShape={bodyShape}
              gender={gender}
              viewAngle={viewAngle}
              showHudBrackets={true}
              showStatureBadge={true}
              aspectRatio={viewAngle === "icon" ? "1/1" : "3/4"}
            />
          </div>

          <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-gray-400 w-full max-w-sm">
            <p className="text-[#00E676]">✓ Active Resolution Query:</p>
            <p className="mt-1 text-gray-200">
              Height: <span className="text-white font-bold">{heightTier}</span> | Shape:{" "}
              <span className="text-white font-bold">{bodyShape}</span> | View:{" "}
              <span className="text-white font-bold">{viewAngle}</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
