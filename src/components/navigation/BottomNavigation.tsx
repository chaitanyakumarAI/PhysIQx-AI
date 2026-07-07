"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { iconSize } from "@/constants/icons";
import { duration, easeOut } from "@/lib/motion";

export interface BottomNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface BottomNavigationProps {
  items: BottomNavItem[];
  className?: string;
}

/**
 * The persistent five-tab bar. Generic: tab config is passed in, so the
 * component owns appearance and semantics, not the app's IA. The active pill
 * slides between tabs via a shared layout animation.
 */
export function BottomNavigation({ items, className }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2",
        className,
      )}
    >
      <div className="mx-auto flex max-w-md items-center justify-between rounded-full border border-white/[0.08] bg-background/70 p-2 backdrop-blur-xl [box-shadow:inset_0_1px_0_0_rgb(255_255_255/0.06),0_16px_40px_-12px_rgb(0_0_0/0.8)]">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
                active
                  ? "text-brand"
                  : "text-foreground-secondary hover:text-foreground",
              )}
            >
              {active && (
                <m.span
                  layoutId="bottom-nav-active"
                  aria-hidden
                  transition={{ duration: duration.fast, ease: easeOut }}
                  className="absolute inset-0 rounded-full border border-brand/25 bg-brand/10 [box-shadow:0_0_16px_-4px_rgb(34_197_94/0.45)]"
                />
              )}
              <item.icon
                size={iconSize.sm}
                aria-hidden
                className="relative"
              />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
