import { useEffect, useMemo, useState } from "react";
import { Banknote, CalendarCheck, Loader2, Percent, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateBookingPricingMutation } from "@/queries/bookings";
import { useUpdateResidentMutation } from "@/queries/residents";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import { securityDepositForSeats, securityPerSeat } from "@/lib/security-deposit";
import {
  RENT_PAYMENT_STATUS_LABELS,
  SECURITY_STATUS_LABELS,
  type RentPaymentStatus,
  type SecurityStatus,
} from "@/types/domain/resident.types";
import {
  buildBookingRentTimeline,
  rentCollectedFromTimeline,
} from "@/lib/rent-ledger";
import type { Booking } from "@/types/domain/booking.types";

type Props = {
  booking: Booking;
};

const SECURITY_STATUS_OPTIONS = Object.keys(SECURITY_STATUS_LABELS) as SecurityStatus[];
const RENT_STATUS_OPTIONS = Object.keys(RENT_PAYMENT_STATUS_LABELS) as RentPaymentStatus[];

function isMonthlyBooking(booking: Booking) {
  return booking.stay_unit !== "night" && booking.months >= 1;
}

export function BookingPricingCard({ booking }: Props) {
  const updatePricing = useUpdateBookingPricingMutation();
  const updateSecurity = useUpdateResidentMutation();
  const cur = normalizeMoneyCurrency(booking.currency);
  const money = (n: number) => formatMoney(n, cur);
  const monthlyStay = isMonthlyBooking(booking);

  const quotedTotal = booking.total_amount;
  const seatMonths = booking.seats_booked * booking.months;
  const listSecurity = monthlyStay ? securityDepositForSeats(booking.seats_booked, cur) : 0;
  const storedSecurityAmount = booking.security_amount ?? listSecurity;
  const storedSecurityStatus =
    booking.security_status && booking.security_status !== "not_applicable"
      ? booking.security_status
      : "not_paid";

  const [totalInput, setTotalInput] = useState(String(quotedTotal));
  const [pricePerSeatInput, setPricePerSeatInput] = useState(String(booking.price_per_seat));
  const [customPercentInput, setCustomPercentInput] = useState("");
  const [note, setNote] = useState("");

  const [useCustomSecurity, setUseCustomSecurity] = useState(false);
  const [securityInput, setSecurityInput] = useState(String(storedSecurityAmount));
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>(storedSecurityStatus);
  const [collectMonths, setCollectMonths] = useState("1");

  const rentTimeline = useMemo(
    () => (monthlyStay ? buildBookingRentTimeline(booking) : []),
    [monthlyStay, booking],
  );
  const rentCollected = booking.amount_paid_upfront ?? rentCollectedFromTimeline(rentTimeline);
  const rentDue = booking.amount_outstanding ?? Math.max(0, quotedTotal - rentCollected);

  useEffect(() => {
    setTotalInput(String(booking.total_amount));
    setPricePerSeatInput(String(booking.price_per_seat));
    setCustomPercentInput("");
    setNote("");
  }, [booking.id, booking.total_amount, booking.price_per_seat]);

  useEffect(() => {
    setSecurityInput(String(booking.security_amount ?? listSecurity));
    setSecurityStatus(
      booking.security_status && booking.security_status !== "not_applicable"
        ? booking.security_status
        : "not_paid",
    );
    setUseCustomSecurity(false);
  }, [booking.id, booking.security_amount, booking.security_status, listSecurity]);

  useEffect(() => {
    const unpaid = rentTimeline.filter((m) => m.payment_status === "not_paid").length;
    const defaultMonths = unpaid > 0 ? unpaid : booking.months;
    setCollectMonths(String(Math.min(defaultMonths, rentTimeline.length || booking.months)));
  }, [booking.id, booking.months, rentTimeline]);

  const parsedTotal = Number(totalInput);
  const parsedPricePerSeat = Number(pricePerSeatInput);
  const parsedSecurity = Number(securityInput);
  const effectiveSecurity =
    useCustomSecurity && Number.isFinite(parsedSecurity) ? parsedSecurity : listSecurity;

  const discount = useMemo(() => {
    if (!Number.isFinite(parsedTotal) || quotedTotal <= 0) return null;
    const saved = quotedTotal - parsedTotal;
    const pct = (saved / quotedTotal) * 100;
    return { saved, pct };
  }, [parsedTotal, quotedTotal]);

  const canSaveRent =
    booking.status !== "cancelled" &&
    Number.isFinite(parsedTotal) &&
    parsedTotal >= 0 &&
    Number.isFinite(parsedPricePerSeat) &&
    parsedPricePerSeat >= 0 &&
    (parsedTotal !== quotedTotal ||
      Math.round(parsedPricePerSeat * 100) !== Math.round(booking.price_per_seat * 100));

  const canSaveSecurity =
    monthlyStay &&
    booking.status !== "cancelled" &&
    effectiveSecurity >= 0 &&
    (effectiveSecurity !== (booking.security_amount ?? listSecurity) ||
      securityStatus !== storedSecurityStatus);

  function handleSaveRent(e: React.FormEvent) {
    e.preventDefault();
    if (!canSaveRent) return;

    updatePricing.mutate(
      {
        id: booking.id,
        input: {
          total_amount: parsedTotal,
          price_per_seat: parsedPricePerSeat,
          pricing_note: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => toast.success("Rent price updated"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );
  }

  function handleMonthRentStatus(month: string, next: RentPaymentStatus) {
    updateSecurity.mutate(
      { bookingId: booking.id, input: { month, payment_status: next } },
      {
        onSuccess: () => toast.success(`Rent (${month}): ${RENT_PAYMENT_STATUS_LABELS[next]}`),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );
  }

  function handleCollectRentMonths(e: React.FormEvent) {
    e.preventDefault();
    const count = Number(collectMonths);
    if (!Number.isFinite(count) || count < 1 || count > rentTimeline.length) {
      toast.error(`Choose between 1 and ${rentTimeline.length} months`);
      return;
    }
    updateSecurity.mutate(
      { bookingId: booking.id, input: { collect_rent_months: count } },
      {
        onSuccess: () =>
          toast.success(
            count === 1
              ? "Marked 1 month rent as collected"
              : `Marked ${count} months rent as collected`,
          ),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );
  }

  function handleSaveSecurity(e: React.FormEvent) {
    e.preventDefault();
    if (!canSaveSecurity) return;

    updateSecurity.mutate(
      {
        bookingId: booking.id,
        input: {
          security_amount: effectiveSecurity,
          security_status: securityStatus,
        },
      },
      {
        onSuccess: () => toast.success("Security deposit updated"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );
  }

  function applyDiscountPercent(percent: number) {
    const safe = Math.min(100, Math.max(0, percent));
    const next = Math.max(0, Math.round(quotedTotal * (1 - safe / 100)));
    setTotalInput(String(next));
    if (seatMonths > 0) {
      setPricePerSeatInput(String(Math.round((next / seatMonths) * 100) / 100));
    }
  }

  function applyCustomPercent() {
    const pct = Number(customPercentInput);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      toast.error("Enter a discount between 0 and 100");
      return;
    }
    applyDiscountPercent(pct);
    toast.success(`Applied ${pct}% discount to quoted price`);
  }

  const customPercentNum = Number(customPercentInput);
  const customPercentValid =
    customPercentInput.trim() !== "" &&
    Number.isFinite(customPercentNum) &&
    customPercentNum >= 0 &&
    customPercentNum <= 100;

  if (booking.status === "cancelled") {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Pricing</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Banknote className="h-4 w-4" />
          Check-in collection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {monthlyStay && (
          <form onSubmit={handleSaveSecurity} className="space-y-4 rounded-lg border-2 border-primary/25 bg-primary/5 p-4">
            <div className="flex items-center gap-2 font-semibold">
              <Shield className="h-4 w-4 text-primary" />
              Security deposit
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Security status</Label>
                <Select
                  value={securityStatus}
                  onValueChange={(v) => setSecurityStatus(v as SecurityStatus)}
                >
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
              <div className="grid gap-1.5">
                <Label>Security amount</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={useCustomSecurity ? securityInput : String(listSecurity)}
                  onChange={(e) => setSecurityInput(e.target.value)}
                  disabled={!useCustomSecurity}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={useCustomSecurity}
                onChange={(e) => {
                  setUseCustomSecurity(e.target.checked);
                  if (e.target.checked) setSecurityInput(String(storedSecurityAmount));
                }}
              />
              <span>Custom security</span>
            </label>

            {useCustomSecurity && Number.isFinite(parsedSecurity) && parsedSecurity !== listSecurity ? (
              <p className="text-xs text-muted-foreground">
                {parsedSecurity < listSecurity
                  ? `Below standard by ${money(listSecurity - parsedSecurity)}`
                  : `Above standard by ${money(parsedSecurity - listSecurity)}`}
              </p>
            ) : null}

            <Button type="submit" variant="default" disabled={!canSaveSecurity || updateSecurity.isPending}>
              {updateSecurity.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving security…
                </>
              ) : (
                "Save security deposit"
              )}
            </Button>
          </form>
        )}

        {monthlyStay && rentTimeline.length > 0 && (
          <div className="space-y-4 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 font-semibold">
              <CalendarCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              Rent collection
            </div>
            {booking.months_paid_upfront != null && booking.months > 1 && (
              <p className="text-xs text-muted-foreground">
                Upfront: {booking.months_paid_upfront}/{booking.months}
              </p>
            )}
            <div className="rounded-lg border border-border/60 bg-background/80 p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Collected: </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {money(rentCollected)}
                </span>
              </p>
              <p className="mt-1">
                <span className="text-muted-foreground">Still due: </span>
                <span className="font-semibold">{money(rentDue)}</span>
              </p>
            </div>

            <div className="space-y-2">
              {rentTimeline.map((row) => (
                <div
                  key={row.month}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{money(row.rent_amount)}</p>
                  </div>
                  <Select
                    value={row.payment_status}
                    onValueChange={(v) => handleMonthRentStatus(row.month, v as RentPaymentStatus)}
                    disabled={updateSecurity.isPending}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RENT_STATUS_OPTIONS.map((k) => (
                        <SelectItem key={k} value={k}>
                          {RENT_PAYMENT_STATUS_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <form onSubmit={handleCollectRentMonths} className="space-y-3 border-t border-border/60 pt-3">
           
              <div className="flex flex-wrap items-end gap-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="collect-rent-months">Collect rent for</Label>
                  <Select value={collectMonths} onValueChange={setCollectMonths}>
                    <SelectTrigger id="collect-rent-months" className="w-[88px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rentTimeline.map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span className="pb-2 text-sm text-muted-foreground">
                  month{Number(collectMonths) === 1 ? "" : "s"} (from move-in)
                </span>
                <Button type="submit" variant="secondary" disabled={updateSecurity.isPending}>
                  {updateSecurity.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    "Mark collected"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        <form onSubmit={handleSaveRent} className="space-y-4">
          <div className="font-semibold">Monthly rent</div>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
            <p>
              <span className="text-muted-foreground">Quoted online: </span>
              <span className="font-semibold">{money(quotedTotal)}</span>
            </p>
            <p className="mt-1 text-muted-foreground">
              {booking.seats_booked} seat(s) × {booking.months} month(s) @ {money(booking.price_per_seat)}/seat/mo
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="booking-total">Final rent total *</Label>
              <Input
                id="booking-total"
                type="number"
                min={0}
                step={1}
                value={totalInput}
                onChange={(e) => {
                  setTotalInput(e.target.value);
                  const t = Number(e.target.value);
                  if (Number.isFinite(t) && seatMonths > 0) {
                    setPricePerSeatInput(String(Math.round((t / seatMonths) * 100) / 100));
                  }
                }}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="booking-pps">Price per seat / month</Label>
              <Input
                id="booking-pps"
                type="number"
                min={0}
                step={1}
                value={pricePerSeatInput}
                onChange={(e) => {
                  setPricePerSeatInput(e.target.value);
                  const p = Number(e.target.value);
                  if (Number.isFinite(p) && seatMonths > 0) {
                    setTotalInput(String(Math.round(p * seatMonths)));
                  }
                }}
              />
            </div>
          </div>

          {discount && parsedTotal !== quotedTotal ? (
            <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <Percent className="h-4 w-4" />
              Discount: {money(Math.max(0, discount.saved))} ({discount.pct.toFixed(1)}% off quoted price)
            </p>
          ) : null}

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Quick discount</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => applyDiscountPercent(5)}>
                −5%
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => applyDiscountPercent(10)}>
                −10%
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => applyDiscountPercent(15)}>
                −15%
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setTotalInput(String(quotedTotal))}>
                Reset to quoted
              </Button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor="custom-discount-pct">Custom discount (%)</Label>
              <Input
                id="custom-discount-pct"
                type="number"
                min={0}
                max={100}
                step={0.5}
                placeholder="e.g. 12"
                value={customPercentInput}
                onChange={(e) => setCustomPercentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyCustomPercent();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Percent off the quoted total ({money(quotedTotal)}). 100% = free.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="sm:mb-6"
              disabled={!customPercentValid}
              onClick={applyCustomPercent}
            >
              Apply %
            </Button>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="pricing-note">Reason (optional)</Label>
            <Textarea
              id="pricing-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Negotiated at front desk, long-stay discount…"
            />
          </div>

          <Button type="submit" disabled={!canSaveRent || updatePricing.isPending}>
            {updatePricing.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              "Save adjusted rent"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
