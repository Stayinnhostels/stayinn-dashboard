import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export function HostelSwitcher() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { activeHostel, hostels, isLoading, setSelectedHostelId, hostelId } = useHostelScope();

  function switchHostel(id: string) {
    setSelectedHostelId(id);
    void queryClient.invalidateQueries();
    setOpen(false);
  }

  if (isLoading) {
    return <Skeleton className="h-9 w-36 rounded-lg" />;
  }

  if (hostels.length === 0) {
    return (
      <Link
        to="/admin/hostels"
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
      >
        <Building2 className="h-4 w-4" />
        Add property
      </Link>
    );
  }

  const label = activeHostel?.name ?? "Property";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-tour="hostel-switcher"
          className={cn(
            "inline-flex h-9 max-w-[12rem] items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3",
            "text-sm font-medium text-foreground transition-colors",
            "hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            "data-[state=open]:bg-primary/15",
          )}
        >
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={6} className="w-56 rounded-lg p-1 shadow-md">
        <ul className="py-0.5">
          {hostels.map((hostel) => {
            const selected = hostel.id === hostelId;
            return (
              <li key={hostel.id}>
                <button
                  type="button"
                  onClick={() => switchHostel(hostel.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm",
                    selected ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted",
                  )}
                >
                  <Check className={cn("h-4 w-4 shrink-0", selected ? "opacity-100" : "opacity-0")} />
                  <span className="min-w-0 flex-1 truncate">{hostel.name}</span>
                  {hostel.status === "inactive" ? (
                    <span className="shrink-0 text-[10px] text-muted-foreground">Paused</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-0.5 border-t border-border/60 pt-0.5">
          <Link
            to="/admin/hostels"
            onClick={() => setOpen(false)}
            className="block rounded-md px-2.5 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Manage properties
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
