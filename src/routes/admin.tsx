import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useGlassDark } from "@/lib/glass-theme";
import { PageHeader } from "@/components/admin/page-header";
import { useAuth } from "@/lib/auth-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/shell/admin-mobile-nav";
import { CommandMenuProvider } from "@/components/admin/shell/admin-command-menu";
import { AdminHeader } from "@/components/admin/admin-header";
import { OnboardingTour } from "@/components/admin/onboarding-tour";
import { NotFoundView } from "@/components/not-found-view";
import { LoadingScreen, NoAccessScreen, SystemAction } from "@/components/system/system-screens";
import { NotificationSocketProvider } from "@/providers/notification-socket-provider";
import { DashboardThemeProvider } from "@/providers/dashboard-theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  notFoundComponent: AdminNotFoundPage,
});

function AdminNotFoundPage() {
  return <NotFoundView embedded />;
}

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Dashboard", subtitle: "" },
  "/admin/rooms": { title: "Rooms", subtitle: "" },
  "/admin/bookings": { title: "Bookings", subtitle: "" },
  "/admin/booking-requests": {
    title: "Guest Requests",
    subtitle: "Cancel, room change & seat requests",
  },
  "/admin/users": { title: "Users", subtitle: "" },
  "/admin/messages": { title: "Messages", subtitle: "" },
  "/admin/payments": { title: "Payments", subtitle: "" },
  "/admin/security-payments": { title: "Security", subtitle: "" },
  "/admin/financials": { title: "Revenue", subtitle: "" },
  "/admin/expenses": { title: "Expenses", subtitle: "" },
  "/admin/profit-loss": { title: "Expenses", subtitle: "" },
  "/admin/monthly-rent": { title: "Monthly Rent", subtitle: "" },
  "/admin/residents": { title: "Residents", subtitle: "" },
  "/admin/residents-by-room": { title: "Residents by Room", subtitle: "" },
  "/admin/facilities": { title: "Facilities", subtitle: "" },
  "/admin/website": { title: "Website", subtitle: "" },
  "/admin/website/about": { title: "About", subtitle: "" },
  "/admin/website/faq": { title: "FAQ", subtitle: "" },
  "/admin/website/booking-rules": { title: "Booking rules", subtitle: "" },
  "/admin/reviews": { title: "Reviews", subtitle: "" },
  "/admin/staff": { title: "Staff", subtitle: "" },
  "/admin/maintenance": { title: "Maintenance", subtitle: "" },
  "/admin/coupons": { title: "Coupons", subtitle: "" },
  "/admin/notifications": { title: "Notifications", subtitle: "" },
  "/admin/hostels": { title: "Properties", subtitle: "Manage hostel locations" },
  "/admin/settings": { title: "Settings", subtitle: "" },
  "/admin/design-system": { title: "Design system", subtitle: "Glass tokens & components" },
};

/** Pages that render their own PageHeader (custom subtitle / actions, per the Figma). */
const CUSTOM_HEADER_ROUTES = /^\/admin\/?$|^\/admin\/rooms(\/[^/]+)?\/?$|^\/admin\/notifications\/?$|^\/admin\/bookings\/?$|^\/admin\/residents(\/[^/]+)?\/?$|^\/admin\/payments\/?$/;

function resolveMeta(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  // Detail routes like /admin/rooms/abc
  const seg = pathname.split("/").filter(Boolean);
  if (seg[0] === "admin" && seg[1]) {
    const base = `/admin/${seg[1]}`;
    if (TITLES[base]) return { title: `${TITLES[base].title} · Details`, subtitle: "" };
  }
  return { title: "Not found", subtitle: "" };
}

function AdminLayout() {
  const { user, loading, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  // Dark Glass: put `.dark` on <html> while inside the admin so portals (dialogs, menus) follow.
  const dark = useGlassDark();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
    return () => {
      root.classList.remove("dark");
      root.style.colorScheme = "";
    };
  }, [dark]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  // Signed in, but this account may not use the admin console.
  if (!isAdmin) {
    return (
      <NoAccessScreen
        primary={
          <SystemAction
            onClick={async () => {
              await logout();
              navigate({ to: "/login" });
            }}
          >
            Use a different account
          </SystemAction>
        }
      />
    );
  }

  const meta = resolveMeta(pathname);

  return (
    <DashboardThemeProvider>
      <TooltipProvider delayDuration={200}>
        <NotificationSocketProvider>
          <CommandMenuProvider>
            {/* Figma "02 · Desktop · Light Glass": floating sidebar + glass main shell, 24px gutters */}
            <div className="glass-root flex h-svh min-h-0 w-full gap-5 overflow-hidden md:p-6">
              <OnboardingTour />
              <AdminSidebar />
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:glass-1 md:rounded-[28px]">
                <div className="px-4 pt-3 md:p-0">
                  <AdminHeader />
                </div>
                <main className="min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-[calc(104px+env(safe-area-inset-bottom))] md:p-6">
                  {CUSTOM_HEADER_ROUTES.test(pathname) ? null : (
                    <PageHeader title={meta.title} subtitle={meta.subtitle} />
                  )}
                  <Outlet />
                </main>
              </div>
              <AdminMobileNav />
            </div>
          </CommandMenuProvider>
        </NotificationSocketProvider>
      </TooltipProvider>
    </DashboardThemeProvider>
  );
}
