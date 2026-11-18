import {
  Banknote,
  Bell,
  CalendarCheck,
  ClipboardList,
  MessageCircle,
  ShieldCheck,
  Star,
  TriangleAlert,
  UserPlus,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Notification, NotificationEvent } from "@/types/domain/notification.types";

/**
 * How each notification looks and what its row button does (Figma 16.01 + "Notifications panel").
 * New rows carry `event` from the API; older rows are mapped from type / entity_type.
 */

export type NotificationAction = "review" | "receipt" | "open" | "assign" | "approve" | "reply";

export type NotificationKind = {
  event: NotificationEvent | "other";
  icon: LucideIcon;
  /** Row button label, or null when the Figma row has none. */
  actionLabel: string | null;
  action: NotificationAction | null;
  urgent: boolean;
};

const KINDS: Record<NotificationKind["event"], Omit<NotificationKind, "event" | "urgent">> = {
  "booking.created": { icon: CalendarCheck, actionLabel: "Review", action: "review" },
  "booking.checked_out": { icon: UserPlus, actionLabel: null, action: null },
  "request.created": { icon: ClipboardList, actionLabel: "Open", action: "open" },
  "payment.received": { icon: Banknote, actionLabel: "Receipt", action: "receipt" },
  "deposit.returned": { icon: ShieldCheck, actionLabel: null, action: null },
  "maintenance.created": { icon: Wrench, actionLabel: "Assign", action: "assign" },
  "rent.reminders_sent": { icon: TriangleAlert, actionLabel: null, action: null },
  "review.created": { icon: Star, actionLabel: "Approve", action: "approve" },
  "contact.created": { icon: MessageCircle, actionLabel: "Reply", action: "reply" },
  other: { icon: Bell, actionLabel: null, action: null },
};

function resolveEvent(n: Notification): NotificationKind["event"] {
  if (n.event && n.event in KINDS) return n.event as NotificationEvent;
  if (n.entity_type === "booking_request") return "request.created";
  switch (n.type) {
    case "booking":
      return "booking.created";
    case "review":
      return "review.created";
    case "contact":
      return "contact.created";
    case "payment":
      return "payment.received";
    case "maintenance":
      return "maintenance.created";
    default:
      return "other";
  }
}

export function getNotificationKind(n: Notification): NotificationKind {
  const event = resolveEvent(n);
  return { event, ...KINDS[event], urgent: n.severity === "urgent" };
}

/** Subtitle line under the title. */
export function notificationDetail(n: Notification): string {
  const m = n.meta ?? {};
  if (n.type === "contact" && m.message_preview) {
    return m.guest_name ? `${m.guest_name} · ${m.message_preview}` : m.message_preview;
  }
  if (n.type === "review" && m.guest_name && m.rating != null && !n.event) {
    return `${m.guest_name} left ${m.rating}★ — waiting for approval`;
  }
  return n.body ?? "";
}

// ── Time ─────────────────────────────────────────────────────────

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export type NotificationDay = "today" | "yesterday" | "earlier";

export function notificationDay(iso: string | null, now = new Date()): NotificationDay {
  if (!iso) return "earlier";
  const day = startOfDay(new Date(iso));
  const today = startOfDay(now);
  if (day >= today) return "today";
  if (day >= today - 86_400_000) return "yesterday";
  return "earlier";
}

/** Page rows: "10:42 AM" for today / yesterday, "8 Nov" before that. */
export function notificationClock(iso: string | null, now = new Date()): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (notificationDay(iso, now) === "earlier") {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** Panel rows: "2m", "18m", "1h", "3d", then "8 Nov". */
export function notificationAgo(iso: string | null, now = new Date()): string {
  if (!iso) return "";
  const d = new Date(iso);
  const mins = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 60_000));
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function groupNotificationsByDay(items: Notification[], now = new Date()) {
  const groups: { day: NotificationDay; label: string; items: Notification[] }[] = [
    { day: "today", label: "Today", items: [] },
    { day: "yesterday", label: "Yesterday", items: [] },
    { day: "earlier", label: "Earlier", items: [] },
  ];
  for (const n of items) {
    groups.find((g) => g.day === notificationDay(n.created_at, now))!.items.push(n);
  }
  return groups.filter((g) => g.items.length > 0);
}
