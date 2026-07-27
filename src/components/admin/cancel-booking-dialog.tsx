import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import type { Booking } from "@/types/domain/booking.types";

type CancelBookingDialogProps = {
  open: boolean;
  booking: Booking | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (amountRefunded: number) => void;
};

const PAID_STATUSES = new Set(["confirmed", "checked_in", "checked_out"]);

export function CancelBookingDialog({
  open,
  booking,
  submitting,
  onClose,
  onConfirm,
}: CancelBookingDialogProps) {
  const cur = normalizeMoneyCurrency(booking?.currency);
  const total = booking?.total_amount ?? 0;
  const requiresRefund = booking ? PAID_STATUSES.has(booking.status) : false;

  const [refundText, setRefundText] = useState("0");

  useEffect(() => {
    if (!open || !booking) return;
    setRefundText(requiresRefund ? String(total) : "0");
  }, [open, booking?.id, total, requiresRefund]);

  const refundNum = Number(refundText);
  const retained = useMemo(() => {
    if (!Number.isFinite(refundNum)) return 0;
    return Math.max(0, Math.round((total - refundNum) * 100) / 100);
  }, [refundNum, total]);

  const valid =
    Number.isFinite(refundNum) &&
    refundNum >= 0 &&
    refundNum <= total &&
    (!requiresRefund || refundText.trim() !== "");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel booking</DialogTitle>
          <DialogDescription className="sr-only">Details</DialogDescription>
        </DialogHeader>

        {booking && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <p className="font-semibold">{booking.guest_name}</p>
              <p className="text-muted-foreground">
                Total paid / quoted: <span className="font-bold text-foreground">{formatMoney(total, cur)}</span>
              </p>
            </div>

            {requiresRefund ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="amount-refunded">Amount returned to guest</Label>
                  <Input
                    id="amount-refunded"
                    type="text"
                    inputMode="decimal"
                    value={refundText}
                    onChange={(e) => setRefundText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter 0 if you are keeping the full amount (no refund).
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Refunded (stats)</p>
                    <p className="font-bold text-rose-600">{formatMoney(Math.max(0, refundNum), cur)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Retained (revenue)</p>
                    <p className="font-bold text-emerald-700">{formatMoney(retained, cur)}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Cancelling will free the seat(s). No payment was collected.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Keep booking
          </Button>
          <Button
            variant="destructive"
            disabled={!valid || submitting}
            onClick={() => onConfirm(requiresRefund ? refundNum : 0)}
          >
            {submitting ? "Cancelling…" : "Cancel booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
