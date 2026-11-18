import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Building2, Check, ChevronDown, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { cn } from "@/lib/utils";

/** Figma "Property switcher" — glass-2, 40px, 12 radius, building + name + chevron. */
export function HostelSwitcher({ compact = false }: { compact?: boolean }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { activeHostel, hostels, isLoading, setSelectedHostelId, hostelId } = useHostelScope();

  function switchHostel(id: string) {
    setSelectedHostelId(id);
    void queryClient.invalidateQueries();
    setOpen(false);
  }

  const triggerClass = cn(
    "glass-2 flex h-10 shrink-0 items-center gap-2 rounded-[12px] px-3 font-geist text-body font-medium text-ink outline-none",
    "hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border data-[state=open]:bg-glass-inset",
    compact ? "w-10 justify-center px-0" : "max-w-[15rem]",
  );

  if (isLoading) {
    return <span aria-hidden className={cn(triggerClass, compact ? "animate-pulse" : "w-[180px] animate-pulse")} />;
  }

  if (hostels.length === 0) {
    return (
      <Link to="/admin/hostels" className={triggerClass} aria-label="Add property">
        <Plus aria-hidden className="size-4 shrink-0 text-ink-2" />
        {compact ? null : "Add property"}
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
          aria-label={`Property: ${label}. Switch property`}
          className={triggerClass}
        >
          <Building2 aria-hidden className={cn("shrink-0", compact ? "size-[18px] text-brand-text" : "size-4 text-ink-2")} />
          {compact ? null : (
            <>
              <span className="min-w-0 truncate">{label}</span>
              <ChevronDown aria-hidden className="size-4 shrink-0 text-ink-2" />
            </>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={compact ? "end" : "start"}
        sideOffset={8}
        className="glass-3 w-64 rounded-[16px] border-glass-stroke p-1.5 font-geist text-ink shadow-none"
      >
        <p className="px-2.5 pt-1.5 pb-1 text-eyebrow text-ink-3">Properties</p>
        <ul role="listbox" aria-label="Properties">
          {hostels.map((hostel) => {
            const selected = hostel.id === hostelId;
            return (
              <li key={hostel.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => switchHostel(hostel.id)}
                  className={cn(
                    "flex h-10 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-left text-body outline-none focus-visible:ring-2 focus-visible:ring-brand-border",
                    selected
                      ? "bg-brand-tint font-medium text-ink"
                      : "text-ink-2 hover:bg-glass-inset hover:text-ink",
                  )}
                >
                  <Check
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0 text-brand-text",
                      selected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{hostel.name}</span>
                  {hostel.status === "inactive" ? (
                    <span className="shrink-0 text-label text-ink-3">Paused</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-1 border-t border-glass-divider pt-1">
          <Link
            to="/admin/hostels"
            onClick={() => setOpen(false)}
            className="flex h-9 items-center rounded-[10px] px-2.5 text-label font-medium text-brand-text outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border"
          >
            Manage properties
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
