import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/admin/stat-card";
import { StatCardsRowSkeleton } from "@/components/admin/admin-page-skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingOverviewStatsQuery } from "@/queries/bookings/useBookingOverviewStatsQuery";
import { BedDouble, CalendarCheck, LogOut, DoorOpen } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { useBookingsQuery } from "@/queries/bookings";
import { useRoomsQuery } from "@/queries/rooms";
import { chartTooltipMoney, formatMoney } from "@/lib/payments";
import type { Room } from "@/types/domain/room.types";
import { ExtrasCollectedCharts } from "@/components/admin/extras-collected-charts";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { HintTooltip } from "@/components/ui/hint-tooltip";

export const Route = createFileRoute("/admin/")({ component: OverviewPage });

const PIE_COLORS = ["#0066B2", "#0ea5e9", "#facc15", "#22c55e", "#a855f7", "#ec4899"];
const chartCard = "border-border/60 bg-card/60 backdrop-blur";

function topNamedSlices(items: { name: string; value: number }[], limit = 6) {
  const sorted = [...items]
    .map((row) => ({
      name: (row.name || "Unknown").trim() || "Unknown",
      value: row.value,
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);
  if (sorted.length <= limit) return sorted;
  const head = sorted.slice(0, limit);
  const rest = sorted.slice(limit).reduce((sum, row) => sum + row.value, 0);
  return [...head, { name: "Other", value: rest }];
}

function OverviewPie({
  data,
  valueFormatter,
}: {
  data: { name: string; value: number }[];
  valueFormatter?: (value: number, name: string) => [string, string];
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="38%"
              outerRadius="68%"
              paddingAngle={2}
            >
              {data.map((row, i) => (
                <Cell key={`${row.name}-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={
                valueFormatter ??
                ((value, name) => [`${value}`, String(name)] as [string, string])
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 flex max-h-[4.75rem] flex-wrap content-start justify-center gap-x-3 gap-y-1 overflow-y-auto px-1">
        {data.map((row, i) => (
          <li
            key={`${row.name}-${i}`}
            className="flex max-w-[9.5rem] items-center gap-1.5 text-[11px] leading-tight text-foreground"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <HintTooltip label={row.name} className="min-w-0">
              <span className="truncate">{row.name}</span>
            </HintTooltip>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartState({
  loading,
  error,
  errorMessage,
  empty,
  emptyMessage,
  children,
}: {
  loading: boolean;
  error: boolean;
  errorMessage: string;
  empty: boolean;
  emptyMessage: string;
  children: ReactNode;
}) {
  if (loading) return <Skeleton className="h-full w-full rounded-lg" />;
  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
        {errorMessage}
      </div>
    );
  }
  if (empty) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return <div className="h-full min-h-0">{children}</div>;
}

function OverviewPage() {
  const { hostelId } = useHostelScope();
  const {
    data: overviewStats,
    isLoading: overviewLoading,
    isError: overviewError,
    error: overviewErr,
  } = useBookingOverviewStatsQuery(30, 8, 6, hostelId);
  const { data: roomsApi, isLoading: roomsLoading } = useRoomsQuery(
    { limit: 100, ...(hostelId ? { hostel: hostelId } : {}) },
    { enabled: Boolean(hostelId) },
  );
  const { data: bookingsApi, isLoading: bookingsLoading } = useBookingsQuery(
    { limit: 100, ...(hostelId ? { hostel: hostelId } : {}) },
    { enabled: Boolean(hostelId) },
  );

  const chartErrorMessage =
    overviewErr instanceof Error ? overviewErr.message : "Could not load booking stats";

  const rooms = roomsApi?.rooms ?? [];
  const bookings = bookingsApi?.bookings ?? [];
  const roomById = new Map<string, Room>(rooms.map((room) => [room.id, room]));
  const statsLoading = overviewLoading || roomsLoading || bookingsLoading;

  const totalBeds = rooms.reduce((s, r) => s + r.beds_total, 0);
  const availableBeds = rooms.reduce((s, r) => s + r.beds_available, 0);
  const occupiedBeds = totalBeds - availableBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalRooms = roomsApi?.pagination?.total ?? rooms.length;
  const availableRooms = rooms.filter((r) => r.status === "available").length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const totalBookings = overviewStats?.status?.total ?? bookingsApi?.pagination?.total ?? 0;
  const checkOutsToday = bookings.filter((b) => b.check_out === todayStr).length;

  const succeededBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "checked_in" || b.status === "checked_out",
  );

  const dailyBookings =
    overviewStats?.daily.series.map((p) => ({ key: p.date, label: p.label, bookings: p.bookings })) ?? [];

  const weeklyBookings =
    overviewStats?.weekly.series.map((p) => ({
      key: p.key,
      label: p.label,
      week_start: p.week_start,
      week_end: p.week_end,
      bookings: p.bookings,
    })) ?? [];

  const statusData = overviewStats?.status.breakdown ?? [];

  const monthlyBookings =
    overviewStats?.monthly.series.map((m) => ({
      key: m.key,
      label: m.label,
      bookings: m.bookings,
    })) ?? [];

  const monthlyRevenueSeries =
    overviewStats?.monthly.series.map((m) => ({
      key: m.key,
      label: m.label,
      revenue_pkr: m.revenue_pkr ?? m.revenue,
      revenue_usd: m.revenue_usd ?? 0,
    })) ?? [];

  const sourceMap: Record<string, number> = {};
  bookings.forEach((b) => {
    const name = (b.source || "Unknown").trim() || "Unknown";
    sourceMap[name] = (sourceMap[name] ?? 0) + 1;
  });
  const sourceData = topNamedSlices(
    Object.entries(sourceMap).map(([name, value]) => ({ name, value })),
  );

  const revByCategory: Record<string, number> = {};
  succeededBookings.forEach((b) => {
    const room = b.room_id ? roomById.get(b.room_id) : undefined;
    const cat = room?.category ?? "other";
    revByCategory[cat] = (revByCategory[cat] ?? 0) + b.total_amount;
  });
  const revCategoryData = Object.entries(revByCategory).map(([name, value]) => ({ name, value }));

  const bookingsByRoom: Record<string, number> = {};
  bookings.forEach((b) => { if (b.room_id) bookingsByRoom[b.room_id] = (bookingsByRoom[b.room_id] ?? 0) + 1; });
  const topRooms = Object.entries(bookingsByRoom)
    .map(([id, count]) => ({ name: roomById.get(id)?.title ?? "—", bookings: count }))
    .sort((a, b) => b.bookings - a.bookings).slice(0, 6);

  const dayOfWeek = Array.from({ length: 7 }).map((_, i) => ({ label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i], bookings: 0 }));
  bookings.forEach((b) => {
    const dateStr = "move_in" in b && b.move_in ? b.move_in : "check_in" in b ? (b as { check_in?: string }).check_in : "";
    const d = new Date(dateStr ?? "");
    if (!Number.isNaN(d.getTime())) dayOfWeek[d.getDay()].bookings += 1;
  });

  return (
    <div className="space-y-6">
      {statsLoading ? (
        <StatCardsRowSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Bookings"
            value={totalBookings}
            icon={CalendarCheck}
            accent="primary"
          />
          <StatCard label="Check-outs Today" value={checkOutsToday} icon={LogOut} accent="warning" />
          <StatCard
            label="Total Rooms"
            value={totalRooms}
            delta={`${availableRooms} available`}
            icon={DoorOpen}
            accent="info"
          />
          <StatCard
            label="Occupancy"
            value={`${occupancyRate}%`}
            delta={`${occupiedBeds} / ${totalBeds} beds`}
            icon={BedDouble}
            accent="primary"
          />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Booking Analytics</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className={`lg:col-span-2 ${chartCard}`}>
            <CardHeader>
              <CardTitle className="text-base">Daily bookings — last 30 days</CardTitle>
              {!overviewLoading && !overviewError && overviewStats ? (
                <p className="text-xs text-muted-foreground">
                  {overviewStats.daily.series.reduce((s, p) => s + p.bookings, 0)} bookings in this period
                </p>
              ) : null}
            </CardHeader>
            <CardContent className="h-[260px]">
              <ChartState
                loading={overviewLoading}
                error={overviewError}
                errorMessage={chartErrorMessage}
                empty={!overviewLoading && !overviewError && dailyBookings.every((d) => d.bookings === 0)}
                emptyMessage="No booking data for the last 30 days"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyBookings}>
                    <defs><linearGradient id="bk-daily" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.62 0.22 35)" stopOpacity={0.55} /><stop offset="100%" stopColor="oklch(0.62 0.22 35)" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                    <Tooltip
                      labelFormatter={(_, payload) => {
                        const row = payload?.[0]?.payload as { key?: string; label?: string } | undefined;
                        return row?.key ?? row?.label ?? "";
                      }}
                      formatter={(value) => [`${value}`, "Bookings"]}
                    />
                    <Area type="monotone" dataKey="bookings" stroke="oklch(0.62 0.22 35)" fill="url(#bk-daily)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartState>
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader>
              <CardTitle className="text-base">Booking status</CardTitle>
              {!overviewLoading && !overviewError && overviewStats ? (
                <p className="text-xs text-muted-foreground">{overviewStats.status.total} total bookings</p>
              ) : null}
            </CardHeader>
            <CardContent className="h-[260px]">
              <ChartState
                loading={overviewLoading}
                error={overviewError}
                errorMessage={chartErrorMessage}
                empty={!overviewLoading && !overviewError && statusData.length === 0}
                emptyMessage="No bookings yet"
              >
                <OverviewPie
                  data={statusData}
                  valueFormatter={(value, name) => [`${value}`, String(name)]}
                />
              </ChartState>
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader>
              <CardTitle className="text-base">Weekly bookings</CardTitle>
              {!overviewLoading && !overviewError && overviewStats ? (
                <p className="text-xs text-muted-foreground">Last {overviewStats.weekly.weeks} weeks</p>
              ) : null}
            </CardHeader>
            <CardContent className="h-[240px]">
              <ChartState
                loading={overviewLoading}
                error={overviewError}
                errorMessage={chartErrorMessage}
                empty={!overviewLoading && !overviewError && weeklyBookings.every((w) => w.bookings === 0)}
                emptyMessage="No bookings in the last 8 weeks"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyBookings}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                    <Tooltip
                      labelFormatter={(_, payload) => {
                        const row = payload?.[0]?.payload as { week_start?: string; week_end?: string } | undefined;
                        if (row?.week_start && row?.week_end) return `${row.week_start} – ${row.week_end}`;
                        return "";
                      }}
                      formatter={(value) => [`${value}`, "Bookings"]}
                    />
                    <Bar dataKey="bookings" fill="oklch(0.62 0.22 35)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartState>
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader>
              <CardTitle className="text-base">Monthly bookings</CardTitle>
              {!overviewLoading && !overviewError && overviewStats ? (
                <p className="text-xs text-muted-foreground">Last {overviewStats.monthly.months} months</p>
              ) : null}
            </CardHeader>
            <CardContent className="h-[240px]">
              <ChartState
                loading={overviewLoading}
                error={overviewError}
                errorMessage={chartErrorMessage}
                empty={!overviewLoading && !overviewError && monthlyBookings.every((m) => m.bookings === 0)}
                emptyMessage="No bookings in this period"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyBookings}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                    <Tooltip formatter={(value) => [`${value}`, "Bookings"]} />
                    <Line type="monotone" dataKey="bookings" stroke="oklch(0.55 0.13 200)" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartState>
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader><CardTitle className="text-base">Booking sources</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              <ChartState
                loading={bookingsLoading}
                error={false}
                errorMessage=""
                empty={!bookingsLoading && sourceData.length === 0}
                emptyMessage="No booking sources yet"
              >
                <OverviewPie data={sourceData} />
              </ChartState>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Revenue Analytics</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className={`lg:col-span-2 ${chartCard}`}>
            <CardHeader>
              <CardTitle className="text-base">Monthly revenue (PKR & USD)</CardTitle>
              {!overviewLoading && !overviewError && overviewStats ? (
                <p className="text-xs text-muted-foreground">
                  {formatMoney(monthlyRevenueSeries.reduce((s, m) => s + m.revenue_pkr, 0), "pkr")} ·{" "}
                  {formatMoney(monthlyRevenueSeries.reduce((s, m) => s + m.revenue_usd, 0), "usd")} (excl. cancelled)
                </p>
              ) : null}
            </CardHeader>
            <CardContent className="h-[280px]">
              <ChartState
                loading={overviewLoading}
                error={overviewError}
                errorMessage={chartErrorMessage}
                empty={
                  !overviewLoading &&
                  !overviewError &&
                  monthlyRevenueSeries.every((m) => m.revenue_pkr === 0 && m.revenue_usd === 0)
                }
                emptyMessage="No revenue in this period"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenueSeries}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} />
                    <Tooltip formatter={(v, name) => chartTooltipMoney(v, name)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="revenue_pkr" name="PKR" fill="oklch(0.62 0.22 35)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="revenue_usd" name="USD" fill="oklch(0.55 0.13 200)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartState>
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader><CardTitle className="text-base">Revenue by room type</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              <OverviewPie
                data={revCategoryData}
                valueFormatter={(value, name) => [formatMoney(Number(value), "pkr"), String(name)]}
              />
            </CardContent>
          </Card>

          <Card className={`${chartCard} lg:col-span-2`}>
            <CardHeader><CardTitle className="text-base">Top booked rooms</CardTitle></CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRooms} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={11} width={140} />
                  <Tooltip /><Bar dataKey="bookings" fill="oklch(0.62 0.22 35)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader><CardTitle className="text-base">Peak booking days</CardTitle></CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeek}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} /><Tooltip />
                  <Bar dataKey="bookings" fill="oklch(0.55 0.13 200)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <ExtrasCollectedCharts
        extras={overviewStats?.extras}
        loading={overviewLoading}
        error={overviewError}
        errorMessage={chartErrorMessage}
      />
    </div>
  );
}
