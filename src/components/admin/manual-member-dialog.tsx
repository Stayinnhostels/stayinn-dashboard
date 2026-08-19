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

function parseLocalDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function daysInMonth(iso: string) {
  const d = parseLocalDate(iso);
  if (!d) return 0;
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** Inclusive days from move-in through month end. */
function daysRemainingInMonth(iso: string) {
  const d = parseLocalDate(iso);
  if (!d) return 0;
  const dim = daysInMonth(iso);
  return Math.max(0, dim - d.getDate() + 1);
}

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

function monthShortLabel(iso: string) {
  const d = parseLocalDate(iso);
  if (!d) return "arrival month";
  return d.toLocaleString("en", { month: "short" });
}

export function ManualMemberDialog({ room, open, onOpenChange }: Props) {
  const createManual = useCreateManualBookingMutation();

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [channel, setChannel] = useState("Walk-in");
  const [stayUnit, setStayUnit] = useState<"month" | "night">("month");
  const [seats, setSeats] = useState("1");
  const [months, setMonths] = useState("1");
  const [monthsToPay, setMonthsToPay] = useState("1");
  const [firstMonthBilling, setFirstMonthBilling] = useState<"full" | "prorate">("full");
  const [useCustomFirstMonth, setUseCustomFirstMonth] = useState(false);
  const [firstMonthAmountInput, setFirstMonthAmountInput] = useState("");
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
  /** List price for one month (all seats). Months field is stay length only. */
  const listMonthlyRent =
    Number.isFinite(seatsNum) && seatsNum >= 1 ? monthlyUnitPrice * seatsNum : 0;
  const listTotal = isNightStay
    ? Number.isFinite(seatsNum) && Number.isFinite(nightsNum) && Number.isFinite(nightlyRateNum)
      ? nightlyRateNum * seatsNum * nightsNum
      : 0
    : Number.isFinite(monthsNum) && monthsNum >= 1
      ? listMonthlyRent * monthsNum
      : 0;

  useEffect(() => {
    if (!open) return;
    if (!moveIn) setMoveIn(todayIsoDate());
  }, [open, moveIn]);

  useEffect(() => {
    if (useCustomPrice) return;
    if (isNightStay) {
      setTotalInput(listTotal > 0 ? String(listTotal) : "");
    } else {
      setTotalInput(listMonthlyRent > 0 ? String(listMonthlyRent) : "");
    }
  }, [listMonthlyRent, listTotal, useCustomPrice, isNightStay]);

  const parsedTotal = Number(totalInput);
  const parsedSecurity = Number(securityInput);
  const monthsToPayNum = Number.parseInt(monthsToPay, 10);
  const listSecurity =
    !isNightStay && Number.isFinite(seatsNum) ? securityDepositForSeats(seatsNum, currency) : 0;
  /** Negotiated input for monthly stays = rent for ONE month (all seats). */
  const monthlyRent =
    !isNightStay && useCustomPrice && Number.isFinite(parsedTotal) && parsedTotal >= 0
      ? parsedTotal
      : listMonthlyRent;

  const moveInDay = parseLocalDate(moveIn)?.getDate() ?? 1;
  const isMidMonthArrival = !isNightStay && moveInDay > 1;
  const remainingDays = !isNightStay ? daysRemainingInMonth(moveIn) : 0;
  const daysInArrivalMonth = !isNightStay ? daysInMonth(moveIn) : 0;
  const suggestedProrate =
    monthlyRent > 0 && daysInArrivalMonth > 0
      ? roundMoney((monthlyRent / daysInArrivalMonth) * remainingDays)
      : 0;
  const parsedFirstMonthOverride = Number(firstMonthAmountInput);
  const arrivalMonthCharge = isNightStay
    ? 0
    : firstMonthBilling === "prorate"
      ? useCustomFirstMonth && Number.isFinite(parsedFirstMonthOverride) && parsedFirstMonthOverride >= 0
        ? parsedFirstMonthOverride
        : suggestedProrate
      : monthlyRent;

  const chargeTotal = isNightStay
    ? useCustomPrice && Number.isFinite(parsedTotal)
      ? parsedTotal
      : listTotal
    : roundMoney(
        arrivalMonthCharge +
          monthlyRent * Math.max(0, (Number.isFinite(monthsNum) ? monthsNum : 0) - 1),
      );
  const securityCharge =
    useCustomSecurity && Number.isFinite(parsedSecurity) ? parsedSecurity : listSecurity;
  const rentPayNow = isNightStay
    ? chargeTotal
    : Number.isFinite(monthsToPayNum) && monthsToPayNum >= 1
      ? roundMoney(
          arrivalMonthCharge + monthlyRent * Math.max(0, monthsToPayNum - 1),
        )
      : 0;
  const payNowAmount = rentPayNow + (isNightStay ? 0 : securityCharge);
  const pricePerSeat =
    !isNightStay && Number.isFinite(seatsNum) && seatsNum > 0
      ? roundMoney(monthlyRent / seatsNum)
      : undefined;

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

  // Mid-month arrivals default to days billing; day-1 stays force full month.
  useEffect(() => {
    if (isNightStay) return;
    if (!isMidMonthArrival) {
      setFirstMonthBilling("full");
      setUseCustomFirstMonth(false);
    }
  }, [isMidMonthArrival, isNightStay, moveIn]);

  useEffect(() => {
    if (!useCustomFirstMonth && suggestedProrate > 0) {
      setFirstMonthAmountInput(String(suggestedProrate));
    }
  }, [suggestedProrate, useCustomFirstMonth]);

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
        monthsToPayNum <= monthsNum &&
        (!useCustomFirstMonth ||
          firstMonthBilling !== "prorate" ||
          (Number.isFinite(parsedFirstMonthOverride) && parsedFirstMonthOverride >= 0))) &&
    moveIn.trim().length > 0 &&
    (!useCustomPrice || (Number.isFinite(parsedTotal) && parsedTotal >= 0)) &&
    (isNightStay ||
      !useCustomSecurity ||
      (Number.isFinite(parsedSecurity) && parsedSecurity >= 0));

  const resetForm = () => {
    setGuestName("");
    setGuestPhone("");
    setGuestEmail("");
    setChannel("Walk-in");
    setStayUnit("month");
    setSeats("1");
    setMonths("1");
    setMonthsToPay("1");
    setFirstMonthBilling("full");
    setUseCustomFirstMonth(false);
    setFirstMonthAmountInput("");
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
        source: channel.trim() || "walk_in",
        seats_booked: seatsNum,
        stay_unit: stayUnit,
        ...(isNightStay
          ? { nights: nightsNum, nightly_rate: nightlyRateNum }
          : {
              months: monthsNum,
              months_to_pay: monthsToPayNum,
              first_month_billing: isMidMonthArrival ? firstMonthBilling : "full",
              ...(firstMonthBilling === "prorate" && isMidMonthArrival
                ? { first_month_amount: arrivalMonthCharge }
                : {}),
            }),
        move_in: moveIn,
        notes: notes.trim() || undefined,
        currency,
        ...(isNightStay
          ? useCustomPrice && Number.isFinite(parsedTotal)
            ? { total_amount: parsedTotal }
            : {}
          : {
              // Monthly rent drives ledger; total_amount includes prorated first month when used.
              ...(useCustomPrice && Number.isFinite(monthlyRent)
                ? { price_per_seat: pricePerSeat }
                : {}),
              ...(useCustomPrice || firstMonthBilling === "prorate"
                ? { total_amount: chargeTotal, price_per_seat: pricePerSeat }
                : {}),
            }),
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
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 border-b border-border/60 px-6 py-4 text-left">
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add walk-in member
          </DialogTitle>
          <DialogDescription className="sr-only">Details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guest</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor="manual-name" required>Full name</Label>
                  <Input
                    id="manual-name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Guest name"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="manual-phone" required>Phone</Label>
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
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor="manual-channel">Channel</Label>
                  <Input
                    id="manual-channel"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    placeholder="Walk-in, Website, or company name"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stay</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label required>Stay type</Label>
                  <Select value={stayUnit} onValueChange={(v) => setStayUnit(v as "month" | "night")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly member</SelectItem>
                      <SelectItem value="night">Short visitor (nightly)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="manual-move-in" required>{isNightStay ? "Check-in" : "Move-in"}</Label>
                  <Input
                    id="manual-move-in"
                    type="date"
                    value={moveIn}
                    onChange={(e) => setMoveIn(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="manual-seats" required>Seats</Label>
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
                      <Label htmlFor="manual-nights" required>Nights</Label>
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
                    <div className="grid gap-1.5 sm:col-span-2">
                      <Label htmlFor="manual-nightly-rate" required>Rate / night</Label>
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
                      <Label htmlFor="manual-months" required>Stay length (months)</Label>
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
                    {isMidMonthArrival ? (
                      <div className="grid gap-1.5 sm:col-span-2">
                        <Label required>Arrival month ({monthShortLabel(moveIn)}) charge</Label>
                        <Select
                          value={firstMonthBilling}
                          onValueChange={(v) => setFirstMonthBilling(v as "full" | "prorate")}
                        >
                          <SelectTrigger id="manual-first-month-billing">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">
                              Full month — {formatMoney(monthlyRent, currency)}
                            </SelectItem>
                            <SelectItem value="prorate">
                              Days only — {remainingDays} day
                              {remainingDays === 1 ? "" : "s"} ≈ {formatMoney(suggestedProrate, currency)}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {firstMonthBilling === "prorate" ? (
                          <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
                            <input
                              type="checkbox"
                              className="mt-0.5 h-3.5 w-3.5 rounded border-border"
                              checked={useCustomFirstMonth}
                              onChange={(e) => {
                                setUseCustomFirstMonth(e.target.checked);
                                if (e.target.checked && suggestedProrate > 0) {
                                  setFirstMonthAmountInput(String(suggestedProrate));
                                }
                              }}
                            />
                            <span>Override days amount</span>
                          </label>
                        ) : null}
                        {firstMonthBilling === "prorate" && useCustomFirstMonth ? (
                          <div className="grid gap-1.5">
                            <Label htmlFor="manual-first-month-amount" required>Days amount</Label>
                            <Input
                              id="manual-first-month-amount"
                              type="number"
                              min={0}
                              step={1}
                              value={firstMonthAmountInput}
                              onChange={(e) => setFirstMonthAmountInput(e.target.value)}
                              required
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="grid gap-1.5 sm:col-span-2">
                      <Label htmlFor="manual-months-pay" required>Paying now (months of rent)</Label>
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
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor="manual-notes">Notes</Label>
                  <Textarea
                    id="manual-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Walk-in, paid cash…"
                    className="resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-border/70 bg-muted/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment</h3>
                <Select value={currency} onValueChange={(v) => setCurrency(v as "pkr" | "usd")}>
                  <SelectTrigger className="h-8 w-[7.5rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pkr">PKR (Rs)</SelectItem>
                    <SelectItem value="usd">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 text-sm">
                {!isNightStay && (
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-muted-foreground">Rent / month</span>
                    <span className="font-semibold tabular-nums">{formatMoney(monthlyRent, currency)}</span>
                  </div>
                )}
                {!isNightStay && isMidMonthArrival && (
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-muted-foreground">
                      {monthShortLabel(moveIn)}{" "}
                      {firstMonthBilling === "prorate"
                        ? `(${remainingDays} day${remainingDays === 1 ? "" : "s"})`
                        : "(full month)"}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatMoney(arrivalMonthCharge, currency)}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-muted-foreground">
                    {isNightStay
                      ? "Full stay"
                      : firstMonthBilling === "prorate"
                        ? `Full stay (${monthsNum || 0} mo, days first)`
                        : `Full stay (${monthsNum || 0} mo)`}
                  </span>
                  <span className="font-semibold tabular-nums">{formatMoney(chargeTotal, currency)}</span>
                </div>
                {!isNightStay && (
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-muted-foreground">
                      Security once at check-in ({formatMoney(securityPerSeat(currency), currency)} ×{" "}
                      {seatsNum})
                    </span>
                    <span className="font-semibold tabular-nums">{formatMoney(securityCharge, currency)}</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-3 border-t border-border/60 pt-2">
                  <span className="font-medium">Collect now</span>
                  <span className="text-base font-bold tabular-nums text-emerald-700">
                    {formatMoney(payNowAmount, currency)}
                  </span>
                </div>
                {!isNightStay && monthsToPayNum < monthsNum && (
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(chargeTotal - rentPayNow, currency)} rent due later
                  </p>
                )}
              </div>

              <div className="space-y-3 border-t border-border/60 pt-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={useCustomPrice}
                    onChange={(e) => {
                      setUseCustomPrice(e.target.checked);
                      if (e.target.checked) {
                        const seed = isNightStay ? listTotal : listMonthlyRent;
                        if (seed > 0) setTotalInput(String(seed));
                      }
                    }}
                  />
                  <span>
                    {isNightStay
                      ? "Use negotiated / manual price"
                      : "Use negotiated monthly rent"}
                  </span>
                </label>

                {useCustomPrice ? (
                  <div className="grid gap-1.5">
                    <Label htmlFor="manual-total" className="flex items-center gap-1.5" required>
                      <Banknote className="h-3.5 w-3.5" />
                      {isNightStay ? "Amount to charge" : "Rent per month"}
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
                    {!isNightStay && Number.isFinite(parsedTotal) && parsedTotal >= 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Full stay ≈ {formatMoney(chargeTotal, currency)}
                        {firstMonthBilling === "prorate"
                          ? ` (${monthShortLabel(moveIn)} days + ${Math.max(0, (monthsNum || 0) - 1)} full months)`
                          : ` (${monthsNum || 0} × monthly)`}
                        . Raise rent later from Monthly Rent → Apply forward.
                      </p>
                    ) : null}
                    {isNightStay &&
                    Number.isFinite(parsedTotal) &&
                    listTotal > 0 &&
                    parsedTotal !== listTotal ? (
                      <p className="text-xs text-muted-foreground">
                        {parsedTotal < listTotal
                          ? `Discount: ${formatMoney(listTotal - parsedTotal, currency)} (${(((listTotal - parsedTotal) / listTotal) * 100).toFixed(0)}% off list)`
                          : `Above list by ${formatMoney(parsedTotal - listTotal, currency)}`}
                      </p>
                    ) : null}
                    {!isNightStay &&
                    Number.isFinite(parsedTotal) &&
                    listMonthlyRent > 0 &&
                    parsedTotal !== listMonthlyRent ? (
                      <p className="text-xs text-muted-foreground">
                        {parsedTotal < listMonthlyRent
                          ? `Below list by ${formatMoney(listMonthlyRent - parsedTotal, currency)} / month`
                          : `Above list by ${formatMoney(parsedTotal - listMonthlyRent, currency)} / month`}
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
                        <Label htmlFor="manual-security" className="flex items-center gap-1.5" required>
                          <Banknote className="h-3.5 w-3.5" />
                          Security to collect
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
                        {Number.isFinite(parsedSecurity) &&
                        listSecurity > 0 &&
                        parsedSecurity !== listSecurity ? (
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
            </section>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t border-border/60 bg-background px-6 py-4 sm:gap-2">
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
