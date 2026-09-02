import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, FileText, Search, Users, Wallet } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { PaymentsTableSkeleton, StatCardsRowSkeleton } from "@/components/admin/admin-page-skeletons";
import { MonthFilterSelect, useSyncedMonthFilter } from "@/components/admin/month-filter-select";
import { usePaymentsQuery } from "@/queries/payments";
import { formatMoney, normalizeMoneyCurrency, paymentStatusLabel } from "@/lib/payments";
import { RENT_PAYMENT_STATUS_LABELS } from "@/types/domain/resident.types";
import { useHostelScope } from "@/lib/use-hostel-scope";
import type { Payment, PaymentStatus } from "@/types/domain/payment.types";

export const Route = createFileRoute("/admin/payments")({ component: PaymentsPage });

function PaymentsPage() {
  const { hostelId } = useHostelScope();
  const { month, setMonth, monthLabel } = useSyncedMonthFilter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const paymentStatus = statusFilter === "all" ? undefined : (statusFilter as PaymentStatus);

  const { data, isLoading, isError } = usePaymentsQuery({
    page,
    limit: 50,
    status: paymentStatus,
    search: query.trim() || undefined,
    month,
    ...(hostelId ? { hostel: hostelId } : {}),
  }, { enabled: Boolean(hostelId) });

  const payments = data?.payments ?? [];
  const pagination = data?.pagination;
  const monthStats = data?.month_stats;

  const statusBadgeClass = useMemo(
    () =>
      ({
        succeeded: "border-emerald-500/40 text-emerald-700 bg-emerald-500/10",
        pending: "border-amber-500/40 text-amber-700 bg-amber-500/10",
        refunded: "border-rose-500/40 text-rose-700 bg-rose-500/10",
        partial_refund: "border-orange-500/40 text-orange-700 bg-orange-500/10",
        cancelled: "border-muted-foreground/40 text-muted-foreground",
        failed: "border-destructive/40 text-destructive",
      }) as Record<PaymentStatus, string>,
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MonthFilterSelect
          id="payments-month"
          value={month}
          onChange={(v) => {
            setMonth(v);
            setPage(1);
          }}
        />
      </div>

      {isLoading && !monthStats ? (
        <StatCardsRowSkeleton count={6} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard
            label={`Collected · ${monthLabel} (PKR)`}
            value={formatMoney(monthStats?.pkr.collected ?? 0, "pkr")}
            icon={Wallet}
            accent="success"
            delta={`Rent ${formatMoney(monthStats?.pkr.rent_collected ?? 0, "pkr")} · extras ${formatMoney(monthStats?.pkr.extras_collected ?? 0, "pkr")}`}
          />
          <StatCard
            label={`Unpaid · ${monthLabel} (PKR)`}
            value={formatMoney(monthStats?.pkr.unpaid ?? 0, "pkr")}
            icon={Clock}
            accent="warning"
            delta={`Due ${formatMoney(monthStats?.pkr.due ?? 0, "pkr")} · ${monthStats?.pkr.unpaid_count ?? 0} rent unpaid`}
          />
          <StatCard
            label={`Residents · ${monthLabel}`}
            value={
              (monthStats?.pkr.resident_count ?? 0) + (monthStats?.usd.resident_count ?? 0)
            }
            icon={Users}
            accent="info"
            delta={`${(monthStats?.pkr.paid_count ?? 0) + (monthStats?.usd.paid_count ?? 0)} paid · ${(monthStats?.pkr.partial_count ?? 0) + (monthStats?.usd.partial_count ?? 0)} partial`}
          />
          <StatCard
            label={`Collected · ${monthLabel} (USD)`}
            value={formatMoney(monthStats?.usd.collected ?? 0, "usd")}
            icon={Wallet}
            accent="info"
            delta={`Rent ${formatMoney(monthStats?.usd.rent_collected ?? 0, "usd")} · extras ${formatMoney(monthStats?.usd.extras_collected ?? 0, "usd")}`}
          />
          <StatCard
            label={`Unpaid · ${monthLabel} (USD)`}
            value={formatMoney(monthStats?.usd.unpaid ?? 0, "usd")}
            icon={Clock}
            accent="warning"
            delta={`Due ${formatMoney(monthStats?.usd.due ?? 0, "usd")} · ${monthStats?.usd.unpaid_count ?? 0} rent unpaid`}
          />
          <StatCard
            label={`Net revenue · ${monthLabel}`}
            value={formatMoney(monthStats?.revenue_pkr ?? 0, "pkr")}
            icon={CheckCircle2}
            accent="success"
            delta={
              (monthStats?.revenue_usd ?? 0) > 0
                ? `+ ${formatMoney(monthStats?.revenue_usd ?? 0, "usd")}`
                : "After refunds / retained security"
            }
          />
        </div>
      )}

      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search guest, email, phone…"
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
              <SelectItem value="succeeded">Paid</SelectItem>
              <SelectItem value="pending">Not paid</SelectItem>
              <SelectItem value="partial_refund">Partial</SelectItem>
              <SelectItem value="refunded">Returned</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {isLoading ? (
            <PaymentsTableSkeleton />
          ) : isError ? (
            <p className="py-16 text-center text-sm text-destructive">Could not load payments.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      No rent payments for {monthLabel}
                      {query.trim() ? " matching your search" : ""}.
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
  const cur = normalizeMoneyCurrency(p.currency);
  const ledgerLabel = p.ledger_status
    ? RENT_PAYMENT_STATUS_LABELS[p.ledger_status]
    : paymentStatusLabel(p.status);

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
      <TableCell className="max-w-[9rem]">
        <span className="block truncate" title={p.room_title ?? undefined}>
          {p.room_title ?? "—"}
        </span>
      </TableCell>
      <TableCell className="text-xs whitespace-nowrap">{p.month_label ?? p.month ?? "—"}</TableCell>
      <TableCell className="font-bold tabular-nums">
        {formatMoney(p.amount, cur)}
        {(p.extras_due ?? 0) > 0 ? (
          <div className="text-[11px] font-normal text-muted-foreground">
            extras {formatMoney(p.extras_due ?? 0, cur)}
          </div>
        ) : null}
      </TableCell>
      <TableCell className="tabular-nums text-emerald-700">
        {formatMoney(p.collected_rent ?? 0, cur)}
        {(p.extras_collected ?? 0) > 0 ? (
          <div className="text-[11px] text-muted-foreground">
            extras {formatMoney(p.extras_collected ?? 0, cur)}
          </div>
        ) : null}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={`whitespace-nowrap ${statusBadgeClass[p.status] ?? ""}`}>
          {ledgerLabel}
        </Badge>
      </TableCell>
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
