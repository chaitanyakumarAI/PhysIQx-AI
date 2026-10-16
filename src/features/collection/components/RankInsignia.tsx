"use client";

import { useId } from "react";
import Image from "next/image";
import type { RankId } from "@/lib/gamification/levels";
import { artFor } from "../lib/badgeArt";
import { MATERIALS, RANK_MATERIAL } from "../lib/materials";
import { chevronPath, starPath } from "../lib/medalGeometry";
import type { MedalState } from "./Medal";
import { Aura, Gloss, MaterialDefs, medalBoxClass } from "./medal/parts";

const SHIELD = "M50 6L80 15.5V44C80 66.5 67.5 82.5 50 93C32.5 82.5 20 66.5 20 44V15.5Z";
/** The inner field: the shield, scaled about the centre. */
const FIELD = "translate(50 50) scale(0.8) translate(-50 -50)";
const CROWN = "M36.5 31L34.5 19.5L42.5 25L50 16.5L57.5 25L65.5 19.5L63.5 31Z";
const GEM = "M50 25L64 40L50 70L36 40Z";
const GEM_FACETS = "M36 40H64M43 40L50 25L57 40M43 40L50 70L57 40";
/** Three feathers off the shield's upper-left edge; mirrored for the right. */
const WING = [
  "M25 22C15 15.5 8 13.5 2.5 14.5C8 19.5 15.5 26.5 24.5 32Z",
  "M24.5 31C15.5 28 8.5 28.5 3.5 32C9.5 35 16.5 38.5 24 41Z",
  "M24 40.5C17.5 40.5 12 42.5 7.5 46.5C12.5 47.5 18 48.5 23.5 49.5Z",
];

interface Crest {
  chevrons: 0 | 1 | 2 | 3;
  crown?: boolean;
  wings?: "small" | "large";
  gem?: boolean;
  star?: boolean;
  /** A glowing core seam down the field. */
  seam?: boolean;
  /** Ray opacity behind the earned insignia. */
  rays?: number;
}

/**
 * Each rank adds to the crest (docs/ASSET_PROMPTS.md §2c): chevrons, then
 * wings, a crown, a diamond, an obsidian core, and the Legend's full regalia.
 */
const CRESTS: Record<RankId, Crest> = {
  rookie: { chevrons: 0 },
  iron: { chevrons: 1 },
  bronze: { chevrons: 2 },
  silver: { chevrons: 3, wings: "small" },
  gold: { chevrons: 3, crown: true },
  platinum: { chevrons: 3, crown: true, wings: "large", rays: 0.25 },
  diamond: { chevrons: 0, gem: true, wings: "large", rays: 0.35 },
  obsidian: { chevrons: 3, seam: true, rays: 0.3 },
  legend: { chevrons: 0, crown: true, wings: "large", star: true, seam: true, rays: 0.6 },
};

const CHEVRON_ROWS: Record<Crest["chevrons"], number[]> = { 0: [], 1: [44], 2: [38, 50], 3: [33, 44, 55] };

export interface RankInsigniaProps {
  rank: RankId;
  state: MedalState;
  /** Collectible id — looks up generated art when it exists. */
  artId?: string;
  size?: number;
  className?: string;
}

/**
 * A rank insignia: a heraldic shield struck in the rank's finish (iron to
 * obsidian), its crest growing with the rank. Ranks not reached yet are
 * unminted dark iron with the same crest, so the next one is something to
 * look at.
 */
export function RankInsignia({ rank, state, artId, size = 64, className }: RankInsigniaProps) {
  const id = useId().replace(/:/g, "");
  const earned = state === "earned";
  const art = earned && artId ? artFor(artId) : null;
  const material = MATERIALS[earned ? RANK_MATERIAL[rank] : "unminted"];
  const crest = CRESTS[rank];
  const relief = `url(#${id}-relief)`;
  const rows = CHEVRON_ROWS[crest.chevrons].map((y) => (crest.crown ? y + 4 : y));
  const wingScale = crest.wings === "small" ? "translate(24.5 32) scale(0.7) translate(-24.5 -32)" : undefined;

  return (
    <div className={medalBoxClass(state === "locked", className)} style={{ width: size, height: size }}>
      {earned && <Aura id={id} material={material} rays={crest.rays ?? 0} />}
      {art ? (
        <Image src={art} alt="" fill sizes={`${size}px`} className="relative object-contain" />
      ) : (
        <svg viewBox="0 0 100 100" className="relative size-full overflow-visible" aria-hidden>
          <MaterialDefs id={id} material={material} />
          {crest.wings &&
            [undefined, "translate(100 0) scale(-1 1)"].map((mirror) => (
              <g key={mirror ?? "left"} transform={mirror}>
                <g transform={wingScale}>
                  {WING.map((feather) => (
                    <path key={feather} d={feather} fill={`url(#${id}-rim)`} stroke={material.deep} strokeWidth="0.6" />
                  ))}
                </g>
              </g>
            ))}
          <path d={SHIELD} fill={`url(#${id}-rim)`} stroke={material.deep} strokeWidth="0.8" />
          <path d={SHIELD} transform={FIELD} fill={`url(#${id}-face)`} stroke={`url(#${id}-bevel)`} strokeWidth="3" />
          {crest.seam && (
            <g strokeLinecap="round">
              <path d="M50 18V84" stroke={material.accent} strokeOpacity={earned ? 0.35 : 0.1} strokeWidth="4" />
              <path d="M50 18V84" stroke={material.emblemLight} strokeOpacity={earned ? 0.9 : 0.3} strokeWidth="1.1" />
            </g>
          )}
          {crest.crown && (
            <g>
              <path d={CROWN} fill={relief} stroke={material.deep} strokeWidth="0.6" strokeLinejoin="round" />
              {[
                [34.5, 19.5],
                [50, 16.5],
                [65.5, 19.5],
              ].map(([cx, cy]) => (
                <circle key={cx} cx={cx} cy={cy} r="1.8" fill={material.emblemLight} stroke={material.deep} strokeWidth="0.4" />
              ))}
            </g>
          )}
          {rows.map((y) => (
            <path key={y} d={chevronPath(y)} fill={relief} stroke={material.deep} strokeWidth="0.6" strokeLinejoin="round" />
          ))}
          {crest.gem && (
            <g>
              <path d={GEM} fill={`url(#${id}-gem)`} stroke={material.deep} strokeWidth="0.6" strokeLinejoin="round" />
              <path d={GEM_FACETS} fill="none" stroke="#ffffff" strokeOpacity={earned ? 0.6 : 0.15} strokeWidth="0.7" />
            </g>
          )}
          {crest.star && (
            <path
              d={starPath(5, 15, 6.5)}
              transform="translate(0 6)"
              fill={relief}
              stroke={material.deep}
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
          )}
          {earned && <Gloss id={id} outline={<path d={SHIELD} />} sheen={false} />}
        </svg>
      )}
    </div>
  );
}
