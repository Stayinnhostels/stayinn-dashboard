import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { CornerDownLeft, Search } from "lucide-react";
import { type AdminNavItem } from "./admin-nav";
import { useVisibleNav } from "./use-visible-nav";

type Ctx = { open: boolean; setOpen: (open: boolean) => void };
const CommandMenuContext = React.createContext<Ctx | null>(null);

export function useCommandMenu() {
  const ctx = React.useContext(CommandMenuContext);
  if (!ctx) throw new Error("useCommandMenu must be used inside <CommandMenuProvider>");
  return ctx;
}

/** Holds the "Search" (⌘K / Ctrl+K) palette state and renders the palette. */
export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = React.useMemo(() => ({ open, setOpen }), [open]);
  return (
    <CommandMenuContext.Provider value={value}>
      {children}
      <AdminCommandMenu open={open} onOpenChange={setOpen} />
    </CommandMenuContext.Provider>
  );
}

function useSections(): { label: string; items: AdminNavItem[] }[] {
  const { principal, groups } = useVisibleNav();
  return [{ label: "Principal", items: principal }, ...groups.map((g) => ({ label: g.label, items: g.items }))];
}

/** "Go to a page" palette. Glass-3 dialog with the same search field as the sidebar. */
function AdminCommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const SECTIONS = useSections();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="glass-3 fixed top-[12vh] left-1/2 z-50 w-[calc(100%-32px)] max-w-[520px] -translate-x-1/2 overflow-hidden rounded-[20px] font-geist text-ink data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <Dialog.Title className="sr-only">Search pages</Dialog.Title>
          <Command loop label="Search pages" className="flex flex-col">
            <div className="flex items-center gap-2.5 border-b border-glass-divider px-4">
              <Search aria-hidden className="size-4 shrink-0 text-ink-3" />
              <Command.Input
                autoFocus
                placeholder="Search pages"
                className="h-12 min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-3"
              />
              <kbd className="glass-inset shrink-0 rounded-[6px] px-1.5 py-0.5 text-label font-medium text-ink-3">
                Esc
              </kbd>
            </div>
            <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-center text-body text-ink-3">
                No pages match that search.
              </Command.Empty>
              {SECTIONS.map((section) => (
                <Command.Group
                  key={section.label}
                  heading={section.label}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-eyebrow [&_[cmdk-group-heading]]:text-ink-3"
                >
                  {section.items.map((item) => (
                    <Command.Item
                      key={item.to}
                      value={`${item.label} ${section.label}`}
                      onSelect={() => go(item.to)}
                      className="group flex h-10 cursor-pointer items-center gap-3 rounded-[12px] px-3 text-body font-medium text-ink-2 data-[selected=true]:bg-brand-tint data-[selected=true]:text-ink"
                    >
                      <item.icon aria-hidden className="size-[18px] shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      <CornerDownLeft
                        aria-hidden
                        className="size-4 shrink-0 text-ink-3 opacity-0 group-data-[selected=true]:opacity-100"
                      />
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
