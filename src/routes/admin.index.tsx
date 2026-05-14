import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BedDouble, CalendarCheck, Users, Wallet, CheckCircle2, XCircle, Clock, Star,
  LogIn, LogOut, TrendingUp, Activity, UserCheck, DoorOpen,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import {
  rooms as roomStore, bookings as bookingStore, profiles as profileStore,
  payments as paymentStore, reviews as reviewStore, getRoom,
} from "@/lib/mock-store";

export const Route = createFileRoute("/admin/")({ component: OverviewPage });

const PIE_COLORS = ["#f97316", "#0ea5e9", "#facc15", "#22c55e", "#a855f7", "#ec4899"];
const chartCard = "border-border/60 bg-card/60 backdrop-blur";

function OverviewPage() {
  const { data } = useQuery({
    queryKey: ["mock", "overview"],
    queryFn: async () => ({
      rooms: [...roomStore], bookings: [...bookingStore], users: [...profileStore],
      payments: [...paymentStore], reviews: [...reviewStore],
    }),
  });

  const rooms = data?.rooms ?? [];
  const bookings = data?.bookings ?? [];
  const users = data?.users ?? [];
  const payments = data?.payments ?? [];
  const reviews = data?.reviews ?? [];

  const totalBeds = rooms.reduce((s, r) => s + r.beds_total, 0);
  const availableBeds = rooms.reduce((s, r) => s + r.beds_available, 0);
  const occupiedBeds = totalBeds - availableBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === "available").length;
  const occupiedRooms = rooms.filter((r) => r.status === "full").length;

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
  const completedBookings = bookings.filter((b) => b.status === "checked_out").length;

  const succeeded = payments.filter((p) => p.status === "succeeded");
  const totalRevenue = succeeded.reduce((s, p) => s + p.amount, 0);

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay());
  const monthlyRevenue = succeeded.filter((p) => new Date(p.created_at) >= startOfMonth).reduce((s, p) => s + p.amount, 0);
  const weeklyRevenue = succeeded.filter((p) => new Date(p.created_at) >= startOfWeek).reduce((s, p) => s + p.amount, 0);

  const avgBookingValue = bookings.length > 0 ? bookings.reduce((s, b) => s + b.total_amount, 0) / bookings.length : 0;
  const todayStr = today.toISOString().slice(0, 10);
  const checkInsToday = bookings.filter((b) => b.check_in === todayStr).length;
  const checkOutsToday = bookings.filter((b) => b.check_out === todayStr).length;
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews : 0;
  const activeUsers = new Set(bookings.map((b) => b.user_id).filter(Boolean)).size;

  const dailyBookings = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return { key: d.toISOString().slice(0, 10), label: `${d.getMonth() + 1}/${d.getDate()}`, bookings: 0 };
  });
  bookings.forEach((b) => { const m = dailyBookings.find((d) => d.key === b.created_at.slice(0, 10)); if (m) m.bookings += 1; });

  const weeklyBookings = Array.from({ length: 8 }).map((_, i) => ({ key: i, label: `W${i + 1}`, bookings: 0 }));
  bookings.forEach((b) => {
    const diff = Math.floor((today.getTime() - new Date(b.created_at).getTime()) / 86400000);
    if (diff >= 0 && diff < 56) {
      const idx = 7 - Math.floor(diff / 7);
      const m = weeklyBookings.find((w) => w.key === idx);
      if (m) m.bookings += 1;
    }
  });

  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en", { month: "short" }), revenue: 0, bookings: 0, users: 0 };
  });
  succeeded.forEach((p) => { const d = new Date(p.created_at); const m = months.find((mm) => mm.key === `${d.getFullYear()}-${d.getMonth()}`); if (m) m.revenue += p.amount; });
  bookings.forEach((b) => { const d = new Date(b.created_at); const m = months.find((mm) => mm.key === `${d.getFullYear()}-${d.getMonth()}`); if (m) m.bookings += 1; });
  users.forEach((u) => { const d = new Date(u.created_at); const m = months.find((mm) => mm.key === `${d.getFullYear()}-${d.getMonth()}`); if (m) m.users += 1; });

  const statusMap: Record<string, number> = {};
  bookings.forEach((b) => { statusMap[b.status] = (statusMap[b.status] ?? 0) + 1; });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  const sourceMap: Record<string, number> = {};
  bookings.forEach((b) => { sourceMap[b.source] = (sourceMap[b.source] ?? 0) + 1; });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  const revByCategory: Record<string, number> = {};
  succeeded.forEach((p) => {
    const b = bookings.find((bb) => bb.id === p.booking_id);
    const room = b ? getRoom(b.room_id ?? "") : null;
    const cat = room?.category ?? "other";
    revByCategory[cat] = (revByCategory[cat] ?? 0) + p.amount;
  });
  const revCategoryData = Object.entries(revByCategory).map(([name, value]) => ({ name, value }));

  const bookingsByRoom: Record<string, number> = {};
  bookings.forEach((b) => { if (b.room_id) bookingsByRoom[b.room_id] = (bookingsByRoom[b.room_id] ?? 0) + 1; });
  const topRooms = Object.entries(bookingsByRoom)
    .map(([id, count]) => ({ name: getRoom(id)?.title ?? "—", bookings: count }))
    .sort((a, b) => b.bookings - a.bookings).slice(0, 6);

  const dayOfWeek = Array.from({ length: 7 }).map((_, i) => ({ label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i], bookings: 0 }));
  bookings.forEach((b) => { const d = new Date(b.check_in); dayOfWeek[d.getDay()].bookings += 1; });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Occupancy" value={`${occupancyRate}%`} delta={`${occupiedBeds} / ${totalBeds} beds`} icon={BedDouble} accent="primary" />
        <StatCard label="Total Rooms" value={totalRooms} delta={`${availableRooms} available`} icon={DoorOpen} accent="info" />
        <StatCard label="Occupied Rooms" value={occupiedRooms} icon={BedDouble} accent="warning" />
        <StatCard label="Available Rooms" value={availableRooms} icon={CheckCircle2} accent="success" />

        <StatCard label="Total Bookings" value={bookings.length} icon={CalendarCheck} accent="primary" />
        <StatCard label="Pending" value={pendingBookings} icon={Clock} accent="warning" />
        <StatCard label="Cancelled" value={cancelledBookings} icon={XCircle} accent="warning" />
        <StatCard label="Completed" value={completedBookings} icon={CheckCircle2} accent="success" />

        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={Wallet} accent="success" />
        <StatCard label="Monthly Revenue" value={`$${monthlyRevenue.toLocaleString()}`} icon={TrendingUp} accent="success" />
        <StatCard label="Weekly Revenue" value={`$${weeklyRevenue.toLocaleString()}`} icon={Activity} accent="info" />
        <StatCard label="Avg Booking Value" value={`$${avgBookingValue.toFixed(0)}`} icon={Wallet} accent="primary" />

        <StatCard label="Total Users" value={users.length} icon={Users} accent="primary" />
        <StatCard label="Active Users" value={activeUsers} icon={UserCheck} accent="info" />
        <StatCard label="Check-ins Today" value={checkInsToday} icon={LogIn} accent="success" />
        <StatCard label="Check-outs Today" value={checkOutsToday} icon={LogOut} accent="warning" />

        <StatCard label="Total Reviews" value={totalReviews} icon={Star} accent="primary" />
        <StatCard label="Average Rating" value={avgRating.toFixed(1)} delta="out of 5" icon={Star} accent="warning" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Booking Analytics</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className={`lg:col-span-2 ${chartCard}`}>
            <CardHeader><CardTitle className="text-base">Daily bookings — last 30 days</CardTitle></CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyBookings}>
                  <defs><linearGradient id="bk-daily" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.62 0.22 35)" stopOpacity={0.55} /><stop offset="100%" stopColor="oklch(0.62 0.22 35)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} /><Tooltip />
                  <Area type="monotone" dataKey="bookings" stroke="oklch(0.62 0.22 35)" fill="url(#bk-daily)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader><CardTitle className="text-base">Booking status</CardTitle></CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={3}>
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader><CardTitle className="text-base">Weekly bookings</CardTitle></CardHeader>
            <CardContent className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyBookings}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} /><Tooltip />
                  <Bar dataKey="bookings" fill="oklch(0.62 0.22 35)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCard}>
            <CardHeader><CardTitle className="text-base">Monthly bookings</CardTitle></CardHeader>
            <CardContent className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} /><Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="oklch(0.55 0.13 200)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
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
            <CardHeader><CardTitle className="text-base">Monthly revenue</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} /><Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="oklch(0.55 0.13 200)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} /><Legend wrapperStyle={{ fontSize: 11 }} />
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
