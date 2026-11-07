import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
}

/**
 * Wordmark: the app icon (public/brand/logo-mark.png, cut from
 * icon-512.png without its white margin) beside the name, so in-app brand
 * moments wear the same mark as the home screen. Promoted from Auth once
 * Onboarding needed the same brand moment at its Welcome step.
 */
export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image src="/brand/logo-mark.png" alt="" width={36} height={36} className="size-9 rounded-field" priority />
      <span className="font-display text-xl font-bold">PhysIQx</span>
    </div>
  );
}
