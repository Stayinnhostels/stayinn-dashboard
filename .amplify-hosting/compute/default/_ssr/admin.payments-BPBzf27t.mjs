import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { C as Card, c as CardContent } from "./card-DCDRzI6q.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { S as StatCard } from "./stat-card-CNUUkvxI.mjs";
import { b as StatCardsRowSkeleton, c as PaymentsTableSkeleton } from "./admin-page-skeletons-NTMVG02X.mjs";
import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { b as bookingKeys } from "./booking.keys-CTE8dzAR.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
import { u as usePaymentsQuery } from "./usePaymentsQuery-Blc2sag1.mjs";
import { f as formatMoney, n as normalizeMoneyCurrency, p as paymentStatusLabel } from "./payments-CPHCHGiR.mjs";
import "../_libs/sonner.mjs";
import { W as Wallet, H as Clock, x as CircleCheck, X, o as Search, J as FileText } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "./skeleton-CoUJiN10.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
async function getRevenueSummaryApi(token) {
  const data = await apiFetch("/api/v1/bookings/stats/revenue", {
    token
  });
  if (!data.success || !data.revenue) {
    throw new Error("Invalid revenue summary response");
  }
  return data.revenue;
}
function useRevenueSummaryQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: bookingKeys.revenue(),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view revenue");
      return getRevenueSummaryApi(token);
    },
    enabled: Boolean(token),
    staleTime: 0
  });
}
function PaymentsPage() {
  const [query, setQuery] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [page, setPage] = reactExports.useState(1);
  const paymentStatus = statusFilter === "all" ? void 0 : statusFilter;
  const {
    data,
    isLoading,
    isError
  } = usePaymentsQuery({
    page,
    limit: 50,
    status: paymentStatus,
    search: query.trim() || void 0
  });
  const {
    data: revenue,
    isLoading: revenueLoading
  } = useRevenueSummaryQuery();
  const payments = data?.payments ?? [];
  const pagination = data?.pagination;
  const statusBadgeClass = reactExports.useMemo(() => ({
    succeeded: "border-emerald-500/40 text-emerald-700 bg-emerald-500/10",
    pending: "border-amber-500/40 text-amber-700 bg-amber-500/10",
    refunded: "border-rose-500/40 text-rose-700 bg-rose-500/10",
    partial_refund: "border-orange-500/40 text-orange-700 bg-orange-500/10",
    cancelled: "border-muted-foreground/40 text-muted-foreground",
    failed: "border-destructive/40 text-destructive"
  }), []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    revenueLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(StatCardsRowSkeleton, { count: 8 }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Revenue this month (PKR)", value: revenueLoading ? "…" : formatMoney(revenue?.pkr?.month ?? 0, "pkr"), icon: Wallet, accent: "success", delta: `All-time collected ${formatMoney(revenue?.pkr?.total ?? 0, "pkr")}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Outstanding rent (PKR)", value: formatMoney(revenue?.pkr?.outstanding_rent ?? 0, "pkr"), icon: Clock, accent: "warning", delta: `${revenue?.pkr?.outstanding_count ?? 0} active stay(s) with unpaid months` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Pending requests (PKR)", value: formatMoney(revenue?.pkr?.pending_amount ?? 0, "pkr"), icon: Clock, accent: "warning", delta: `${revenue?.pkr?.pending_count ?? 0} unconfirmed booking(s)` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Revenue this month (USD)", value: revenueLoading ? "…" : formatMoney(revenue?.usd?.month ?? 0, "usd"), icon: Wallet, accent: "info", delta: `All-time collected ${formatMoney(revenue?.usd?.total ?? 0, "usd")}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Outstanding rent (USD)", value: formatMoney(revenue?.usd?.outstanding_rent ?? 0, "usd"), icon: Clock, accent: "warning", delta: `${revenue?.usd?.outstanding_count ?? 0} active stay(s) with unpaid months` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Pending requests (USD)", value: formatMoney(revenue?.usd?.pending_amount ?? 0, "usd"), icon: Clock, accent: "warning", delta: `${revenue?.usd?.pending_count ?? 0} unconfirmed booking(s)` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Succeeded bookings", value: (revenue?.pkr?.succeeded_count ?? 0) + (revenue?.usd?.succeeded_count ?? 0), icon: CircleCheck, accent: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Refunded", value: formatMoney(revenue?.pkr?.refunded_amount ?? 0, "pkr"), icon: X, accent: "info", delta: [(revenue?.pkr?.refunded_count ?? 0) > 0 ? `PKR ${revenue?.pkr?.refunded_count ?? 0} refund(s)` : null, (revenue?.usd?.refunded_amount ?? 0) > 0 ? `${formatMoney(revenue?.usd?.refunded_amount ?? 0, "usd")} (${revenue?.usd?.refunded_count ?? 0})` : null].filter(Boolean).join(" · ") || "No refunds yet" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-center gap-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[220px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: query, onChange: (e) => {
          setQuery(e.target.value);
          setPage(1);
        }, placeholder: "Search guest, email, room…", className: "pl-9" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: (v) => {
        setStatusFilter(v);
        setPage(1);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All statuses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "succeeded", children: "Succeeded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "refunded", children: "Refunded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "partial_refund", children: "Partial refund" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentsTableSkeleton, {}) : isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-16 text-center text-sm text-destructive", children: "Could not load payments." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Guest" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Room" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Source" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: payments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "py-10 text-center text-sm text-muted-foreground", children: "No payments match your filters." }) }) : payments.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentRow, { payment: p, statusBadgeClass }, p.id)) })
    ] }) }) }),
    pagination && pagination.pages > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", disabled: page <= 1, onClick: () => setPage((p) => p - 1), children: "Previous" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
        "Page ",
        pagination.page,
        " of ",
        pagination.pages
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", disabled: page >= pagination.pages, onClick: () => setPage((p) => p + 1), children: "Next" })
    ] }) : null
  ] });
}
function PaymentRow({
  payment: p,
  statusBadgeClass
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-mono text-xs", children: [
      "#",
      p.booking_id.slice(-8).toUpperCase()
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/bookings/$id", params: {
        id: p.booking_id
      }, className: "font-semibold hover:underline", children: p.guest_name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: p.guest_email })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.room_title ?? "—" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "capitalize text-xs text-muted-foreground", children: p.source === "walk_in" ? "Walk-in" : p.source }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-bold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: formatMoney(p.amount, normalizeMoneyCurrency(p.currency)) }),
      p.collected_rent != null && p.total_amount != null && p.collected_rent !== p.total_amount && p.booking_status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-normal text-muted-foreground", children: [
        "of ",
        formatMoney(p.total_amount, normalizeMoneyCurrency(p.currency)),
        " contract"
      ] }),
      p.booking_status === "cancelled" && (p.amount_refunded != null || p.amount_retained != null) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-normal text-muted-foreground", children: [
        "Refunded ",
        formatMoney(p.amount_refunded ?? 0, normalizeMoneyCurrency(p.currency)),
        (p.amount_retained ?? 0) > 0 && ` · Kept ${formatMoney(p.amount_retained ?? 0, normalizeMoneyCurrency(p.currency))}`
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: statusBadgeClass[p.status] ?? "", children: paymentStatusLabel(p.status) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.created_at ? new Date(p.created_at).toLocaleDateString() : "—" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "ghost", title: "View booking & invoice", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/bookings/$id", params: {
      id: p.booking_id
    }, hash: "booking-invoice", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }) }) }) })
  ] });
}
export {
  PaymentsPage as component
};
