import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  Banknote,
  History,
  Loader2,
  Shield,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchInput } from "@/components/ui/search-input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/admin/stat-card";
import { PaymentsTableSkeleton, StatCardsRowSkeleton } from "@/components/admin/admin-page-skeletons";
import {
  useRecordSecurityMovementMutation,
  useSecurityPaymentsQuery,
} from "@/queries/security-payments";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { SECURITY_STATUS_LABELS, type SecurityStatus } from "@/types/domain/resident.types";
import { HintTooltip } from "@/components/ui/hint-tooltip";
import type { SecurityPaymentRow } from "@/types/domain/security-payment.types";

export const Route = createFileRoute("/admin/security-payments")({
  component: SecurityPaymentsPage,
});

function securityBadgeClass(status: SecurityStatus) {
  switch (status) {
    case "paid":
      return "border-emerald-500/40 text-emerald-700 bg-emerald-500/10";
    case "returned":
      return "border-sky-500/40 text-sky-700 bg-sky-500/10";
    case "held":
      return "border-amber-500/40 text-amber-700 bg-amber-500/10";
    case "not_paid":
      return "border-rose-500/40 text-rose-700 bg-rose-500/10";
    default:
      return "border-muted-foreground/40 text-muted-foreground";
  }
}

function SecurityPaymentsPage() {
  const { hostelId } = useHostelScope();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [refundRow, setRefundRow] = useState<SecurityPaymentRow | null>(null);
  const [historyRow, setHistoryRow] = useState<SecurityPaymentRow | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const status =
    statusFilter === "all" ? undefined : (statusFilter as SecurityStatus);

  const { data, isLoading, isError } = useSecurityPaymentsQuery(
    {
      page,
      limit: 50,
      status,
      search: debouncedQuery || undefined,
      ...(hostelId ? { hostel: hostelId } : {}),
    },
    { enabled: Boolean(hostelId) },
  );

  const rows = data?.security_payments ?? [];
  const pagination = data?.pagination;
  const summary = data?.summary;

  return (
    <div className="space-y-4">
      {isLoading && !data ? (
        <StatCardsRowSkeleton count={6} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Held security (PKR)"
            value={formatMoney(summary?.pkr?.remaining ?? 0, "pkr")}
            icon={Shield}
            accent="success"
            delta={`${summary?.pkr?.count ?? 0} booking(s) with deposit on file`}
          />
          <StatCard
            label="Returnable security (PKR)"
            value={formatMoney(summary?.pkr?.returnable ?? 0, "pkr")}
            icon={Banknote}
            accent="info"
            delta="Planned amount to give back to guests"
          />
          <StatCard
            label="Returned to date (PKR)"
            value={formatMoney(summary?.pkr?.returned ?? 0, "pkr")}
            icon={ArrowDownToLine}
            accent="info"
            delta={`Deposited ${formatMoney(summary?.pkr?.deposited ?? 0, "pkr")}`}
          />
          <StatCard
            label="Held security (USD)"
            value={formatMoney(summary?.usd?.remaining ?? 0, "usd")}
            icon={Wallet}
            accent="info"
            delta={`${summary?.usd?.count ?? 0} booking(s)`}
          />
          <StatCard
            label="Returnable security (USD)"
            value={formatMoney(summary?.usd?.returnable ?? 0, "usd")}
            icon={Banknote}
            accent="warning"
            delta="Planned amount to give back to guests"
          />
          <StatCard
            label="Returned to date (USD)"
            value={formatMoney(summary?.usd?.returned ?? 0, "usd")}
            icon={ArrowDownToLine}
            accent="warning"
            delta={`Deposited ${formatMoney(summary?.usd?.deposited ?? 0, "usd")}`}
          />
        </div>
      )}

      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput
            placeholder="Search guest, phone, payer…"
            value={query}
            onValueChange={setQuery}
          />
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
              <SelectItem value="paid">Held / paid</SelectItem>
              <SelectItem value="not_paid">Not paid</SelectItem>
              <SelectItem value="returned">Fully returned</SelectItem>
              <SelectItem value="held">Retained / held</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {isLoading ? (
            <PaymentsTableSkeleton />
          ) : isError ? (
            <p className="py-16 text-center text-sm text-destructive">Could not load security payments.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest / payer</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Deposited</TableHead>
                  <TableHead>Returnable</TableHead>
                  <TableHead>Returned</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      No security deposits match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <SecurityRow
                      key={row.id}
                      row={row}
                      onRefund={() => setRefundRow(row)}
                      onHistory={() => setHistoryRow(row)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.pages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
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

      <ReturnSecurityDialog
        row={refundRow}
        open={Boolean(refundRow)}
        onOpenChange={(open) => {
          if (!open) setRefundRow(null);
        }}
      />

      <SecurityHistoryDialog
        row={historyRow}
        open={Boolean(historyRow)}
        onOpenChange={(open) => {
          if (!open) setHistoryRow(null);
        }}
      />
    </div>
  );
}

function SecurityRow({
  row,
  onRefund,
  onHistory,
}: {
  row: SecurityPaymentRow;
  onRefund: () => void;
  onHistory: () => void;
}) {
  const cur = normalizeMoneyCurrency(row.currency);
  const canRefund = row.security_remaining > 0 && (row.security_status === "paid" || row.security_status === "held");

  return (
    <TableRow>
      <TableCell>
        <Link
          to="/admin/bookings/$id"
          params={{ id: row.booking_id }}
          className="font-semibold hover:underline"
        >
          {row.guest_name}
        </Link>
        <div className="text-xs text-muted-foreground">{row.guest_phone || row.guest_email || "—"}</div>
        {row.payer_name && row.payer_name !== row.guest_name ? (
          <div className="text-[11px] text-muted-foreground">Payer: {row.payer_name}</div>
        ) : null}
      </TableCell>
      <TableCell>{row.room_title ?? "—"}</TableCell>
      <TableCell className="font-medium tabular-nums">
        {formatMoney(row.security_amount ?? 0, cur)}
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">
        {formatMoney(row.security_returnable ?? row.security_amount ?? 0, cur)}
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">
        {formatMoney(row.security_returned ?? 0, cur)}
      </TableCell>
      <TableCell className="font-bold tabular-nums text-emerald-700">
        {formatMoney(row.security_remaining ?? 0, cur)}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={`whitespace-nowrap ${securityBadgeClass(row.security_status)}`}
        >
          {SECURITY_STATUS_LABELS[row.security_status]}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <HintTooltip label="Ledger history">
            <Button type="button" size="sm" variant="ghost" aria-label="Ledger history" onClick={onHistory}>
              <History className="h-4 w-4" />
            </Button>
          </HintTooltip>
          <Button type="button" size="sm" variant="outline" disabled={!canRefund} onClick={onRefund}>
            Return
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ReturnSecurityDialog({
  row,
  open,
  onOpenChange,
}: {
  row: SecurityPaymentRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useRecordSecurityMovementMutation();
  const cur = normalizeMoneyCurrency(row?.currency);
  const remaining = row?.security_remaining ?? 0;
  const [amountText, setAmountText] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open && row) {
      setAmountText(String(remaining));
      setNote("");
    }
  }, [open, row?.id, remaining]);

  const amount = Number(amountText);
  const valid = Number.isFinite(amount) && amount > 0 && amount <= remaining;

  function submit() {
    if (!row || !valid) return;
    mutation.mutate(
      {
        bookingId: row.booking_id,
        input: { action: "refund", amount, note: note.trim() || undefined },
      },
      {
        onSuccess: () => {
          toast.success(
            `Returned ${formatMoney(amount, cur)}. Remaining ${formatMoney(remaining - amount, cur)}.`,
          );
          onOpenChange(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not return security"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Return security</DialogTitle>
          <DialogDescription className="sr-only">Details</DialogDescription>
        </DialogHeader>

        {row ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Deposited: </span>
                <span className="font-semibold">{formatMoney(row.security_amount ?? 0, cur)}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Returnable (planned): </span>
                <span className="font-semibold">
                  {formatMoney(row.security_returnable ?? row.security_amount ?? 0, cur)}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Already returned: </span>
                <span className="font-semibold">{formatMoney(row.security_returned ?? 0, cur)}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Remaining held: </span>
                <span className="font-bold text-emerald-700">{formatMoney(remaining, cur)}</span>
              </p>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="sec-return-amount" required>Amount to return</Label>
              <Input
                id="sec-return-amount"
                type="number"
                min={0}
                max={remaining}
                step={1}
                value={amountText}
                onChange={(e) => setAmountText(e.target.value)}
              />
              {valid ? (
                <p className="text-xs text-muted-foreground">
                  After this return, remaining will be {formatMoney(remaining - amount, cur)}.
                </p>
              ) : (
                <p className="text-xs text-destructive">Enter an amount up to the remaining balance.</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="sec-return-note">Note</Label>
              <Textarea
                id="sec-return-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Partial refund — guest requested Rs 2,000 back"
                className="resize-none"
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!valid || mutation.isPending} onClick={submit}>
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              "Return security"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SecurityHistoryDialog({
  row,
  open,
  onOpenChange,
}: {
  row: SecurityPaymentRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const cur = normalizeMoneyCurrency(row?.currency);
  const ledger = row?.security_ledger ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Security ledger</DialogTitle>
          <DialogDescription className="sr-only">Details</DialogDescription>
        </DialogHeader>

        {ledger.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No ledger entries yet.</p>
        ) : (
          <div className="max-h-[50vh] space-y-2 overflow-y-auto">
            {ledger.map((entry, idx) => (
              <div
                key={entry.id ?? `${entry.type}-${idx}`}
                className="rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium capitalize">{entry.type}</span>
                  <span className="font-semibold tabular-nums">{formatMoney(entry.amount, cur)}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                  {entry.payer_name ? <span>Payer: {entry.payer_name}</span> : null}
                  <span>Balance after: {formatMoney(entry.balance_after, cur)}</span>
                  {entry.recorded_at ? (
                    <span>{new Date(entry.recorded_at).toLocaleString()}</span>
                  ) : null}
                </div>
                {entry.note ? <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p> : null}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
