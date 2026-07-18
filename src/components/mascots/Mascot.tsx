import { cn } from "@/lib/utils";

/**
 * The mascot expression crops cut from the locked canon grids
 * (docs/MASCOTS.md). Kix appears at moments of effort and celebration,
 * Nyra at moments of standards and rest — never during input, never both
 * on one screen (the anti-Clippy law).
 */
export type MascotPose =
  | "kix-default"
  | "kix-focus"
  | "kix-joy"
  | "kix-sheepish"
  | "kix-worried"
  | "kix-proud"
  | "kix-determined"
  | "kix-asleep"
  | "nyra-stare"
  | "nyra-narrowed"
  | "nyra-closed"
  | "nyra-nod"
  | "nyra-tilt";

/** Natural height/width ratio of the source crops, per character. */
const ASPECT: Record<"kix" | "nyra", number> = {
  kix: 748 / 684,
  nyra: 780 / 543,
};

export interface MascotProps {
  pose: MascotPose;
  /** Display width in px (assets are 480px wide — keep size ≤ 240 for 2x). */
  size?: number;
  /** "circle" crops to a face medallion; "portrait" keeps the full bust. */
  shape?: "circle" | "portrait";
  className?: string;
  /** Mascots are decorative by default; pass alt text only when the image
   *  carries meaning the surrounding text doesn't. */
  alt?: string;
}

export function Mascot({
  pose,
  size = 96,
  shape = "portrait",
  className,
  alt = "",
}: MascotProps) {
  const character = pose.startsWith("kix") ? "kix" : "nyra";
  const height = shape === "circle" ? size : Math.round(size * ASPECT[character]);

  // Static bundled asset with exact dimensions — the Next Image pipeline
  // adds nothing here. Inline size is data-driven (same pattern as
  // CircularProgress) and defeats the img preflight's `height: auto`.
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/mascots/${pose}.webp`}
      alt={alt}
      aria-hidden={alt === "" || undefined}
      width={size}
      height={height}
      style={{ width: size, height }}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn(
        "select-none",
        // Faces sit in the upper half of every crop — bias the circle there
        shape === "circle" && "size-full object-cover object-[center_25%]",
        shape !== "circle" && className,
      )}
    />
  );

  if (shape !== "circle") return image;

  // Clip with an overflow wrapper rather than border-radius on the img —
  // radius on a filtered/composited image layer (e.g. inside the glow ring)
  // can fail to clip in some renderers.
  return (
    <span
      className={cn("inline-block overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
    >
      {image}
    </span>
  );
}
