/**
 * Icon strategy: Lucide only (docs/UI_Guideliness.md), sized exclusively from
 * this scale. Pass to the `size` prop: <Dumbbell size={iconSize.sm} />
 */
export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
} as const;

export type IconSize = keyof typeof iconSize;
