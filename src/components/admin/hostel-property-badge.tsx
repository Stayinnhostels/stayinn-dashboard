import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";

type HostelPropertyBadgeProps = {
  hostelId?: string | null;
  hostelName?: string | null;
  className?: string;
  /** When true and no hostel is set, show "All properties" (global items). */
  showAllProperties?: boolean;
};

export function HostelPropertyBadge({
  hostelId,
  hostelName,
  className,
  showAllProperties = true,
}: HostelPropertyBadgeProps) {
  if (!hostelId && !hostelName) {
    if (!showAllProperties) return null;
    return (
      <Badge
        variant="outline"
        className={cn(
          "inline-flex max-w-full items-center gap-1 border-violet-500/30 bg-violet-500/10 font-medium text-violet-700 dark:text-violet-300",
          className,
        )}
      >
        <Building2 className="h-3 w-3 shrink-0" />
        All properties
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex max-w-full items-center gap-1 border-sky-500/30 bg-sky-500/10 font-medium text-sky-700 dark:text-sky-300",
        className,
      )}
      title={hostelId ?? undefined}
    >
      <Building2 className="h-3 w-3 shrink-0" />
      <span className="truncate">{hostelName ?? "Property"}</span>
    </Badge>
  );
}
