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
import {
  buildBookingRentTimeline,
  rentCollectedFromTimeline,
} from "@/lib/rent-ledger";
import {
  bookingSecurityAmount,
  isMonthlyBooking,
} from "@/lib/security-deposit";
import { SECURITY_STATUS_LABELS } from "@/types/domain/resident.types";
import type { Booking } from "@/types/domain/booking.types";

export type CheckoutConfirmExtras = {
  securityReturned: number;
};

type BookingRefundDialogProps = {
  open: boolean;
  booking: Booking | null;
  mode: "cancel" | "checkout";
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (amountRefunded: number, checkoutExtras?: CheckoutConfirmExtras) => void;
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
  const contractTotal = booking?.total_amount ?? 0;
  const rentCollected = useMemo(() => {
    if (!booking) return 0;
    if (booking.amount_paid_upfront != null) return booking.amount_paid_upfront;
    return rentCollectedFromTimeline(buildBookingRentTimeline(booking));
  }, [booking]);
  /** Checkout refunds are based on rent actually collected, not the full contract. */
  const rentBasis =
    mode === "checkout" ? (rentCollected > 0 ? rentCollected : contractTotal) : contractTotal;
  const requiresRefund = booking ? PAID_STATUSES.has(booking.status) : false;

  const [refundText, setRefundText] = useState("0");
  const [securityReturnText, setSecurityReturnText] = useState("0");

  const securityAmount = booking ? bookingSecurityAmount(booking, cur) : null;
  const securityRemainingHeld =
    booking?.security_remaining != null
      ? booking.security_remaining
      : securityAmount != null
        ? Math.max(
            0,
            securityAmount -
              (booking?.security_returned ?? 0) -
              (booking?.security_retained ?? 0),
          )
        : 0;
  const securityPaid =
    booking?.security_status === "paid" ||
    (booking?.security_status === "held" && securityRemainingHeld > 0);
  const showSecurityCheckout =
    mode === "checkout" &&
    booking != null &&
    isMonthlyBooking(booking) &&
    securityAmount != null &&
    securityRemainingHeld > 0;

  useEffect(() => {
    if (!open || !booking) return;
    if (!requiresRefund) {
      setRefundText("0");
    } else {
      setRefundText(mode === "cancel" ? String(rentBasis) : "0");
    }
    if (showSecurityCheckout && securityPaid) {
      setSecurityReturnText(String(securityRemainingHeld));
    } else {
      setSecurityReturnText("0");
    }
  }, [
    open,
    booking?.id,
    rentBasis,
    requiresRefund,
    mode,
    showSecurityCheckout,
    securityPaid,
    securityRemainingHeld,
  ]);

  const refundNum = Number(refundText);
  const securityReturnNum = Number(securityReturnText);
  const retained = useMemo(() => {
    if (!Number.isFinite(refundNum)) return 0;
    return Math.max(0, Math.round((rentBasis - refundNum) * 100) / 100);
  }, [refundNum, rentBasis]);
  const securityKept = useMemo(() => {
    if (!showSecurityCheckout || !securityPaid) return 0;
    if (!Number.isFinite(securityReturnNum)) return securityRemainingHeld;
    return Math.max(0, Math.round((securityRemainingHeld - securityReturnNum) * 100) / 100);
  }, [showSecurityCheckout, securityPaid, securityRemainingHeld, securityReturnNum]);

  const rentValid =
    Number.isFinite(refundNum) &&
    refundNum >= 0 &&
    refundNum <= rentBasis &&
    (!requiresRefund || refundText.trim() !== "");
  const securityValid =
    !showSecurityCheckout ||
    !securityPaid ||
    (Number.isFinite(securityReturnNum) &&
      securityReturnNum >= 0 &&
      securityReturnNum <= securityRemainingHeld &&
      securityReturnText.trim() !== "");
  const valid = rentValid && securityValid;

  const title = mode === "cancel" ? "Cancel booking" : "Check out guest";
  const description =
    mode === "cancel"
      ? requiresRefund
        ? "Enter how much money you returned to the guest. The rest stays in your revenue."
        : "This booking was not paid yet. No refund is recorded."
      : requiresRefund
        ? rentCollected > 0 && rentCollected < contractTotal
          ? "Guest is leaving early. Refund is based on rent collected so far — not the full booking total. Enter how much rent you returned; the rest stays as your revenue."
          : "Guest is leaving early. Enter how much rent you returned. The rest counts as your revenue in Monthly Reports and Payments."
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
            <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
              <p className="font-semibold">{booking.guest_name}</p>
              {mode === "checkout" && rentCollected > 0 ? (
                <>
                  <p>
                    <span className="text-muted-foreground">Rent collected: </span>
                    <span className="font-bold text-foreground">{formatMoney(rentCollected, cur)}</span>
                  </p>
                  {contractTotal > rentCollected ? (
                    <p className="text-xs text-muted-foreground">
                      Booking total {formatMoney(contractTotal, cur)} ({booking.months} month
                      {booking.months === 1 ? "" : "s"}) — unpaid months are not part of checkout
                      refund.
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-muted-foreground">
                  Booking total:{" "}
                  <span className="font-bold text-foreground">{formatMoney(contractTotal, cur)}</span>
                </p>
              )}
            </div>

            {requiresRefund ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="amount-refunded">
                    {mode === "checkout" && rentCollected > 0
                      ? "Rent returned to guest"
                      : "Amount returned to guest"}
                  </Label>
                  <Input
                    id="amount-refunded"
                    type="text"
                    inputMode="decimal"
                    value={refundText}
                    onChange={(e) => setRefundText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {mode === "checkout" && rentCollected > 0
                      ? `Enter 0 to keep all ${formatMoney(rentCollected, cur)} collected rent. Max refund ${formatMoney(rentBasis, cur)}.`
                      : "Enter 0 if you are keeping the full amount (no refund)."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Rent refunded</p>
                    <p className="font-bold text-rose-600">{formatMoney(Math.max(0, refundNum), cur)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rent kept (revenue)</p>
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

            {showSecurityCheckout && securityAmount != null && (
              <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="text-sm font-semibold">Security deposit</p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Originally deposited</span>
                  <span className="font-bold">{formatMoney(securityAmount, cur)}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Still held</span>
                  <span className="font-bold text-emerald-700">
                    {formatMoney(securityRemainingHeld, cur)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Status:{" "}
                  <span className="font-medium text-foreground">
                    {SECURITY_STATUS_LABELS[booking.security_status ?? "not_paid"] ??
                      booking.security_status}
                  </span>
                </p>
                {securityPaid ? (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="security-returned">Security returned to guest now</Label>
                      <Input
                        id="security-returned"
                        type="text"
                        inputMode="decimal"
                        value={securityReturnText}
                        onChange={(e) => setSecurityReturnText(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter 0 to keep the remaining held security. Max {formatMoney(securityRemainingHeld, cur)}.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Security returned</p>
                        <p className="font-bold text-rose-600">
                          {formatMoney(Math.max(0, securityReturnNum), cur)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Security kept (revenue)</p>
                        <p className="font-bold text-emerald-700">{formatMoney(securityKept, cur)}</p>
                      </div>
                      {securityKept > 0 ? (
                        <p className="col-span-2 text-xs text-muted-foreground">
                          Kept security counts as revenue in Monthly Reports for the checkout month.
                        </p>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No security was marked as collected. Update the booking&apos;s security status on
                    the detail page if you took a deposit at check-in.
                  </p>
                )}
              </div>
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
            onClick={() => {
              const rentRefunded = requiresRefund ? refundNum : 0;
              if (mode === "checkout" && showSecurityCheckout && securityPaid) {
                onConfirm(rentRefunded, { securityReturned: securityReturnNum });
              } else {
                onConfirm(rentRefunded);
              }
            }}
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
