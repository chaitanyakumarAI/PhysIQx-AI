"use client";

import { useId } from "react";
import Image from "next/image";
import type { CollectionIcon, Grade } from "@/lib/gamification/catalog";
import { artFor } from "../lib/badgeArt";
import { GRADE_MATERIAL, MATERIALS, type Material } from "../lib/materials";
import {
  arcPoints,
  facets,
  polygonPath,
  ringPoints,
  rosettePath,
  smallStarPath,
  starPath,
  sunburstPath,
} from "../lib/medalGeometry";
import { collectionIcons } from "./medal/icons";
import { Aura, Emblem, Gloss, MaterialDefs, medalBoxClass, ProgressRing, SealedTag, TopGem } from "./medal/parts";

export type MedalState = "earned" | "progress" | "sealed" | "locked";

export interface MedalProps {
  grade: Grade;
  icon: CollectionIcon;
  state: MedalState;
  /** 0–1, drawn as a ring while in progress. */
  progress?: number;
  /** The level a sealed medal waits for, shown on its padlock. */
  sealedLevel?: number;
  /** Collectible id — looks up generated art when it exists. */
  artId?: string;
  size?: number;
  className?: string;
}

/**
 * The rim gets more elaborate with every tier, so a medal visibly levels
 * up: a plain coin, a beaded edge, a rosette, a cut gem, a star crest.
 */
const TIER_SHAPE = {
  bronze: "coin",
  silver: "beaded",
  gold: "rosette",
  platinum: "faceted",
  legendary: "crest",
} as const satisfies Record<Grade, string>;

const TIER_STARS: Record<Grade, number> = { bronze: 1, silver: 2, gold: 3, platinum: 4, legendary: 5 };
/** Faint rays behind the top tiers. */
const TIER_RAYS: Record<Grade, number> = { bronze: 0, silver: 0, gold: 0, platinum: 0.35, legendary: 0.6 };

const FACE_RADIUS = 35.5;
const EMBLEM_SIZE = 38;
/** In progress, the medal sits inside the ring. */
const PROGRESS_SCALE = 0.82;
/** Fine ornament only where it can be seen. */
const LAUREL_MIN_SIZE = 56;
const STARS_MIN_SIZE = 96;
const COMPACT_TAG_BELOW = 56;

/** The outer outline per tier, also used for the glint. */
function outlineFor(shape: (typeof TIER_SHAPE)[Grade]) {
  switch (shape) {
    case "coin":
      return <circle cx="50" cy="50" r="45" />;
    case "beaded":
      return <circle cx="50" cy="50" r="43" />;
    case "rosette":
      return <path d={rosettePath(18, 43.5, 47.5)} transform="translate(50 50) scale(0.97) translate(-50 -50)" />;
    case "faceted":
      return <path d={polygonPath(12, 46.5)} />;
    case "crest":
      return <circle cx="50" cy="50" r="41.5" />;
  }
}

function Rim({ id, shape, material }: { id: string; shape: (typeof TIER_SHAPE)[Grade]; material: Material }) {
  const fill = `url(#${id}-rim)`;
  const edge = { stroke: material.deep, strokeWidth: 0.8, strokeOpacity: 0.9 };
  switch (shape) {
    case "coin":
      return (
        <g>
          <circle cx="50" cy="50" r="46" fill={fill} {...edge} />
          {/* A reeded edge, like a struck coin. */}
          <path d={sunburstPath(72, 43.2, 45.6)} stroke={material.deep} strokeOpacity="0.35" strokeWidth="0.6" />
        </g>
      );
    case "beaded":
      return (
        <g>
          {ringPoints(30, 45.2).map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.7" fill={fill} {...edge} strokeWidth={0.5} />
          ))}
          <circle cx="50" cy="50" r="43.4" fill={fill} {...edge} />
        </g>
      );
    case "rosette":
      return <path d={rosettePath(18, 43.5, 47.5)} fill={fill} {...edge} />;
    case "faceted":
      return (
        <g>
          <path d={polygonPath(12, 48)} fill={fill} {...edge} />
          {facets(12, 48, 41.5).map((facet) => (
            <path
              key={facet.d}
              d={facet.d}
              fill={facet.shade > 0 ? "#ffffff" : "#000000"}
              opacity={Math.abs(facet.shade) * (facet.shade > 0 ? 0.28 : 0.32)}
            />
          ))}
        </g>
      );
    case "crest":
      return (
        <g>
          <path d={starPath(8, 49, 39.5)} fill={fill} {...edge} />
          <circle cx="50" cy="50" r="42.5" fill={fill} {...edge} />
        </g>
      );
  }
}

/** Violet veins in the legendary obsidian. */
function Veins({ color }: { color: string }) {
  const veins = "M17 32Q22 35 21 40M83 32Q78 36 80 41M27 82Q31 77 36 78M73 82Q69 77 64 79M44 9Q47 13 45 16M56 91Q53 87 55 84";
  return (
    <g fill="none" strokeLinecap="round">
      <path d={veins} stroke={color} strokeOpacity="0.35" strokeWidth="2.6" />
      <path d={veins} stroke="#f5f0ff" strokeOpacity="0.85" strokeWidth="0.8" />
    </g>
  );
}

