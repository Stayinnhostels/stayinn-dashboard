import { Link, useRouterState } from "@tanstack/react-router";
import { BedDouble, CircleHelp, FileText, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

const pages = [
  { to: "/admin/website", label: "Homepage", icon: LayoutTemplate, exact: true },
  { to: "/admin/website/about", label: "About page", icon: FileText },
  { to: "/admin/website/faq", label: "FAQ page", icon: CircleHelp },
  { to: "/admin/website/booking-rules", label: "Booking rules", icon: BedDouble },
] as const;

export function WebsitePageNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex flex-wrap gap-2">
      {pages.map(({ to, label, icon: Icon, exact }) => {
        const active = exact ? pathname === to : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border/60 bg-background text-muted-foreground hover:text-foreground hover:border-primary/40",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
