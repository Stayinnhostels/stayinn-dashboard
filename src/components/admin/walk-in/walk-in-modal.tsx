import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  BedSingle,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Info,
  Landmark,
  Loader2,
  LogIn,
  Minus,
  Plus,
  Search,
  Smartphone,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import { GlassButton, Tag } from "@/components/glass";
import { RoomThumbnail } from "@/components/admin/room-thumbnail";
import { ApiError } from "@/api/apiFetch";
import { getReturningGuestApi } from "@/api/rooms/roomBeds.api";
import { ocrCnicApi } from "@/api/residents";
import { useCreateManualBookingMutation } from "@/queries/bookings";
import { useRoomAvailabilityQuery, useRoomBedsQuery } from "@/queries/rooms/useRoomBeds";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { useAuthStore } from "@/stores/auth/auth.store";
import { compressImageFile } from "@/lib/compress-image";
import { cn } from "@/lib/utils";
import { securityDepositForSeats } from "@/lib/security-deposit";
import { showWalkInSuccessToast } from "./walk-in-toast";
import type { Room } from "@/types/domain/room.types";
import type { Bed, BedTakenDetails, RoomAvailability } from "@/types/domain/room-beds.types";

/**
 * Figma 05 · Walk-in booking (05.02 dorm step 1, 05.04 private filled, 05.06 errors,
 * 05.08 ID pending, 05.09 bed conflict, 05.11 global entry with room picker).
 * Creates the booking through POST /bookings/manual — "Check in now" = checked_in,
 * "Save as reservation" = confirmed. Bed conflicts come back as 409 BED_TAKEN.
 */

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Start on this room (room page). Omit for the global "New booking" entry (room picker). */
  room?: Room | null;
  /** Dorm: beds to pre-select (from a bed tile's Assign). */
  presetBeds?: number[];
  /** After success, go to the room page (global entry). */
  navigateToRoom?: boolean;
};

type IdType = "cnic" | "b_form" | "passport";
type Method = "cash" | "card" | "bank_transfer" | "jazzcash" | "easypaisa";
type Currency = "pkr" | "usd";

const METHODS: { key: Method; label: string; icon: ReactNode }[] = [
  { key: "cash", label: "Cash", icon: <Wallet /> },
  { key: "card", label: "Card", icon: <CreditCard /> },
  { key: "bank_transfer", label: "Bank transfer", icon: <Landmark /> },
  { key: "jazzcash", label: "JazzCash", icon: <Smartphone /> },
  { key: "easypaisa", label: "Easypaisa", icon: <Smartphone /> },
];

const DURATIONS: { key: string; label: string; unit: "month" | "night"; n: number }[] = [
  ...[1, 2, 3, 4, 5, 6, 9, 12].map((n) => ({
    key: `m${n}`,
    label: n === 1 ? "1 month (30 nights)" : `${n} months`,
    unit: "month" as const,
    n,
  })),
  ...[1, 2, 3, 4, 5, 7, 10, 14, 21].map((n) => ({
    key: `n${n}`,
    label: `${n} night${n === 1 ? "" : "s"}`,
    unit: "night" as const,
    n,
  })),
];

