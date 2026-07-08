/**
 * The built-in avatars: 15 fitness personas (user-generated art, cropped
 * from avatars/Gemini_Generated_Image_*.png into public/avatars/). They
 * replaced the original CSS-gradient placeholders the moment real art
 * existed. Ids are stable — persisted picks survive art swaps.
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
];

export function findAvatarPreset(id: string | null): AvatarPreset | undefined {
  return AVATAR_PRESETS.find((preset) => preset.id === id);
}
