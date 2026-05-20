import { CalendarCheck, MessageSquare, Star, type LucideIcon } from "lucide-react";
import type { Notification, NotificationType } from "@/types/domain/notification.types";

export type NotificationTheme = {
  icon: LucideIcon;
  shell: string;
  iconBox: string;
  headline: string;
  name: string;
  summary: string;
  time: string;
  unreadBar: string;
};

const themes: Record<NotificationType, NotificationTheme> = {
  booking: {
    icon: CalendarCheck,
    shell:
      "border-primary/20 bg-gradient-to-br from-primary/[0.12] via-card to-card shadow-[var(--shadow-card)]",
    iconBox: "bg-primary text-primary-foreground",
    headline: "text-primary",
    name: "text-foreground",
    summary: "text-muted-foreground",
    time: "text-muted-foreground/80",
    unreadBar: "bg-primary",
  },
  review: {
    icon: Star,
    shell:
      "border-accent/35 bg-gradient-to-br from-accent/20 via-card to-card shadow-[var(--shadow-card)]",
    iconBox: "bg-accent text-accent-foreground",
    headline: "text-foreground",
    name: "text-foreground",
    summary: "text-muted-foreground",
    time: "text-muted-foreground/80",
    unreadBar: "bg-accent",
  },
  contact: {
    icon: MessageSquare,
    shell:
      "border-secondary/25 bg-gradient-to-br from-secondary/[0.08] via-card to-card shadow-[var(--shadow-card)]",
    iconBox: "bg-secondary text-secondary-foreground",
    headline: "text-secondary",
    name: "text-foreground",
    summary: "text-muted-foreground",
    time: "text-muted-foreground/80",
    unreadBar: "bg-secondary",
  },
  payment: {
    icon: CalendarCheck,
    shell: "border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card shadow-[var(--shadow-card)]",
    iconBox: "bg-primary/90 text-primary-foreground",
    headline: "text-primary",
    name: "text-foreground",
    summary: "text-muted-foreground",
    time: "text-muted-foreground/80",
    unreadBar: "bg-primary",
  },
  maintenance: {
    icon: MessageSquare,
    shell: "border-border bg-card shadow-[var(--shadow-soft)]",
    iconBox: "bg-muted text-muted-foreground",
    headline: "text-foreground",
    name: "text-foreground",
    summary: "text-muted-foreground",
    time: "text-muted-foreground/80",
    unreadBar: "bg-muted-foreground",
  },
  system: {
    icon: MessageSquare,
    shell: "border-border bg-card shadow-[var(--shadow-soft)]",
    iconBox: "bg-muted text-muted-foreground",
    headline: "text-foreground",
    name: "text-foreground",
    summary: "text-muted-foreground",
    time: "text-muted-foreground/80",
    unreadBar: "bg-primary",
  },
};

export type NotificationDisplay = {
  icon: LucideIcon;
  theme: NotificationTheme;
  headline: string;
  guestName: string;
  guestInitial: string;
  summaryLine: string;
};

const typeIcons: Record<NotificationType, LucideIcon> = {
  booking: CalendarCheck,
  review: Star,
  contact: MessageSquare,
  payment: CalendarCheck,
  maintenance: MessageSquare,
  system: MessageSquare,
};

function guestFromNotification(n: Notification): string {
  return (
    n.meta?.guest_name?.trim() ||
    n.body?.split("·")[0]?.split(":")[0]?.trim() ||
    "Guest"
  );
}

function buildSummaryLine(n: Notification): string {
  const m = n.meta ?? {};
  switch (n.type) {
    case "booking": {
      const parts: string[] = [];
      if (m.room_title) parts.push(m.room_title);
      if (m.seats_booked != null) parts.push(`${m.seats_booked} seat(s)`);
      if (m.total_amount != null) {
        parts.push(`₹${Number(m.total_amount).toLocaleString("en-IN")}`);
      }
      if (m.source) parts.push(m.source);
      const line = parts.join(" · ") || n.body;
      return line.length > 52 ? `${line.slice(0, 52)}…` : line;
    }
    case "review": {
      const parts: string[] = [];
      if (m.rating != null) parts.push(`${m.rating}★`);
      if (m.room_title) parts.push(m.room_title);
      const line = parts.join(" · ") || n.body;
      return line.length > 52 ? `${line.slice(0, 52)}…` : line;
    }
    case "contact": {
      const line = m.message_preview || n.body || "";
      return line.length > 52 ? `${line.slice(0, 52)}…` : line;
    }
    default: {
      const line = n.body || "";
      return line.length > 52 ? `${line.slice(0, 52)}…` : line;
    }
  }
}

export function getNotificationDisplay(
  n: Notification,
  _options: { minimal?: boolean } = {},
): NotificationDisplay {
  const guestName = guestFromNotification(n);
  const initial = guestName.charAt(0).toUpperCase() || "?";

  return {
    icon: typeIcons[n.type] ?? MessageSquare,
    theme: themes[n.type] ?? themes.system,
    headline: n.title,
    guestName,
    guestInitial: initial,
    summaryLine: buildSummaryLine(n),
  };
}
