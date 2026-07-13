/**
 * The built-in avatars: 16 fitness personas (user-generated art, cropped
 * from avatars/Gemini_Generated_Image_*.png into public/avatars/). 14 slots
 * were upgraded to dedicated high-res portraits (July 8); Creative Artist
 * and Outdoor Adventurer still use contact-sheet crops. Ids are stable —
 * persisted picks survive art swaps.
 */
export interface AvatarPreset {
  id: string;
  label: string;
  /** Path under public/. */
  src: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "gen-z-boy", label: "Gen Z Boy", src: "/avatars/preset-1.png" },
  { id: "gen-z-girl", label: "Gen Z Girl", src: "/avatars/preset-2.png" },
  { id: "millennial-man", label: "Millennial Man", src: "/avatars/preset-3.png" },
  { id: "millennial-woman", label: "Millennial Woman", src: "/avatars/preset-4.png" },
  { id: "old-school", label: "Old-School Gentleman", src: "/avatars/preset-5.png" },
  { id: "mature-enthusiast", label: "Mature Enthusiast", src: "/avatars/preset-6.png" },
  { id: "gym-lover", label: "Gym Lover", src: "/avatars/preset-7.png" },
  { id: "runner", label: "Runner", src: "/avatars/preset-8.png" },
  { id: "yoga", label: "Yoga Practitioner", src: "/avatars/preset-9.png" },
  { id: "cyclist", label: "Cyclist", src: "/avatars/preset-10.png" },
  { id: "tech-nerd", label: "Tech Fitness Nerd", src: "/avatars/preset-11.png" },
  { id: "college-student", label: "College Student", src: "/avatars/preset-12.png" },
  { id: "creative-artist", label: "Creative Artist", src: "/avatars/preset-13.png" },
  { id: "minimalist-athlete", label: "Minimalist Athlete", src: "/avatars/preset-14.png" },
  { id: "outdoor-adventurer", label: "Outdoor Adventurer", src: "/avatars/preset-15.png" },
  { id: "city-athlete", label: "City Athlete", src: "/avatars/preset-16.png" },
];

export function findAvatarPreset(id: string | null): AvatarPreset | undefined {
  return AVATAR_PRESETS.find((preset) => preset.id === id);
}

/**
 * Shown before the user has picked anything — a real portrait beats a
 * letter-in-a-circle as the profile's hero moment (visual-audit finding).
 * Gym Lover: the most goal-neutral persona of the sixteen.
 */
export const DEFAULT_AVATAR_PRESET =
  AVATAR_PRESETS.find((preset) => preset.id === "gym-lover") ?? AVATAR_PRESETS[0]!;
