import { useEffect, useState } from "react";
import { Banknote, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateResidentMutation } from "@/queries/residents";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import {
  isMonthlyBooking,
  securityDepositForSeats,
  securityPerSeat,
} from "@/lib/security-deposit";

export { isMonthlyBooking };
import {
  SECURITY_STATUS_LABELS,
  type SecurityStatus,
} from "@/types/domain/resident.types";
import type { Booking } from "@/types/domain/booking.types";

type Props = {
  booking: Booking;
};

const SECURITY_STATUS_OPTIONS = Object.keys(SECURITY_STATUS_LABELS) as SecurityStatus[];

export function BookingSecurityCard({ booking }: Props) {
  const update = useUpdateResidentMutation();
  const cur = normalizeMoneyCurrency(booking.currency);
  const money = (n: number) => formatMoney(n, cur);
  const isMonthlyStay = isMonthlyBooking(booking);
  const listSecurity = securityDepositForSeats(booking.seats_booked, cur);
  const storedAmount = booking.security_amount ?? listSecurity;
  const storedStatus =
    booking.security_status && booking.security_status !== "not_applicable"
      ? booking.security_status
      : "not_paid";

  const [useCustom, setUseCustom] = useState(false);
  const [amountInput, setAmountInput] = useState(String(storedAmount));
  const [status, setStatus] = useState<SecurityStatus>(storedStatus);

  useEffect(() => {
    setAmountInput(String(booking.security_amount ?? listSecurity));
    setStatus(
      booking.security_status && booking.security_status !== "not_applicable"
        ? booking.security_status
        : "not_paid",
    );
    setUseCustom(false);
  }, [booking.id, booking.security_amount, booking.security_status, listSecurity]);

  if (!isMonthlyStay) return null;

  const parsedAmount = Number(amountInput);
  const effectiveAmount =
    useCustom && Number.isFinite(parsedAmount) ? parsedAmount : listSecurity;
  const canSave =
    booking.status !== "cancelled" &&
    effectiveAmount >= 0 &&
    (effectiveAmount !== (booking.security_amount ?? listSecurity) || status !== storedStatus);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    update.mutate(
      {
        bookingId: booking.id,
        input: {
          security_amount: effectiveAmount,
          security_status: status,
        },
      },
      {
        onSuccess: () => toast.success("Security deposit updated"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );
  }

  return (
    <Card className="border-border/60 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4 text-primary" />
          Security deposit
        </CardTitle>
        <CardDescription>
          Refundable deposit for monthly stays — standard {money(securityPerSeat(cur))} per seat (
          {money(listSecurity)} for {booking.seats_booked} seat(s)). Negotiate below if the guest
          pays less.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-sm">
            <p>
              <span className="text-muted-foreground">Standard: </span>
              <span className="font-bold">{money(listSecurity)}</span>
              {booking.security_amount != null && booking.security_amount !== listSecurity && (
                <span className="text-muted-foreground">
                  {" "}
                  · saved: <span className="font-bold text-foreground">{money(booking.security_amount)}</span>
                </span>
              )}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as SecurityStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECURITY_STATUS_OPTIONS.filter((k) => k !== "not_applicable").map((k) => (
                    <SelectItem key={k} value={k}>
                      {SECURITY_STATUS_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount to collect</Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={useCustom ? amountInput : String(listSecurity)}
                onChange={(e) => setAmountInput(e.target.value)}
                disabled={!useCustom}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={useCustom}
              onChange={(e) => {
                setUseCustom(e.target.checked);
                if (e.target.checked) setAmountInput(String(storedAmount));
              }}
            />
            <span>Use negotiated security amount</span>
          </label>

          {useCustom && Number.isFinite(parsedAmount) && parsedAmount !== listSecurity ? (
            <p className="text-xs text-muted-foreground">
              {parsedAmount < listSecurity
                ? `Below standard by ${money(listSecurity - parsedAmount)}`
                : `Above standard by ${money(parsedAmount - listSecurity)}`}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={!canSave || update.isPending}>
            {update.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Banknote className="h-4 w-4" /> Save security details
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
