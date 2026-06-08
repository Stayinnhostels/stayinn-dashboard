import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/stat-card";
import { Wallet, TrendingUp, CreditCard, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePaymentsQuery } from "@/queries/payments";
import { useBookingOverviewStatsQuery } from "@/queries/bookings/useBookingOverviewStatsQuery";
import {
  chartTooltipMoney,
  formatMoney,
  normalizeMoneyCurrency,
  paymentMethodLabel,
} from "@/lib/payments";

export const Route = createFileRoute("/admin/financials")({ component: FinancialsPage });

function FinancialsPage() {
  const { data: overviewStats, isLoading: statsLoading } = useBookingOverviewStatsQuery(30, 8, 6);
  const { data: paymentsData, isLoading: paymentsLoading } = usePaymentsQuery({ page: 1, limit: 20 });

  const revenue = overviewStats?.revenue;
  const payments = paymentsData?.payments ?? [];

  const months =
    overviewStats?.monthly.series.map((m) => ({
      key: m.key,
      label: m.label,
      revenue_pkr: m.revenue_pkr ?? m.revenue,
      revenue_usd: m.revenue_usd ?? 0,
    })) ?? [];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Revenue is tracked separately in <span className="font-semibold text-foreground">PKR</span> (Pakistan) and{" "}
        <span className="font-semibold text-foreground">USD</span> (international). Monthly charts use rent
        collected per stay month (from Monthly Rent). Payment rows show collected rent vs contract total.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue (PKR)"
          value={statsLoading ? "…" : formatMoney(revenue?.pkr?.total ?? 0, "pkr")}
          icon={Wallet}
          delta="All-time collected · Pakistan"
        />
        <StatCard
          label="Total revenue (USD)"
          value={statsLoading ? "…" : formatMoney(revenue?.usd?.total ?? 0, "usd")}
          icon={Wallet}
          accent="info"
          delta="All-time collected · International"
        />
        <StatCard
          label="Pending (PKR)"
          value={statsLoading ? "…" : formatMoney(revenue?.pkr?.pending_amount ?? 0, "pkr")}
          icon={CreditCard}
          delta="Awaiting confirmation"
        />
        <StatCard
          label="Pending (USD)"
          value={statsLoading ? "…" : formatMoney(revenue?.usd?.pending_amount ?? 0, "usd")}
          icon={CreditCard}
          accent="info"
          delta="Awaiting confirmation"
        />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Revenue by month (PKR & USD)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {statsLoading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip formatter={(v, name) => chartTooltipMoney(v, name)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue_pkr" name="PKR" fill="oklch(0.62 0.22 35)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revenue_usd" name="USD" fill="oklch(0.55 0.13 200)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Recent payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {paymentsLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No payments yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Link
                          to="/admin/bookings/$id"
                          params={{ id: p.booking_id }}
                          className="font-semibold hover:underline"
                        >
                          {p.guest_name}
                        </Link>
                      </TableCell>
                      <TableCell>{p.room_title ?? "—"}</TableCell>
                      <TableCell className="font-mono">
                        {formatMoney(p.amount, normalizeMoneyCurrency(p.currency))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-xs text-muted-foreground">
                        {paymentMethodLabel(p.method, p.source)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
