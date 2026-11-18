import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CalendarDays, CreditCard, FileUp, Landmark, Loader2, Minus, Plus, Smartphone, Sparkles, UserPlus, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, Tag } from "@/components/glass";
import { RoomThumbnail } from "@/components/admin/room-thumbnail";
import { ocrCnicApi } from "@/api/residents";
import { useCreateManualBookingMutation } from "@/queries/bookings";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { useAuthStore } from "@/stores/auth/auth.store";
import { securityDepositForSeats } from "@/lib/security-deposit";
import { cn } from "@/lib/utils";
import { showWalkInSuccessToast } from "./walk-in-toast";
import { Banner, DropZone, FieldLabel, InputShell, RoomPicker, Section, SegmentedField, StepBtn, TextField } from "./walk-in-modal";
import type { Room } from "@/types/domain/room.types";

/**
 * Figma 06.12–06.14 · Add walk-in member (Bookings page). Upload the CNIC first — name,
 * CNIC number, father name, gender and address are read from it (POST /residents/ocr-cnic).
 * Creates the booking through POST /bookings/manual with the full billing options.
 */

type Method = "cash" | "card" | "bank_transfer" | "jazzcash" | "easypaisa";
type Cur = "pkr" | "usd";
const METHODS: { key: Method; label: string; icon: React.ReactNode }[] = [
  { key: "cash", label: "Cash", icon: <Wallet /> },
  { key: "card", label: "Card", icon: <CreditCard /> },
  { key: "bank_transfer", label: "Bank transfer", icon: <Landmark /> },
  { key: "jazzcash", label: "JazzCash", icon: <Smartphone /> },
  { key: "easypaisa", label: "Easypaisa", icon: <Smartphone /> },
];
const pad = (n: number) => String(n).padStart(2, "0");
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const parse = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};
const digits = (s: string) => s.replace(/\D/g, "");
const phoneOk = (v: string) => {
  const d = digits(v);
  return d.startsWith("92") ? d.length === 12 : d.startsWith("0") ? d.length === 11 : d.length >= 10 && d.length <= 15;
};

