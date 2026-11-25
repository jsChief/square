import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  compact?: boolean;
  defaultValue?: string;
  className?: string;
}

export function SearchBar({
  compact = false,
  defaultValue = "",
  className,
}: SearchBarProps) {
  return (
    <form
      action="/listings"
      method="get"
      role="search"
      className={cn(
        "flex w-full items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 transition-colors focus-within:border-accent",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={
          compact ? "Search listings..." : "Search textbooks, lamps, tickets..."
        }
        aria-label="Search listings"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
      />
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}
