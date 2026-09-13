"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Camera,
  ChevronRight,
  Clock,
  Compass,
  CornerDownLeft,
  Dumbbell,
  HeartPulse,
  Home,
  Image as ImageIcon,
  Layers,
  Moon,
  Plus,
  Scale,
  Search,
  Settings,
  Sparkles,
  Trophy,
  User,
  Users,
  Utensils,
  X,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { iconSize } from "@/constants/icons";
import { exercises } from "@/data/exercises";
import type { Exercise } from "@/types/exercise";
import { useNotificationStore } from "@/store/notificationStore";

export function openCommandPalette() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  }
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "actions" | "navigation" | "exercises";
  icon: LucideIcon;
  href?: string;
  action?: () => void;
  badge?: string;
}

const STATIC_COMMANDS: CommandItem[] = [
  // Quick Actions
  {
    id: "action-log-cardio",
    title: "Record Cardio Session",
    subtitle: "Zone 2, running, cycling, or rowing",
    category: "actions",
    icon: HeartPulse,
    href: "/train/cardio",
  },
  {
    id: "action-notifications",
    title: "Activity & Alerts",
    subtitle: "View notifications, challenge standings, and training updates",
    category: "actions",
    icon: Bell,
    badge: "Center",
  },

  // Navigation
  {
    id: "nav-home",
    title: "Home",
    subtitle: "Daily mission, priorities, and PhysIQ score",
    category: "navigation",
    icon: Home,
    href: "/home",
  },
  {
    id: "nav-train",
    title: "Train & Workouts",
    subtitle: "Programs, custom builder, and active missions",
    category: "navigation",
    icon: Dumbbell,
    href: "/train",
  },
  {
    id: "nav-exercises",
    title: "Exercise Library (189)",
    subtitle: "Complete catalog with EMG muscle breakdown",
    category: "navigation",
    icon: Layers,
    href: "/train/exercises",
  },
  {
    id: "nav-insights",
    title: "Insights & Analytics",
    subtitle: "4-pillar radar, 1RM Epley curves, and trends",
    category: "navigation",
    icon: BarChart3,
    href: "/insights",
  },
  {
    id: "nav-strength-standards",
    title: "Strength Standards & Big 4",
    subtitle: "Bodyweight ratio benchmarks, tiers & powerlifting total",
    category: "navigation",
    icon: Award,
    href: "/insights/strength",
    badge: "Standards",
  },
  {
    id: "nav-recovery",
    title: "Recovery & Readiness",
    subtitle: "ACWR workload ratio, systemic fatigue & recovery meters",
    category: "navigation",
    icon: HeartPulse,
    href: "/insights/recovery",
    badge: "Readiness",
  },
  {
    id: "nav-compete",
    title: "Compete & Challenges",
    subtitle: "Weekly community leaderboard & rank verification",
    category: "navigation",
    icon: Users,
    href: "/compete",
  },
  {
    id: "nav-profile",
    title: "Profile & Archetype",
    subtitle: "DNA profile, level progression, and stats",
    category: "navigation",
    icon: User,
    href: "/profile",
  },
  {
    id: "nav-history",
    title: "Workout History",
    subtitle: "Complete chronological session ledger",
    category: "navigation",
    icon: Clock,
    href: "/profile/history",
  },
  {
    id: "nav-achievements",
    title: "Achievements Showcase",
    subtitle: "Milestones, badges, and unlockable feats",
    category: "navigation",
    icon: Trophy,
    href: "/profile/achievements",
  },
  {
    id: "nav-integrations",
    title: "Wearables & Integrations",
    subtitle: "Apple Health, Android Connect, Garmin, WHOOP, Oura",
    category: "navigation",
    icon: Activity,
    href: "/profile/integrations",
  },
  {
    id: "nav-photos",
    title: "Progress Photos",
    subtitle: "Visual body transformation journal",
    category: "navigation",
    icon: ImageIcon,
    href: "/profile/photos",
  },
  {
    id: "nav-body",
    title: "Body Metrics & Measurements",
    subtitle: "Weight history, circumference, and body composition",
    category: "navigation",
    icon: Scale,
    href: "/profile/body",
  },
  {
    id: "nav-settings",
    title: "Data Export & Settings",
    subtitle: "Export session logs JSON/CSV and preferences",
    category: "navigation",
    icon: Settings,
    href: "/profile/settings/export",
  },
];

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Listen for Cmd+K / Ctrl+K and custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Dynamic search matching
  const matchingItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return STATIC_COMMANDS;
    }

    const staticMatches = STATIC_COMMANDS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)),
    );

    const exerciseMatches: CommandItem[] = exercises
      .filter(
        (ex: Exercise) =>
          ex.name.toLowerCase().includes(q) ||
          ex.muscleGroups.some((mg: string) => mg.toLowerCase().includes(q)) ||
          ex.equipment.toLowerCase().includes(q),
      )
      .slice(0, 8)
      .map((ex: Exercise) => ({
        id: `exercise-${ex.id}`,
        title: ex.name,
        subtitle: `${ex.muscleGroups.join(", ")} &bull; ${ex.equipment} &bull; ${ex.difficulty}`,
        category: "exercises" as const,
        icon: Dumbbell,
        href: `/train/exercises/${ex.id}`,
        badge: ex.muscleGroups[0] || "Exercise",
      }));

    return [...staticMatches, ...exerciseMatches];
  }, [query]);

  // Reset selected index when list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [matchingItems]);

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);

    if (item.id === "action-notifications") {
      useNotificationStore.getState().openDrawer();
      return;
    }

    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, matchingItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? Math.max(0, matchingItems.length - 1) : prev - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = matchingItems[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/75 p-4 pt-16 sm:pt-24 backdrop-blur-md"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-border/60 px-4 py-3.5">
          <Search
            size={iconSize.sm}
            className="text-foreground-secondary shrink-0"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command, search routes, or find 189 exercises..."
            className="ml-3 flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-secondary focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mr-2 text-foreground-secondary hover:text-foreground"
            >
              <X size={iconSize.xs} />
            </button>
          )}
          <kbd className="rounded bg-surface-elevated px-2 py-0.5 text-[10px] font-semibold text-foreground-secondary">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-96 overflow-y-auto p-2 divide-y divide-border/20 scrollbar-thin"
        >
          {matchingItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-foreground-secondary">
              No matching commands or exercises found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            matchingItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? "bg-brand/15 text-brand"
                      : "text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <span
                      className={`grid size-8 place-items-center rounded-lg ${
                        isSelected
                          ? "bg-brand text-zinc-950"
                          : "bg-surface-elevated text-foreground-secondary"
                      }`}
                    >
                      <item.icon size={iconSize.xs} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-semibold">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-foreground-secondary">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <span
                          className="block truncate text-[11px] text-foreground-secondary"
                          dangerouslySetInnerHTML={{ __html: item.subtitle }}
                        />
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="shrink-0 flex items-center text-xs text-brand font-medium">
                      <CornerDownLeft size={iconSize.xs} />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard Footer */}
        <div className="flex items-center justify-between border-t border-border/40 bg-surface-elevated/40 px-4 py-2 text-[10px] text-foreground-secondary">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded bg-surface px-1.5 py-0.5">↑</kbd>{" "}
              <kbd className="rounded bg-surface px-1.5 py-0.5">↓</kbd> navigate
            </span>
            <span>
              <kbd className="rounded bg-surface px-1.5 py-0.5">↵</kbd> select
            </span>
          </div>
          <span>PhysIQx Command Palette</span>
        </div>
      </div>
    </div>
  );
}
