import Link from "next/link";
import {
  Bell,
  ChevronRight,
  CircleUserRound,
  Download,
  Moon,
  Play,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import type { SettingsIconId, SettingsItem } from "../types";

export interface SettingsRowProps {
  item: SettingsItem;
  className?: string;
}

const settingsIcon: Record<SettingsIconId, LucideIcon> = {
  bell: Bell,
  moon: Moon,
  shield: Shield,
  download: Download,
  user: CircleUserRound,
  play: Play,
};

/**
 * One Settings list row. Deliberately not shared with Train's
 * ExerciseListItem despite the similar shape (icon + label + chevron) — no
 * subtitle line or badge here, and forcing a shared component now would mean
 * inventing optional-prop flags for a difference that's real, not premature.
 */
export function SettingsRow({ item, className }: SettingsRowProps) {
  const Icon = settingsIcon[item.iconId];

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
        className,
      )}
    >
      <Icon size={iconSize.sm} aria-hidden className="shrink-0 text-foreground-secondary" />
      <span className="flex-1 font-medium">{item.label}</span>
      {item.value && <span className="text-sm text-foreground-secondary">{item.value}</span>}
      <ChevronRight size={iconSize.sm} aria-hidden className="shrink-0 text-foreground-secondary" />
    </Link>
  );
}