export function AddWalkInMemberModal({ open, onOpenChange, room: initialRoom = null }: { open: boolean; onOpenChange: (o: boolean) => void; room?: Room | null }) {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const { hostelId } = useHostelScope();
  const create = useCreateManualBookingMutation();
  const bodyRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const [room, setRoom] = useState<Room | null>(initialRoom);
  const [picking, setPicking] = useState(!initialRoom);
  const [search, setSearch] = useState("");
  const [cur, setCur] = useState<Cur>("pkr");
  const [useBForm, setUseBForm] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [bForm, setBForm] = useState("");
  const [pdf, setPdf] = useState("");
  const [ocrBusy, setOcrBusy] = useState(false);
  const [auto, setAuto] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [cnic, setCnic] = useState("");
  const [father, setFather] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [guardian, setGuardian] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"student" | "employee" | "other">("employee");
  const [org, setOrg] = useState("");
  const [unit, setUnit] = useState<"month" | "night">("month");
  const [moveIn, setMoveIn] = useState(todayKey());
  const [seats, setSeats] = useState(1);
  const [length, setLength] = useState(1);
  const [billing, setBilling] = useState<"full" | "prorate">("full");
  const [payNow, setPayNow] = useState(1);
  const [negRent, setNegRent] = useState(false);
  const [rentInput, setRentInput] = useState("");
  const [negSec, setNegSec] = useState(false);
  const [secInput, setSecInput] = useState("");
  const [retOn, setRetOn] = useState(false);
  const [retInput, setRetInput] = useState("");
  const [method, setMethod] = useState<Method>("cash");
  const [received, setReceived] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRoom(initialRoom);
    setPicking(!initialRoom);
    setUseBForm(false); setFront(""); setBack(""); setBForm(""); setPdf(""); setAuto([]);
    setName(""); setCnic(""); setFather(""); setGender("male"); setAddress(""); setPhone(""); setGuardian(""); setEmail("");
    setType("employee"); setOrg(""); setUnit("month"); setMoveIn(todayKey()); setSeats(1); setLength(1);
    setBilling("full"); setPayNow(1); setNegRent(false); setRentInput(""); setNegSec(false); setSecInput(""); setRetOn(false); setRetInput("");
    setMethod("cash"); setReceived(""); setShowErrors(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Read the CNIC once front (and back, for the address) are in.
  useEffect(() => {
    if (!token || useBForm || !front) return;
    let cancelled = false;
    setOcrBusy(true);
    ocrCnicApi(token, { front, back: back || undefined })
      .then((f) => {
        if (cancelled) return;
        const filled: string[] = [];
        if (f.name && !name) { setName(f.name); filled.push("name"); }
        if (f.cnic && !cnic) { setCnic(f.cnic); filled.push("cnic"); }
        if (f.father_name && !father) { setFather(f.father_name); filled.push("father"); }
        if (f.gender) setGender(f.gender);
        if (f.address && !address) { setAddress(f.address); filled.push("address"); }
        setAuto((a) => [...new Set([...a, ...filled])]);
      })
      .catch(() => {})
      .finally(() => !cancelled && setOcrBusy(false));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [front, back, useBForm, token]);

  // ── Money ──
  const listRent = Number(cur === "usd" ? room?.price_per_night_usd ?? room?.price_per_night : room?.price_per_night_pkr) || 0;
  const nightly = Number(cur === "usd" ? room?.visitor_nightly_rate_usd : room?.visitor_nightly_rate_pkr) || Math.round(listRent / 30);
  const rent = negRent && Number(rentInput) > 0 ? Number(rentInput) : listRent;
  const monthly = rent * seats;
  const listSecurity = unit === "month" ? securityDepositForSeats(seats, cur) : 0;
  const security = unit === "month" ? (negSec && secInput !== "" ? Number(secInput) || 0 : listSecurity) : 0;
  const returnable = retOn && retInput !== "" ? Math.min(Number(retInput) || 0, security) : security;
  const mi = parse(moveIn);
  const dim = new Date(mi.getFullYear(), mi.getMonth() + 1, 0).getDate();
  const prorated = Math.round((monthly * (dim - mi.getDate() + 1)) / dim);
  const firstCharge = billing === "prorate" ? prorated : monthly;
  const fullStay = unit === "month" ? firstCharge + monthly * (length - 1) : nightly * seats * length;
  const collectNow = unit === "month" ? firstCharge + monthly * Math.max(0, payNow - 1) + security : fullStay;
  const receivedNum = received === "" ? 0 : Number(received) || 0;
  const balance = Math.max(0, collectNow - receivedNum);
  const monthName = mi.toLocaleDateString("en-GB", { month: "short" });
  const moveOut = useMemo(() => {
    const d = parse(moveIn);
    if (unit === "month") d.setMonth(d.getMonth() + length);
    else d.setDate(d.getDate() + length);
    return d;
  }, [moveIn, unit, length]);
  const fmtMoney = (n: number) => (cur === "usd" ? `$${n.toLocaleString("en-US")}` : `Rs ${Math.round(n).toLocaleString("en-US")}`);
  const idUploaded = useBForm ? Boolean(bForm) : Boolean(front || pdf);
  const freeSeats = room?.beds_available ?? 1;

  // ── Validation (Figma 06.14) ──
  const errors: Record<string, string> = {};
  if (!room) errors.room = "Pick a room";
  if (!name.trim()) errors.name = "Full name is required";
  if (!phone.trim()) errors.phone = "Phone is required";
  else if (!phoneOk(phone)) errors.phone = "Enter a 10-digit mobile number, e.g. +92 300 1234567";
  if (guardian.trim() && !phoneOk(guardian)) errors.guardian = "Enter a valid guardian number";
  if (cnic.trim() && digits(cnic).length !== 13) errors.cnic = "CNIC must be 13 digits: 00000-0000000-0";
  if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter a valid email";
  if (type === "employee" && !org.trim()) errors.org = "Company name is required";
  if (type === "student" && !org.trim()) errors.org = "Institution name is required";
  if (!moveIn) errors.moveIn = "Move-in is required";
  if (room && seats > Math.max(1, freeSeats)) errors.seats = `Only ${freeSeats} seat(s) available`;
  if (negRent && !(Number(rentInput) > 0)) errors.rent = "Enter the agreed monthly rent";
  if (receivedNum > collectNow) errors.received = `Exceeds ${fmtMoney(collectNow)} — enter that or less`;
  const errorCount = Object.keys(errors).length;
  const err = (k: string) => (showErrors ? errors[k] : undefined);

  function submit(asReservation: boolean) {
    if (errorCount > 0 || !room) {
      setShowErrors(true);
      requestAnimationFrame(() => bodyRef.current?.querySelector('[aria-invalid="true"]')?.scrollIntoView({ block: "center", behavior: "smooth" }));
      return;
    }
    const cnicDigits = digits(cnic);
    const checkInNow = !asReservation && moveIn <= todayKey();
    create.mutate(
      {
        room_id: room.id,
        source: "walk_in",
        status: checkInNow ? "checked_in" : "confirmed",
        guest_name: name.trim(),
        guest_phone: phone.trim(),
        guest_email: email.trim() || undefined,
        guest_gender: gender,
        guest_father_name: father.trim() || undefined,
        guest_permanent_address: address.trim() || undefined,
        guest_guardian_contact: guardian.trim() || undefined,
        guest_cnic: cnicDigits.length === 13 ? `${cnicDigits.slice(0, 5)}-${cnicDigits.slice(5, 12)}-${cnicDigits.slice(12)}` : undefined,
        id_type: useBForm ? "b_form" : "cnic",
        ...(useBForm ? { guest_b_form_image: bForm || undefined } : { guest_cnic_image_front: front || undefined, guest_cnic_image_back: back || undefined }),
        ...(pdf ? { guest_cnic_pdf: pdf } : {}),
        resident_type: type,
        ...(type === "employee" ? { guest_company: org.trim() } : type === "student" ? { guest_institution: org.trim() } : {}),
        seats_booked: seats,
        stay_unit: unit,
        ...(unit === "month" ? { months: length, months_to_pay: payNow, first_month_billing: billing } : { nights: length, nightly_rate: nightly }),
        move_in: moveIn,
        currency: cur,
        ...(negRent ? { price_per_seat: rent } : {}),
        ...(unit === "month" ? { security_amount: security, security_returnable: returnable } : {}),
        payment_method: method,
        ...(receivedNum > 0 ? { amount_received: receivedNum, amount_includes_security: unit === "month" } : {}),
      } as Parameters<typeof create.mutate>[0],
      {
        onSuccess: (booking) => {
          onOpenChange(false);
          showWalkInSuccessToast({
            guestName: name.trim(),
            roomLabel: room.room_number != null ? `Room ${room.room_number}` : room.title,
            status: checkInNow ? "checked_in" : "confirmed",
            detail: [receivedNum > 0 ? `paid ${fmtMoney(receivedNum)} ${METHODS.find((m) => m.key === method)?.label.toLowerCase()}` : "unpaid", idUploaded ? "ID saved" : "ID pending"].join(" · "),
          });
          void navigate({ to: "/admin/bookings/$id", params: { id: booking.id } });
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add the member"),
      },
    );
  }

  const fieldEmpty: Record<string, string> = { name, cnic, father, address };
  const autoTag = (k: string) => (ocrBusy && !fieldEmpty[k] ? <span className="ml-auto flex items-center gap-1 text-label text-brand-text"><Loader2 className="size-3 animate-spin" aria-hidden />Reading…</span> : auto.includes(k) ? <span className="ml-auto flex items-center gap-1 rounded-full bg-brand-tint px-1.5 text-label text-brand-text"><Sparkles className="size-3" aria-hidden />Auto-filled</span> : null);
  const toggle = (on: boolean, set: (v: boolean) => void, label: string) => (
    <label className="flex cursor-pointer items-center gap-2.5 text-body text-ink">
      <button type="button" role="switch" aria-checked={on} onClick={() => set(!on)} className={cn("relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors", on ? "bg-brand" : "bg-glass-inset ring-1 ring-glass-stroke")}>
        <span className={cn("absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform", on && "translate-x-4")} />
      </button>
      {label}
    </label>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="glass-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[94svh] flex-col overflow-hidden rounded-t-[28px] font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:max-h-[calc(100svh-48px)] md:w-[min(960px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px]">
          <div className="flex items-center gap-3 border-b border-glass-divider px-6 py-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-tint text-brand-text [&_svg]:size-[18px]"><UserPlus aria-hidden /></span>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap items-center gap-2"><Dialog.Title className="text-hero text-ink">Add walk-in member</Dialog.Title><Tag tone="brand" showDot>Channel · Walk-in (locked)</Tag></div>
              <p className="text-label text-ink-2">Upload the ID first — most details fill in automatically</p>
            </div>
            <Dialog.Close aria-label="Close" className="glass-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] text-ink outline-none hover:bg-glass-inset"><X className="size-[18px]" aria-hidden /></Dialog.Close>
          </div>

          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-4 pb-6">
            {/* Payment summary */}
            <div className="flex flex-col gap-3 rounded-[18px] border border-glass-divider bg-glass-inset px-[18px] py-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="text-eyebrow text-ink-2 uppercase">Payment summary</p>
                <span className="flex-1" />
                <Tag tone="brand" showDot>Walk-in</Tag>
                <Tag tone={idUploaded ? "success" : "warning"} showDot>{idUploaded ? "ID uploaded" : "ID pending"}</Tag>
                <Tag tone={receivedNum <= 0 ? "danger" : balance > 0 ? "warning" : "success"} showDot>{receivedNum <= 0 ? "Unpaid" : balance > 0 ? "Partial" : "Paid"}</Tag>
                <div role="radiogroup" aria-label="Currency" className="flex gap-0.5 rounded-[10px] border border-glass-divider bg-glass-inset p-[3px]">
                  {(["pkr", "usd"] as Cur[]).map((c) => (
                    <button key={c} type="button" role="radio" aria-checked={cur === c} onClick={() => setCur(c)} className={cn("cursor-pointer rounded-[8px] px-2.5 py-[3px] text-label", cur === c ? "bg-brand-tint text-ink" : "text-ink-3")}>{c === "pkr" ? "PKR (Rs)" : "USD ($)"}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="grid min-w-0 flex-1 grid-cols-3 items-start gap-y-2.5 md:auto-cols-fr md:grid-flow-col md:grid-cols-none">
                  {[
                    [unit === "month" ? "Rent / month" : "Rate / night", unit === "month" ? (
                      <span className="flex flex-col items-start gap-1">
                        <span>{negRent && rent !== listRent ? <span className="mr-1 text-label font-normal text-ink-3 line-through">{listRent.toLocaleString("en-US")}</span> : null}{fmtMoney(rent)}</span>
                        {negRent && rent !== listRent ? <Tag tone="brand" showDot>Negotiated</Tag> : null}
                      </span>
                    ) : fmtMoney(nightly)],
                    ...(unit === "month" ? [[`${monthName} (${billing === "prorate" ? "prorated" : "full"})`, fmtMoney(firstCharge)]] : []),
                    [`Full stay (${length} ${unit === "month" ? "mo" : length === 1 ? "night" : "nights"})`, fmtMoney(fullStay)],
                    ...(unit === "month" ? [["Security (once)", fmtMoney(security)], ["Returnable", fmtMoney(returnable)]] : []),
                    ["Received", fmtMoney(receivedNum)],
                    ["Balance", fmtMoney(balance)],
                  ].map(([l, v], i) => (
                    <div key={String(l)} className={cn("flex min-w-0 flex-col gap-0.5 py-0.5 pr-2.5", i > 0 && "md:border-l md:border-glass-divider md:pl-3")}>
                      <span className="truncate text-[11px] leading-4 text-ink-3 md:whitespace-nowrap" title={String(l)}>{l}</span>
                      <span className="text-[13px] leading-5 font-semibold whitespace-nowrap text-ink">{room ? v : "—"}</span>
                    </div>
                  ))}
                </div>
                <div className="flex shrink-0 flex-col items-end border-l border-glass-divider pl-3.5">
                  <span className="text-label font-medium text-ink-2">Collect now</span>
                  <span className="text-kpi text-success">{room ? fmtMoney(collectNow) : "—"}</span>
                </div>
              </div>
              <p className="text-label text-ink-3">{monthName} charge + rent × (months − 1) + security deposit</p>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {showErrors && errorCount ? (
                <Banner tone="danger" icon={<AlertTriangle />} action={{ label: "Jump to first", onClick: () => bodyRef.current?.querySelector('[aria-invalid="true"]')?.scrollIntoView({ block: "center", behavior: "smooth" }) }}>
                  Fix {errorCount} field{errorCount === 1 ? "" : "s"} before adding this member.
                </Banner>
              ) : null}

              {/* 1 · Guest ID */}
              <Section num={1} title="Guest ID">
                <div className="-mt-1 flex items-center gap-3">
                  <p className={cn("flex flex-1 items-center gap-1.5 text-label", ocrBusy || auto.length ? "text-brand-text" : "text-ink-2")}>
                    {ocrBusy ? <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden /> : null}
                    {ocrBusy ? "Reading the CNIC — name, CNIC number and address will fill in…" : auto.length ? `Read from CNIC · ${auto.length} field${auto.length === 1 ? "" : "s"} filled in. Check them before saving.` : useBForm ? "Upload the B-Form image." : "Upload front and back — name, CNIC number and address fill in automatically."}
                  </p>
                  <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 6_000_000) return toast.error("PDF is too large (max 6 MB)");
                    const rd = new FileReader();
                    rd.onload = () => setPdf(String(rd.result));
                    rd.readAsDataURL(f);
                  }} />
                  <GlassButton variant="glass" size="sm" onClick={() => pdfRef.current?.click()}><FileUp /> {pdf ? "PDF added" : "Upload PDF"}</GlassButton>
                </div>
                {useBForm ? (
                  <DropZone label="B-Form" value={bForm} onChange={setBForm} />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DropZone label="CNIC front" value={front} onChange={setFront} scanning={ocrBusy} scanLabel="Reading CNIC…" />
                    <DropZone label="CNIC back (for address)" value={back} onChange={setBack} scanning={ocrBusy && Boolean(back)} scanLabel="Reading address…" />
                  </div>
                )}
                <button type="button" onClick={() => { setUseBForm((v) => !v); setAuto([]); }} className="mx-auto cursor-pointer text-[11px] font-semibold tracking-[0.88px] text-ink-3 uppercase hover:text-ink">
                  {useBForm ? "Use CNIC instead" : front ? "Re-scan · switch to B-Form" : "No CNIC? Use B-Form instead"}
                </button>
              </Section>

              {/* 2 · Guest details */}
              <Section num={2} title="Guest details">
                <div className="grid gap-3 md:grid-cols-2">
                  <LabeledText label="Full name" required tag={autoTag("name")} value={name} onChange={setName} placeholder="Guest name" error={err("name")} />
                  <LabeledText label="CNIC number" tag={autoTag("cnic")} value={cnic} onChange={setCnic} placeholder="00000-0000000-0" error={err("cnic")} />
                  <LabeledText label="Father / husband name" tag={autoTag("father")} value={father} onChange={setFather} placeholder="Father / husband name" />
                  <SegmentedField label="Gender" value={gender} onChange={(v) => setGender(v as typeof gender)} options={[["male", "Male"], ["female", "Female"], ["other", "Other"]]} />
                  <div className="md:col-span-2"><LabeledText label="Permanent address" tag={autoTag("address")} value={address} onChange={setAddress} placeholder="Type address if not read from CNIC back" /></div>
                  <TextField label="Phone" required value={phone} onChange={setPhone} placeholder="+92 300 1234567" inputMode="tel" error={err("phone")} />
                  <TextField label="Guardian number" value={guardian} onChange={setGuardian} placeholder="+92 300 1234567" inputMode="tel" error={err("guardian")} />
                  <div className="md:col-span-2"><TextField label="Email" value={email} onChange={setEmail} placeholder="guest@email.com" inputMode="email" error={err("email")} /></div>
                </div>
              </Section>

              {/* 3 · Occupation */}
              <Section num={3} title="Occupation & channel">
                <SegmentedField label="Type" value={type} onChange={(v) => { setType(v as typeof type); setOrg(""); }} options={[["student", "Student"], ["employee", "Employee"], ["other", "Other"]]} />
                {type !== "other" ? (
                  <TextField label={type === "employee" ? "Company name" : "Institution name"} required value={org} onChange={setOrg} placeholder={type === "employee" ? "Employer or company" : "School, college or university"} error={err("org")} />
                ) : null}
              </Section>

              {/* 4 · Stay */}
              <Section num={4} title="Stay">
                {picking || !room ? (
                  <RoomPicker hostelId={hostelId ?? undefined} search={search} onSearch={setSearch} selectedId={room?.id ?? null} onPick={(r) => { setRoom(r); setPicking(false); setSeats(1); }} />
                ) : (
                  <>
                    <div className="glass-2 flex items-center gap-2.5 rounded-[14px] py-2.5 pr-4 pl-3">
                      <span className="size-10 shrink-0 overflow-hidden rounded-[8px]"><RoomThumbnail images={room.images} iconClassName="size-4" /></span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="truncate text-body font-semibold text-ink">{room.room_number != null ? `Room ${room.room_number} · ` : ""}{room.title}</p>
                        <p className="truncate text-label text-ink-2">{[room.floor != null ? `Floor ${room.floor}` : null, `${freeSeats} of ${room.beds_total} seat${room.beds_total === 1 ? "" : "s"} available`].filter(Boolean).join(" · ")}</p>
                      </div>
                      <button type="button" onClick={() => setPicking(true)} className="cursor-pointer text-body font-semibold text-brand-text underline">Change</button>
                    </div>
                    <SegmentedField label="Stay type" value={unit} onChange={(v) => { setUnit(v as typeof unit); setLength(v === "month" ? 1 : 3); }} options={[["month", "Monthly member"], ["night", "Daily guest"]]} />
                    <div className="flex flex-wrap items-start gap-3">
                      <label className="flex min-w-[220px] flex-1 flex-col gap-1.5">
                        <FieldLabel required>Move-in</FieldLabel>
                        <InputShell icon={<CalendarDays />} invalid={Boolean(err("moveIn"))}>
                          <input type="date" value={moveIn} onChange={(e) => e.target.value && setMoveIn(e.target.value)} onClick={(e) => e.currentTarget.showPicker?.()} className="w-full cursor-pointer bg-transparent text-body text-ink outline-none [&::-webkit-calendar-picker-indicator]:hidden" />
                        </InputShell>
                      </label>
                      <Stepper label="Seats" value={seats} min={1} max={Math.max(1, Math.min(freeSeats, room.capacity || freeSeats))} onChange={setSeats} hint={err("seats") ?? `${freeSeats} seat(s) available`} danger={Boolean(err("seats"))} />
                      <Stepper label={unit === "month" ? "Stay length (months)" : "Stay length (nights)"} value={length} min={1} max={unit === "month" ? 24 : 60} onChange={(v) => { setLength(v); setPayNow((p) => Math.min(p, v)); }} hint={`Move-out · ${moveOut.toLocaleDateString("en-GB", { weekday: "short" })} ${moveOut.getDate()} ${moveOut.toLocaleDateString("en-GB", { month: "short" })}`} />
                    </div>
                  </>
                )}
              </Section>

              {/* 5 · Billing */}
              <Section num={5} title="Billing">
                {unit === "month" ? (
                  <>
                    <SegmentedField label={`Arrival month (${monthName}) charge`} value={billing} onChange={(v) => setBilling(v as typeof billing)} options={[["full", `Full month — ${fmtMoney(monthly)}`], ["prorate", `Prorated — ${fmtMoney(prorated)}`]]} />
                    <div className="flex flex-col gap-1.5">
                      <Stepper label="Paying now (months of rent)" value={payNow} min={1} max={length} onChange={setPayNow} />
                      <p className="text-label text-ink-3">Counted from the move-in month. Set move-in to the real check-in date if they already live here.</p>
                    </div>
                    {toggle(negRent, setNegRent, "Use negotiated monthly rent")}
                    {negRent ? <TextField label="Agreed rent / month" value={rentInput} onChange={(v) => setRentInput(v.replace(/[^\d.]/g, ""))} placeholder={String(listRent)} inputMode="decimal" error={err("rent")} /> : null}
                    {toggle(negSec, setNegSec, "Use negotiated security deposit")}
                    {negSec ? <TextField label="Security deposit" value={secInput} onChange={(v) => setSecInput(v.replace(/[^\d.]/g, ""))} placeholder={String(listSecurity)} inputMode="decimal" /> : null}
                    {toggle(retOn, setRetOn, "Set returnable security (amount to give back later)")}
                    {retOn ? <TextField label="Returnable security" value={retInput} onChange={(v) => setRetInput(v.replace(/[^\d.]/g, ""))} placeholder={String(security)} inputMode="decimal" /> : null}
                  </>
                ) : (
                  <p className="text-body text-ink-2">Daily guests pay {fmtMoney(nightly)} per night per seat — no security deposit.</p>
                )}
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Payment method</FieldLabel>
                  <div role="radiogroup" aria-label="Payment method" className="flex flex-wrap gap-2">
                    {METHODS.map((m) => (
                      <button key={m.key} type="button" role="radio" aria-checked={method === m.key} onClick={() => setMethod(m.key)} className={cn("flex h-10 cursor-pointer items-center gap-2 rounded-[12px] border px-3.5 text-body font-medium [&_svg]:size-[18px]", method === m.key ? "border-brand-border bg-brand-tint text-ink" : "glass-2 text-ink-2 hover:text-ink")}>
                        {m.icon}{m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <TextField label={`Amount received (${cur.toUpperCase()})`} value={received} onChange={(v) => setReceived(v.replace(/[^\d.]/g, ""))} placeholder="0" inputMode="decimal" error={err("received")} />
              </Section>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-glass-divider px-6 py-4">
            <p className="min-w-0 flex-1 text-label text-ink-2">
              {showErrors && errorCount ? `${errorCount} field${errorCount === 1 ? "" : "s"} need attention` : errorCount ? `Required: full name, phone${type !== "other" ? `, ${type === "employee" ? "company" : "institution"} name` : ""}, move-in` : "All required fields complete"}
            </p>
            <Dialog.Close asChild><GlassButton variant="ghost">Cancel</GlassButton></Dialog.Close>
            <GlassButton variant="glass" disabled={create.isPending} onClick={() => submit(true)}><CalendarDays /> Save as reservation</GlassButton>
            <GlassButton disabled={create.isPending} className={cn(errorCount && "opacity-50")} onClick={() => submit(false)}>
              {create.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <UserPlus />} Add member
            </GlassButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function LabeledText({ label, required, tag, value, onChange, placeholder, error }: { label: string; required?: boolean; tag?: React.ReactNode; value: string; onChange: (v: string) => void; placeholder?: string; error?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center"><FieldLabel required={required}>{label}</FieldLabel>{tag}</span>
      <InputShell invalid={Boolean(error)}>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-invalid={error ? true : undefined} className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-3" />
      </InputShell>
      {error ? <span className="text-label font-medium text-danger">{error}</span> : null}
    </label>
  );
}

function Stepper({ label, value, min, max, onChange, hint, danger }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; hint?: string; danger?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="glass-2 flex h-11 w-fit items-center gap-1 rounded-[14px] px-1">
        <StepBtn label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}><Minus /></StepBtn>
        <span className="w-10 text-center text-body font-semibold text-ink">{value}</span>
        <StepBtn label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}><Plus /></StepBtn>
      </div>
      {hint ? <span className={cn("text-label", danger ? "text-danger" : "text-ink-3")}>{hint}</span> : null}
    </div>
  );
}
