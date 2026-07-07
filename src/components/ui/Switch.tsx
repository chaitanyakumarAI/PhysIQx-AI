"use client";

import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name — this control has no visible text of its own. */
  label: string;
  disabled?: boolean;
}

/**
 * Toggle switch. First real use of this primitive — listed in
 * docs/COMPONENTS.md since Foundation, never built until Settings needed it.
 *
 * The button itself is a full 44x44 hit target (docs/UI_Guideliness.md's
 * minimum) even though the visual track is the conventional slimmer
 * pill shape — the track is a decorative inner span, centered within the
 * larger tappable button, the same pattern iOS/Android switches use.
 */
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="grid size-11 shrink-0 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
    >
      <span
        aria-hidden
        className={cn(
          "relative h-7 w-12 rounded-full border transition-colors",
          checked ? "border-brand bg-brand" : "border-border bg-surface-elevated",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-150",
            checked ? "translate-x-[22px]" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}
