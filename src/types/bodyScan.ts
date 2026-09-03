export type HeightTier = "short" | "average" | "tall";

export type BodyShapeCategory =
  | "lean"
  | "athletic"
  | "muscular"
  | "powerful"
  | "skinnyfat"
  | "dadbod"
  | "apple"
  | "pear"
  | "hourglass"
  | "rectangular"
  | "endomorph"
  | "underweight"
  | "average"
  | "overweight";

export type GenderVariant = "male" | "female" | "neutral";

export type ViewAngle = "front" | "side" | "45deg" | "icon";

export interface BodyScanQueryParams {
  heightTier?: HeightTier;
  bodyShape: BodyShapeCategory;
  gender?: GenderVariant;
  viewAngle?: ViewAngle;
}

export interface BodyScanAssetMeta {
  filename: string;
  url: string;
  heightTier: HeightTier;
  bodyShape: BodyShapeCategory;
  gender: GenderVariant;
  viewAngle: ViewAngle;
  isExactMatch: boolean;
}
