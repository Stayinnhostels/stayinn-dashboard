import {
  Bed,
  Bell,
  Building2,
  CalendarCheck,
  ClipboardList,
  ContactRound,
  Globe,
  House,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  TicketPercent,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { NavCounts } from "@/api/admin/getNavCounts.api";

/**
 * Admin navigation, laid out like the Figma "Glass Redesign" sidebar:
 * a "Principal" list of the four daily pages, then collapsible groups.
 * Every existing admin route is still reachable.
 */
export type AdminNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Only the exact path counts as active (default: path prefix). */
  exact?: boolean;
  /** Short label for the mobile tab bar. */
  tabLabel?: string;
  /** Which sidebar badge count belongs to this page (GET /admin/nav-counts). */
  countKey?: keyof NavCounts;
};

export type AdminNavGroup = {
  id: "operations" | "money" | "people" | "system";
  label: string;
  items: AdminNavItem[];
};

export const PRINCIPAL_NAV: AdminNavItem[] = [
  { to: "/admin", label: "Dashboard", tabLabel: "Home", icon: LayoutDashboard, exact: true },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck, countKey: "bookings" },
  {
    to: "/admin/residents",
    label: "Residents",
    icon: ContactRound,
    countKey: "residents",
  },
  { to: "/admin/rooms", label: "Rooms", icon: Bed },
];

export const NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        to: "/admin/booking-requests",
        label: "Guest Requests",
        icon: ClipboardList,
        countKey: "booking_requests",
      },
      { to: "/admin/residents-by-room", label: "Residents by Room", icon: Building2 },
      { to: "/admin/monthly-rent", label: "Monthly Rent", icon: Receipt },
      { to: "/admin/maintenance", label: "Maintenance", icon: Wrench, countKey: "maintenance" },
      { to: "/admin/facilities", label: "Facilities", icon: Sparkles },
    ],
  },
  {
    id: "money",
    label: "Money",
    items: [
      { to: "/admin/payments", label: "Payments", icon: Wallet },
      { to: "/admin/security-payments", label: "Security deposits", icon: ShieldCheck },
      { to: "/admin/financials", label: "Revenue & Analytics", icon: TrendingUp },
      { to: "/admin/expenses", label: "Monthly Expenses", icon: Receipt },
      { to: "/admin/coupons", label: "Coupons", icon: TicketPercent },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/staff", label: "Staff", icon: Shield },
      { to: "/admin/messages", label: "Messages", icon: MessageSquare, countKey: "messages" },
      { to: "/admin/reviews", label: "Reviews", icon: Star, countKey: "reviews" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { to: "/admin/notifications", label: "Notifications", icon: Bell, countKey: "notifications" },
      { to: "/admin/hostels", label: "Properties", icon: Building2 },
      { to: "/admin/website", label: "Website Content", icon: Globe },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const ALL_NAV_ITEMS: AdminNavItem[] = [
  ...PRINCIPAL_NAV,
  ...NAV_GROUPS.flatMap((g) => g.items),
];

/** Icon used for the Home tab on mobile (Figma uses a house). */
export const HOME_TAB_ICON = House;

export function isNavItemActive(pathname: string, item: AdminNavItem) {
  if (item.exact) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export function groupHasActive(pathname: string, group: AdminNavGroup) {
  return group.items.some((item) => isNavItemActive(pathname, item));
}

export const PUBLIC_SITE_URL = (
  import.meta.env.VITE_PUBLIC_FRONTEND_URL as string | undefined
)?.replace(/\/$/, "");

export function itemCount(item: AdminNavItem, counts?: NavCounts | null) {
  return item.countKey && counts ? (counts[item.countKey] ?? 0) : 0;
}

export function groupCount(group: AdminNavGroup, counts?: NavCounts | null) {
  return group.items.reduce((sum, item) => sum + itemCount(item, counts), 0);
}

/** "99+" for big numbers so the badge stays round. */
export function badgeLabel(n: number) {
  return n > 99 ? "99+" : String(n);
}
