import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { iconSize } from "@/constants/icons";
import { textControlStyles } from "@/components/ui/Input";

export interface SearchInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  /** Optional keyboard-shortcut hint rendered on the right (e.g. "⌘K"). */
  shortcut?: string;
}

export function SearchInput({
  className,
  shortcut,
  "aria-label": ariaLabel = "Search",
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search
        size={iconSize.sm}
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-secondary"
      />
      <input
        type="search"
        aria-label={ariaLabel}
        className={cn(
          textControlStyles,
          "h-12 rounded-full bg-surface-elevated pl-11",
          shortcut ? "pr-14" : "pr-4",
        )}
        {...props}
      />
      {shortcut && (
        <kbd
          aria-hidden
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-foreground/5 px-2 py-1 font-sans text-xs text-foreground-secondary"
        >
          {shortcut}
        </kbd>
      )}
    </div>
  );
}
