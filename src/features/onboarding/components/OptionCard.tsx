import { Check, type LucideIcon } from "lucide-react";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";

export interface OptionCardProps {
  label: string;
  description?: string;
  icon?: LucideIcon;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

/**
 * Large, tappable single-select card — Goal/Experience/Split/Rest-days all
 * use this. A deliberately bigger, more confident touch target than Chip,
 * matching the "generous, satisfying selection" bar the reference designs
 * point at, without inventing radio-group keyboard semantics (arrow-key
 * cycling) this component doesn't implement — aria-pressed toggle-button
 * semantics instead, the same pattern Chip/FilterChipRow already use.
 * Group multiple under a `role="group"` wrapper with an aria-label.
 */
export function OptionCard({
  label,
  description,
  icon: Icon,
  selected,
  onSelect,
  className,
}: OptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-card border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
        selected
          ? "border-brand/40 bg-brand/10"
          : "border-border/60 bg-surface hover:bg-surface-elevated",
        className,
      )}
    >
      {Icon && (
        <span
          aria-hidden
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full",
            selected
              ? "bg-brand/20 text-brand"
              : "bg-surface-elevated text-foreground-secondary",
          )}
        >
          <Icon size={iconSize.md} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{label}</span>
        {description && (
          <span className="block text-sm text-foreground-secondary">
            {description}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full border",
          selected ? "border-brand bg-brand text-zinc-950" : "border-border",
        )}
      >
        {selected && <Check size={iconSize.xs} />}
      </span>
    </button>
  );
}
