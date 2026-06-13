import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { N as NotificationsGridSkeleton } from "./admin-page-skeletons-NTMVG02X.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { C as Card, c as CardContent } from "./card-DCDRzI6q.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { a as useNotificationsQuery, u as useMarkNotificationReadMutation, b as useMarkAllNotificationsReadMutation, c as useDeleteNotificationMutation, N as NotificationCard } from "./useNotificationMutations-Ddt2HELU.mjs";
import { m as Bell, v as Trash2 } from "../_libs/lucide-react.mjs";
import "./skeleton-CoUJiN10.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./table-RrXKMtST.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./payments-CPHCHGiR.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./apiFetch-Cc9rh5iq.mjs";
import "./router-CXpZMrmV.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
import "../_libs/date-fns.mjs";
function NotificationTile({
  notification,
  onDelete,
  onMarkRead
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative h-[5.75rem]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationCard, { notification, variant: "tile", onMarkRead }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", className: "absolute right-1.5 top-1.5 h-6 w-6 rounded-full text-primary-foreground/0 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary-foreground hover:bg-white/20", onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      onDelete();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
  ] });
}
function NotificationsPage() {
  const {
    data,
    isLoading,
    isError
  } = useNotificationsQuery({
    limit: 100
  });
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();
  const remove = useDeleteNotificationMutation();
  const items = data?.notifications ?? [];
  const unread = data?.unread_count ?? 0;
  const unreadItems = items.filter((n) => !n.read);
  const readItems = items.filter((n) => n.read);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card px-4 py-3 shadow-[var(--shadow-soft)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-primary", children: "Live alerts" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground", children: unread }),
        " unread ·",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground", children: items.length }),
        " total"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => markAll.mutate(void 0, {
        onSuccess: () => toast.success("All marked as read")
      }), disabled: unread === 0 || markAll.isPending, children: "Mark all read" })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsGridSkeleton, {}) : isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-sm text-destructive", children: "Could not load notifications." }) }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "mx-auto h-10 w-10 text-muted-foreground/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-bold", children: "No notifications" })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      unreadItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold uppercase tracking-wider text-muted-foreground", children: "Unread" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: unreadItems.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationTile, { notification: n, onMarkRead: () => markRead.mutate(n.id), onDelete: () => remove.mutate(n.id, {
          onSuccess: () => toast.success("Deleted")
        }) }, n.id)) })
      ] }),
      readItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold uppercase tracking-wider text-muted-foreground", children: "Earlier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: readItems.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationTile, { notification: n, onDelete: () => remove.mutate(n.id, {
          onSuccess: () => toast.success("Deleted")
        }) }, n.id)) })
      ] })
    ] })
  ] });
}
export {
  NotificationsPage as component
};
