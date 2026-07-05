import type { LucideIcon } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";

export interface FilterChipOption {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface FilterChipRowProps {
  options: FilterChipOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Selected chip style — solid white (programs, scope tabs) or brand tint (muscles). */
  variant?: "solid" | "accent";
  /** Accessible name for the group (e.g. "Programs"). */
  label: string;
  className?: string;
}

/**
 * Horizontally scrollable single-select chip row. Promoted from
 * features/train/components/ once a third consumer (Compete's leaderboard
 * scope tabs) needed it — was already domain-agnostic, just waiting for the
 * threshold. Selection semantics (toggle vs. always-one) belong to the caller.
 */
export function FilterChipRow({
  options,
  selectedId,
  onSelect,
  variant = "solid",
  label,
  className,
}: FilterChipRowProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((option) => (
        <Chip
          key={option.id}
          variant={variant}
          selected={option.id === selectedId}
          onClick={() => onSelect(option.id)}
          className="shrink-0"
        >
          {option.icon && <option.icon size={iconSize.xs} aria-hidden />}
          {option.label}
        </Chip>
      ))}
    </div>
  );
}
