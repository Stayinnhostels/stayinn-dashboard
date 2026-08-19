import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { OnboardingTour } from "@/components/admin/onboarding-tour";
import { NotFoundView } from "@/components/not-found-view";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationSocketProvider } from "@/providers/notification-socket-provider";
import { DashboardThemeProvider } from "@/providers/dashboard-theme-provider";

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
  "/admin/users": { title: "Users", subtitle: "" },
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
  "/admin/reviews": { title: "Reviews", subtitle: "" },
  "/admin/staff": { title: "Staff", subtitle: "" },
  "/admin/maintenance": { title: "Maintenance", subtitle: "" },
  "/admin/coupons": { title: "Coupons", subtitle: "" },
  "/admin/notifications": { title: "Notifications", subtitle: "" },
  "/admin/settings": { title: "Settings", subtitle: "" },
};

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
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (!isAdmin) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 space-y-4 max-w-2xl">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const meta = resolveMeta(pathname);

  return (
    <DashboardThemeProvider>
      <NotificationSocketProvider>
      <div className="flex h-svh min-h-0 w-full overflow-hidden bg-muted/30">
        <OnboardingTour />
        <AdminSidebar />
        <AdminMobileSidebar open={mobileNav} onOpenChange={setMobileNav} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AdminHeader
            title={meta.title}
            subtitle={meta.subtitle}
            onOpenMobileNav={() => setMobileNav(true)}
          />
          <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationSocketProvider>
    </DashboardThemeProvider>
  );
}
