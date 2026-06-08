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

type BookingRefundDialogProps = {
  open: boolean;
  booking: Booking | null;
  mode: "cancel" | "checkout";
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (amountRefunded: number) => void;
};

const PAID_STATUSES = new Set(["confirmed", "checked_in", "checked_out"]);

export function BookingRefundDialog({
  open,
  booking,
  mode,
  submitting,
  onClose,
  onConfirm,
}: BookingRefundDialogProps) {
  const cur = normalizeMoneyCurrency(booking?.currency);
  const total = booking?.total_amount ?? 0;
  const requiresRefund = booking ? PAID_STATUSES.has(booking.status) : false;

  const [refundText, setRefundText] = useState("0");

  useEffect(() => {
    if (!open || !booking) return;
    if (!requiresRefund) {
      setRefundText("0");
      return;
    }
    setRefundText(mode === "cancel" ? String(total) : "0");
  }, [open, booking?.id, total, requiresRefund, mode]);

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

  const title = mode === "cancel" ? "Cancel booking" : "Check out guest";
  const description =
    mode === "cancel"
      ? requiresRefund
        ? "Enter how much money you returned to the guest. The rest stays in your revenue."
        : "This booking was not paid yet. No refund is recorded."
      : requiresRefund
        ? "Guest is leaving early. Enter how much rent you returned. The rest counts as your revenue in Monthly Reports and Payments."
        : "Mark this stay as completed. No payment was collected.";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {booking && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <p className="font-semibold">{booking.guest_name}</p>
              <p className="text-muted-foreground">
                Booking total:{" "}
                <span className="font-bold text-foreground">{formatMoney(total, cur)}</span>
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
                    <p className="text-xs text-muted-foreground">Refunded</p>
                    <p className="font-bold text-rose-600">{formatMoney(Math.max(0, refundNum), cur)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Kept (revenue)</p>
                    <p className="font-bold text-emerald-700">{formatMoney(retained, cur)}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {mode === "cancel"
                  ? "Cancelling will free the seat(s). No payment was collected."
                  : "The seat(s) will be freed. No refund is recorded."}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {mode === "cancel" ? "Keep booking" : "Go back"}
          </Button>
          <Button
            variant={mode === "cancel" ? "destructive" : "default"}
            disabled={!valid || submitting}
            onClick={() => onConfirm(requiresRefund ? refundNum : 0)}
          >
            {submitting
              ? mode === "cancel"
                ? "Cancelling…"
                : "Saving…"
              : mode === "cancel"
                ? "Cancel booking"
                : "Confirm checkout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
