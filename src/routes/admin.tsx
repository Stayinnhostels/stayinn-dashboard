import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Dashboard Overview", subtitle: "High-level performance at a glance" },
  "/admin/rooms": { title: "Room Management", subtitle: "Inventory, pricing & availability" },
  "/admin/bookings": { title: "Booking Management", subtitle: "All reservations across the property" },
  "/admin/users": { title: "User Management", subtitle: "Registered guests and staff" },
  "/admin/payments": { title: "Payments", subtitle: "Transactions, refunds and invoices" },
  "/admin/financials": { title: "Revenue & Analytics", subtitle: "Deep financial insights" },
  "/admin/reviews": { title: "Reviews", subtitle: "Moderate guest feedback" },
  "/admin/staff": { title: "Staff Management", subtitle: "Roles and permissions" },
  "/admin/maintenance": { title: "Maintenance", subtitle: "Tickets and room issues" },
  "/admin/coupons": { title: "Coupons & Discounts", subtitle: "Promotional codes" },
  "/admin/notifications": { title: "Notifications", subtitle: "All system alerts" },
  "/admin/settings": { title: "Settings", subtitle: "Property and platform configuration" },
};

function resolveMeta(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  // Detail routes like /admin/rooms/abc
  const seg = pathname.split("/").filter(Boolean);
  if (seg[0] === "admin" && seg[1]) {
    const base = `/admin/${seg[1]}`;
    if (TITLES[base]) return { title: `${TITLES[base].title} · Details`, subtitle: "" };
  }
  return { title: "Admin", subtitle: "" };
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
    <div className="flex h-svh min-h-0 w-full overflow-hidden bg-muted/30">
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
  );
}
