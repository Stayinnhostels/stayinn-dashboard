import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { f as formatMoney } from "./payments-CPHCHGiR.mjs";
import { b as useQuery, u as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
import { f as formatDistanceToNow } from "../_libs/date-fns.mjs";
import { X, K as MessageSquare, C as CalendarCheck, i as Star } from "../_libs/lucide-react.mjs";
const themes = {
  booking: {
    icon: CalendarCheck,
    shell: "border-primary/20 bg-gradient-to-br from-primary/[0.12] via-card to-card shadow-[var(--shadow-card)]",
    iconBox: "bg-primary text-primary-foreground",
    headline: "text-primary",
    name: "text-foreground",
    summary: "text-muted-foreground",
    time: "text-muted-foreground/80",
    unreadBar: "bg-primary"
  },
  review: {
    icon: Star,
    shell: "border-accent/35 bg-gradient-to-br from-accent/20 via-card to-card shadow-[var(--shadow-card)]",
    iconBox: "bg-accent text-accent-foreground",
    headline: "text-foreground",
    name: "text-foreground",
    summary: "text-muted-foreground",
    time: "text-muted-foreground/80",
    unreadBar: "bg-accent"
  },
  contact: {
    icon: MessageSquare,
    shell: "border-secondary/25 bg-gradient-to-br from-secondary/[0.08] via-card to-card shadow-[var(--shadow-card)]",
    iconBox: "bg-secondary text-secondary-foreground",
    headline: "text-secondary",
    name: "text-foreground",
    summary: "text-muted-foreground",
    time: "text-muted-foreground/80",
    unreadBar: "bg-secondary"
  },
  payment: {
    icon: CalendarCheck,
    shell: "border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card shadow-[var(--shadow-card)]",
    iconBox: "bg-primary/90 text-primary-foreground",
    headline: "text-primary",
    name: "text-foreground",
    summary: "text-muted-foreground",
    time: "text-muted-foreground/80",
    unreadBar: "bg-primary"
  },
  maintenance: {
    icon: MessageSquare,
    shell: "border-border bg-card shadow-[var(--shadow-soft)]",
    iconBox: "bg-muted text-muted-foreground",
    headline: "text-foreground",
    name: "text-foreground",
    summary: "text-muted-foreground",
    time: "text-muted-foreground/80",
    unreadBar: "bg-muted-foreground"
  },
  system: {
    icon: MessageSquare,
    shell: "border-border bg-card shadow-[var(--shadow-soft)]",
    iconBox: "bg-muted text-muted-foreground",
    headline: "text-foreground",
    name: "text-foreground",
    summary: "text-muted-foreground",
    time: "text-muted-foreground/80",
    unreadBar: "bg-primary"
  }
};
const typeIcons = {
  booking: CalendarCheck,
  review: Star,
  contact: MessageSquare,
  payment: CalendarCheck,
  maintenance: MessageSquare,
  system: MessageSquare
};
function guestFromNotification(n) {
  return n.meta?.guest_name?.trim() || n.body?.split("·")[0]?.split(":")[0]?.trim() || "Guest";
}
function buildSummaryLine(n) {
  const m = n.meta ?? {};
  switch (n.type) {
    case "booking": {
      const parts = [];
      if (m.room_title) parts.push(m.room_title);
      if (m.seats_booked != null) parts.push(`${m.seats_booked} seat(s)`);
      if (m.total_amount != null) {
        parts.push(formatMoney(Number(m.total_amount), "pkr"));
      }
      if (m.source) parts.push(m.source);
      const line = parts.join(" · ") || n.body;
      return line.length > 52 ? `${line.slice(0, 52)}…` : line;
    }
    case "review": {
      const parts = [];
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
function getNotificationDisplay(n, _options = {}) {
  const guestName = guestFromNotification(n);
  const initial = guestName.charAt(0).toUpperCase() || "?";
  return {
    icon: typeIcons[n.type] ?? MessageSquare,
    theme: themes[n.type] ?? themes.system,
    headline: n.title,
    guestName,
    guestInitial: initial,
    summaryLine: buildSummaryLine(n)
  };
}
const TILE_HEIGHT = "h-[5.75rem]";
function NotificationCard({
  notification,
  variant = "tile",
  onDismiss,
  onMarkRead,
  className
}) {
  const isAlert = variant === "alert";
  const d = getNotificationDisplay(notification, {});
  const Icon = d.icon;
  const t = d.theme;
  const timeAgo = notification.created_at ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }) : "";
  const handleActivate = () => {
    onDismiss?.();
    onMarkRead?.();
  };
  const inner = /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        TILE_HEIGHT,
        "relative flex w-full flex-col justify-between overflow-hidden rounded-xl border p-2.5 transition-all hover:shadow-md",
        t.shell,
        notification.read && "opacity-75",
        !notification.read && "ring-1 ring-primary/10",
        className
      ),
      children: [
        !notification.read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("absolute inset-y-2 left-0 w-1 rounded-full", t.unreadBar), "aria-hidden": true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs",
                t.iconBox
              ),
              children: isAlert ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }) : d.guestInitial
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("min-w-0 flex-1 truncate text-xs font-bold leading-none", t.headline), children: d.headline }),
          onDismiss && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-6 w-6 shrink-0 rounded-full text-muted-foreground hover:bg-muted",
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                onDismiss();
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("truncate text-sm font-semibold leading-tight", t.name), children: d.guestName }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between gap-2 min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("min-w-0 flex-1 truncate text-[10px] leading-snug", t.summary), children: d.summaryLine }),
          timeAgo && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("shrink-0 text-[9px] whitespace-nowrap", t.time), children: timeAgo })
        ] })
      ]
    }
  );
  if (notification.link) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: notification.link,
        className: cn("block h-[5.75rem] w-full"),
        onClick: handleActivate,
        children: inner
      }
    );
  }
  if (onDismiss) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "block h-[5.75rem] w-full cursor-pointer text-left",
        onClick: handleActivate,
        children: inner
      }
    );
  }
  return inner;
}
async function getNotificationsApi(token, params = {}) {
  const search = new URLSearchParams();
  if (params.limit) search.set("limit", String(params.limit));
  if (params.unread_only) search.set("unread_only", "true");
  const q = search.toString();
  const data = await apiFetch(
    `/api/v1/notifications${q ? `?${q}` : ""}`,
    { token }
  );
  if (!data.success || !Array.isArray(data.notifications)) {
    throw new Error("Invalid notifications response");
  }
  return { notifications: data.notifications, unread_count: data.unread_count };
}
async function markNotificationReadApi(token, id) {
  const data = await apiFetch(`/api/v1/notifications/${id}/read`, { token, method: "PATCH" });
  return data;
}
async function markAllNotificationsReadApi(token) {
  const data = await apiFetch(
    "/api/v1/notifications/read-all",
    { token, method: "PATCH" }
  );
  return data;
}
async function deleteNotificationApi(token, id) {
  const data = await apiFetch(
    `/api/v1/notifications/${id}`,
    { token, method: "DELETE" }
  );
  return data;
}
const notificationKeys = {
  all: ["notifications"],
  list: (params) => [...notificationKeys.all, "list", params],
  unreadCount: () => [...notificationKeys.all, "unread-count"]
};
function useNotificationsQuery(params = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getNotificationsApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 1e4
  });
}
function useMarkNotificationReadMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      if (!token) throw new Error("You must be signed in");
      return markNotificationReadApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
}
function useMarkAllNotificationsReadMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error("You must be signed in");
      return markAllNotificationsReadApi(token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
}
function useDeleteNotificationMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      if (!token) throw new Error("You must be signed in");
      return deleteNotificationApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
}
export {
  NotificationCard as N,
  useNotificationsQuery as a,
  useMarkAllNotificationsReadMutation as b,
  useDeleteNotificationMutation as c,
  notificationKeys as n,
  useMarkNotificationReadMutation as u
};
