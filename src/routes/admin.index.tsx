import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BedDouble,
  CalendarCheck,
  Users,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  LogIn,
  LogOut,
  TrendingUp,
  Activity,
  UserCheck,
  DoorOpen,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  component: OverviewPage,
});

const PIE_COLORS = ["#f97316", "#0ea5e9", "#facc15", "#22c55e", "#a855f7", "#ec4899"];

function useOverviewData() {
  return useQuery({
    queryKey: ["admin", "overview-v2"],
    queryFn: async () => {
      const [roomsRes, bookingsRes, usersRes, paymentsRes, reviewsRes] = await Promise.all([
        supabase.from("rooms").select("id, title, category, beds_total, beds_available, status, price_per_night"),
        supabase
          .from("bookings")
          .select("id, status, total_amount, source, created_at, check_in, check_out, room_id, user_id"),
        supabase.from("profiles").select("id, created_at"),
        supabase.from("payments").select("amount, status, created_at, booking_id"),
        supabase.from("reviews").select("rating, status, created_at"),
      ]);
      if (roomsRes.error) throw roomsRes.error;
      if (bookingsRes.error) throw bookingsRes.error;
      if (usersRes.error) throw usersRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      // reviews may be empty / RLS-permissive; tolerate errors
      return {
        rooms: roomsRes.data ?? [],
        bookings: bookingsRes.data ?? [],
        users: usersRes.data ?? [],
        payments: paymentsRes.data ?? [],
        reviews: reviewsRes.data ?? [],
      };
    },
  });
}

const chartCard = "border-border/60 bg-card/60 backdrop-blur";

