import { useEffect, useMemo, useState } from "react";
import { IndianRupee, Loader2, Percent } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateBookingPricingMutation } from "@/queries/bookings";
import type { Booking } from "@/types/domain/booking.types";

type Props = {
  booking: Booking;
};

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function BookingPricingCard({ booking }: Props) {
  const updatePricing = useUpdateBookingPricingMutation();

  const quotedTotal = booking.total_amount;
  const seatMonths = booking.seats_booked * booking.months;

  const [totalInput, setTotalInput] = useState(String(quotedTotal));
  const [pricePerSeatInput, setPricePerSeatInput] = useState(String(booking.price_per_seat));
  const [note, setNote] = useState("");

  useEffect(() => {
    setTotalInput(String(booking.total_amount));
    setPricePerSeatInput(String(booking.price_per_seat));
    setNote("");
  }, [booking.id, booking.total_amount, booking.price_per_seat]);

  const parsedTotal = Number(totalInput);
  const parsedPricePerSeat = Number(pricePerSeatInput);

  const discount = useMemo(() => {
    if (!Number.isFinite(parsedTotal) || quotedTotal <= 0) return null;
    const saved = quotedTotal - parsedTotal;
    const pct = (saved / quotedTotal) * 100;
    return { saved, pct };
  }, [parsedTotal, quotedTotal]);

  const canSave =
    booking.status !== "cancelled" &&
    Number.isFinite(parsedTotal) &&
    parsedTotal >= 0 &&
    Number.isFinite(parsedPricePerSeat) &&
    parsedPricePerSeat >= 0 &&
    (parsedTotal !== quotedTotal ||
      Math.round(parsedPricePerSeat * 100) !== Math.round(booking.price_per_seat * 100));

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

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
        onSuccess: () => toast.success("Booking price updated — stats and invoices will use the new amount"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );
  }

  function applyDiscountPercent(percent: number) {
    const next = Math.max(0, Math.round(quotedTotal * (1 - percent / 100)));
    setTotalInput(String(next));
    if (seatMonths > 0) {
      setPricePerSeatInput(String(Math.round((next / seatMonths) * 100) / 100));
    }
  }

  if (booking.status === "cancelled") {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Pricing</CardTitle>
          <CardDescription>Cancelled bookings cannot be repriced.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <IndianRupee className="h-4 w-4" />
          Adjust price (discount)
        </CardTitle>
        <CardDescription>
          Guest booked online but negotiated a lower rate at check-in? Update the total here so revenue stats and
          invoices stay accurate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
            <p>
              <span className="text-muted-foreground">Quoted online: </span>
              <span className="font-semibold">{formatInr(quotedTotal)}</span>
            </p>
            <p className="mt-1 text-muted-foreground">
              {booking.seats_booked} seat(s) × {booking.months} month(s) @ {formatInr(booking.price_per_seat)}/seat/mo
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="booking-total">Final total (₹) *</Label>
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
              <Label htmlFor="booking-pps">Price per seat / month (₹)</Label>
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
              Discount: {formatInr(Math.max(0, discount.saved))} ({discount.pct.toFixed(1)}% off quoted price)
            </p>
          ) : null}

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

          <Button type="submit" disabled={!canSave || updatePricing.isPending}>
            {updatePricing.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              "Save adjusted price"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
