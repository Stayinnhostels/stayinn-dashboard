import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  "aria-label"?: string;
};

/**
 * Live search field with a clear (X) control.
 * Pair with `useDebouncedValue` when the query hits the API.
 */
export function SearchInput({
  value,
  onValueChange,
  placeholder = "Search…",
  className,
  inputClassName,
  id,
  name,
  autoComplete = "off",
  "aria-label": ariaLabel,
}: SearchInputProps) {
  const hasValue = value.length > 0;

  return (
    <div className={cn("relative min-w-[220px] flex-1", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        name={name}
        autoComplete={autoComplete}
        aria-label={ariaLabel ?? placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={cn("h-9 pl-9", hasValue ? "pr-9" : "pr-3", inputClassName)}
      />
      {hasValue ? (
        <button
          type="button"
          onClick={() => onValueChange("")}
          className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
