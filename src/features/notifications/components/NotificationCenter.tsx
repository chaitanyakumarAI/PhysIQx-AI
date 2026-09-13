"use client";

import { useEffect, useMemo, useId } from "react";
import Link from "next/link";
import {
  Bell,
  X,
  CheckCheck,
  Flame,
  Trophy,
  Target,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import {
  useNotificationStore,
  type NotificationCategory,
  type CustomNotification,
} from "@/store/notificationStore";

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "Recently";
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "streak_risk":
      return <Flame size={16} className="text-warning" />;
    case "challenge_update":
      return <Trophy size={16} className="text-legendary" />;
    case "mission_reminder":
    case "session_resume":
      return <Target size={16} className="text-brand" />;
    case "score_recap":
    default:
      return <ShieldAlert size={16} className="text-info" />;
  }
}

const CATEGORY_TABS: { id: NotificationCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "alerts", label: "Alerts" },
  { id: "training", label: "Training" },
  { id: "social", label: "Social" },
];

export function NotificationCenter() {
  const isOpen = useNotificationStore((state) => state.isOpen);
  const closeDrawer = useNotificationStore((state) => state.closeDrawer);
  const filterCategory = useNotificationStore((state) => state.filterCategory);
  const setFilterCategory = useNotificationStore((state) => state.setFilterCategory);
  const readIds = useNotificationStore((state) => state.readIds);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const dismissNotification = useNotificationStore((state) => state.dismissNotification);
  const getAllNotifications = useNotificationStore((state) => state.getAllNotifications);
  const titleId = useId();

  const notifications = useMemo(() => {
    return getAllNotifications();
  }, [getAllNotifications, isOpen]);

  const filteredNotifications = useMemo(() => {
    if (filterCategory === "all") return notifications;
    return notifications.filter((n) => n.category === filterCategory);
  }, [notifications, filterCategory]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readIds.includes(n.id)).length;
  }, [notifications, readIds]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDrawer();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDrawer]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[90] flex items-end justify-end bg-black/75 p-0 backdrop-blur-sm sm:items-start sm:p-4"
      onClick={closeDrawer}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full flex-col rounded-t-2xl border border-border/80 bg-surface sm:max-w-md sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 p-4">
          <div className="flex items-center gap-2.5">
            <div className="relative grid size-9 place-items-center rounded-full bg-brand/15 text-brand">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-background">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 id={titleId} className="font-display text-base font-bold text-foreground">
                Activity & Alerts
              </h2>
              <p className="text-[11px] text-foreground-secondary">
                {unreadCount > 0 ? `${unreadCount} unread updates` : "All notifications caught up"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                aria-label="Mark all notifications as read"
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-foreground-secondary hover:bg-surface-elevated hover:text-foreground"
              >
                <CheckCheck size={14} />
                <span>Mark read</span>
              </button>
            )}
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close notification center"
              className="grid size-8 place-items-center rounded-full text-foreground-secondary hover:bg-surface-elevated hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-2 bg-surface-elevated/40">
          {CATEGORY_TABS.map((tab) => {
            const isActive = filterCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCategory(tab.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-brand text-background font-bold shadow-sm"
                    : "text-foreground-secondary hover:bg-surface hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Notification Feed List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/40 p-2 max-h-[60vh]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
              <div className="grid size-14 place-items-center rounded-full bg-surface-elevated text-foreground-secondary">
                <Inbox size={28} />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-foreground">
                  You're all caught up!
                </p>
                <p className="text-xs text-foreground-secondary mt-1 max-w-[240px]">
                  No active alerts in this section. New personal records and challenge updates will appear here.
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const isUnread = !readIds.includes(notification.id);
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative flex items-start gap-3 rounded-card p-3 transition-colors",
                    isUnread ? "bg-brand/5 hover:bg-brand/10" : "hover:bg-surface-elevated/60",
                  )}
                >
                  {/* Icon Indicator */}
                  <div className="relative mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-surface-elevated border border-border/60">
                    {getNotificationIcon(notification.type)}
                    {isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-brand ring-2 ring-background animate-pulse" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-foreground truncate">
                        {notification.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-foreground-secondary">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-foreground-secondary leading-relaxed">
                      {notification.body}
                    </p>

                    {/* Action Deep-link */}
                    {notification.deepLink && (
                      <div className="mt-2 flex items-center gap-2">
                        <Link
                          href={notification.deepLink}
                          onClick={() => {
                            markAsRead(notification.id);
                            closeDrawer();
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                        >
                          <span>Open</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Dismiss button */}
                  <button
                    type="button"
                    onClick={() => dismissNotification(notification.id)}
                    aria-label="Dismiss notification"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-foreground-secondary hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 p-3 bg-surface-elevated/40 text-center">
          <Link
            href="/profile/settings/notifications"
            onClick={closeDrawer}
            className="text-xs text-foreground-secondary hover:text-foreground font-medium transition-colors"
          >
            Manage notification preferences →
          </Link>
        </div>
      </div>
    </div>
  );
}
