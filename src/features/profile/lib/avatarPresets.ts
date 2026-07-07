/**
 * The 8 built-in avatars: gradient marks with the user's initials —
 * weightless (pure CSS, no image assets) and on-palette. Replaceable
 * default content: swap for illustrated avatars whenever design supplies
 * them; ids are stable so persisted picks survive a art swap.
 */
export interface AvatarPreset {
  id: string;
  label: string;
  /** Tailwind gradient classes applied over Avatar's base styles. */
  className: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "forest", label: "Forest", className: "bg-gradient-to-br from-brand to-brand-strong text-zinc-950" },
  { id: "mint", label: "Mint", className: "bg-gradient-to-br from-emerald-300 to-brand-strong text-zinc-950" },
  { id: "ocean", label: "Ocean", className: "bg-gradient-to-br from-sky-400 to-blue-600 text-zinc-950" },
  { id: "dusk", label: "Dusk", className: "bg-gradient-to-br from-legendary to-violet-700 text-zinc-950" },
  { id: "ember", label: "Ember", className: "bg-gradient-to-br from-amber-400 to-orange-600 text-zinc-950" },
  { id: "punch", label: "Punch", className: "bg-gradient-to-br from-rose-400 to-red-600 text-zinc-950" },
  { id: "steel", label: "Steel", className: "bg-gradient-to-br from-zinc-300 to-zinc-500 text-zinc-950" },
  { id: "night", label: "Night", className: "bg-gradient-to-br from-zinc-600 to-zinc-900 text-zinc-100" },
];

export function findAvatarPreset(id: string | null): AvatarPreset | undefined {
  return AVATAR_PRESETS.find((preset) => preset.id === id);
}