function OverviewPage() {
  const { data, isLoading } = useOverviewData();

  const rooms = data?.rooms ?? [];
  const bookings = data?.bookings ?? [];
  const users = data?.users ?? [];
  const payments = data?.payments ?? [];
  const reviews = data?.reviews ?? [];

  // -------- KPI computations --------
  const totalBeds = rooms.reduce((s, r) => s + (r.beds_total ?? 0), 0);
  const availableBeds = rooms.reduce((s, r) => s + (r.beds_available ?? 0), 0);
  const occupiedBeds = totalBeds - availableBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === "available").length;
  const occupiedRooms = rooms.filter((r) => r.status === "full").length;

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
  const completedBookings = bookings.filter((b) => b.status === "checked_out").length;

  const succeededPayments = payments.filter((p) => p.status === "succeeded");
  const totalRevenue = succeededPayments.reduce((s, p) => s + Number(p.amount), 0);

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const monthlyRevenue = succeededPayments
    .filter((p) => new Date(p.created_at as string) >= startOfMonth)
    .reduce((s, p) => s + Number(p.amount), 0);
  const weeklyRevenue = succeededPayments
    .filter((p) => new Date(p.created_at as string) >= startOfWeek)
    .reduce((s, p) => s + Number(p.amount), 0);

  const avgBookingValue =
    bookings.length > 0
      ? bookings.reduce((s, b) => s + Number(b.total_amount ?? 0), 0) / bookings.length
      : 0;

  const todayStr = today.toISOString().slice(0, 10);
  const checkInsToday = bookings.filter((b) => b.check_in === todayStr).length;
  const checkOutsToday = bookings.filter((b) => b.check_out === todayStr).length;

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0 ? reviews.reduce((s, r) => s + Number(r.rating), 0) / totalReviews : 0;

  const activeUsers = new Set(bookings.map((b) => b.user_id).filter(Boolean)).size;

  // -------- Time series --------
  // Daily bookings (30 days)
  const dailyBookings = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      key: d.toISOString().slice(0, 10),
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      bookings: 0,
    };
  });
  bookings.forEach((b) => {
    const k = (b.created_at as string).slice(0, 10);
    const m = dailyBookings.find((d) => d.key === k);
    if (m) m.bookings += 1;
  });

  // Weekly bookings (last 8 weeks)
  const weeklyBookings = Array.from({ length: 8 }).map((_, i) => {
    const start = new Date();
    start.setDate(start.getDate() - (7 - i) * 7);
    return { key: i, label: `W${i + 1}`, bookings: 0 };
  });
  bookings.forEach((b) => {
    const created = new Date(b.created_at as string);
    const diffDays = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 56) {
      const idx = 7 - Math.floor(diffDays / 7);
      const m = weeklyBookings.find((w) => w.key === idx);
      if (m) m.bookings += 1;
    }
  });

  // Monthly buckets (last 6 months) — bookings + revenue
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en", { month: "short" }),
      revenue: 0,
      bookings: 0,
      users: 0,
    };
  });
  succeededPayments.forEach((p) => {
    const d = new Date(p.created_at as string);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((mm) => mm.key === key);
    if (m) m.revenue += Number(p.amount);
  });
  bookings.forEach((b) => {
    const d = new Date(b.created_at as string);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((mm) => mm.key === key);
    if (m) m.bookings += 1;
  });
  users.forEach((u) => {
    const d = new Date(u.created_at as string);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((mm) => mm.key === key);
    if (m) m.users += 1;
  });

  // Booking status pie
  const statusMap: Record<string, number> = {};
  bookings.forEach((b) => {
    const k = b.status as string;
    statusMap[k] = (statusMap[k] ?? 0) + 1;
  });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Booking sources
  const sourceMap: Record<string, number> = {};
  bookings.forEach((b) => {
    const k = (b.source as string) || "website";
    sourceMap[k] = (sourceMap[k] ?? 0) + 1;
  });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  // Revenue by room category
  const roomById = Object.fromEntries(rooms.map((r) => [r.id, r]));
  const revByCategory: Record<string, number> = {};
  succeededPayments.forEach((p) => {
    const booking = bookings.find((b) => b.id === p.booking_id);
    if (!booking) return;
    const room = roomById[booking.room_id ?? ""];
    const cat = room?.category ?? "other";
    revByCategory[cat] = (revByCategory[cat] ?? 0) + Number(p.amount);
  });
  const revCategoryData = Object.entries(revByCategory).map(([name, value]) => ({ name, value }));

  // Top booked rooms
  const bookingsByRoom: Record<string, number> = {};
  bookings.forEach((b) => {
    if (!b.room_id) return;
    bookingsByRoom[b.room_id] = (bookingsByRoom[b.room_id] ?? 0) + 1;
  });
  const topRooms = Object.entries(bookingsByRoom)
    .map(([id, count]) => ({ name: roomById[id]?.title ?? "—", bookings: count }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 6);

  // Available vs occupied (across rooms)
  const availVsOcc = [
    { name: "Available", value: availableRooms },
    { name: "Occupied", value: occupiedRooms },
    { name: "Other", value: Math.max(0, totalRooms - availableRooms - occupiedRooms) },
  ];

  // Peak booking hour (by check_in day-of-week as proxy if no time)
  const dayOfWeek = Array.from({ length: 7 }).map((_, i) => ({
    label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
    bookings: 0,
  }));
  bookings.forEach((b) => {
    if (!b.check_in) return;
    const d = new Date(b.check_in as string);
    dayOfWeek[d.getDay()].bookings += 1;
  });

  return (
    <div className="space-y-6">
      {/* ============== STAT CARDS ============== */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Occupancy" value={`${occupancyRate}%`} delta={`${occupiedBeds} / ${totalBeds} beds`} icon={BedDouble} accent="primary" loading={isLoading} />
        <StatCard label="Total Rooms" value={totalRooms} delta={`${availableRooms} available`} icon={DoorOpen} accent="info" loading={isLoading} />
        <StatCard label="Occupied Rooms" value={occupiedRooms} icon={BedDouble} accent="warning" loading={isLoading} />
        <StatCard label="Available Rooms" value={availableRooms} icon={CheckCircle2} accent="success" loading={isLoading} />

        <StatCard label="Total Bookings" value={bookings.length} icon={CalendarCheck} accent="primary" loading={isLoading} />
        <StatCard label="Pending" value={pendingBookings} icon={Clock} accent="warning" loading={isLoading} />
        <StatCard label="Cancelled" value={cancelledBookings} icon={XCircle} accent="warning" loading={isLoading} />
        <StatCard label="Completed" value={completedBookings} icon={CheckCircle2} accent="success" loading={isLoading} />

        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={Wallet} accent="success" loading={isLoading} />
        <StatCard label="Monthly Revenue" value={`$${monthlyRevenue.toLocaleString()}`} icon={TrendingUp} accent="success" loading={isLoading} />
        <StatCard label="Weekly Revenue" value={`$${weeklyRevenue.toLocaleString()}`} icon={Activity} accent="info" loading={isLoading} />
        <StatCard label="Avg Booking Value" value={`$${avgBookingValue.toFixed(0)}`} icon={Wallet} accent="primary" loading={isLoading} />

        <StatCard label="Total Users" value={users.length} icon={Users} accent="primary" loading={isLoading} />
        <StatCard label="Active Users" value={activeUsers} icon={UserCheck} accent="info" loading={isLoading} />
        <StatCard label="Check-ins Today" value={checkInsToday} icon={LogIn} accent="success" loading={isLoading} />
        <StatCard label="Check-outs Today" value={checkOutsToday} icon={LogOut} accent="warning" loading={isLoading} />

        <StatCard label="Total Reviews" value={totalReviews} icon={Star} accent="primary" loading={isLoading} />
        <StatCard label="Average Rating" value={avgRating.toFixed(1)} delta="out of 5" icon={Star} accent="warning" loading={isLoading} />
      </div>

      {/* ============== BOOKING ANALYTICS ============== */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Booking Analytics
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className={`lg:col-span-2 ${chartCard}`}>
            <CardHeader>
              <CardTitle className="text-base">Daily bookings — last 30 days</CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyBookings}>
                  <defs>
                    <linearGradient id="bk-daily" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.22 35)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="oklch(0.62 0.22 35)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="bookings" stroke="oklch(0.62 0.22 35)" fill="url(#bk-daily)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader>
              <CardTitle className="text-base">Booking status</CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
              {statusData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={3}>
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader><CardTitle className="text-base">Weekly bookings — last 8 weeks</CardTitle></CardHeader>
            <CardContent className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyBookings}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="oklch(0.62 0.22 35)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader><CardTitle className="text-base">Monthly bookings — last 6 months</CardTitle></CardHeader>
            <CardContent className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="oklch(0.55 0.13 200)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader><CardTitle className="text-base">Booking sources</CardTitle></CardHeader>
            <CardContent className="h-[240px]">
              {sourceData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceData} dataKey="value" nameKey="name" outerRadius={85}>
                      {sourceData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============== REVENUE ANALYTICS ============== */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Revenue Analytics
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className={`lg:col-span-2 ${chartCard}`}>
            <CardHeader><CardTitle className="text-base">Monthly revenue</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="oklch(0.55 0.13 200)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader><CardTitle className="text-base">Revenue by room type</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              {revCategoryData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No revenue yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={revCategoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                      {revCategoryData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className={`lg:col-span-3 ${chartCard}`}>
            <CardHeader><CardTitle className="text-base">Revenue growth — bookings vs revenue</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="oklch(0.55 0.13 200)" strokeWidth={2.5} />
                  <Line yAxisId="right" type="monotone" dataKey="bookings" name="Bookings" stroke="oklch(0.62 0.22 35)" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============== ROOM & PERFORMANCE ANALYTICS ============== */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Room & Performance Analytics
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className={chartCard}>
            <CardHeader><CardTitle className="text-base">Available vs Occupied</CardTitle></CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={availVsOcc} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                    {availVsOcc.map((_, i) => (
                      <Cell key={i} fill={["#22c55e", "#f97316", "#94a3b8"][i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={`lg:col-span-2 ${chartCard}`}>
            <CardHeader><CardTitle className="text-base">Top booked rooms</CardTitle></CardHeader>
            <CardContent className="h-[260px]">
              {topRooms.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topRooms} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} fontSize={11} width={120} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="oklch(0.62 0.22 35)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader><CardTitle className="text-base">New users per month</CardTitle></CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={months}>
                  <defs>
                    <linearGradient id="users-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.55 0.13 200)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.55 0.13 200)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="oklch(0.55 0.13 200)" fill="url(#users-grad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={`lg:col-span-2 ${chartCard}`}>
            <CardHeader><CardTitle className="text-base">Peak booking days (check-in by day of week)</CardTitle></CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeek}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                  <Tooltip />
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
