import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./card-DCDRzI6q.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { S as StatCard } from "./stat-card-CNUUkvxI.mjs";
import { b as StatCardsRowSkeleton, C as ChartCardSkeleton, d as AdminTableSkeleton } from "./admin-page-skeletons-NTMVG02X.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { u as usePaymentsQuery } from "./usePaymentsQuery-Blc2sag1.mjs";
import { u as useBookingOverviewStatsQuery } from "./useBookingOverviewStatsQuery-1OdTNf4v.mjs";
import { f as formatMoney, c as chartTooltipMoney, n as normalizeMoneyCurrency, a as paymentMethodLabel } from "./payments-CPHCHGiR.mjs";
import "../_libs/sonner.mjs";
import { W as Wallet, _ as CreditCard } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, d as Bar } from "../_libs/recharts.mjs";
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
import "./skeleton-CoUJiN10.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./apiFetch-Cc9rh5iq.mjs";
import "./router-CXpZMrmV.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
import "./booking.keys-CTE8dzAR.mjs";
import "../_libs/lodash.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
function FinancialsPage() {
  const {
    data: overviewStats,
    isLoading: statsLoading
  } = useBookingOverviewStatsQuery(30, 8, 6);
  const {
    data: paymentsData,
    isLoading: paymentsLoading
  } = usePaymentsQuery({
    page: 1,
    limit: 20
  });
  const revenue = overviewStats?.revenue;
  const payments = paymentsData?.payments ?? [];
  const months = overviewStats?.monthly.series.map((m) => ({
    key: m.key,
    label: m.label,
    revenue_pkr: m.revenue_pkr ?? m.revenue,
    revenue_usd: m.revenue_usd ?? 0
  })) ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    statsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(StatCardsRowSkeleton, { count: 4 }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total revenue (PKR)", value: formatMoney(revenue?.pkr?.total ?? 0, "pkr"), icon: Wallet, delta: "All-time collected · Pakistan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total revenue (USD)", value: formatMoney(revenue?.usd?.total ?? 0, "usd"), icon: Wallet, accent: "info", delta: "All-time collected · International" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Pending (PKR)", value: formatMoney(revenue?.pkr?.pending_amount ?? 0, "pkr"), icon: CreditCard, delta: "Awaiting confirmation" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Pending (USD)", value: formatMoney(revenue?.usd?.pending_amount ?? 0, "usd"), icon: CreditCard, accent: "info", delta: "Awaiting confirmation" })
    ] }),
    statsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCardSkeleton, { titleWidth: "w-56" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Revenue by month (PKR & USD)" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-[300px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: months, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.2 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tickLine: false, axisLine: false, fontSize: 12 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 12 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v, name) => chartTooltipMoney(v, name) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: {
          fontSize: 11
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "revenue_pkr", name: "PKR", fill: "oklch(0.62 0.22 35)", radius: [8, 8, 0, 0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "revenue_usd", name: "USD", fill: "oklch(0.55 0.13 200)", radius: [8, 8, 0, 0] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Recent payments" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: paymentsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(AdminTableSkeleton, { rows: 8, columns: 6, bare: true }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Guest" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Room" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Method" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: payments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-8 text-center text-sm text-muted-foreground", children: "No payments yet." }) }) : payments.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.created_at ? new Date(p.created_at).toLocaleDateString() : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/bookings/$id", params: {
            id: p.booking_id
          }, className: "font-semibold hover:underline", children: p.guest_name }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.room_title ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono", children: formatMoney(p.amount, normalizeMoneyCurrency(p.currency)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "capitalize", children: p.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "capitalize text-xs text-muted-foreground", children: paymentMethodLabel(p.method, p.source) })
        ] }, p.id)) })
      ] }) })
    ] })
  ] });
}
export {
  FinancialsPage as component
};