function Laurels({ id, material }: { id: string; material: Material }) {
  const branches = [arcPoints(5, 40.6, 1.95, 2.86), arcPoints(5, 40.6, 1.19, 0.28)];
  return (
    <g>
      {branches.flatMap((leaves, side) =>
        leaves.map((leaf, index) => {
          const tilt = (index % 2 === 0 ? 1 : -1) * (side === 0 ? 30 : -30);
          return (
            <ellipse
              key={`${side}-${index}`}
              cx={leaf.x}
              cy={leaf.y}
              rx="3.2"
              ry="1.35"
              fill={`url(#${id}-relief)`}
              stroke={material.deep}
              strokeWidth="0.35"
              transform={`rotate(${leaf.tangent + tilt} ${leaf.x} ${leaf.y})`}
            />
          );
        }),
      )}
    </g>
  );
}

function TierStars({ id, count, material }: { id: string; count: number; material: Material }) {
  const spread = (count - 1) * 0.105;
  return (
    <g>
      {arcPoints(count, 40.8, Math.PI / 2 + spread, Math.PI / 2 - spread).map((star) => (
        <path
          key={`${star.x}-${star.y}`}
          d={smallStarPath(star.x, star.y, 2.5, 1.05)}
          fill={`url(#${id}-relief)`}
          stroke={material.deep}
          strokeWidth="0.35"
        />
      ))}
    </g>
  );
}

/**
 * A collection medal. Earned medals are struck in their tier's metal, with
 * an emblem in relief and ornament that grows with the tier (laurels from
 * gold, a jewel from platinum). Anything not earned yet is unminted dark
 * iron in its tier's shape — in progress inside a green ring, sealed with a
 * padlock showing the level it waits for. Generated art, when registered,
 * replaces the vector medal.
 */
export function Medal({
  grade,
  icon,
  state,
  progress = 0,
  sealedLevel,
  artId,
  size = 72,
  className,
}: MedalProps) {
  const id = useId().replace(/:/g, "");
  const earned = state === "earned";
  const art = earned && artId ? artFor(artId) : null;
  const material = MATERIALS[earned ? GRADE_MATERIAL[grade] : "unminted"];
  const shape = TIER_SHAPE[grade];
  const fancy = grade === "gold" || grade === "platinum" || grade === "legendary";
  const scale = state === "progress" ? PROGRESS_SCALE : 1;

  return (
    <div className={medalBoxClass(state === "locked", className)} style={{ width: size, height: size }}>
      {earned && <Aura id={id} material={material} rays={TIER_RAYS[grade]} />}
      {art ? (
        <Image src={art} alt="" fill sizes={`${size}px`} className="relative object-contain" />
      ) : (
        <svg viewBox="0 0 100 100" className="relative size-full overflow-visible" aria-hidden>
          <MaterialDefs id={id} material={material} />
          {state === "progress" && <ProgressRing value={progress} />}
          <g transform={scale === 1 ? undefined : `translate(50 50) scale(${scale}) translate(-50 -50)`}>
            <Rim id={id} shape={shape} material={material} />
            {earned && grade === "legendary" && <Veins color={material.accent} />}
            <circle cx="50" cy="50" r={FACE_RADIUS + 1.6} fill="none" stroke={`url(#${id}-bevel)`} strokeWidth="3" />
            <circle cx="50" cy="50" r={FACE_RADIUS} fill={`url(#${id}-face)`} />
            {earned && fancy ? (
              <g stroke={material.light} fill="none">
                <path d={sunburstPath(48, 21.5, 33.5)} strokeOpacity="0.09" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="21" strokeOpacity="0.16" strokeWidth="0.7" />
              </g>
            ) : (
              <circle cx="50" cy="50" r="31.5" fill="none" stroke={material.light} strokeOpacity="0.12" strokeWidth="0.6" />
            )}
            <Emblem Icon={collectionIcons[icon]} id={id} size={EMBLEM_SIZE} engraved={!earned} />
            {earned && fancy && grade !== "legendary" && size >= LAUREL_MIN_SIZE && (
              <Laurels id={id} material={material} />
            )}
            {size >= STARS_MIN_SIZE && earned && <TierStars id={id} count={TIER_STARS[grade]} material={material} />}
            {earned && (grade === "platinum" || grade === "legendary") && <TopGem id={id} y={grade === "legendary" ? 4.5 : 5.5} />}
            {earned && <Gloss id={id} outline={outlineFor(shape)} />}
          </g>
          {state === "sealed" && <SealedTag level={sealedLevel} compact={size < COMPACT_TAG_BELOW} />}
        </svg>
      )}
    </div>
  );
}
