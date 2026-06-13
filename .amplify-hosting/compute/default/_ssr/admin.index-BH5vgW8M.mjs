import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { S as StatCard } from "./stat-card-CNUUkvxI.mjs";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./card-DCDRzI6q.mjs";
import { S as Skeleton } from "./skeleton-CoUJiN10.mjs";
import { u as useBookingOverviewStatsQuery } from "./useBookingOverviewStatsQuery-1OdTNf4v.mjs";
import { p as profiles, b as bookings, r as rooms, g as getRoom } from "./mock-store-BZjn1Nz4.mjs";
import { u as useBookingsQuery } from "./useBookingsQuery-DUnY8M_b.mjs";
import { u as useRoomsQuery } from "./useRoomsQuery-CTFHt2Dq.mjs";
import { f as formatMoney, c as chartTooltipMoney } from "./payments-CPHCHGiR.mjs";
import "../_libs/sonner.mjs";
import { C as CalendarCheck, d as LogOut, D as DoorOpen, B as BedDouble } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, A as AreaChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Area, P as PieChart, b as Pie, c as Cell, L as Legend, B as BarChart, d as Bar, e as LineChart, f as Line } from "../_libs/recharts.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./apiFetch-Cc9rh5iq.mjs";
import "./router-CXpZMrmV.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
import "./booking.keys-CTE8dzAR.mjs";
import "./room.keys-BMDsz0NU.mjs";
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
const PIE_COLORS = ["#f97316", "#0ea5e9", "#facc15", "#22c55e", "#a855f7", "#ec4899"];
const chartCard = "border-border/60 bg-card/60 backdrop-blur";
function ChartState({
  loading,
  error,
  errorMessage,
  empty,
  emptyMessage,
  children
}) {
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-full w-full rounded-lg" });
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground", children: errorMessage });
  }
  if (empty) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center text-sm text-muted-foreground", children: emptyMessage });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
