import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateBookingDetailsMutation } from "@/queries/bookings";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import type { Booking } from "@/types/domain/booking.types";

type Props = {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function addMonthsIso(iso: string, months: number) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d, 12, 0, 0, 0);
  dt.setMonth(dt.getMonth() + months);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function addDaysIso(iso: string, days: number) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d, 12, 0, 0, 0);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function EditBookingDialog({ booking, open, onOpenChange }: Props) {
  const updateDetails = useUpdateBookingDetailsMutation();
  const isNightStay = booking.stay_unit === "night";
  const isCancelled = booking.status === "cancelled";
  const cur = normalizeMoneyCurrency(booking.currency);

  const [guestName, setGuestName] = useState(booking.guest_name);
  const [guestEmail, setGuestEmail] = useState(booking.guest_email);
  const [guestPhone, setGuestPhone] = useState(booking.guest_phone);
  const [source, setSource] = useState(booking.source ?? "");
  const [notes, setNotes] = useState(booking.notes ?? "");
  const [moveIn, setMoveIn] = useState(booking.move_in?.slice(0, 10) ?? "");
  const [checkOut, setCheckOut] = useState(booking.check_out?.slice(0, 10) ?? "");
  const [months, setMonths] = useState(String(booking.months ?? 1));
  const [nights, setNights] = useState(String(booking.nights ?? 1));
  const [seats, setSeats] = useState(String(booking.seats_booked ?? 1));
  const [pricePerSeat, setPricePerSeat] = useState(String(booking.price_per_seat ?? 0));
  const [totalAmount, setTotalAmount] = useState(String(booking.total_amount ?? 0));
  const [autoTotal, setAutoTotal] = useState(true);
  const [overrideCheckOut, setOverrideCheckOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    setGuestName(booking.guest_name);
    setGuestEmail(booking.guest_email);
    setGuestPhone(booking.guest_phone);
    setSource(booking.source ?? "");
    setNotes(booking.notes ?? "");
    setMoveIn(booking.move_in?.slice(0, 10) ?? "");
    setCheckOut(booking.check_out?.slice(0, 10) ?? "");
    setMonths(String(booking.months ?? 1));
    setNights(String(booking.nights ?? 1));
    setSeats(String(booking.seats_booked ?? 1));
    setPricePerSeat(String(booking.price_per_seat ?? 0));
    setTotalAmount(String(booking.total_amount ?? 0));
    setAutoTotal(true);
    setOverrideCheckOut(false);
  }, [open, booking]);

  const seatsNum = Number.parseInt(seats, 10);
  const monthsNum = Number.parseInt(months, 10);
  const nightsNum = Number.parseInt(nights, 10);
  const priceNum = Number.parseFloat(pricePerSeat);

  const derivedCheckOut = useMemo(() => {
    if (!moveIn || !/^\d{4}-\d{2}-\d{2}$/.test(moveIn)) return "";
    if (isNightStay) {
      if (!Number.isFinite(nightsNum) || nightsNum < 1) return "";
      return addDaysIso(moveIn, nightsNum);
    }
    if (!Number.isFinite(monthsNum) || monthsNum < 1) return "";
    return addMonthsIso(moveIn, monthsNum);
  }, [moveIn, isNightStay, nightsNum, monthsNum]);

  const previewTotal = useMemo(() => {
    if (!Number.isFinite(priceNum) || !Number.isFinite(seatsNum) || seatsNum < 1) return null;
    const units = isNightStay
      ? seatsNum * (Number.isFinite(nightsNum) && nightsNum >= 1 ? nightsNum : 0)
      : seatsNum * (Number.isFinite(monthsNum) && monthsNum >= 1 ? monthsNum : 0);
    if (units <= 0) return null;
    return Math.round(priceNum * units * 100) / 100;
  }, [priceNum, seatsNum, isNightStay, nightsNum, monthsNum]);

  useEffect(() => {
    if (!autoTotal || previewTotal == null) return;
    setTotalAmount(String(previewTotal));
  }, [autoTotal, previewTotal]);

  useEffect(() => {
    if (overrideCheckOut || !derivedCheckOut) return;
    setCheckOut(derivedCheckOut);
  }, [overrideCheckOut, derivedCheckOut]);

  const canSave =
    guestName.trim().length > 0 &&
    guestEmail.trim().includes("@") &&
    guestPhone.trim().length >= 5 &&
    moveIn.length === 10 &&
    checkOut.length === 10 &&
    Number.isFinite(seatsNum) &&
    seatsNum >= 1 &&
    (isNightStay
      ? Number.isFinite(nightsNum) && nightsNum >= 1
      : Number.isFinite(monthsNum) && monthsNum >= 1) &&
    Number.isFinite(priceNum) &&
    priceNum >= 0 &&
    Number.isFinite(Number(totalAmount)) &&
    Number(totalAmount) >= 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    const input: Parameters<typeof updateDetails.mutate>[0]["input"] = {
      guest_name: guestName.trim(),
      guest_email: guestEmail.trim(),
      guest_phone: guestPhone.trim(),
      source: source.trim() || undefined,
      notes: notes.trim(),
    };

    if (!isCancelled) {
      input.move_in = moveIn;
      input.seats_booked = seatsNum;
      input.price_per_seat = priceNum;
      input.total_amount = Number(totalAmount);
      input.recalculate_total = false;
      if (isNightStay) {
        input.nights = nightsNum;
      } else {
        input.months = monthsNum;
      }
      if (overrideCheckOut && checkOut) {
        input.check_out = checkOut;
      }
    }

    updateDetails.mutate(
      { id: booking.id, input },
      {
        onSuccess: () => {
          toast.success("Booking updated");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Edit booking
          </DialogTitle>
          <DialogDescription className="sr-only">Details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="edit-guest-name" required>Guest name</Label>
              <Input
                id="edit-guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-guest-email" required>Email</Label>
              <Input
                id="edit-guest-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-guest-phone" required>Phone</Label>
              <Input
                id="edit-guest-phone"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="edit-source">Source / channel</Label>
              <Input
                id="edit-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="website, walk_in, company…"
              />
            </div>
          </div>

          {!isCancelled && (
            <div className="space-y-3 rounded-md border border-border/60 p-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Stay
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit-move-in" required>Move-in</Label>
                  <Input
                    id="edit-move-in"
                    type="date"
                    value={moveIn}
                    onChange={(e) => setMoveIn(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-duration" required>
                    {isNightStay ? "Nights" : "Months"}
                  </Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min={1}
                    max={isNightStay ? 60 : 24}
                    value={isNightStay ? nights : months}
                    onChange={(e) =>
                      isNightStay ? setNights(e.target.value) : setMonths(e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-seats" required>Seats</Label>
                  <Input
                    id="edit-seats"
                    type="number"
                    min={1}
                    max={20}
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-check-out" required={overrideCheckOut}>
                    Check-out {overrideCheckOut ? "" : "(auto)"}
                  </Label>
                  <Input
                    id="edit-check-out"
                    type="date"
                    value={checkOut}
                    disabled={!overrideCheckOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                  <label className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={overrideCheckOut}
                      onChange={(e) => setOverrideCheckOut(e.target.checked)}
                    />
                    Set check-out manually
                  </label>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit-price">
                    {isNightStay ? "Price per seat / night" : "Price per seat / month"}
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-total">Rent total</Label>
                  <Input
                    id="edit-total"
                    type="number"
                    min={0}
                    step="0.01"
                    value={totalAmount}
                    disabled={autoTotal}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />
                  <label className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={autoTotal}
                      onChange={(e) => setAutoTotal(e.target.checked)}
                    />
                    Auto-calculate total
                    {previewTotal != null ? ` (${formatMoney(previewTotal, cur)})` : ""}
                  </label>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Internal notes…"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave || updateDetails.isPending}>
              {updateDetails.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
