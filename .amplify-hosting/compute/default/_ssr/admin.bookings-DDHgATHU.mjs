import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { f as useMatch, O as Outlet, L as Link } from "../_libs/tanstack__react-router.mjs";
import { C as Card, c as CardContent } from "./card-DCDRzI6q.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { B as BookingRefundDialog, a as BookingsListSkeleton } from "./booking-refund-dialog-Bbxe9-Ie.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-fMRf3trd.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useBookingsQuery } from "./useBookingsQuery-DUnY8M_b.mjs";
import { u as useUpdateBookingStatusMutation } from "./security-deposit-CEf7jVFl.mjs";
import { f as formatMoney, n as normalizeMoneyCurrency } from "./payments-CPHCHGiR.mjs";
import { o as Search, p as LayoutGrid, q as List, C as CalendarCheck, b as Eye, J as FileText } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "./skeleton-CoUJiN10.mjs";
import "./dialog-SXOy8WpB.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "./label-JU3yqRBo.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "./resident.types-DjDosJYK.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./apiFetch-Cc9rh5iq.mjs";
import "./router-CXpZMrmV.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
import "./booking.keys-CTE8dzAR.mjs";
import "./resident.keys-DK2A-v-L.mjs";
import "./usePaymentsQuery-Blc2sag1.mjs";
import "./room.keys-BMDsz0NU.mjs";
const PAGE_SIZE = 50;
const STATUSES = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];
const statusColor = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  confirmed: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  checked_in: "bg-violet-500/15 text-violet-600 border-violet-500/30",
  checked_out: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-600 border-rose-500/30"
};
function BookingsAdminPage() {
  const detailMatch = useMatch({
    from: "/admin/bookings/$id",
    shouldThrow: false
  });
  if (detailMatch) return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BookingsListPage, {});
}
function BookingsListPage() {
  const [query, setQuery] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [view, setView] = reactExports.useState("grid");
  const [page, setPage] = reactExports.useState(1);
  const listParams = reactExports.useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    ...statusFilter !== "all" ? {
      status: statusFilter
    } : {},
    ...query.trim() ? {
      search: query.trim()
    } : {}
  }), [page, statusFilter, query]);
  const {
    data,
    isLoading,
    isError,
    error
  } = useBookingsQuery(listParams);
  const bookings = data?.bookings ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.pages ?? 1;
  const updateStatus = useUpdateBookingStatusMutation();
  const [cancelBookingId, setCancelBookingId] = reactExports.useState(null);
  const [checkoutBookingId, setCheckoutBookingId] = reactExports.useState(null);
  const cancelBooking = bookings.find((b) => b.id === cancelBookingId) ?? null;
  const checkoutBooking = bookings.find((b) => b.id === checkoutBookingId) ?? null;
  function applyStatus(id, status, amountRefunded, checkoutExtras) {
    const bookingRow = bookings.find((b) => b.id === id) ?? null;
    updateStatus.mutate({
      id,
      status,
      amount_refunded: amountRefunded,
      ...status === "checked_out" && checkoutExtras && bookingRow?.security_status === "paid" ? {
        security_returned: checkoutExtras.securityReturned
      } : {}
    }, {
      onSuccess: () => {
        toast.success(status === "cancelled" ? "Booking cancelled" : status === "checked_out" ? "Guest checked out" : "Booking updated");
        setCancelBookingId(null);
        setCheckoutBookingId(null);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed")
    });
  }
  function onStatusChange(id, status, currentStatus) {
    if (status === currentStatus) return;
    if (status === "cancelled") {
      setCancelBookingId(id);
      return;
    }
    if (status === "checked_out") {
      setCheckoutBookingId(id);
      return;
    }
    applyStatus(id, status);
  }
  function onCancelConfirm(amountRefunded) {
    if (!cancelBookingId) return;
    applyStatus(cancelBookingId, "cancelled", amountRefunded);
  }
  function onCheckoutConfirm(amountRefunded, checkoutExtras) {
    if (!checkoutBookingId) return;
    applyStatus(checkoutBookingId, "checked_out", amountRefunded, checkoutExtras);
  }
  function exportCsv() {
    const rows = [["ID", "Guest", "Email", "Room", "Seats", "Move-in", "Check-out", "Status", "Total"], ...bookings.map((b) => [b.id, b.guest_name, b.guest_email, b.room_title ?? "", String(b.seats_booked), b.move_in ?? "", b.check_out ?? "", b.status, String(b.total_amount)])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {
      type: "text/csv"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BookingRefundDialog, { open: cancelBookingId != null, booking: cancelBooking, mode: "cancel", submitting: updateStatus.isPending, onClose: () => setCancelBookingId(null), onConfirm: onCancelConfirm }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BookingRefundDialog, { open: checkoutBookingId != null, booking: checkoutBooking, mode: "checkout", submitting: updateStatus.isPending, onClose: () => setCheckoutBookingId(null), onConfirm: onCheckoutConfirm }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-center gap-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-[220px] flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: query, onChange: (e) => {
          setQuery(e.target.value);
          setPage(1);
        }, placeholder: "Search by guest, room, ID…", className: "pl-9" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: (v) => {
        setStatusFilter(v);
        setPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All statuses" }),
          STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s.replace("_", " ") }, s))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: view, onValueChange: (v) => setView(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "grid", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "table", children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "calendar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "h-4 w-4" }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: exportCsv, disabled: bookings.length === 0, children: "Export CSV" })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(BookingsListSkeleton, { view }) : isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-sm text-destructive", children: error instanceof Error ? error.message : "Failed to load bookings" }) }) : bookings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-sm text-muted-foreground", children: "No bookings found." }) }) : view === "grid" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: bookings.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden border-border/60 transition-shadow hover:shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex aspect-[4/3] items-center justify-center bg-muted", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "h-12 w-12 text-muted-foreground/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `absolute right-2 top-2 capitalize ${statusColor[b.status]}`, children: b.status.replace("_", " ") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-bold tracking-tight", children: b.guest_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] text-muted-foreground", children: [
            "#",
            b.id.slice(-6)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-muted-foreground", children: b.room_title ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          b.move_in,
          " → ",
          b.check_out,
          " · ",
          b.seats_booked,
          " seat(s)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-extrabold", children: formatMoney(b.total_amount, normalizeMoneyCurrency(b.currency)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/bookings/$id", params: {
            id: b.id
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }),
            " View"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: b.status, onValueChange: (v) => onStatusChange(b.id, v, b.status), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-32 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s.replace("_", " ") }, s)) })
          ] })
        ] })
      ] })
    ] }, b.id)) }) : view === "table" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Booking" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Guest" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Room" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Dates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Seats" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-44", children: "Quick action" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: bookings.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-mono text-xs", children: [
          "#",
          b.id.slice(-6)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: b.guest_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: b.guest_email })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: b.room_title ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-sm", children: [
          b.move_in,
          " → ",
          b.check_out
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: b.seats_booked }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatMoney(b.total_amount, normalizeMoneyCurrency(b.currency)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `capitalize ${statusColor[b.status]}`, children: b.status.replace("_", " ") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: b.status, onValueChange: (v) => onStatusChange(b.id, v, b.status), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s.replace("_", " ") }, s)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "ghost", title: "View booking", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/bookings/$id", params: {
            id: b.id
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "ghost", title: "Invoice / Bill", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/bookings/$id", params: {
            id: b.id
          }, hash: "booking-invoice", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }) }) })
        ] }) })
      ] }, b.id)) })
    ] }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarView, { bookings }),
    totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: page === 1, onClick: () => setPage((p) => p - 1), children: "Previous" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        "Page ",
        page,
        " of ",
        totalPages,
        pagination ? ` · ${pagination.total} bookings` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: page >= totalPages, onClick: () => setPage((p) => p + 1), children: "Next" })
    ] })
  ] });
}
function CalendarView({
  bookings
}) {
  const [cursor, setCursor] = reactExports.useState(() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(1);
    return d;
  });
  const month = cursor.getMonth();
  const year = cursor.getFullYear();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const total = startPad + last.getDate();
  const cells = Array.from({
    length: total
  }).map((_, i) => i < startPad ? null : new Date(year, month, i - startPad + 1));
  while (cells.length % 7 !== 0) cells.push(null);
  function bookingsForDay(d) {
    const iso = d.toISOString().slice(0, 10);
    return bookings.filter((b) => b.move_in && b.check_out && iso >= b.move_in && iso <= b.check_out);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setCursor(new Date(year, month - 1, 1)), children: "‹ Prev" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: cursor.toLocaleString("en", {
        month: "long",
        year: "numeric"
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setCursor(new Date(year, month + 1, 1)), children: "Next ›" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground", children: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: d }, d)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 grid grid-cols-7 gap-1", children: cells.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-20 rounded-md border border-border/60 bg-card/40 p-1 text-xs", children: d && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: d.getDate() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 space-y-0.5", children: [
        bookingsForDay(d).slice(0, 2).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/bookings/$id", params: {
          id: b.id
        }, className: "block truncate rounded bg-primary/15 px-1 text-[10px] font-semibold text-primary hover:bg-primary/25", children: b.guest_name }, b.id)),
        bookingsForDay(d).length > 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
          "+",
          bookingsForDay(d).length - 2,
          " more"
        ] })
      ] })
    ] }) }, i)) })
  ] }) });
}
export {
  BookingsAdminPage as component
};