function OverviewPage() {
  const {
    data: overviewStats,
    isLoading: overviewLoading,
    isError: overviewError,
    error: overviewErr
  } = useBookingOverviewStatsQuery(30, 8, 6);
  const {
    data: roomsApi
  } = useRoomsQuery({
    limit: 100
  });
  const {
    data: bookingsApi
  } = useBookingsQuery({
    limit: 100
  });
  const chartErrorMessage = overviewErr instanceof Error ? overviewErr.message : "Could not load booking stats";
  const {
    data
  } = useQuery({
    queryKey: ["mock", "overview"],
    queryFn: async () => ({
      rooms: [...rooms],
      bookings: [...bookings],
      users: [...profiles]
    })
  });
  const rooms$1 = roomsApi?.rooms?.length ? roomsApi.rooms : data?.rooms ?? [];
  const bookings$1 = bookingsApi?.bookings?.length ? bookingsApi.bookings : data?.bookings ?? [];
  const totalBeds = rooms$1.reduce((s, r) => s + r.beds_total, 0);
  const availableBeds = rooms$1.reduce((s, r) => s + r.beds_available, 0);
  const occupiedBeds = totalBeds - availableBeds;
  const occupancyRate = totalBeds > 0 ? Math.round(occupiedBeds / totalBeds * 100) : 0;
  const totalRooms = roomsApi?.pagination?.total ?? rooms$1.length;
  const availableRooms = rooms$1.filter((r) => r.status === "available").length;
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const totalBookings = overviewStats?.status?.total ?? bookingsApi?.pagination?.total ?? bookings$1.length;
  const checkOutsToday = bookings$1.filter((b) => b.check_out === todayStr).length;
  const succeededBookings = bookings$1.filter((b) => b.status === "confirmed" || b.status === "checked_in" || b.status === "checked_out");
  const dailyBookings = overviewStats?.daily.series.map((p) => ({
    key: p.date,
    label: p.label,
    bookings: p.bookings
  })) ?? [];
  const weeklyBookings = overviewStats?.weekly.series.map((p) => ({
    key: p.key,
    label: p.label,
    week_start: p.week_start,
    week_end: p.week_end,
    bookings: p.bookings
  })) ?? [];
  const statusData = overviewStats?.status.breakdown ?? [];
  const monthlyBookings = overviewStats?.monthly.series.map((m) => ({
    key: m.key,
    label: m.label,
    bookings: m.bookings
  })) ?? [];
  const monthlyRevenueSeries = overviewStats?.monthly.series.map((m) => ({
    key: m.key,
    label: m.label,
    revenue_pkr: m.revenue_pkr ?? m.revenue,
    revenue_usd: m.revenue_usd ?? 0
  })) ?? [];
  const sourceMap = {};
  bookings$1.forEach((b) => {
    sourceMap[b.source] = (sourceMap[b.source] ?? 0) + 1;
  });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({
    name,
    value
  }));
  const revByCategory = {};
  succeededBookings.forEach((b) => {
    const room = getRoom(b.room_id ?? "");
    const cat = room?.category ?? "other";
    revByCategory[cat] = (revByCategory[cat] ?? 0) + b.total_amount;
  });
  const revCategoryData = Object.entries(revByCategory).map(([name, value]) => ({
    name,
    value
  }));
  const bookingsByRoom = {};
  bookings$1.forEach((b) => {
    if (b.room_id) bookingsByRoom[b.room_id] = (bookingsByRoom[b.room_id] ?? 0) + 1;
  });
  const topRooms = Object.entries(bookingsByRoom).map(([id, count]) => ({
    name: getRoom(id)?.title ?? "—",
    bookings: count
  })).sort((a, b) => b.bookings - a.bookings).slice(0, 6);
  const dayOfWeek = Array.from({
    length: 7
  }).map((_, i) => ({
    label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
    bookings: 0
  }));
  bookings$1.forEach((b) => {
    const dateStr = "move_in" in b && b.move_in ? b.move_in : "check_in" in b ? b.check_in : "";
    const d = new Date(dateStr ?? "");
    if (!Number.isNaN(d.getTime())) dayOfWeek[d.getDay()].bookings += 1;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Bookings", value: totalBookings, icon: CalendarCheck, accent: "primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Check-outs Today", value: checkOutsToday, icon: LogOut, accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Rooms", value: totalRooms, delta: `${availableRooms} available`, icon: DoorOpen, accent: "info" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Occupancy", value: `${occupancyRate}%`, delta: `${occupiedBeds} / ${totalBeds} beds`, icon: BedDouble, accent: "primary" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground", children: "Booking Analytics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `lg:col-span-2 ${chartCard}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Daily bookings — last 30 days" }),
            !overviewLoading && !overviewError && overviewStats ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              overviewStats.daily.series.reduce((s, p) => s + p.bookings, 0),
              " bookings in this period"
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-[260px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartState, { loading: overviewLoading, error: overviewError, errorMessage: chartErrorMessage, empty: !overviewLoading && !overviewError && dailyBookings.every((d) => d.bookings === 0), emptyMessage: "No booking data for the last 30 days", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: dailyBookings, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "bk-daily", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "oklch(0.62 0.22 35)", stopOpacity: 0.55 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "oklch(0.62 0.22 35)", stopOpacity: 0 })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.2 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tickLine: false, axisLine: false, fontSize: 11 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, allowDecimals: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { labelFormatter: (_, payload) => {
              const row = payload?.[0]?.payload;
              return row?.key ?? row?.label ?? "";
            }, formatter: (value) => [`${value}`, "Bookings"] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "bookings", stroke: "oklch(0.62 0.22 35)", fill: "url(#bk-daily)", strokeWidth: 2 })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: chartCard, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Booking status" }),
            !overviewLoading && !overviewError && overviewStats ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              overviewStats.status.total,
              " total bookings"
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-[260px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartState, { loading: overviewLoading, error: overviewError, errorMessage: chartErrorMessage, empty: !overviewLoading && !overviewError && statusData.length === 0, emptyMessage: "No bookings yet", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: statusData, dataKey: "value", nameKey: "name", innerRadius: 45, outerRadius: 85, paddingAngle: 3, children: statusData.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLORS[i % PIE_COLORS.length] }, row.status)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (value, name) => [`${value}`, name] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: {
              fontSize: 11
            } })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: chartCard, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Weekly bookings" }),
            !overviewLoading && !overviewError && overviewStats ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Last ",
              overviewStats.weekly.weeks,
              " weeks"
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-[240px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartState, { loading: overviewLoading, error: overviewError, errorMessage: chartErrorMessage, empty: !overviewLoading && !overviewError && weeklyBookings.every((w) => w.bookings === 0), emptyMessage: "No bookings in the last 8 weeks", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: weeklyBookings, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.2 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tickLine: false, axisLine: false, fontSize: 11 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, allowDecimals: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { labelFormatter: (_, payload) => {
              const row = payload?.[0]?.payload;
              if (row?.week_start && row?.week_end) return `${row.week_start} – ${row.week_end}`;
              return "";
            }, formatter: (value) => [`${value}`, "Bookings"] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "bookings", fill: "oklch(0.62 0.22 35)", radius: [6, 6, 0, 0] })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: chartCard, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Monthly bookings" }),
            !overviewLoading && !overviewError && overviewStats ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Last ",
              overviewStats.monthly.months,
              " months"
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-[240px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartState, { loading: overviewLoading, error: overviewError, errorMessage: chartErrorMessage, empty: !overviewLoading && !overviewError && monthlyBookings.every((m) => m.bookings === 0), emptyMessage: "No bookings in this period", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: monthlyBookings, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.2 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tickLine: false, axisLine: false, fontSize: 11 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, allowDecimals: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (value) => [`${value}`, "Bookings"] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "bookings", stroke: "oklch(0.55 0.13 200)", strokeWidth: 2.5, dot: {
              r: 3
            } })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: chartCard, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Booking sources" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-[240px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: sourceData, dataKey: "value", nameKey: "name", outerRadius: 85, children: sourceData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLORS[i % PIE_COLORS.length] }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: {
              fontSize: 11
            } })
          ] }) }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground", children: "Revenue Analytics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `lg:col-span-2 ${chartCard}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Monthly revenue (PKR & USD)" }),
            !overviewLoading && !overviewError && overviewStats ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              formatMoney(monthlyRevenueSeries.reduce((s, m) => s + m.revenue_pkr, 0), "pkr"),
              " ·",
              " ",
              formatMoney(monthlyRevenueSeries.reduce((s, m) => s + m.revenue_usd, 0), "usd"),
              " (excl. cancelled)"
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-[280px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartState, { loading: overviewLoading, error: overviewError, errorMessage: chartErrorMessage, empty: !overviewLoading && !overviewError && monthlyRevenueSeries.every((m) => m.revenue_pkr === 0 && m.revenue_usd === 0), emptyMessage: "No revenue in this period", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: monthlyRevenueSeries, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.2 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tickLine: false, axisLine: false, fontSize: 11 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v, name) => chartTooltipMoney(v, name) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: {
              fontSize: 11
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "revenue_pkr", name: "PKR", fill: "oklch(0.62 0.22 35)", radius: [8, 8, 0, 0] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "revenue_usd", name: "USD", fill: "oklch(0.55 0.13 200)", radius: [8, 8, 0, 0] })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: chartCard, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Revenue by room type" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-[280px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: revCategoryData, dataKey: "value", nameKey: "name", outerRadius: 95, children: revCategoryData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLORS[i % PIE_COLORS.length] }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => formatMoney(Number(v), "pkr") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: {
              fontSize: 11
            } })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `${chartCard} lg:col-span-2`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Top booked rooms" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-[260px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: topRooms, layout: "vertical", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.2 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tickLine: false, axisLine: false, fontSize: 11, allowDecimals: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tickLine: false, axisLine: false, fontSize: 11, width: 140 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "bookings", fill: "oklch(0.62 0.22 35)", radius: [0, 6, 6, 0] })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: chartCard, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Peak booking days" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-[260px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: dayOfWeek, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.2 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tickLine: false, axisLine: false, fontSize: 11 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, allowDecimals: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "bookings", fill: "oklch(0.55 0.13 200)", radius: [6, 6, 0, 0] })
          ] }) }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  OverviewPage as component
};
