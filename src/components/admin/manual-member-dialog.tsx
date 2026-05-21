import { useEffect, useMemo, useState } from "react";
import { Banknote, Loader2, UserPlus } from "lucide-react";
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
import { useCreateManualBookingMutation } from "@/queries/bookings";
import type { Room } from "@/types/domain/room.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney } from "@/lib/payments";

type Props = {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function todayIsoDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ManualMemberDialog({ room, open, onOpenChange }: Props) {
  const createManual = useCreateManualBookingMutation();

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [seats, setSeats] = useState("1");
  const [months, setMonths] = useState("1");
  const [moveIn, setMoveIn] = useState(() => todayIsoDate());
  const [notes, setNotes] = useState("");
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [totalInput, setTotalInput] = useState("");
  const [currency, setCurrency] = useState<"pkr" | "usd">("pkr");

  const seatsNum = Number.parseInt(seats, 10);
  const monthsNum = Number.parseInt(months, 10);
  const unitPrice =
    currency === "usd"
      ? (room.price_per_night_usd ?? room.price_per_night)
      : (room.price_per_night_pkr ?? room.price_per_night);
  const listTotal =
    Number.isFinite(seatsNum) && Number.isFinite(monthsNum) ? unitPrice * seatsNum * monthsNum : 0;

  useEffect(() => {
    if (!useCustomPrice) {
      setTotalInput(listTotal > 0 ? String(listTotal) : "");
    }
  }, [listTotal, useCustomPrice]);

  const parsedTotal = Number(totalInput);

  const canSubmit =
    guestName.trim().length > 0 &&
    guestPhone.trim().length >= 5 &&
    Number.isFinite(seatsNum) &&
    seatsNum >= 1 &&
    seatsNum <= room.beds_available &&
    Number.isFinite(monthsNum) &&
    monthsNum >= 1 &&
    moveIn.trim().length > 0 &&
    (!useCustomPrice || (Number.isFinite(parsedTotal) && parsedTotal >= 0));

  const resetForm = () => {
    setGuestName("");
    setGuestPhone("");
    setGuestEmail("");
    setSeats("1");
    setMonths("1");
    setMoveIn(todayIsoDate());
    setNotes("");
    setUseCustomPrice(false);
    setTotalInput("");
    setCurrency("pkr");
  };

  const seatsHint = useMemo(() => {
    if (room.beds_available <= 0) return "No seats free in this room.";
    return `${room.beds_available} seat(s) available`;
  }, [room.beds_available]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    createManual.mutate(
      {
        room_id: room.id,
        guest_name: guestName.trim(),
        guest_phone: guestPhone.trim(),
        guest_email: guestEmail.trim() || undefined,
        seats_booked: seatsNum,
        months: monthsNum,
        move_in: moveIn,
        notes: notes.trim() || undefined,
        currency,
        ...(useCustomPrice && Number.isFinite(parsedTotal)
          ? { total_amount: parsedTotal }
          : {}),
      },
      {
        onSuccess: () => {
          toast.success("Member added — room seats updated");
          resetForm();
          onOpenChange(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add member"),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add walk-in member
          </DialogTitle>
          <DialogDescription>
            Register someone who took a seat manually in <strong>{room.title}</strong>. This creates a booking and
            reduces available seats.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="manual-name">Full name *</Label>
            <Input
              id="manual-name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Guest name"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="manual-phone">Phone *</Label>
              <Input
                id="manual-phone"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+92 300 1234567"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="manual-email">Email (optional)</Label>
              <Input
                id="manual-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="guest@email.com"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="manual-seats">Seats *</Label>
              <Input
                id="manual-seats"
                type="number"
                min={1}
                max={room.beds_available}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">{seatsHint}</p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="manual-months">Months *</Label>
              <Input
                id="manual-months"
                type="number"
                min={1}
                max={24}
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="manual-move-in">Move-in *</Label>
              <Input
                id="manual-move-in"
                type="date"
                value={moveIn}
                onChange={(e) => setMoveIn(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="manual-notes">Notes</Label>
            <Textarea
              id="manual-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Walk-in, paid cash, ID verified…"
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-3 space-y-3 text-sm">
            <div className="grid gap-2">
              <Label>Charge currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as "pkr" | "usd")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pkr">PKR (Rs)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <span className="text-muted-foreground">List total: </span>
              <span className="font-bold">{formatMoney(listTotal, currency)}</span>
              <span className="text-muted-foreground">
                {" "}
                ({formatMoney(unitPrice, currency)} × seats × months)
              </span>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={useCustomPrice}
                onChange={(e) => {
                  setUseCustomPrice(e.target.checked);
                  if (e.target.checked && listTotal > 0) {
                    setTotalInput(String(listTotal));
                  }
                }}
              />
              <span>Use negotiated / manual price</span>
            </label>

            {useCustomPrice ? (
              <div className="grid gap-1.5">
                <Label htmlFor="manual-total" className="flex items-center gap-1.5">
                  <Banknote className="h-3.5 w-3.5" />
                  Amount to charge *
                </Label>
                <Input
                  id="manual-total"
                  type="number"
                  min={0}
                  step={1}
                  value={totalInput}
                  onChange={(e) => setTotalInput(e.target.value)}
                  required
                />
                {Number.isFinite(parsedTotal) && listTotal > 0 && parsedTotal !== listTotal ? (
                  <p className="text-xs text-muted-foreground">
                    {parsedTotal < listTotal
                      ? `Discount: ${formatMoney(listTotal - parsedTotal, currency)} (${(((listTotal - parsedTotal) / listTotal) * 100).toFixed(0)}% off list)`
                      : `Above list by ${formatMoney(parsedTotal - listTotal, currency)}`}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createManual.isPending || room.beds_available <= 0}>
              {createManual.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Adding…
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Add member
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