const pad = (n: number) => String(n).padStart(2, "0");
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const parseKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};
const fmtShort = (k: string) => {
  const d = parseKey(k);
  return `${d.toLocaleDateString("en-GB", { weekday: "short" })} ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })}`;
};
const fmtLong = (k: string) => {
  const d = parseKey(k);
  return `${d.toLocaleDateString("en-GB", { weekday: "short" })}, ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })} ${d.getFullYear()}`;
};
function addToKey(k: string, unit: "month" | "night", n: number) {
  const d = parseKey(k);
  if (unit === "month") d.setMonth(d.getMonth() + n);
  else d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function nowTime() {
  const d = new Date();
  const m = Math.ceil(d.getMinutes() / 15) * 15;
  if (m === 60) d.setHours(d.getHours() + 1, 0);
  else d.setMinutes(m);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const laterTime = (a: string, b: string) => (a > b ? a : b);
function plus30(t: string) {
  const [h, m] = t.split(":").map(Number);
  const total = h * 60 + m + 30;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}
const digits = (s: string) => s.replace(/\D/g, "");
const money = (n: number, c: Currency) =>
  c === "usd"
    ? `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
    : `PKR ${Math.round(n).toLocaleString("en-US")}`;
const shortName = (n: string) => {
  const p = n.trim().split(/\s+/);
  return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0];
};

function phoneError(v: string) {
  const d = digits(v);
  if (!d) return "Phone is required";
  const ok = d.startsWith("92") ? d.length === 12 : d.startsWith("0") ? d.length === 11 : d.length >= 10 && d.length <= 15;
  return ok ? null : "Enter a 10-digit mobile number, e.g. +92 300 1234567";
}

export function WalkInModal({ open, onOpenChange, room: initialRoom = null, presetBeds, navigateToRoom }: Props) {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const { hostelId } = useHostelScope();
  const create = useCreateManualBookingMutation();
  const bodyRef = useRef<HTMLDivElement>(null);

  const [room, setRoom] = useState<Room | null>(initialRoom);
  const [picking, setPicking] = useState(!initialRoom);
  const [roomSearch, setRoomSearch] = useState("");
  const [beds, setBeds] = useState<number[]>(presetBeds ?? []);
  const [party, setParty] = useState(1);
  const [checkInDate, setCheckInDate] = useState(todayKey());
  const [checkInTime, setCheckInTime] = useState(nowTime());
  const [duration, setDuration] = useState("m1");
  const [currency, setCurrency] = useState<Currency>("pkr");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [idType, setIdType] = useState<IdType>("cnic");
  const [idNumber, setIdNumber] = useState("");
  const [emName, setEmName] = useState("");
  const [emPhone, setEmPhone] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [received, setReceived] = useState("");
  const [method, setMethod] = useState<Method>("cash");
  const [notes, setNotes] = useState("");
  const [returning, setReturning] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [conflict, setConflict] = useState<BedTakenDetails | null>(null);
  // Same options as Bookings → Add walk-in member.
  const [father, setFather] = useState("");
  const [address, setAddress] = useState("");
  const [resType, setResType] = useState<"student" | "employee" | "other">("employee");
  const [org, setOrg] = useState("");
  const [billing, setBilling] = useState<"full" | "prorate">("full");
  /** Prorated arrival-month charge typed by the admin (empty = use the worked-out amount). */
  const [firstInput, setFirstInput] = useState("");
  const [payNow, setPayNow] = useState(1);
  const [negRent, setNegRent] = useState(false);
  const [rentInput, setRentInput] = useState("");
  const [negSec, setNegSec] = useState(false);
  const [secInput, setSecInput] = useState("");
  const [retOn, setRetOn] = useState(false);
  const [retInput, setRetInput] = useState("");

  // Reset whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    setRoom(initialRoom);
    setPicking(!initialRoom);
    setBeds(presetBeds ?? []);
    setParty(1);
    setCheckInDate(todayKey());
    setCheckInTime(nowTime());
    setDuration("m1");
    setName("");
    setPhone("");
    setEmail("");
    setGender("");
    setIdType("cnic");
    setIdNumber("");
    setEmName("");
    setEmPhone("");
    setFront("");
    setBack("");
    setReceived("");
    setMethod("cash");
    setNotes("");
    setReturning(null);
    setShowErrors(false);
    setConflict(null);
    setFather(""); setAddress(""); setResType("employee"); setOrg("");
    setBilling("full"); setFirstInput(""); setPayNow(1);
    setNegRent(false); setRentInput(""); setNegSec(false); setSecInput(""); setRetOn(false); setRetInput("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Read the CNIC once the photos are in (same as Bookings → Add walk-in member): fills empty fields only.
  const [ocrBusy, setOcrBusy] = useState(false);
  useEffect(() => {
    if (!open || !token || idType !== "cnic" || !front) return;
    let cancelled = false;
    setOcrBusy(true);
    ocrCnicApi(token, { front, back: back || undefined })
      .then((f) => {
        if (cancelled) return;
        if (f.name) setName((v) => v || f.name!);
        if (f.cnic) setIdNumber((v) => v || f.cnic!);
        if (f.father_name) setFather((v) => v || f.father_name!);
        if (f.gender) setGender((v) => v || f.gender!);
        if (f.address) setAddress((v) => v || f.address!);
      })
      .catch(() => {})
      .finally(() => !cancelled && setOcrBusy(false));
    return () => {
      cancelled = true;
    };
  }, [open, token, idType, front, back]);

  const bedsQuery = useRoomBedsQuery(room?.id ?? "", { enabled: open && Boolean(room) });
  const bedData = bedsQuery.data;
  const isDorm = (bedData?.kind ?? (room && /dorm/i.test(`${room.category} ${room.title}`) ? "dorm" : "private")) === "dorm";
  const checkOutTime = bedData?.check_out_time ?? "11:00";

  // A bed that frees later today pushes the check-in time (Figma 05.02 banner).
  const freesAt = useMemo(() => {
    if (!bedData || checkInDate !== todayKey()) return null;
    const leaving = beds
      .map((n) => bedData.beds.find((b) => b.number === n))
      .filter((b): b is Bed => Boolean(b && b.status === "checking_out" && b.free_from));
    return leaving.length ? leaving.map((b) => b.free_from!).sort().reverse()[0] : null;
  }, [bedData, beds, checkInDate]);
  useEffect(() => {
    if (freesAt) setCheckInTime((t) => laterTime(t, plus30(freesAt)));
  }, [freesAt]);

  const dur = DURATIONS.find((d) => d.key === duration) ?? DURATIONS[0];
  const seats = isDorm ? Math.max(beds.length, 0) : party;
  const usdRate = Number(room?.price_per_night_usd ?? room?.price_per_night ?? 0);
  const pkrRate = Number(room?.price_per_night_pkr ?? 0);
  const rate = currency === "usd" ? usdRate : pkrRate;
  const factor = dur.unit === "month" ? dur.n : dur.n / 30;
  const monthlyStay = dur.unit === "month";
  // Monthly members: negotiated rent, arrival-month charge (full / prorated / your own amount),
  // months paid now and the security deposit — same rules as Bookings → Add walk-in member.
  const rentPerSeat = monthlyStay && negRent && Number(rentInput) > 0 ? Number(rentInput) : rate;
  const monthly = rentPerSeat * Math.max(seats, 0);
  const ci = new Date(`${checkInDate}T00:00:00`);
  const dim = new Date(ci.getFullYear(), ci.getMonth() + 1, 0).getDate();
  const daysLeft = dim - ci.getDate() + 1;
  const prorated = Math.round((monthly * daysLeft) / dim);
  const customFirst = firstInput === "" ? null : Number(firstInput);
  const proratedCharge = customFirst != null && Number.isFinite(customFirst) && customFirst >= 0 ? customFirst : prorated;
  const firstCharge = billing === "prorate" ? proratedCharge : monthly;
  const listSecurity = monthlyStay ? securityDepositForSeats(Math.max(seats, 1), currency) : 0;
  const security = monthlyStay ? (negSec && secInput !== "" ? Number(secInput) || 0 : listSecurity) : 0;
  const returnable = retOn && retInput !== "" ? Math.min(Number(retInput) || 0, security) : security;
  const payMonths = Math.min(Math.max(1, payNow), dur.n);
  const total = monthlyStay
    ? Math.round((firstCharge + monthly * (dur.n - 1)) * 100) / 100
    : Math.round(rate * Math.max(seats, 0) * factor * 100) / 100;
  const totalOther = Math.round((currency === "usd" ? pkrRate : usdRate) * Math.max(seats, 0) * factor * 100) / 100;
  /** What is due at the desk now: months being paid (+ deposit for monthly members). */
  const dueNow = monthlyStay ? Math.round((firstCharge + monthly * (payMonths - 1) + security) * 100) / 100 : total;
  const monShort = ci.toLocaleDateString("en-GB", { month: "short" });
  const receivedNum = received.trim() === "" ? 0 : Number(received);
  const balance = Math.round((dueNow - receivedNum) * 100) / 100;
  const payState = !seats ? "unpaid" : receivedNum <= 0 ? "unpaid" : receivedNum > dueNow ? "overpaid" : receivedNum >= dueNow ? "paid" : "partial";
  const checkOutKey = addToKey(checkInDate, dur.unit, dur.n);
  const idUploaded = idType === "cnic" ? Boolean(front && back) : Boolean(front);
  const bedLabel = beds.length ? beds.map((n) => `Bed ${n}`).join(", ") : null;

  // ── Validation (Figma 05.06) ──
  const errors: Record<string, string> = {};
  if (!room) errors.room = "Pick a room";
  if (room && isDorm && beds.length === 0) errors.beds = "Pick a bed";
  if (!name.trim()) errors.name = "Full name is required";
  const pe = phoneError(phone);
  if (pe) errors.phone = pe;
  if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter a valid email";
  if (idType === "passport") {
    if (!/^[A-Za-z0-9]{6,12}$/.test(idNumber.trim())) errors.idNumber = "Passport number: 6–12 letters or digits";
  } else if (digits(idNumber).length !== 13) {
    errors.idNumber = `${idType === "cnic" ? "CNIC" : "B-Form"} must be 13 digits: 00000-0000000-0`;
  }
  if (!emName.trim()) errors.emName = "Emergency contact is required";
  const epe = phoneError(emPhone);
  if (epe) errors.emPhone = epe === "Phone is required" ? "Emergency phone is required" : epe;
  if ((resType === "employee" || resType === "student") && !org.trim()) errors.org = resType === "employee" ? "Company name is required" : "Institution name is required";
  if (monthlyStay && negRent && !(Number(rentInput) > 0)) errors.rent = "Enter the agreed monthly rent";
  if (monthlyStay && billing === "prorate" && customFirst != null && (!Number.isFinite(customFirst) || customFirst < 0)) errors.firstMonth = "Enter a valid amount";
  if (received.trim() === "") errors.received = "Enter the amount received (0 if unpaid)";
  else if (!Number.isFinite(receivedNum) || receivedNum < 0) errors.received = "Enter a valid amount";
  else if (receivedNum > dueNow && seats) errors.received = `Exceeds ${money(dueNow, currency)} due now — enter ${Math.round(dueNow).toLocaleString("en-US")} or less`;
  const errorCount = Object.keys(errors).length;
  const canSave = errorCount === 0 && !conflict;
  const canCheckIn = canSave && idUploaded;
  const fieldError = (k: string) => (showErrors ? errors[k] : undefined);

  async function lookupGuest() {
    if (!token || phoneError(phone) || name.trim()) return;
    try {
      const g = await getReturningGuestApi(token, { phone });
      if (!g) return;
      setName(g.guest_name);
      setEmail(g.guest_email);
      if (g.guest_gender === "male" || g.guest_gender === "female" || g.guest_gender === "other") setGender(g.guest_gender);
      if (g.id_type) setIdType(g.id_type);
      setIdNumber(g.id_type === "passport" ? g.guest_passport : g.guest_cnic);
      setEmName(g.guest_guardian_name);
      setEmPhone(g.guest_guardian_contact);
      setReturning(g.last_stay);
    } catch {
      /* lookup is a convenience */
    }
  }
  function clearReturning() {
    setReturning(null);
    setName("");
    setEmail("");
    setGender("");
    setIdNumber("");
    setEmName("");
    setEmPhone("");
  }

  function jumpToFirst() {
    setShowErrors(true);
    requestAnimationFrame(() => {
      bodyRef.current?.querySelector('[aria-invalid="true"]')?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }

  function submit(status: "checked_in" | "confirmed") {
    if (!room) return;
    if (status === "checked_in" ? !canCheckIn : !canSave) {
      jumpToFirst();
      return;
    }
    const idDigits = digits(idNumber);
    create.mutate(
      {
        room_id: room.id,
        status,
        source: "walk_in",
        guest_name: name.trim(),
        guest_phone: phone.trim(),
        guest_email: email.trim() || undefined,
        guest_gender: gender || "",
        id_type: idType,
        ...(idType === "passport"
          ? { guest_passport: idNumber.trim().toUpperCase(), guest_cnic_image_front: front || undefined }
          : idType === "b_form"
            ? { guest_cnic: `${idDigits.slice(0, 5)}-${idDigits.slice(5, 12)}-${idDigits.slice(12)}`, guest_b_form_image: front || undefined }
            : {
                guest_cnic: `${idDigits.slice(0, 5)}-${idDigits.slice(5, 12)}-${idDigits.slice(12)}`,
                guest_cnic_image_front: front || undefined,
                guest_cnic_image_back: back || undefined,
              }),
        guest_guardian_name: emName.trim(),
        guest_guardian_contact: emPhone.trim(),
        guest_father_name: father.trim() || undefined,
        guest_permanent_address: address.trim() || undefined,
        resident_type: resType,
        ...(resType === "employee" ? { guest_company: org.trim() } : resType === "student" ? { guest_institution: org.trim() } : {}),
        seats_booked: seats,
        ...(isDorm && beds.length ? { seat_label: beds.map((n) => `Bed ${n}`).join(", ") } : {}),
        stay_unit: dur.unit,
        ...(dur.unit === "month"
          ? {
              months: dur.n,
              months_to_pay: payMonths,
              first_month_billing: billing,
              ...(billing === "prorate" && customFirst != null && Number.isFinite(customFirst) ? { first_month_amount: customFirst } : {}),
              ...(negRent ? { price_per_seat: rentPerSeat } : {}),
              security_amount: security,
              security_returnable: returnable,
            }
          : { nights: dur.n }),
        move_in: checkInDate,
        expected_arrival_time: checkInTime,
        currency,
        amount_received: receivedNum,
        ...(monthlyStay && receivedNum > 0 ? { amount_includes_security: true } : {}),
        payment_method: method,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: (booking) => {
          onOpenChange(false);
          showWalkInSuccessToast({
            guestName: name.trim(),
            roomLabel: room.room_number != null ? `Room ${room.room_number}` : room.title,
            status,
            detail: [
              "Walk-in",
              receivedNum > 0 ? `paid ${money(receivedNum, currency)} ${METHODS.find((m) => m.key === method)?.label.toLowerCase()}` : "unpaid",
              idUploaded ? "ID saved to booking" : "ID pending",
            ].join(" · "),
            bookingId: booking.id,
          });
          if (navigateToRoom) void navigate({ to: "/admin/rooms/$id", params: { id: room.id } });
        },
        onError: (e) => {
          if (e instanceof ApiError && e.code === "BED_TAKEN") {
            setConflict(e.details as BedTakenDetails);
            setBeds([]);
            void bedsQuery.refetch();
            bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          setShowErrors(true);
          import("sonner").then(({ toast }) => toast.error(e instanceof Error ? e.message : "Could not save the booking"));
        },
      },
    );
  }

  function pickRoom(r: Room, presetBed?: number[]) {
    setRoom(r);
    setPicking(false);
    setBeds(presetBed ?? []);
    setConflict(null);
    setParty(1);
  }

  const summaryLine = room
    ? [
        room.room_number != null ? `Room ${room.room_number}` : null,
        room.title,
        isDorm ? (bedLabel ?? "No bed selected") : "Whole room",
        room.floor != null ? `Floor ${room.floor}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  const footerNote = !room
    ? "Step 1 of 3 · choose a room"
    : conflict || (isDorm && beds.length === 0)
      ? "Pick a bed to continue"
      : showErrors && errorCount
        ? `${errorCount} field${errorCount === 1 ? "" : "s"} need${errorCount === 1 ? "s" : ""} attention`
        : canSave && !idUploaded
          ? "Check-in needs ID · saving creates a reservation"
          : canCheckIn
            ? `All set — ID verified, ${payState === "paid" ? "paid in full" : payState === "partial" ? "part paid" : "unpaid"}`
            : "Fill guest details and upload ID to enable check-in";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="glass-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[94svh] flex-col overflow-hidden rounded-t-[28px] font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:max-h-[calc(100svh-48px)] md:w-[min(960px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-glass-divider px-6 py-5">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <Dialog.Title className="text-hero text-ink">
                  {initialRoom ? "Walk-in booking" : "New booking · Walk-in"}
                </Dialog.Title>
                <Tag tone="brand" showDot>
                  Source · Walk-in (locked)
                </Tag>
              </div>
              <p className="text-body text-ink-2">
                {initialRoom ? "Register a guest who is at the desk now" : "Started from “+ New booking” — pick a room first"}
              </p>
            </div>
            <Dialog.Close
              aria-label="Close"
              className="glass-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] text-ink outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border"
            >
              <X className="size-[18px]" aria-hidden />
            </Dialog.Close>
          </div>

          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {/* Summary strip */}
            <div className="px-6 pt-4">
              <SummaryStrip
                title={room ? "Booking summary" : "Payment summary"}
                line={summaryLine}
                currency={currency}
                onCurrency={setCurrency}
                tags={
                  room ? (
                    <>
                      <Tag tone="brand" showDot>Walk-in</Tag>
                      <Tag tone={idUploaded ? "success" : "warning"} showDot>{idUploaded ? "ID verified" : "ID pending"}</Tag>
                      <PayTag state={payState} />
                    </>
                  ) : null
                }
                figures={
                  room
                    ? [
                        ["Check-in", isDorm && !beds.length ? "—" : `${fmtShort(checkInDate)} · ${checkInTime}`],
                        ["Check-out", isDorm && !beds.length ? "—" : `${fmtShort(checkOutKey)} · ${checkOutTime}`],
                        ["Duration", dur.label],
                        ["Guests", String(isDorm ? Math.max(beds.length, 1) : party)],
                        ...(monthlyStay
                          ? ([
                              ["Rent / month", seats ? `${money(monthly, currency)}${negRent && rentPerSeat !== rate ? " (negotiated)" : ""}` : "—"],
                              [`${monShort} (${billing === "prorate" ? "prorated" : "full"})`, seats ? money(firstCharge, currency) : "—"],
                              ["Security (once)", money(security, currency)],
                            ] as [string, string][])
                          : ([["Rate", seats ? `${money(rate, currency)} × ${seats} seat${seats === 1 ? "" : "s"} × ${dur.n} ${dur.n === 1 ? "night" : "nights"}` : "—"]] as [string, string][])),
                        ["Received", money(receivedNum || 0, currency)],
                        ["Balance", seats ? `${balance < 0 ? "-" : ""}${money(Math.abs(balance), currency)}` : "—"],
                      ]
                    : []
                }
                total={room && seats ? money(total, currency) : null}
                totalOther={room && seats ? money(totalOther, currency === "usd" ? "pkr" : "usd") : room ? "Select a bed" : null}
              />
            </div>

            <div className="flex flex-col gap-4 px-6 pt-4 pb-6">
              {showErrors && errorCount > 0 && room && !conflict ? (
                <Banner tone="danger" icon={<AlertTriangle />} action={{ label: "Jump to first", onClick: jumpToFirst }}>
                  Fix {errorCount} field{errorCount === 1 ? "" : "s"} before checking in.
                </Banner>
              ) : room && canSave && !idUploaded && showErrors ? (
                <Banner tone="warning" icon={<AlertTriangle />}>
                  No ID uploaded — save as a reservation tagged “ID pending” and collect ID before check-in.
                </Banner>
              ) : null}

              {/* 1 · Stay */}
              <Section num={1} title={room ? "Stay" : "Stay · choose a room"}>
                {picking || !room ? (
                  <RoomPicker
                    hostelId={hostelId ?? undefined}
                    search={roomSearch}
                    onSearch={setRoomSearch}
                    selectedId={room?.id ?? null}
                    onPick={(r) => pickRoom(r)}
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 rounded-[14px] border border-glass-divider bg-glass-inset py-[11px] pr-4 pl-[13px]">
                      <span className="size-10 shrink-0 overflow-hidden rounded-[8px]">
                        <RoomThumbnail images={room.images} iconClassName="size-4" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="truncate text-body font-semibold text-ink">
                          {room.room_number != null ? `Room ${room.room_number} · ` : ""}
                          {room.title}
                        </p>
                        <p className="truncate text-label text-ink-2">
                          {[room.floor != null ? `Floor ${room.floor}` : null, isDorm ? capital(bedData?.gender_policy ?? "mixed") : "Whole room", `${money(usdRate, "usd")} / seat / month`]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPicking(true)}
                        className="cursor-pointer text-body font-semibold text-brand-text underline outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
                      >
                        Change
                      </button>
                    </div>

                    {isDorm ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-label font-medium text-ink-2">Choose bed(s)</span>
                          <Tag tone={beds.length ? "brand" : "danger"} showDot>
                            {beds.length
                              ? `${beds.length} bed${beds.length === 1 ? "" : "s"} selected · ${beds.join(", ")}`
                              : "0 beds selected"}
                          </Tag>
                        </div>
                        {bedsQuery.isLoading ? (
                          <div className="flex justify-center py-10 text-ink-3">
                            <Loader2 className="size-5 animate-spin" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            {(bedData?.beds ?? []).map((b) => (
                              <PickBedTile
                                key={b.number}
                                bed={b}
                                selected={beds.includes(b.number)}
                                takenNow={conflict?.beds.includes(b.number) ? conflict.holder?.guest_name ?? "another guest" : null}
                                onToggle={() =>
                                  setBeds((cur) => (cur.includes(b.number) ? cur.filter((n) => n !== b.number) : [...cur, b.number].sort((x, y) => x - y)))
                                }
                              />
                            ))}
                          </div>
                        )}
                        {conflict ? (
                          <ConflictPanel
                            conflict={conflict}
                            onRefresh={() => {
                              setConflict(null);
                              void bedsQuery.refetch();
                            }}
                            onBrowse={() => {
                              setConflict(null);
                              setPicking(true);
                            }}
                            onSelect={async (roomId, freeBeds) => {
                              const { getRoomApi } = await import("@/api/rooms/getRoom.api");
                              const r = await getRoomApi(roomId);
                              pickRoom(r, freeBeds.slice(0, Math.max(1, seats || 1)));
                            }}
                          />
                        ) : freesAt ? (
                          <Banner tone="info" icon={<Info />}>
                            {bedLabel} is free from {freesAt} — check-in time set to {checkInTime}.
                          </Banner>
                        ) : null}
                      </>
                    ) : (
                      <div className="flex flex-wrap items-start gap-3">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-label font-medium text-ink-2">Party size</span>
                          <div className="glass-2 flex h-11 items-center gap-1 rounded-[14px] px-1">
                            <StepBtn label="Fewer guests" disabled={party <= 1} onClick={() => setParty((p) => Math.max(1, p - 1))}>
                              <Minus />
                            </StepBtn>
                            <span className="w-8 text-center text-body font-semibold text-ink">{party}</span>
                            <StepBtn label="More guests" disabled={party >= (room.capacity || 1)} onClick={() => setParty((p) => Math.min(room.capacity || 1, p + 1))}>
                              <Plus />
                            </StepBtn>
                          </div>
                          <span className="text-label text-ink-3">Max {room.capacity || 1} · capacity</span>
                        </div>
                        <div className="flex min-w-[240px] flex-1 flex-col gap-1 rounded-[14px] bg-brand-tint px-3.5 py-3 self-stretch justify-center">
                          <p className="text-body font-medium text-brand-text">Whole room is booked for this party.</p>
                          <p className="text-label text-ink-2">Private rooms are never shared with other walk-ins.</p>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <FieldLabel required>Check-in</FieldLabel>
                        <div className="flex gap-2">
                          <InputShell icon={<CalendarDays />} className="flex-1">
                            <input
                              type="date"
                              value={checkInDate}
                              onChange={(e) => e.target.value && setCheckInDate(e.target.value)}
                              aria-label="Check-in date"
                              onClick={(e) => e.currentTarget.showPicker?.()}
                              className="w-full cursor-pointer bg-transparent text-body text-ink outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                            />
                          </InputShell>
                          <InputShell icon={<Clock3 />} className="w-[124px]">
                            <input
                              type="time"
                              value={checkInTime}
                              onChange={(e) => e.target.value && setCheckInTime(e.target.value)}
                              aria-label="Check-in time"
                              onClick={(e) => e.currentTarget.showPicker?.()}
                              className="w-full cursor-pointer bg-transparent text-body text-ink outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                            />
                          </InputShell>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <FieldLabel>Duration</FieldLabel>
                        <InputShell>
                          <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            aria-label="Duration"
                            className="w-full cursor-pointer bg-transparent text-body text-ink outline-none"
                          >
                            <optgroup label="Monthly">
                              {DURATIONS.filter((d) => d.unit === "month").map((d) => (
                                <option key={d.key} value={d.key}>{d.label}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Nightly">
                              {DURATIONS.filter((d) => d.unit === "night").map((d) => (
                                <option key={d.key} value={d.key}>{d.label}</option>
                              ))}
                            </optgroup>
                          </select>
                        </InputShell>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel>Check-out (auto)</FieldLabel>
                      <InputShell muted>
                        <span className="text-body text-ink">{fmtLong(checkOutKey)} · {checkOutTime}</span>
                      </InputShell>
                    </div>
                  </>
                )}
              </Section>

              {room && !picking ? (
                <>
                  {/* 2 · Guest */}
                  <Section num={2} title={isDorm ? `Guest${bedLabel ? ` · ${bedLabel}` : ""}` : "Lead guest"}>
                    {returning ? (
                      <Banner tone="success" icon={<CheckCircle2 />} action={{ label: "Clear", onClick: clearReturning }}>
                        Returning guest — details filled from the {monthLabel(returning)} stay.
                      </Banner>
                    ) : null}
                    <div className="grid gap-3 md:grid-cols-2">
                      <TextField label="Full name" required value={name} onChange={setName} placeholder="e.g. Ahmed Khan" error={fieldError("name")} />
                      <TextField label="Phone" required value={phone} onChange={setPhone} onBlur={() => void lookupGuest()} placeholder="+92 3__ _______" inputMode="tel" error={fieldError("phone")} />
                      <TextField label="Email" value={email} onChange={setEmail} placeholder="name@email.com" inputMode="email" error={fieldError("email")} />
                      <SegmentedField
                        label="Gender"
                        value={gender}
                        onChange={(v) => setGender(v as typeof gender)}
                        options={[["male", "Male"], ["female", "Female"], ["other", "Other"]]}
                      />
                      <SegmentedField
                        label="ID type"
                        value={idType}
                        onChange={(v) => {
                          setIdType(v as IdType);
                          setBack("");
                        }}
                        options={[["cnic", "CNIC"], ["b_form", "B-Form"], ["passport", "Passport"]]}
                      />
                      <TextField
                        label={idType === "cnic" ? "CNIC number" : idType === "b_form" ? "B-Form number" : "Passport number"}
                        required
                        value={idNumber}
                        onChange={setIdNumber}
                        placeholder={idType === "passport" ? "AB1234567" : "00000-0000000-0"}
                        error={fieldError("idNumber")}
                      />
                      <TextField label="Emergency contact" required value={emName} onChange={setEmName} placeholder="Name" error={fieldError("emName")} />
                      <TextField label="Emergency phone" required value={emPhone} onChange={setEmPhone} placeholder="+92 3__ _______" inputMode="tel" error={fieldError("emPhone")} />
                      <TextField label="Father / husband name" value={father} onChange={setFather} placeholder="Father / husband name" />
                      <TextField label="Permanent address" value={address} onChange={setAddress} placeholder="Home address" />
                      <SegmentedField
                        label="Type"
                        value={resType}
                        onChange={(v) => {
                          setResType(v as typeof resType);
                          setOrg("");
                        }}
                        options={[["student", "Student"], ["employee", "Employee"], ["other", "Other"]]}
                      />
                      {resType !== "other" ? (
                        <TextField
                          label={resType === "employee" ? "Company name" : "Institution name"}
                          required
                          value={org}
                          onChange={setOrg}
                          placeholder={resType === "employee" ? "Employer or company" : "School, college or university"}
                          error={fieldError("org")}
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex-1 text-label font-medium text-ink-2">ID documents</span>
                        <Tag tone={idUploaded ? "success" : "warning"} showDot>
                          {idUploaded ? "Required for check-in · uploaded" : showErrors ? "Required for check-in · missing" : "Required for check-in"}
                        </Tag>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <DropZone label={idType === "cnic" ? "CNIC front" : idType === "b_form" ? "B-Form" : "Passport photo page"} value={front} onChange={setFront} />
                        {idType === "cnic" ? <DropZone label="CNIC back" value={back} onChange={setBack} /> : null}
                      </div>
                      <p className="text-label font-medium text-ink-3">
                        {ocrBusy ? "Reading the CNIC…" : idType === "cnic" ? "No CNIC? Switch ID type to B-Form or Passport. Details fill in from the CNIC photos." : "Upload a clear photo of the document."}
                      </p>
                    </div>
                  </Section>

                  {/* 3 · Payment */}
                  <Section num={3} title={monthlyStay ? "Billing & payment" : "Payment"}>
                    {monthlyStay ? (
                      <div className="flex flex-col gap-3">
                        <SegmentedField
                          label={`Arrival month (${monShort}) charge`}
                          value={billing}
                          onChange={(v) => setBilling(v as typeof billing)}
                          options={[["full", `Full month — ${money(monthly, currency)}`], ["prorate", `Prorated — ${money(proratedCharge, currency)}`]]}
                        />
                        {billing === "prorate" ? (
                          <div className="flex flex-col gap-1.5">
                            <TextField label={`Prorated charge for ${monShort}`} value={firstInput} onChange={(v) => setFirstInput(v.replace(/[^\d.]/g, ""))} placeholder={String(prorated)} inputMode="decimal" error={fieldError("firstMonth")} />
                            <p className="text-label text-ink-3">
                              {daysLeft} day{daysLeft === 1 ? "" : "s"} left in {monShort} → worked out {money(prorated, currency)}. Leave empty to use it, or type your own amount.
                              {customFirst != null && Number.isFinite(customFirst) && customFirst !== prorated ? (
                                <span className={customFirst > prorated ? "text-warning" : "text-brand-text"}> {money(Math.abs(customFirst - prorated), currency)} {customFirst > prorated ? "more" : "less"} than worked out.</span>
                              ) : null}
                            </p>
                          </div>
                        ) : null}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-label font-medium text-ink-2">Paying now (months of rent)</span>
                          <div className="glass-2 flex h-11 w-fit items-center gap-1 rounded-[14px] px-1">
                            <StepBtn label="Fewer months" disabled={payMonths <= 1} onClick={() => setPayNow(Math.max(1, payMonths - 1))}>
                              <Minus />
                            </StepBtn>
                            <span className="w-8 text-center text-body font-semibold text-ink">{payMonths}</span>
                            <StepBtn label="More months" disabled={payMonths >= dur.n} onClick={() => setPayNow(Math.min(dur.n, payMonths + 1))}>
                              <Plus />
                            </StepBtn>
                          </div>
                          <span className="text-label text-ink-3">Counted from the check-in month.</span>
                        </div>
                        <Switch on={negRent} onChange={setNegRent} label="Use negotiated monthly rent" />
                        {negRent ? <TextField label="Agreed rent / month" value={rentInput} onChange={(v) => setRentInput(v.replace(/[^\d.]/g, ""))} placeholder={String(rate)} inputMode="decimal" error={fieldError("rent")} /> : null}
                        <Switch on={negSec} onChange={setNegSec} label="Use negotiated security deposit" />
                        {negSec ? <TextField label="Security deposit" value={secInput} onChange={(v) => setSecInput(v.replace(/[^\d.]/g, ""))} placeholder={String(listSecurity)} inputMode="decimal" /> : null}
                        <Switch on={retOn} onChange={setRetOn} label="Set returnable security (amount to give back later)" />
                        {retOn ? <TextField label="Returnable security" value={retInput} onChange={(v) => setRetInput(v.replace(/[^\d.]/g, ""))} placeholder={String(security)} inputMode="decimal" /> : null}
                        <p className="text-label text-ink-3">
                          Due now: {money(dueNow, currency)} ({payMonths} month{payMonths === 1 ? "" : "s"} of rent{security ? ` + ${money(security, currency)} deposit` : ""})
                        </p>
                      </div>
                    ) : null}
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <FieldLabel>Rate (read-only)</FieldLabel>
                        <InputShell muted>
                          <span className="text-body text-ink">
                            {money(usdRate, "usd")} / seat / month · PKR {Math.round(pkrRate).toLocaleString("en-US")}
                          </span>
                        </InputShell>
                      </div>
                      <TextField
                        label={`Amount received (${currency.toUpperCase()})`}
                        required
                        value={received}
                        onChange={(v) => setReceived(v.replace(/[^\d.]/g, ""))}
                        placeholder="0"
                        inputMode="decimal"
                        error={fieldError("received")}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel>Method</FieldLabel>
                      <div role="radiogroup" aria-label="Payment method" className="flex flex-wrap gap-2">
                        {METHODS.map((m) => (
                          <button
                            key={m.key}
                            type="button"
                            role="radio"
                            aria-checked={method === m.key}
                            onClick={() => setMethod(m.key)}
                            className={cn(
                              "flex h-10 cursor-pointer items-center gap-2 rounded-[12px] border px-3.5 text-body font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-[18px]",
                              method === m.key ? "border-brand-border bg-brand-tint text-ink" : "glass-2 text-ink-2 hover:text-ink",
                            )}
                          >
                            {m.icon}
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-label font-medium text-ink-2">Payment status (auto)</span>
                      <PayTag state={payState} />
                      <span className="flex-1" />
                      <span className="text-label font-medium text-ink-2">Source</span>
                      <Tag tone="brand" showDot>Walk-in</Tag>
                    </div>
                    <TextField label="Notes" value={notes} onChange={setNotes} placeholder="Anything the next shift should know" />
                  </Section>
                </>
              ) : null}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-2.5 border-t border-glass-divider px-6 py-4">
            <p className="min-w-0 flex-1 text-label text-ink-2">{footerNote}</p>
            <Dialog.Close asChild>
              <GlassButton variant="ghost">Cancel</GlassButton>
            </Dialog.Close>
            <GlassButton
              variant={room && canSave && !idUploaded ? "primary" : "glass"}
              disabled={!room || picking || create.isPending}
              onClick={() => submit("confirmed")}
            >
              <CalendarDays aria-hidden /> Save as reservation
            </GlassButton>
            <GlassButton
              disabled={!room || picking || create.isPending}
              aria-disabled={!canCheckIn || undefined}
              className={cn(!canCheckIn && "opacity-50")}
              onClick={() => submit("checked_in")}
            >
              {create.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <LogIn aria-hidden />} Check in now
            </GlassButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const capital = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

// ── Pieces ──────────────────────────────────────────────────────

function SummaryStrip({
  title,
  line,
  tags,
  currency,
  onCurrency,
  figures,
  total,
  totalOther,
}: {
  title: string;
  line: string | null;
  tags: ReactNode;
  currency: Currency;
  onCurrency: (c: Currency) => void;
  figures: [string, string][];
  total: string | null;
  totalOther: string | null;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-glass-divider bg-glass-inset px-[18px] py-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <p className="text-eyebrow text-ink-2 uppercase">{title}</p>
        {line ? <p className="truncate text-label font-medium text-ink">{line}</p> : null}
        <span className="flex-1" />
        {tags}
        <div role="radiogroup" aria-label="Currency" className="flex gap-0.5 rounded-[10px] border border-glass-divider bg-glass-inset p-[3px]">
          {(["pkr", "usd"] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={currency === c}
              onClick={() => onCurrency(c)}
              className={cn(
                "cursor-pointer rounded-[8px] px-2.5 py-[3px] text-label outline-none focus-visible:ring-2 focus-visible:ring-brand-border",
                currency === c ? "bg-brand-tint text-ink" : "text-ink-3 hover:text-ink",
              )}
            >
              {c === "pkr" ? "PKR (Rs)" : "USD ($)"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-y-2.5">
          {figures.map(([label, value], i) => (
            <div key={label} className={cn("flex flex-col gap-0.5 py-0.5 pr-4", i > 0 && "border-l border-glass-divider pl-3.5")}>
              <span className="text-label whitespace-nowrap text-ink-3">{label}</span>
              <span className="text-body font-semibold whitespace-nowrap text-ink">{value}</span>
            </div>
          ))}
        </div>
        <div className="flex shrink-0 flex-col items-end border-l border-glass-divider py-0.5 pl-3.5 whitespace-nowrap">
          <span className="text-label font-medium text-ink-2">Total</span>
          <span className={cn("text-kpi", total ? "text-ink" : "text-ink-2")}>{total ?? (line ? "—" : "Pick a room")}</span>
          {totalOther ? <span className="text-label text-ink-3">{totalOther}</span> : null}
        </div>
      </div>
      <p className="text-label text-ink-3">Custom stays: $/seat/month ÷ 30 × nights × seats</p>
    </div>
  );
}

export function Section({ num, title, children }: { num: number; title: string; children: ReactNode }) {
  return (
    <section className="glass-1 flex flex-col gap-3.5 rounded-[20px] p-[19px]">
      <div className="flex items-center gap-2.5">
        <span className="flex size-6 items-center justify-center rounded-full bg-brand text-label font-medium text-on-brand">{num}</span>
        <h3 className="text-body font-semibold text-ink-2">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="flex gap-0.5 text-label font-medium text-ink-2">
      {children}
      {required ? <span className="text-danger" aria-hidden>*</span> : null}
    </span>
  );
}

export function InputShell({ icon, children, className, muted, invalid }: { icon?: ReactNode; children: ReactNode; className?: string; muted?: boolean; invalid?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2.5 rounded-[14px] border px-3.5 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-ink-3",
        muted ? "border-glass-divider bg-glass-inset" : "glass-2 bg-glass-inset",
        invalid && "border-danger! ring-1 ring-danger",
        "focus-within:ring-2 focus-within:ring-brand-border",
        className,
      )}
    >
      {icon}
      {children}
    </div>
  );
}

export function TextField({
  label,
  required,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  inputMode,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  inputMode?: "tel" | "email" | "decimal";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <FieldLabel required={required}>{label}</FieldLabel>
      <InputShell invalid={Boolean(error)}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          inputMode={inputMode}
          aria-invalid={error ? true : undefined}
          className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-3"
        />
      </InputShell>
      {error ? <span className="text-label font-medium text-danger">{error}</span> : null}
    </label>
  );
}

export function SegmentedField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-[14px] border border-glass-divider bg-glass-inset p-1">
        {options.map(([v, l]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={cn(
              "flex h-9 flex-1 cursor-pointer items-center justify-center rounded-[10px] border px-3.5 text-body font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand-border",
              value === v ? "border-brand-border bg-brand-tint text-ink" : "border-transparent text-ink-2 hover:text-ink",
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DropZone({
  label,
  value,
  onChange,
  scanning = false,
  scanLabel = "Reading ID…",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Show a scanning overlay on the uploaded image (OCR running). */
  scanning?: boolean;
  scanLabel?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function pick(file: File | null | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await compressImageFile(file));
    } catch (e) {
      import("sonner").then(({ toast }) => toast.error(e instanceof Error ? e.message : "Could not read the image"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-label font-medium text-ink-3">{label}</span>
      <input ref={ref} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
      {value ? (
        <div className="group relative h-24 overflow-hidden rounded-[12px]">
          <img src={value} alt={`${label} uploaded`} className="size-full object-cover" />
          {scanning ? (
            <div role="status" aria-live="polite" className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/45 text-white backdrop-blur-[1px]">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 animate-[gl-scan_1.4s_ease-in-out_infinite] bg-brand shadow-[0_0_12px_2px_var(--color-brand)]" />
              <Loader2 className="size-5 animate-spin" aria-hidden />
              <span className="text-label font-medium">{scanLabel}</span>
            </div>
          ) : (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-label font-medium text-white [&_svg]:size-3">
              <Check aria-hidden /> Uploaded
            </span>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={`Remove ${label}`}
            className="glass-3 absolute top-2 right-2 hidden size-7 cursor-pointer items-center justify-center rounded-full text-ink group-hover:flex focus-visible:flex"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void pick(e.dataTransfer.files?.[0]);
          }}
          disabled={busy}
          aria-busy={busy || undefined}
          className={cn(
            "flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-[12px] border-[1.2px] border-dashed border-brand-border bg-glass-inset p-3 text-ink-2 outline-none hover:bg-brand-tint focus-visible:ring-2 focus-visible:ring-brand-border",
            busy && "cursor-progress bg-brand-tint text-brand-text",
          )}
        >
          {busy ? <Loader2 className="size-[18px] animate-spin" aria-hidden /> : <Upload className="size-[18px]" aria-hidden />}
          <span className="text-label font-medium">{busy ? "Preparing image…" : "Photo or scan"}</span>
        </button>
      )}
    </div>
  );
}

export function PayTag({ state }: { state: "paid" | "partial" | "unpaid" | "overpaid" }) {
  const map = {
    paid: { tone: "success" as const, label: "Paid" },
    partial: { tone: "warning" as const, label: "Partial" },
    unpaid: { tone: "danger" as const, label: "Unpaid" },
    overpaid: { tone: "warning" as const, label: "Overpaid" },
  }[state];
  return (
    <Tag tone={map.tone} showDot>
      {map.label}
    </Tag>
  );
}

export function Banner({
  tone,
  icon,
  children,
  action,
}: {
  tone: "info" | "danger" | "warning" | "success";
  icon: ReactNode;
  children: ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  const cls = {
    info: "border-brand-border bg-brand-tint text-brand-text",
    danger: "border-danger bg-danger-tint text-danger",
    warning: "border-warning bg-warning-tint text-warning",
    success: "border-success bg-success-tint text-success",
  }[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex items-center gap-2.5 rounded-[12px] border px-3.5 py-2.5 text-body font-medium [&>svg]:size-4 [&>svg]:shrink-0", cls)}>
      {icon}
      <span className="min-w-0 flex-1">{children}</span>
      {action ? (
        <button type="button" onClick={action.onClick} className="shrink-0 cursor-pointer text-body font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-border">
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

export function StepBtn({ children, label, onClick, disabled }: { children: ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 cursor-pointer items-center justify-center rounded-[10px] text-ink outline-none hover:bg-glass-inset disabled:cursor-default disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-4"
    >
      {children}
    </button>
  );
}

/** Bed tile in the walk-in form (Figma "Bed tile": selectable when free or freeing today). */
function PickBedTile({ bed, selected, takenNow, onToggle }: { bed: Bed; selected: boolean; takenNow: string | null; onToggle: () => void }) {
  const selectable = !takenNow && (bed.status === "free" || bed.status === "checking_out");
  const b = bed.booking;
  const line1 = takenNow
    ? "Just assigned"
    : bed.status === "free"
      ? "Free now"
      : bed.status === "checking_out"
        ? `Free from ${bed.free_from}`
        : bed.status === "out_of_service"
          ? "Out of service"
          : b
            ? shortName(b.guest_name)
            : "—";
  const line2 = takenNow
    ? `by ${takenNow}`
    : bed.status === "checking_out" && b
      ? `${shortName(b.guest_name)} leaves ${bed.free_from}`
      : bed.status === "occupied" && b
        ? `until ${fmtShort(b.check_out ?? "").replace(/^\w+ /, "")}`
        : bed.status === "reserved" && b
          ? `arrives ${b.expected_arrival_time ?? b.check_in_time}`
          : bed.status === "free"
            ? "Ready"
            : "";
  const stateLabel = takenNow ? "Occupied" : { occupied: "Occupied", reserved: "Reserved", checking_out: "", free: "", out_of_service: "Out of service" }[bed.status];
  return (
    <button
      type="button"
      disabled={!selectable}
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "relative flex h-[184px] flex-col items-start gap-1.5 rounded-[18px] p-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-border",
        selected
          ? "border-2 border-brand bg-brand-tint"
          : takenNow
            ? "border-[1.2px] border-danger bg-glass-2"
            : bed.status === "reserved"
              ? "border-[1.2px] border-brand-text/60 bg-brand-tint/60"
              : selectable
                ? "glass-2 cursor-pointer hover:border-brand-border"
                : "glass-2",
        !selectable && !takenNow && "cursor-not-allowed opacity-55",
      )}
    >
      <span className="flex w-full items-center justify-between">
        <span className="flex size-[30px] items-center justify-center rounded-[9px] bg-glass-inset text-ink [&_svg]:size-4">
          <BedSingle aria-hidden />
        </span>
        {stateLabel ? (
          <span className="flex items-center gap-1 rounded-full bg-glass-inset px-[7px] py-0.5 text-label text-ink-2">
            <span className={cn("size-1.5 rounded-full", takenNow ? "bg-danger" : bed.status === "reserved" ? "bg-brand-text" : "bg-brand")} aria-hidden />
            {stateLabel}
          </span>
        ) : null}
      </span>
      <span className="text-hero text-ink">{bed.label}</span>
      <span className="text-body font-medium text-ink">{line1}</span>
      <span className="text-label font-medium text-ink-2">{line2}</span>
      {selected ? (
        <span className="absolute -top-2 left-[52%] flex size-[22px] items-center justify-center rounded-full bg-brand text-on-brand [&_svg]:size-[13px]">
          <Check strokeWidth={3} aria-hidden />
        </span>
      ) : null}
    </button>
  );
}

function ConflictPanel({
  conflict,
  onRefresh,
  onBrowse,
  onSelect,
}: {
  conflict: BedTakenDetails;
  onRefresh: () => void;
  onBrowse: () => void;
  onSelect: (roomId: string, freeBeds: number[]) => void;
}) {
  return (
    <>
      <Banner tone="danger" icon={<AlertTriangle />} action={{ label: "Refresh", onClick: onRefresh }}>
        {conflict.beds.map((n) => `Bed ${n}`).join(", ")} was just assigned to another guest. Your form is saved — pick another bed.
      </Banner>
      <div className="flex flex-col gap-2 rounded-[14px] border border-glass-divider bg-glass-inset p-3">
        <p className="text-label font-medium text-ink-2">Suggested alternatives</p>
        {conflict.alternatives.map((a) => (
          <div key={a.room_id} className="glass-2 flex items-center gap-3 rounded-[12px] px-3 py-2.5">
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="truncate text-body font-semibold text-ink">
                {a.room_number != null ? `Room ${a.room_number} · ` : ""}
                {a.kind === "dorm" && a.free_beds[0] ? `Bed ${a.free_beds[0]}` : a.title}
              </p>
              <p className="truncate text-label text-ink-2">
                {a.title} · {a.free_now > 0 ? `${a.free_now} bed${a.free_now === 1 ? "" : "s"} free now` : `frees ${a.frees_at ?? "today"}`}
                {a.price_per_night_usd != null ? ` · $${a.price_per_night_usd} / seat / month` : ""}
              </p>
            </div>
            <GlassButton variant="glass" size="sm" onClick={() => onSelect(a.room_id, a.free_beds)}>
              Select
            </GlassButton>
          </div>
        ))}
        <div className="glass-2 flex items-center gap-3 rounded-[12px] px-3 py-2.5">
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="text-body font-semibold text-ink">Choose another room</p>
            <p className="text-label text-ink-2">See all rooms with free beds</p>
          </div>
          <GlassButton variant="glass" size="sm" onClick={onBrowse}>
            Browse
          </GlassButton>
        </div>
      </div>
    </>
  );
}

/** Figma 05.11 · "Stay · choose a room". */
export function RoomPicker({
  hostelId,
  search,
  onSearch,
  selectedId,
  onPick,
}: {
  hostelId?: string;
  search: string;
  onSearch: (s: string) => void;
  selectedId: string | null;
  onPick: (r: Room) => void;
}) {
  const { data, isLoading } = useRoomAvailabilityQuery({ hostel: hostelId, search });
  const rooms = (data ?? []).filter((r) => r.free_now + r.frees_today > 0);
  return (
    <div className="flex flex-col gap-2.5">
      <label className="glass-2 flex h-11 items-center gap-2.5 rounded-[14px] bg-glass-inset px-3.5 focus-within:ring-2 focus-within:ring-brand-border">
        <Search className="size-4 text-ink-3" aria-hidden />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by room number or type"
          aria-label="Search rooms"
          className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-3"
        />
      </label>
      {isLoading ? (
        <div className="flex justify-center py-8 text-ink-3">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : rooms.length === 0 ? (
        <p className="py-8 text-center text-body text-ink-2">
          <Building2 className="mx-auto mb-2 size-5 text-ink-3" aria-hidden />
          No room has a free bed right now
        </p>
      ) : (
        <div role="radiogroup" aria-label="Rooms" className="flex flex-col gap-2">
          {rooms.map((r) => (
            <RoomOption key={r.room.id} r={r} selected={selectedId === r.room.id} onPick={() => onPick(r.room)} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoomOption({ r, selected, onPick }: { r: RoomAvailability; selected: boolean; onPick: () => void }) {
  const leaving = r.free_now === 0 && r.frees_today > 0;
  const sub =
    r.kind === "dorm"
      ? leaving
        ? `Floor ${r.room.floor ?? "—"} · Bed ${r.leaving_beds[0]} frees at ${r.frees_at}`
        : `Floor ${r.room.floor ?? "—"} · ${r.free_now} bed${r.free_now === 1 ? "" : "s"} free`
      : `Floor ${r.room.floor ?? "—"} · whole room · ${r.housekeeping_status === "needs_cleaning" ? "needs cleaning" : "ready now"}`;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onPick}
      className={cn(
        "glass-2 flex cursor-pointer items-center gap-3 rounded-[14px] px-4 py-3 text-left outline-none hover:border-brand-border focus-visible:ring-2 focus-visible:ring-brand-border",
        selected && "border-brand-border bg-brand-tint",
      )}
    >
      <span className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px]", selected ? "border-brand" : "border-ink-3")}>
        {selected ? <span className="size-2.5 rounded-full bg-brand" /> : null}
      </span>
      <span className="size-[38px] shrink-0 overflow-hidden rounded-[8px]">
        <RoomThumbnail images={r.room.images} iconClassName="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body font-semibold text-ink">
          {r.room.room_number != null ? `Room ${r.room.room_number} · ` : ""}
          {r.room.title}
        </span>
        <span className="truncate text-label text-ink-2">{sub}</span>
      </span>
      <span className="hidden text-label text-ink-2 sm:inline">
        ${r.room.price_per_night_usd ?? r.room.price_per_night} / seat / month
      </span>
      <Tag tone={leaving ? "warning" : "success"} showDot>
        {leaving ? `${r.frees_today} from ${r.frees_at}` : `${r.free_now} free`}
      </Tag>
    </button>
  );
}

/** On/off switch row (same look as Bookings → Add walk-in member). */
function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-body text-ink">
      <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={cn("relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors", on ? "bg-brand" : "bg-glass-inset ring-1 ring-glass-stroke")}>
        <span className={cn("absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform", on && "translate-x-4")} />
      </button>
      {label}
    </label>
  );
}
