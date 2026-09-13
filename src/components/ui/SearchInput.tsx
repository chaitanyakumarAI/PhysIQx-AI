import { forwardRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { iconSize } from "@/constants/icons";
import { textControlStyles } from "@/components/ui/Input";

export interface SearchInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  /** Optional keyboard-shortcut hint rendered on the right (e.g. "⌘K"). */
  shortcut?: string;
  onShortcutClick?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      className,
      shortcut,
      onShortcutClick,
      "aria-label": ariaLabel = "Search",
      ...props
    },
    ref,
  ) {
    return (
      <div className={cn("relative w-full", className)}>
        <Search
          size={iconSize.sm}
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-secondary"
        />
        <input
          ref={ref}
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
            onClick={onShortcutClick}
            aria-hidden
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-foreground/5 px-2 py-1 font-sans text-xs text-foreground-secondary",
              onShortcutClick && "cursor-pointer hover:bg-foreground/10 hover:text-foreground",
            )}
          >
            {shortcut}
          </kbd>
        )}
      </div>
    );
  },
);

