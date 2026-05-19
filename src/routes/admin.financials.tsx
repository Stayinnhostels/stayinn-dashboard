import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/stat-card";
import { Wallet, TrendingUp, CreditCard, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { usePaymentsQuery } from "@/queries/payments";
import { useBookingOverviewStatsQuery } from "@/queries/bookings/useBookingOverviewStatsQuery";
import { formatPaymentInr, paymentMethodLabel } from "@/lib/payments";

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
      value: m.revenue,
    })) ?? [];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Revenue charts use <span className="font-semibold text-foreground">succeeded</span> bookings only.
        The table lists all booking payments including pending and cancelled.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total revenue"
          value={statsLoading ? "…" : formatPaymentInr(revenue?.total ?? 0)}
          icon={Wallet}
          delta="Succeeded payments"
        />
        <StatCard
          label="Pending"
          value={statsLoading ? "…" : formatPaymentInr(revenue?.pending_amount ?? 0)}
          icon={CreditCard}
          delta="Awaiting confirmation"
        />
        <StatCard
          label="Refunded / cancelled"
          value={statsLoading ? "…" : formatPaymentInr(revenue?.refunded_amount ?? 0)}
          icon={TrendingUp}
          delta="Not counted in revenue"
        />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Revenue by month (succeeded)</CardTitle>
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
                <Tooltip formatter={(v: number) => formatPaymentInr(v)} />
                <Bar dataKey="value" fill="oklch(0.62 0.22 35)" radius={[8, 8, 0, 0]} />
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
                      <TableCell className="font-mono">{formatPaymentInr(p.amount)}</TableCell>
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
