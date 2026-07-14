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
import { securityDepositForSeats, securityPerSeat } from "@/lib/security-deposit";

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
  const [guestCnic, setGuestCnic] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [channel, setChannel] = useState("Walk-in");
  const [stayUnit, setStayUnit] = useState<"month" | "night">("month");
  const [seats, setSeats] = useState("1");
  const [months, setMonths] = useState("1");
  const [monthsToPay, setMonthsToPay] = useState("1");
  const [nights, setNights] = useState("4");
  const [nightlyRate, setNightlyRate] = useState("1500");
  const [moveIn, setMoveIn] = useState(() => todayIsoDate());
  const [notes, setNotes] = useState("");
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [useCustomSecurity, setUseCustomSecurity] = useState(false);
  const [totalInput, setTotalInput] = useState("");
  const [securityInput, setSecurityInput] = useState("");
  const [currency, setCurrency] = useState<"pkr" | "usd">("pkr");

  const seatsNum = Number.parseInt(seats, 10);
  const monthsNum = Number.parseInt(months, 10);
  const nightsNum = Number.parseInt(nights, 10);
  const nightlyRateNum = Number.parseFloat(nightlyRate);
  const monthlyUnitPrice =
    currency === "usd"
      ? (room.price_per_night_usd ?? room.price_per_night)
      : (room.price_per_night_pkr ?? room.price_per_night);
  const isNightStay = stayUnit === "night";
  const listTotal = isNightStay
    ? Number.isFinite(seatsNum) && Number.isFinite(nightsNum) && Number.isFinite(nightlyRateNum)
      ? nightlyRateNum * seatsNum * nightsNum
      : 0
    : Number.isFinite(seatsNum) && Number.isFinite(monthsNum)
      ? monthlyUnitPrice * seatsNum * monthsNum
      : 0;

  useEffect(() => {
    if (!open) return;
    const today = todayIsoDate();
    if (moveIn < today) setMoveIn(today);
  }, [open, moveIn]);

  useEffect(() => {
    if (!useCustomPrice) {
      setTotalInput(listTotal > 0 ? String(listTotal) : "");
    }
  }, [listTotal, useCustomPrice]);

  const parsedTotal = Number(totalInput);
  const parsedSecurity = Number(securityInput);
  const monthsToPayNum = Number.parseInt(monthsToPay, 10);
  const listSecurity =
    !isNightStay && Number.isFinite(seatsNum) ? securityDepositForSeats(seatsNum, currency) : 0;
  const chargeTotal = useCustomPrice && Number.isFinite(parsedTotal) ? parsedTotal : listTotal;
  const securityCharge =
    useCustomSecurity && Number.isFinite(parsedSecurity) ? parsedSecurity : listSecurity;
  const rentPayNow = isNightStay
    ? chargeTotal
    : monthsNum > 0 && Number.isFinite(monthsToPayNum)
      ? Math.round((chargeTotal / monthsNum) * monthsToPayNum * 100) / 100
      : 0;
  const payNowAmount = rentPayNow + (isNightStay ? 0 : securityCharge);

  useEffect(() => {
    if (!useCustomSecurity && listSecurity > 0) {
      setSecurityInput(String(listSecurity));
    }
  }, [listSecurity, useCustomSecurity]);

  useEffect(() => {
    if (!isNightStay) {
      setMonthsToPay((prev) => {
        const n = Number.parseInt(prev, 10);
        if (!Number.isFinite(monthsNum) || monthsNum < 1) return "1";
        return String(Math.min(Number.isFinite(n) ? n : 1, monthsNum));
      });
    }
  }, [monthsNum, isNightStay]);

  const canSubmit =
    guestName.trim().length > 0 &&
    guestPhone.trim().length >= 5 &&
    Number.isFinite(seatsNum) &&
    seatsNum >= 1 &&
    seatsNum <= room.beds_available &&
    (isNightStay
      ? Number.isFinite(nightsNum) && nightsNum >= 1 && Number.isFinite(nightlyRateNum) && nightlyRateNum >= 0
      : Number.isFinite(monthsNum) &&
        monthsNum >= 1 &&
        Number.isFinite(monthsToPayNum) &&
        monthsToPayNum >= 1 &&
        monthsToPayNum <= monthsNum) &&
    moveIn.trim().length > 0 &&
    moveIn >= todayIsoDate() &&
    (!useCustomPrice || (Number.isFinite(parsedTotal) && parsedTotal >= 0)) &&
    (isNightStay ||
      !useCustomSecurity ||
      (Number.isFinite(parsedSecurity) && parsedSecurity >= 0));

  const resetForm = () => {
    setGuestName("");
    setGuestPhone("");
    setGuestEmail("");
    setGuestCnic("");
    setGuardianContact("");
    setPermanentAddress("");
    setChannel("Walk-in");
    setStayUnit("month");
    setSeats("1");
    setMonths("1");
    setMonthsToPay("1");
    setNights("4");
    setNightlyRate("1500");
    setMoveIn(todayIsoDate());
    setNotes("");
    setUseCustomPrice(false);
    setUseCustomSecurity(false);
    setTotalInput("");
    setSecurityInput("");
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
        guest_cnic: guestCnic.trim() || undefined,
        guest_guardian_contact: guardianContact.trim() || undefined,
        guest_permanent_address: permanentAddress.trim() || undefined,
        source: channel.trim() || "walk_in",
        seats_booked: seatsNum,
        stay_unit: stayUnit,
        ...(isNightStay
          ? { nights: nightsNum, nightly_rate: nightlyRateNum }
          : { months: monthsNum, months_to_pay: monthsToPayNum }),
        move_in: moveIn,
        notes: notes.trim() || undefined,
        currency,
        ...(useCustomPrice && Number.isFinite(parsedTotal)
          ? { total_amount: parsedTotal }
          : {}),
        ...(!isNightStay && Number.isFinite(securityCharge) ? { security_amount: securityCharge } : {}),
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
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
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
              <Label htmlFor="manual-email">Email</Label>
              <Input
                id="manual-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="guest@email.com"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="manual-channel">Channel</Label>
              <Input
                id="manual-channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="Walk-in, Website, or company name"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="manual-cnic">CNIC number</Label>
              <Input
                id="manual-cnic"
                value={guestCnic}
                onChange={(e) => setGuestCnic(e.target.value)}
                placeholder="35201-1234567-1"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="manual-guardian">Guardian contact number</Label>
            <Input
              id="manual-guardian"
              value={guardianContact}
              onChange={(e) => setGuardianContact(e.target.value)}
              placeholder="+92 300 1234567"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="manual-address">Permanent address</Label>
            <Textarea
              id="manual-address"
              rows={2}
              value={permanentAddress}
              onChange={(e) => setPermanentAddress(e.target.value)}
              placeholder="House / street, city"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Stay type *</Label>
            <Select value={stayUnit} onValueChange={(v) => setStayUnit(v as "month" | "night")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Monthly member</SelectItem>
                <SelectItem value="night">Short visitor (nightly)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {isNightStay
                ? "Books the seat only for the number of nights — e.g. 4 nights at Rs 1,500/night."
                : "Monthly residents billed per seat per month."}
            </p>
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
            {isNightStay ? (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="manual-nights">Nights *</Label>
                  <Input
                    id="manual-nights"
                    type="number"
                    min={1}
                    max={60}
                    value={nights}
                    onChange={(e) => setNights(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="manual-nightly-rate">Rate / night *</Label>
                  <Input
                    id="manual-nightly-rate"
                    type="number"
                    min={0}
                    step={1}
                    value={nightlyRate}
                    onChange={(e) => setNightlyRate(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="manual-months">Stay (months) *</Label>
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
                  <Label htmlFor="manual-months-pay">Paying now (months) *</Label>
                  <Input
                    id="manual-months-pay"
                    type="number"
                    min={1}
                    max={monthsNum || 24}
                    value={monthsToPay}
                    onChange={(e) => setMonthsToPay(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="manual-move-in">{isNightStay ? "Check-in *" : "Move-in *"}</Label>
              <Input
                id="manual-move-in"
                type="date"
                min={todayIsoDate()}
                value={moveIn}
                onChange={(e) => setMoveIn(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Today or a future date only.</p>
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
              <span className="text-muted-foreground">Full stay: </span>
              <span className="font-bold">{formatMoney(chargeTotal, currency)}</span>
              <span className="text-muted-foreground">
                {" "}
                {isNightStay
                  ? `(${formatMoney(nightlyRateNum, currency)} × seats × nights)`
                  : `(${formatMoney(monthlyUnitPrice, currency)} × seats × months)`}
              </span>
            </div>
            {!isNightStay && (
              <div>
                <span className="text-muted-foreground">Security deposit: </span>
                <span className="font-bold">{formatMoney(securityCharge, currency)}</span>
                <span className="text-muted-foreground">
                  {" "}
                  ({formatMoney(securityPerSeat(currency), currency)} × {seatsNum} seat · refundable)
                </span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Collect now: </span>
              <span className="font-bold text-emerald-700">{formatMoney(payNowAmount, currency)}</span>
              {!isNightStay && monthsToPayNum < monthsNum && (
                <span className="text-muted-foreground">
                  {" "}
                  · {formatMoney(chargeTotal - rentPayNow, currency)} rent due later
                </span>
              )}
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

            {!isNightStay && (
              <>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={useCustomSecurity}
                    onChange={(e) => {
                      setUseCustomSecurity(e.target.checked);
                      if (e.target.checked && listSecurity > 0) {
                        setSecurityInput(String(listSecurity));
                      }
                    }}
                  />
                  <span>Use negotiated security deposit</span>
                </label>

                {useCustomSecurity ? (
                  <div className="grid gap-1.5">
                    <Label htmlFor="manual-security" className="flex items-center gap-1.5">
                      <Banknote className="h-3.5 w-3.5" />
                      Security to collect *
                    </Label>
                    <Input
                      id="manual-security"
                      type="number"
                      min={0}
                      step={1}
                      value={securityInput}
                      onChange={(e) => setSecurityInput(e.target.value)}
                      required
                    />
                    {Number.isFinite(parsedSecurity) && listSecurity > 0 && parsedSecurity !== listSecurity ? (
                      <p className="text-xs text-muted-foreground">
                        {parsedSecurity < listSecurity
                          ? `Below standard by ${formatMoney(listSecurity - parsedSecurity, currency)}`
                          : `Above standard by ${formatMoney(parsedSecurity - listSecurity, currency)}`}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
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
