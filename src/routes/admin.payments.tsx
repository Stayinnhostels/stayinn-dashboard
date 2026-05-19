import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Loader2, Search, Wallet, CheckCircle2, Clock, X } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { usePaymentsQuery } from "@/queries/payments";
import { useBookingOverviewStatsQuery } from "@/queries/bookings/useBookingOverviewStatsQuery";
import { formatPaymentInr } from "@/lib/payments";
import type { Payment, PaymentStatus } from "@/types/domain/payment.types";

export const Route = createFileRoute("/admin/payments")({ component: PaymentsPage });

function PaymentsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const paymentStatus =
    statusFilter === "all" ? undefined : (statusFilter as PaymentStatus);

  const { data, isLoading, isError } = usePaymentsQuery({
    page,
    limit: 50,
    status: paymentStatus,
    search: query.trim() || undefined,
  });

  const { data: overviewStats } = useBookingOverviewStatsQuery(30, 8, 6);
  const revenue = overviewStats?.revenue;

  const payments = data?.payments ?? [];
  const pagination = data?.pagination;

  const statusBadgeClass = useMemo(
    () =>
      ({
        succeeded: "border-emerald-500/40 text-emerald-700 bg-emerald-500/10",
        pending: "border-amber-500/40 text-amber-700 bg-amber-500/10",
        refunded: "border-muted-foreground/40 text-muted-foreground",
        failed: "border-destructive/40 text-destructive",
      }) as Record<PaymentStatus, string>,
    [],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Every booking (website or walk-in) appears here as a payment record. Revenue stats count only{" "}
        <span className="font-semibold text-foreground">succeeded</span> bookings — confirmed, checked in, or
        checked out.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatPaymentInr(revenue?.total ?? 0)}
          icon={Wallet}
          accent="success"
          delta="Succeeded payments only"
        />
        <StatCard
          label="Successful"
          value={revenue?.succeeded_count ?? 0}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Pending"
          value={formatPaymentInr(revenue?.pending_amount ?? 0)}
          icon={Clock}
          accent="warning"
          delta={`${revenue?.pending_count ?? 0} booking(s)`}
        />
        <StatCard
          label="Refunded / cancelled"
          value={formatPaymentInr(revenue?.refunded_amount ?? 0)}
          icon={X}
          accent="info"
          delta={`${revenue?.refunded_count ?? 0} booking(s)`}
        />
      </div>

      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search guest, email, room…"
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading payments…
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-destructive">Could not load payments.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      No payments match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <PaymentRow key={p.id} payment={p} statusBadgeClass={statusBadgeClass} />
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.pages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function PaymentRow({
  payment: p,
  statusBadgeClass,
}: {
  payment: Payment;
  statusBadgeClass: Record<PaymentStatus, string>;
}) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">#{p.booking_id.slice(-8).toUpperCase()}</TableCell>
      <TableCell>
        <Link
          to="/admin/bookings/$id"
          params={{ id: p.booking_id }}
          className="font-semibold hover:underline"
        >
          {p.guest_name}
        </Link>
        <div className="text-xs text-muted-foreground">{p.guest_email}</div>
      </TableCell>
      <TableCell>{p.room_title ?? "—"}</TableCell>
      <TableCell className="capitalize text-xs text-muted-foreground">
        {p.source === "walk_in" ? "Walk-in" : p.source}
      </TableCell>
      <TableCell className="font-bold">{formatPaymentInr(p.amount)}</TableCell>
      <TableCell>
        <Badge variant="outline" className={`capitalize ${statusBadgeClass[p.status]}`}>
          {p.status}
        </Badge>
      </TableCell>
      <TableCell>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</TableCell>
      <TableCell className="text-right">
        <Button asChild size="sm" variant="ghost" title="View booking & invoice">
          <Link to="/admin/bookings/$id" params={{ id: p.booking_id }} hash="booking-invoice">
            <FileText className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
