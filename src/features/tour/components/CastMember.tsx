"use client";

import { memo, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, m, useAnimationControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { stageImageFor, type CastPose } from "../script";
import { CAST, type CastBox } from "../stage";
import {
  ENTER,
  ENTER_REDUCED,
  EXIT,
  EXIT_REDUCED,
  IDLE,
  OFFSTAGE,
  reactionFor,
  ROLE,
  ROLE_TRANSITION,
  TALKING,
  type CastRole,
} from "../castMotion";

interface CastMemberProps {
  pose: CastPose;
  role: CastRole;
  /** Changes with every line; a new cue replays the speaker's reaction. */
  cue: string;
  /** Their line is still typing out. */
  talking: boolean;
  leaving: boolean;
  box: CastBox;
  reducedMotion: boolean;
}

/**
 * One character on the tour stage, chest-up and anchored to a bottom
 * corner. Layers, outside in: entrance/exit → speaking/listening → idle or
 * talking loop → per-line reaction → the cross-fading render.
 */
export const CastMember = memo(function CastMember({
  pose,
  role,
  cue,
  talking,
  leaving,
  box,
  reducedMotion,
}: CastMemberProps) {
  const { speaker } = pose;
  const left = CAST[speaker].side === "left";
  const reaction = useAnimationControls();
  const src = stageImageFor(pose);

  useEffect(() => {
    if (role === "speaking" && !reducedMotion) void reaction.start(reactionFor(pose));
  }, [cue, role, pose, reducedMotion, reaction]);

  const presence = leaving
    ? reducedMotion
      ? EXIT_REDUCED
      : EXIT[speaker]
    : reducedMotion
      ? ENTER_REDUCED
      : ENTER[speaker];

  return (
    <m.div
      aria-hidden
      className={cn(
        "absolute",
        left ? "origin-bottom-left" : "origin-bottom-right",
        role === "speaking" ? "z-10" : "z-0",
      )}
      style={left ? { left: box.inset, bottom: box.bottom } : { right: box.inset, bottom: box.bottom }}
      initial={reducedMotion ? { opacity: 0 } : OFFSTAGE[speaker]}
      animate={presence}
    >
      <m.div
        className={cn("relative", left ? "origin-bottom-left" : "origin-bottom-right")}
        initial={false}
        animate={{ ...ROLE[role], width: box.width, height: box.height }}
        transition={ROLE_TRANSITION}
      >
        <m.div className="size-full" animate={reducedMotion ? undefined : talking ? TALKING[speaker] : IDLE[speaker]}>
          <m.div className="relative size-full origin-bottom" animate={reaction}>
            {/* Each character's one light source (MASCOTS.md): Kix's gloves
                light the floor; Nyra's eyes glow from the dark. */}
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                role === "speaking" ? "opacity-100" : "opacity-0",
                speaker === "kix"
                  ? "bg-[radial-gradient(ellipse_75%_40%_at_50%_100%,rgb(34_197_94/0.32),transparent_70%)]"
                  : "bg-[radial-gradient(ellipse_60%_38%_at_50%_44%,rgb(34_197_94/0.2),transparent_70%)]",
              )}
            />
            <div className={cn("absolute inset-0", speaker === "nyra" ? "cast-fade-emerge" : "cast-fade")}>
              <AnimatePresence initial={false}>
                <m.div
                  key={src}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized
                    priority
                    draggable={false}
                    className="select-none object-cover object-bottom"
                  />
                </m.div>
              </AnimatePresence>
            </div>
          </m.div>
        </m.div>
      </m.div>
    </m.div>
  );
});
