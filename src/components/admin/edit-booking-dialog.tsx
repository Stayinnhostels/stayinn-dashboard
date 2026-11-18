import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, CalendarDays, Loader2, Minus, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, GlassCheckbox, Tag } from "@/components/glass";
import { Banner, FieldLabel, InputShell, Section, SegmentedField, StepBtn, TextField } from "@/components/admin/walk-in/walk-in-modal";
import { cn } from "@/lib/utils";
import { useUpdateBookingDetailsMutation } from "@/queries/bookings";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import type { Booking } from "@/types/domain/booking.types";
import type { ResidentType } from "@/types/domain/resident.types";

type Props = {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type StayUnit = "month" | "night";

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
  const isCancelled = booking.status === "cancelled";
  const cur = normalizeMoneyCurrency(booking.currency);

  const [guestName, setGuestName] = useState(booking.guest_name);
  const [guestEmail, setGuestEmail] = useState(booking.guest_email);
  const [guestPhone, setGuestPhone] = useState(booking.guest_phone);
  const [source, setSource] = useState(booking.source ?? "");
  const [residentType, setResidentType] = useState<ResidentType>(booking.resident_type || "employee");
  const [company, setCompany] = useState(booking.guest_company ?? "");
  const [institution, setInstitution] = useState(booking.guest_institution ?? "");
  const [notes, setNotes] = useState(booking.notes ?? "");
  const [stayUnit, setStayUnit] = useState<StayUnit>(
    booking.stay_unit === "night" ? "night" : "month",
  );
  const [moveIn, setMoveIn] = useState(booking.move_in?.slice(0, 10) ?? "");
  const [checkOut, setCheckOut] = useState(booking.check_out?.slice(0, 10) ?? "");
  const [months, setMonths] = useState(String(booking.months ?? 1));
  const [nights, setNights] = useState(String(booking.nights ?? 1));
  const [seats, setSeats] = useState(String(booking.seats_booked ?? 1));
  const [pricePerSeat, setPricePerSeat] = useState(String(booking.price_per_seat ?? 0));
  const [totalAmount, setTotalAmount] = useState(String(booking.total_amount ?? 0));
  const [autoTotal, setAutoTotal] = useState(true);
  const [overrideCheckOut, setOverrideCheckOut] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const isNightStay = stayUnit === "night";
  const originalStayUnit: StayUnit = booking.stay_unit === "night" ? "night" : "month";

  useEffect(() => {
    if (!open) return;
    setGuestName(booking.guest_name);
    setGuestEmail(booking.guest_email);
    setGuestPhone(booking.guest_phone);
    setSource(booking.source ?? "");
    setResidentType(booking.resident_type || "employee");
    setCompany(booking.guest_company ?? "");
    setInstitution(booking.guest_institution ?? "");
    setNotes(booking.notes ?? "");
    setStayUnit(booking.stay_unit === "night" ? "night" : "month");
    setMoveIn(booking.move_in?.slice(0, 10) ?? "");
    setCheckOut(booking.check_out?.slice(0, 10) ?? "");
    setMonths(String(Math.max(1, booking.months ?? 1)));
    setNights(String(Math.max(1, booking.nights ?? 1)));
    setSeats(String(booking.seats_booked ?? 1));
    setPricePerSeat(String(booking.price_per_seat ?? 0));
    setTotalAmount(String(booking.total_amount ?? 0));
    setAutoTotal(true);
    setOverrideCheckOut(false);
    setShowErrors(false);
  }, [open, booking]);

  function handleStayUnitChange(next: StayUnit) {
    if (next === stayUnit) return;
    setStayUnit(next);
    setOverrideCheckOut(false);
    setAutoTotal(true);
    if (next === "night") {
      // Sensible short-stay defaults when converting from monthly
      if (originalStayUnit === "month") {
        setNights("1");
        if (!Number.isFinite(Number.parseFloat(pricePerSeat)) || Number(pricePerSeat) <= 0) {
          setPricePerSeat("1500");
        }
      } else if (!Number.isFinite(Number.parseInt(nights, 10)) || Number(nights) < 1) {
        setNights("1");
      }
    } else {
      if (originalStayUnit === "night") {
        setMonths("1");
      } else if (!Number.isFinite(Number.parseInt(months, 10)) || Number(months) < 1) {
        setMonths("1");
      }
    }
  }

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
    Number(totalAmount) >= 0 &&
    (residentType !== "employee" || company.trim().length > 0) &&
    (residentType !== "student" || institution.trim().length > 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) {
      setShowErrors(true);
      requestAnimationFrame(() => bodyRef.current?.querySelector('[aria-invalid="true"]')?.scrollIntoView({ block: "center", behavior: "smooth" }));
      return;
    }

    const input: Parameters<typeof updateDetails.mutate>[0]["input"] = {
      guest_name: guestName.trim(),
      guest_email: guestEmail.trim(),
      guest_phone: guestPhone.trim(),
      source: source.trim() || undefined,
      resident_type: residentType,
      guest_company: company.trim(),
      guest_institution: institution.trim(),
      notes: notes.trim(),
    };

    if (!isCancelled) {
      input.move_in = moveIn;
      input.seats_booked = seatsNum;
      input.price_per_seat = priceNum;
      input.total_amount = Number(totalAmount);
      input.recalculate_total = false;
      input.stay_unit = stayUnit;
      if (isNightStay) {
        input.nights = nightsNum;
      } else {
        input.months = monthsNum;
        input.clear_nights = true;
      }
      if (overrideCheckOut && checkOut) {
        input.check_out = checkOut;
      }
    }

    updateDetails.mutate(
      { id: booking.id, input },
      {
        onSuccess: () => {
          toast.success(
            stayUnit !== originalStayUnit
              ? `Booking switched to ${stayUnit === "night" ? "nightly" : "monthly"} stay`
              : "Booking updated",
          );
          onOpenChange(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );
  }

  const errors: Record<string, string> = {};
  if (!guestName.trim()) errors.name = "Guest name is required";
  if (!guestEmail.trim().includes("@")) errors.email = "Enter a valid email";
  if (guestPhone.trim().length < 5) errors.phone = "Enter a phone number";
  if (residentType === "employee" && !company.trim()) errors.company = "Company name is required";
  if (residentType === "student" && !institution.trim()) errors.institution = "Institution name is required";
  if (!isCancelled) {
    if (moveIn.length !== 10) errors.moveIn = "Move-in is required";
    if (checkOut.length !== 10) errors.checkOut = "Check-out is required";
    if (!(Number.isFinite(priceNum) && priceNum >= 0)) errors.price = "Enter a price";
    if (!(Number.isFinite(Number(totalAmount)) && Number(totalAmount) >= 0)) errors.total = "Enter a total";
  }
  const errorCount = Object.keys(errors).length;
  const err = (k: string) => (showErrors ? errors[k] : undefined);
  const durNum = isNightStay ? nightsNum : monthsNum;
  const setDur = (n: number) => (isNightStay ? setNights(String(n)) : setMonths(String(n)));
  const roomLine = [booking.booking_code, booking.room_number != null ? `Room ${booking.room_number}` : booking.room_title, booking.seat_label].filter(Boolean).join(" · ");
  const pretty = (iso: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "—";
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="glass-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[94svh] flex-col overflow-hidden rounded-t-[28px] font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:max-h-[calc(100svh-48px)] md:w-[min(760px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px]"
        >
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-glass-divider px-6 py-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-tint text-brand-text [&_svg]:size-[18px]"><Pencil aria-hidden /></span>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <Dialog.Title className="text-hero text-ink">Edit booking</Dialog.Title>
                  {isCancelled ? <Tag tone="neutral" showDot>Cancelled · guest details only</Tag> : null}
                </div>
                <p className="truncate text-label text-ink-2">{[booking.guest_name, roomLine].filter(Boolean).join(" · ")}</p>
              </div>
              <Dialog.Close aria-label="Close" className="glass-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] text-ink outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border"><X className="size-[18px]" aria-hidden /></Dialog.Close>
            </div>

            <div ref={bodyRef} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-6 pt-4 pb-6">
              {!isCancelled ? (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[18px] border border-glass-divider bg-glass-inset px-[18px] py-3.5">
                  {[
                    [isNightStay ? "Rate / night" : "Rent / month", Number.isFinite(priceNum) ? formatMoney(priceNum * (Number.isFinite(seatsNum) ? seatsNum : 1), cur) : "—"],
                    ["Stay", `${Number.isFinite(durNum) ? durNum : "—"} ${isNightStay ? "night(s)" : "month(s)"} · ${Number.isFinite(seatsNum) ? seatsNum : "—"} seat(s)`],
                    ["Check-out", pretty(checkOut)],
                  ].map(([l, v]) => (
                    <div key={l} className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-label text-ink-3">{l}</span>
                      <span className="truncate text-body font-semibold text-ink">{v}</span>
                    </div>
                  ))}
                  <span className="flex-1" />
                  <div className="flex flex-col items-end">
                    <span className="text-label font-medium text-ink-2">Rent total</span>
                    <span className="text-kpi text-ink">{Number.isFinite(Number(totalAmount)) ? formatMoney(Number(totalAmount), cur) : "—"}</span>
                  </div>
                </div>
              ) : null}

              {showErrors && errorCount ? (
                <Banner tone="danger" icon={<AlertTriangle />}>Fix {errorCount} field{errorCount === 1 ? "" : "s"} before saving.</Banner>
              ) : null}

              <Section num={1} title="Guest">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2"><TextField label="Guest name" required value={guestName} onChange={setGuestName} error={err("name")} /></div>
                  <TextField label="Email" required value={guestEmail} onChange={setGuestEmail} inputMode="email" placeholder="guest@email.com" error={err("email")} />
                  <TextField label="Phone" required value={guestPhone} onChange={setGuestPhone} inputMode="tel" placeholder="+92 300 1234567" error={err("phone")} />
                </div>
              </Section>

              <Section num={2} title="Occupation & channel">
                <SegmentedField label="Type" value={residentType || "employee"} onChange={(v) => setResidentType(v as ResidentType)} options={[["student", "Student"], ["employee", "Employee"], ["other", "Other"]]} />
                {residentType === "employee" ? <TextField label="Company name" required value={company} onChange={setCompany} placeholder="Employer or company" error={err("company")} /> : null}
                {residentType === "student" ? <TextField label="Institution name" required value={institution} onChange={setInstitution} placeholder="College, university, or institute" error={err("institution")} /> : null}
                <TextField label="Source / channel" value={source} onChange={setSource} placeholder="website, walk_in…" />
              </Section>

              {!isCancelled ? (
                <Section num={3} title="Stay & billing">
                  <div className="flex flex-col gap-1.5">
                    <SegmentedField label="Billing type" value={stayUnit} onChange={(v) => handleStayUnitChange(v as StayUnit)} options={[["month", "Monthly rent"], ["night", "Nightly / short visitor"]]} />
                    {stayUnit !== originalStayUnit ? (
                      <p className="text-label text-warning">Switching will recalculate check-out, rent total, and the payment ledger for this stay.</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-start gap-3">
                    <label className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                      <FieldLabel required>Move-in</FieldLabel>
                      <InputShell icon={<CalendarDays />} invalid={Boolean(err("moveIn"))}>
                        <input type="date" value={moveIn} onChange={(e) => setMoveIn(e.target.value)} onClick={(e) => e.currentTarget.showPicker?.()} aria-invalid={err("moveIn") ? true : undefined} className="w-full cursor-pointer bg-transparent text-body text-ink outline-none [&::-webkit-calendar-picker-indicator]:hidden" />
                      </InputShell>
                      {err("moveIn") ? <span className="text-label font-medium text-danger">{err("moveIn")}</span> : null}
                    </label>
                    <Stepper label={isNightStay ? "Nights" : "Months"} value={Number.isFinite(durNum) ? durNum : 1} min={1} max={isNightStay ? 60 : 24} onChange={setDur} />
                    <Stepper label="Seats" value={Number.isFinite(seatsNum) ? seatsNum : 1} min={1} max={20} onChange={(n) => setSeats(String(n))} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel required={overrideCheckOut}>{overrideCheckOut ? "Check-out" : "Check-out (auto)"}</FieldLabel>
                    <InputShell icon={<CalendarDays />} muted={!overrideCheckOut} invalid={Boolean(err("checkOut"))}>
                      <input type="date" value={checkOut} disabled={!overrideCheckOut} onChange={(e) => setCheckOut(e.target.value)} onClick={(e) => overrideCheckOut && e.currentTarget.showPicker?.()} className="w-full cursor-pointer bg-transparent text-body text-ink outline-none disabled:cursor-default disabled:text-ink-2 [&::-webkit-calendar-picker-indicator]:hidden" />
                    </InputShell>
                    <label className="flex cursor-pointer items-center gap-2 text-label text-ink-2">
                      <GlassCheckbox checked={overrideCheckOut} onCheckedChange={setOverrideCheckOut} aria-label="Set check-out manually" /> Set check-out manually
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <TextField label={isNightStay ? "Price per seat / night" : "Price per seat / month"} value={pricePerSeat} onChange={(v) => setPricePerSeat(v.replace(/[^\d.]/g, ""))} inputMode="decimal" error={err("price")} />
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel>Rent total</FieldLabel>
                      <InputShell muted={autoTotal} invalid={Boolean(err("total"))}>
                        <input value={totalAmount} disabled={autoTotal} inputMode="decimal" onChange={(e) => setTotalAmount(e.target.value.replace(/[^\d.]/g, ""))} aria-invalid={err("total") ? true : undefined} className="w-full bg-transparent text-body text-ink outline-none disabled:text-ink-2" />
                      </InputShell>
                      <label className="flex cursor-pointer items-center gap-2 text-label text-ink-2">
                        <GlassCheckbox checked={autoTotal} onCheckedChange={setAutoTotal} aria-label="Auto-calculate total" />
                        Auto-calculate total{previewTotal != null ? ` (${formatMoney(previewTotal, cur)})` : ""}
                      </label>
                    </div>
                  </div>
                </Section>
              ) : null}

              <Section num={isCancelled ? 3 : 4} title="Notes">
                <div className="glass-2 rounded-[14px] px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-brand-border">
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Internal notes…" className="w-full resize-none bg-transparent text-body text-ink outline-none placeholder:text-ink-3" />
                </div>
              </Section>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 border-t border-glass-divider px-6 py-4">
              <p className="min-w-0 flex-1 text-label text-ink-2">
                {showErrors && errorCount ? `${errorCount} field${errorCount === 1 ? "" : "s"} need attention` : "Changes apply to this booking only."}
              </p>
              <Dialog.Close asChild><GlassButton type="button" variant="ghost">Cancel</GlassButton></Dialog.Close>
              <GlassButton type="submit" disabled={updateDetails.isPending} className={cn(!canSave && "opacity-60")}>
                {updateDetails.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Pencil aria-hidden />} {updateDetails.isPending ? "Saving…" : "Save changes"}
              </GlassButton>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel required>{label}</FieldLabel>
      <div className="glass-2 flex h-11 w-fit items-center gap-1 rounded-[14px] px-1">
        <StepBtn label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}><Minus /></StepBtn>
        <span className="w-10 text-center text-body font-semibold text-ink">{value}</span>
        <StepBtn label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}><Plus /></StepBtn>
      </div>
    </div>
  );
}
