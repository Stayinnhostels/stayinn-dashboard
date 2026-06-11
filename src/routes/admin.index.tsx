import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingOverviewStatsQuery } from "@/queries/bookings/useBookingOverviewStatsQuery";
import { BedDouble, CalendarCheck, LogOut, DoorOpen } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { rooms as roomStore, bookings as bookingStore, profiles as profileStore, getRoom } from "@/lib/mock-store";
import { useBookingsQuery } from "@/queries/bookings";
import { useRoomsQuery } from "@/queries/rooms";
import { chartTooltipMoney, formatMoney } from "@/lib/payments";

export const Route = createFileRoute("/admin/")({ component: OverviewPage });

const PIE_COLORS = ["#f97316", "#0ea5e9", "#facc15", "#22c55e", "#a855f7", "#ec4899"];
const chartCard = "border-border/60 bg-card/60 backdrop-blur";

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
  return <>{children}</>;
}

function OverviewPage() {
  const {
    data: overviewStats,
    isLoading: overviewLoading,
    isError: overviewError,
    error: overviewErr,
  } = useBookingOverviewStatsQuery(30, 8, 6);
  const { data: roomsApi } = useRoomsQuery({ limit: 100 });
  const { data: bookingsApi } = useBookingsQuery({ limit: 100 });

  const chartErrorMessage =
    overviewErr instanceof Error ? overviewErr.message : "Could not load booking stats";

  const { data } = useQuery({
    queryKey: ["mock", "overview"],
    queryFn: async () => ({
      rooms: [...roomStore], bookings: [...bookingStore], users: [...profileStore],
    }),
  });

  const rooms = roomsApi?.rooms?.length ? roomsApi.rooms : (data?.rooms ?? []);
  const bookings = bookingsApi?.bookings?.length ? bookingsApi.bookings : (data?.bookings ?? []);

  const totalBeds = rooms.reduce((s, r) => s + r.beds_total, 0);
  const availableBeds = rooms.reduce((s, r) => s + r.beds_available, 0);
  const occupiedBeds = totalBeds - availableBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalRooms = roomsApi?.pagination?.total ?? rooms.length;
  const availableRooms = rooms.filter((r) => r.status === "available").length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const totalBookings = overviewStats?.status?.total ?? bookingsApi?.pagination?.total ?? bookings.length;
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
  bookings.forEach((b) => { sourceMap[b.source] = (sourceMap[b.source] ?? 0) + 1; });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  const revByCategory: Record<string, number> = {};
  succeededBookings.forEach((b) => {
    const room = getRoom(b.room_id ?? "");
    const cat = room?.category ?? "other";
    revByCategory[cat] = (revByCategory[cat] ?? 0) + b.total_amount;
  });
  const revCategoryData = Object.entries(revByCategory).map(([name, value]) => ({ name, value }));

  const bookingsByRoom: Record<string, number> = {};
  bookings.forEach((b) => { if (b.room_id) bookingsByRoom[b.room_id] = (bookingsByRoom[b.room_id] ?? 0) + 1; });
  const topRooms = Object.entries(bookingsByRoom)
    .map(([id, count]) => ({ name: getRoom(id)?.title ?? "—", bookings: count }))
    .sort((a, b) => b.bookings - a.bookings).slice(0, 6);

  const dayOfWeek = Array.from({ length: 7 }).map((_, i) => ({ label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i], bookings: 0 }));
  bookings.forEach((b) => {
    const dateStr = "move_in" in b && b.move_in ? b.move_in : "check_in" in b ? (b as { check_in?: string }).check_in : "";
    const d = new Date(dateStr ?? "");
    if (!Number.isNaN(d.getTime())) dayOfWeek[d.getDay()].bookings += 1;
  });

  return (
    <div className="space-y-6">
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
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={3}>
                      {statusData.map((row, i) => (
                        <Cell key={row.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}`, name]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
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
            <CardContent className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" outerRadius={85}>
                    {sourceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revCategoryData} dataKey="value" nameKey="name" outerRadius={95}>
                    {revCategoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatMoney(Number(v), "pkr")} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
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
    </div>
  );
}
