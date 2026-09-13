import {
  isBodyScanRegistered,
} from "@/data/bodyScanRegistry";
import type {
  BodyScanAssetMeta,
  BodyScanQueryParams,
} from "@/types/bodyScan";

const DEFAULT_FALLBACK = "athletic_male_front.png";

/**
 * Resolves the best matching body shape hologram asset from public/body-shapes/
 * based on stature, physique, gender, and view angle.
 *
 * Implements a smart multi-tier fallback system so the frontend NEVER breaks or 404s
 * regardless of how many assets have been generated so far.
 */
export function resolveBodyScanAsset(
  params: BodyScanQueryParams
): BodyScanAssetMeta {
  const {
    heightTier = "average",
    bodyShape,
    gender = "male",
    viewAngle = "front",
  } = params;

  // Candidate 1: Exact Match (e.g. "short_lean_male_front.png")
  if (heightTier !== "average") {
    const candidateExact = `${heightTier}_${bodyShape}_${gender}_${viewAngle}.png`;
    if (isBodyScanRegistered(candidateExact)) {
      return {
        filename: candidateExact,
        url: `/body-shapes/${candidateExact}`,
        heightTier,
        bodyShape,
        gender,
        viewAngle,
        isExactMatch: true,
      };
    }
  }

  // Candidate 2: Average Height Prefix (e.g. "average_lean_male_front.png")
  const candidateAveragePrefix = `average_${bodyShape}_${gender}_${viewAngle}.png`;
  if (isBodyScanRegistered(candidateAveragePrefix)) {
    return {
      filename: candidateAveragePrefix,
      url: `/body-shapes/${candidateAveragePrefix}`,
      heightTier: "average",
      bodyShape,
      gender,
      viewAngle,
      isExactMatch: heightTier === "average",
    };
  }

  // Candidate 3: Standard Base Filename (e.g. "lean_male_front.png" or "skinnyfat_male_front.png")
  const candidateBase = `${bodyShape}_${gender}_${viewAngle}.png`;
  if (isBodyScanRegistered(candidateBase)) {
    return {
      filename: candidateBase,
      url: `/body-shapes/${candidateBase}`,
      heightTier: "average",
      bodyShape,
      gender,
      viewAngle,
      isExactMatch: heightTier === "average",
    };
  }

  // Candidate 4: Neutral Icon Fallback if icon view angle requested
  if (viewAngle === "icon") {
    // 4a. Exact height-aware icon (e.g. "tall_lean_neutral_icon.png")
    if (heightTier !== "average") {
      const candidateHeightIcon = `${heightTier}_${bodyShape}_neutral_icon.png`;
      if (isBodyScanRegistered(candidateHeightIcon)) {
        return {
          filename: candidateHeightIcon,
          url: `/body-shapes/${candidateHeightIcon}`,
          heightTier,
          bodyShape,
          gender: "neutral",
          viewAngle: "icon",
          isExactMatch: true,
        };
      }
    }

    // 4b. Base icon (e.g. "lean_neutral_icon.png" or "apple_neutral_icon.png")
    const candidateIcon = `${bodyShape}_neutral_icon.png`;
    if (isBodyScanRegistered(candidateIcon)) {
      return {
        filename: candidateIcon,
        url: `/body-shapes/${candidateIcon}`,
        heightTier: "average",
        bodyShape,
        gender: "neutral",
        viewAngle: "icon",
        isExactMatch: heightTier === "average",
      };
    }
  }

  // Candidate 5: Category Fallback (Direct real archetype mappings)
  const categoryFallbackMap: Record<string, string> = {
    skinnyfat: "skinnyfat_male_front.png",
    dadbod: "dadbod_male_front.png",
    apple: "apple_male_front.png",
    pear: "pear_female_front.png",
    hourglass: "hourglass_female_front.png",
    rectangular: "rectangular_male_front.png",
    endomorph: "endomorph_male_front.png",
    underweight: "current_underweight_front.png",
    average: "current_average_front.png",
    overweight: "current_overweight_front.png",
  };

  const candidateMapped = categoryFallbackMap[bodyShape];
  if (candidateMapped && isBodyScanRegistered(candidateMapped)) {
    return {
      filename: candidateMapped,
      url: `/body-shapes/${candidateMapped}`,
      heightTier: "average",
      bodyShape,
      gender,
      viewAngle: "front",
      isExactMatch: false,
    };
  }

  // Candidate 6: Ultimate Fallback (Guaranteed to exist)
  return {
    filename: DEFAULT_FALLBACK,
    url: `/body-shapes/${DEFAULT_FALLBACK}`,
    heightTier: "average",
    bodyShape: "athletic",
    gender: "male",
    viewAngle: "front",
    isExactMatch: false,
  };
}
