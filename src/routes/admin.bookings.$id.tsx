import { useEffect, useRef, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  Copy,
  Download,
  Ellipsis,
  Eye,
  EyeOff,
  Maximize2,
  FileText,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Printer,
  Receipt,
  ShieldCheck,
  Upload,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { GlassButton, Tag } from "@/components/glass";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoomThumbnail } from "@/components/admin/room-thumbnail";
import { BookingRefundDialog } from "@/components/admin/booking-refund-dialog";
import { BookingSecurityCard } from "@/components/admin/booking-security-card";
import { ChangeRoomDialog } from "@/components/admin/change-room-dialog";
import { EditBookingDialog } from "@/components/admin/edit-booking-dialog";
import { ReceiptDialog } from "@/components/admin/booking-detail/receipt-dialog";
import { RecordPaymentSheet } from "@/components/admin/booking-detail/record-payment-sheet";
import { CheckoutDialog } from "@/components/admin/booking-detail/checkout-dialog";
import { IdImageViewer } from "@/components/admin/id-image-viewer";
import { DISPLAY_STATUS, bookingDisplayStatus, channelLabel, occupationLine } from "@/components/admin/bookings/booking-format";
import { useBookingQuery, useUpdateBookingStatusMutation } from "@/queries/bookings";
import { useAddBookingNoteMutation, useVerifyIdMutation } from "@/queries/bookings/useBookingDetailActions";
import { useResidentDetailQuery, useUpdateResidentMutation } from "@/queries/residents";
import { compressImageFile } from "@/lib/compress-image";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types/domain/booking.types";

export const Route = createFileRoute("/admin/bookings/$id")({
  component: BookingDetailPage,
  validateSearch: (search: Record<string, unknown>) => ({
    edit: search.edit === true || search.edit === "1" || search.edit === "true" ? true : undefined,
  }),
});

/**
 * Figma 06.07–06.11 · Booking detail (checked in, reserved / ID pending, partial payment),
 * Record payment side sheet and Check-out dialog.
 */

const pk = (k?: string | null) => {
  if (!k) return null;
  const [y, m, d] = k.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};
const fmtDay = (k?: string | null, weekday = true) => {
  const d = pk(k);
  if (!d) return "—";
  return `${weekday ? `${d.toLocaleDateString("en-GB", { weekday: "short" })} ` : ""}${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })}`;
};
const fmtStamp = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", { weekday: "short" })} ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })} ${d.toTimeString().slice(0, 5)}`;
};
const fmtStampDot = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", { weekday: "short" })} ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })} · ${d.toTimeString().slice(0, 5)}`;
};
const nights = (a?: string | null, b?: string | null) => {
  const x = pk(a);
  const y = pk(b);
  return x && y ? Math.round((y.getTime() - x.getTime()) / 86_400_000) : 0;
};
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const initials = (n: string) => {
  const p = n.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "?";
};
const ordinal = (n: number) => `${n}${["th", "st", "nd", "rd"][(n % 100 > 10 && n % 100 < 14) || n % 10 > 3 ? 0 : n % 10]}`;

function BookingDetailPage() {
  const { id } = Route.useParams();
  const { edit: editFromSearch } = Route.useSearch();
  const navigate = useNavigate();
  const { data: booking, isLoading, isError, error } = useBookingQuery(id);
  const { data: resident } = useResidentDetailQuery(booking ? id : null);
  const updateStatus = useUpdateBookingStatusMutation();
  const verifyId = useVerifyIdMutation();
  const updateResident = useUpdateResidentMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const idInput = useRef<HTMLInputElement>(null);
  const [idSlot, setIdSlot] = useState<"front" | "back">("front");

  useEffect(() => {
    if (!booking || !editFromSearch) return;
    setEditOpen(true);
    void navigate({ to: "/admin/bookings/$id", params: { id }, search: {}, replace: true });
  }, [booking, editFromSearch, id, navigate]);
  useEffect(() => {
    if (booking && typeof window !== "undefined" && window.location.hash === "#booking-invoice") setReceiptOpen(true);
    if (booking && typeof window !== "undefined" && window.location.hash === "#payments") setPayOpen(true);
  }, [booking?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-4 2xl:gap-5" aria-busy>
        <div className="h-[110px]" />
        <div className="glass-1 h-[66px] animate-pulse rounded-[18px]" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_420px] min-[1920px]:grid-cols-[minmax(0,1fr)_460px]">
          <div className="glass-1 h-[520px] animate-pulse rounded-[20px]" />
          <div className="glass-1 h-[520px] animate-pulse rounded-[20px]" />
        </div>
      </div>
    );
  }
  if (isError || !booking) {
    return (
      <div className="flex w-full flex-col gap-4 2xl:gap-5">
        <BackLink />
        <div className="glass-1 rounded-[20px] py-16 text-center text-body text-danger">{error instanceof Error ? error.message : "Booking not found."}</div>
      </div>
    );
  }

  const b = booking;
  const ds = bookingDisplayStatus(b);
  const status = DISPLAY_STATUS[ds];
  const cur = b.currency ?? "pkr";
  const money = (n: number | null | undefined) => formatMoney(Number(n) || 0, cur);
  const r = resident?.resident;
  const front = r?.cnic_image_front || "";
  const back = r?.cnic_image_back || "";
  const bForm = r?.b_form_image || "";
  const pdf = r?.cnic_pdf || "";
  const hasId = Boolean(front || back || bForm || pdf || b.id_pending === false);
  const idPending = b.id_pending ?? !hasId;
  const balance = Math.max(0, b.balance_due ?? 0);
  const reservedArriving = ds === "reserved";
  const checkInLocked = reservedArriving && idPending;

  function setStatus(s: BookingStatus) {
    if (s === "cancelled") return setCancelOpen(true);
    if (s === "checked_out") return setCheckoutOpen(true);
    updateStatus.mutate(
      { id: b.id, status: s },
      {
        onSuccess: () => toast.success(s === "checked_in" ? `${b.guest_name} checked in` : s === "confirmed" ? "Booking confirmed" : "Booking updated"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
      },
    );
  }

  function pickId(slot: "front" | "back") {
    setIdSlot(slot);
    idInput.current?.click();
  }
  async function uploadId(file: File | null | undefined) {
    if (!file) return;
    try {
      const data = await compressImageFile(file);
      const key = b.id_type === "b_form" ? "guest_b_form_image" : idSlot === "front" ? "guest_cnic_image_front" : "guest_cnic_image_back";
      updateResident.mutate(
        { bookingId: b.id, input: { [key]: data } },
        { onSuccess: () => toast.success("ID uploaded"), onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed") },
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read the image");
    }
  }

  function whatsappReminder() {
    const digits = String(b.guest_phone ?? "").replace(/\D/g, "");
    if (!digits) return toast.error("No phone number on this booking");
    const msg = balance > 0
      ? `Hi ${b.guest_name.split(" ")[0]}, a friendly reminder that ${money(balance)} is due for your stay (${b.booking_code ?? ""}). Thank you!`
      : `Hi ${b.guest_name.split(" ")[0]}, your next rent of ${money(b.next_due_amount)} is due on ${fmtDay(b.next_due_date, false)}. Thank you!`;
    window.open(`https://wa.me/${digits.startsWith("0") ? `92${digits.slice(1)}` : digits}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  }

  const primary =
    ds === "reserved"
      ? { label: "Check in", icon: <LogIn />, onClick: () => setStatus("checked_in"), disabled: checkInLocked }
      : ds === "checking_out_today"
        ? { label: "Check out", icon: <LogOut />, onClick: () => setCheckoutOpen(true), disabled: false }
        : ds === "checked_in"
          ? { label: "Record payment", icon: <Banknote />, onClick: () => setPayOpen(true), disabled: false }
          : null;

  return (
    <div className="flex w-full flex-col gap-4 2xl:gap-5">
      <input ref={idInput} type="file" accept="image/*" className="hidden" onChange={(e) => { void uploadId(e.target.files?.[0]); e.target.value = ""; }} />
      <BackLink />

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-tint text-body font-semibold text-brand-text">{initials(b.guest_name)}</span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="truncate text-page-title text-ink">{b.guest_name}</h1>
          <div className="flex flex-wrap gap-1.5">
            <Tag tone="neutral" showDot>{b.booking_code ?? `#${b.id.slice(-8).toUpperCase()}`}</Tag>
            <Tag tone={status.tone} showDot>{status.label}</Tag>
            <Tag tone="brand" showDot>{channelLabel(b.source)}</Tag>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GlassButton variant="glass" onClick={() => setEditOpen(true)}><Pencil /> Edit</GlassButton>
          <GlassButton variant="glass" onClick={() => setReceiptOpen(true)}><Printer /> Print receipt</GlassButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label="More actions" className="glass-2 flex size-10 cursor-pointer items-center justify-center rounded-[12px] text-ink outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border">
                <Ellipsis className="size-[18px]" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-3 min-w-[210px] rounded-[16px] border-glass-stroke p-1.5 font-geist text-ink shadow-none [&_[role=menuitem]]:cursor-pointer [&_[role=menuitem]]:rounded-[10px] [&_[role=menuitem]]:px-2.5 [&_[role=menuitem]]:py-2 [&_[role=menuitem]]:text-body">
              {b.status === "pending" ? <DropdownMenuItem onSelect={() => setStatus("confirmed")}>Confirm booking</DropdownMenuItem> : null}
              {b.status === "checked_in" ? <DropdownMenuItem onSelect={() => setCheckoutOpen(true)}>Check out</DropdownMenuItem> : null}
              {b.status !== "cancelled" && b.status !== "checked_out" ? <DropdownMenuItem onSelect={() => setPayOpen(true)}>Record payment</DropdownMenuItem> : null}
              <DropdownMenuItem onSelect={() => setSecurityOpen(true)}>Security deposit…</DropdownMenuItem>
              {b.status !== "cancelled" && b.status !== "checked_out" ? <DropdownMenuItem onSelect={() => setMoveOpen(true)}>Move to another room</DropdownMenuItem> : null}
              {b.status !== "cancelled" && b.status !== "checked_out" ? (
                <>
                  <DropdownMenuSeparator className="my-1 bg-glass-divider" />
                  <DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => setCancelOpen(true)}>Cancel booking</DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
          {primary ? (
            <GlassButton onClick={primary.onClick} disabled={primary.disabled} className="disabled:opacity-40">{primary.icon} {primary.label}</GlassButton>
          ) : null}
        </div>
      </div>

      <StatusRail booking={b} />

      {checkInLocked ? (
        <Banner tone="warning" action={{ label: "Upload ID", onClick: () => pickId("front") }}>
          Check-in is locked until ID is uploaded.{balance > 0 ? ` ${money(balance)} is due on arrival.` : ""}
        </Banner>
      ) : b.overdue && balance > 0 ? (
        <Banner tone="danger" action={{ label: "Record payment", onClick: () => setPayOpen(true) }}>
          {money(balance)} overdue since {fmtDay(b.next_due_date, false)}.
        </Banner>
      ) : null}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_420px] min-[1920px]:grid-cols-[minmax(0,1fr)_460px]">
        <div className="flex min-w-0 flex-col gap-4">
          <GuestCard booking={b} idPending={idPending} />
          <IdCard
            booking={b}
            images={{ front, back, bForm, pdf }}
            idPending={idPending}
            onUpload={pickId}
            onVerify={() => verifyId.mutate(b.id, { onSuccess: () => toast.success("ID verified"), onError: (e) => toast.error(e instanceof Error ? e.message : "Could not verify") })}
          />
          <PaymentsCard booking={b} onRecord={() => setPayOpen(true)} onReceipt={() => setReceiptOpen(true)} />
          <ActivityCard booking={b} />
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-0">
          <StayCard booking={b} />
          <BillingCard booking={b} />
          <Panel eyebrow="Quick actions" className="gap-2 p-4">
            {checkInLocked ? (
              <GlassButton className="h-11 w-full" onClick={() => pickId("front")}><Upload /> Upload ID</GlassButton>
            ) : b.status !== "cancelled" && b.status !== "checked_out" ? (
              <GlassButton className="h-11 w-full" onClick={() => setPayOpen(true)}><Banknote /> {reservedArriving && balance > 0 ? `Collect ${money(balance)}` : "Record payment"}</GlassButton>
            ) : null}
            {checkInLocked && balance > 0 ? (
              <GlassButton variant="glass" className="h-11 w-full" onClick={() => setPayOpen(true)}><Banknote /> Collect {money(balance)}</GlassButton>
            ) : null}
            {b.status === "checked_in" ? (
              <GlassButton variant="glass" className="h-11 w-full" onClick={() => setEditOpen(true)}><CalendarDays /> Extend stay</GlassButton>
            ) : null}
            {b.status !== "cancelled" ? (
              <GlassButton variant="glass" className="h-11 w-full" onClick={whatsappReminder}><MessageCircle /> Send reminder (WhatsApp)</GlassButton>
            ) : null}
            {!checkInLocked ? (
              <GlassButton variant="ghost" className="h-11 w-full" onClick={() => setReceiptOpen(true)}><Printer /> Print receipt</GlassButton>
            ) : null}
          </Panel>
          <Panel
            eyebrow="Notes"
            action={
              <button type="button" aria-label="Edit notes" onClick={() => setEditOpen(true)} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 outline-none hover:bg-glass-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border">
                <Pencil className="size-4" aria-hidden />
              </button>
            }
          >
            <p className="text-body whitespace-pre-line text-ink">{b.notes?.trim() || <span className="text-ink-3">No notes yet.</span>}</p>
          </Panel>
        </div>
      </div>

      <RecordPaymentSheet booking={b} open={payOpen} onOpenChange={setPayOpen} onRecorded={(print) => print && setReceiptOpen(true)} />
      <CheckoutDialog booking={b} open={checkoutOpen} onOpenChange={setCheckoutOpen} />
      <EditBookingDialog booking={b} open={editOpen} onOpenChange={setEditOpen} />
      <ChangeRoomDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        bookingId={b.id}
        currentRoomId={b.room_id}
        currentRoomTitle={b.room_title}
        seatsBooked={b.seats_booked}
        hostelId={b.hostel_id}
        bookingStatus={b.status}
      />
      <BookingRefundDialog
        open={cancelOpen}
        booking={b}
        mode="cancel"
        submitting={updateStatus.isPending}
        onClose={() => setCancelOpen(false)}
        onConfirm={(amount) =>
          updateStatus.mutate(
            { id: b.id, status: "cancelled", amount_refunded: amount },
            {
              onSuccess: () => { toast.success("Booking cancelled"); setCancelOpen(false); },
              onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
            },
          )
        }
      />
      <ReceiptDialog booking={b} open={receiptOpen} onOpenChange={setReceiptOpen} />
      <GlassModal open={securityOpen} onOpenChange={setSecurityOpen} title="Security deposit">
        <BookingSecurityCard booking={b} />
      </GlassModal>
    </div>
  );
}

// ── Pieces ──────────────────────────────────────────────────────

function BackLink() {
  return (
    <Link to="/admin/bookings" className="-ml-1 inline-flex w-fit items-center gap-1 rounded-[8px] text-body font-medium text-ink-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border">
      <ChevronLeft className="size-4" aria-hidden /> Bookings
    </Link>
  );
}

function Panel({ eyebrow, action, children, className }: { eyebrow: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("glass-1 flex flex-col gap-3.5 rounded-[20px] p-5", className)}>
      <header className="flex min-h-8 items-center justify-between gap-3">
        <h2 className="text-eyebrow text-ink-2 uppercase">{eyebrow}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

function Banner({ tone, children, action }: { tone: "warning" | "danger"; children: ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <div role="alert" className={cn("flex items-center gap-2.5 rounded-[14px] border px-4 py-3 text-body font-medium", tone === "warning" ? "border-warning bg-warning-tint text-warning" : "border-danger bg-danger-tint text-danger")}>
      <AlertTriangle className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">{children}</span>
      {action ? <button type="button" onClick={action.onClick} className="shrink-0 cursor-pointer font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-border">{action.label}</button> : null}
    </div>
  );
}

function StatusRail({ booking: b }: { booking: Booking }) {
  const act = b.activity ?? [];
  const find = (t: RegExp) => act.find((a) => t.test(a.label));
  const created = find(/created/i);
  const checkedIn = find(/^checked in/i);
  const checkedOut = find(/^checked out/i);
  const by = (a?: { actor_name: string } | undefined, fallback?: string) => (a?.actor_name ? ` · ${a.actor_name}` : fallback ? ` · ${fallback}` : "");
  const ds = bookingDisplayStatus(b);
  const cancelled = b.status === "cancelled";
  const current = cancelled ? 0 : b.status === "checked_out" ? 4 : ds === "checking_out_today" ? 3 : b.status === "checked_in" ? 2 : 1;
  const steps = [
    { label: "Reserved", sub: `${fmtStamp(b.created_at) ?? "—"}${by(created, b.source === "website" ? "Website" : undefined)}` },
    { label: "Checked in", sub: b.checked_in_at ? `${fmtStamp(b.checked_in_at)}${by(checkedIn)}` : ds === "reserved" ? `Arrives ${b.move_in === todayKey() ? "today" : fmtDay(b.move_in)}${b.expected_arrival_time ? ` ${b.expected_arrival_time}` : ""}` : "—" },
    { label: "Checking out", sub: b.check_out ? `Due ${fmtDay(b.check_out)} · 11:00` : "—" },
    { label: cancelled ? "Cancelled" : "Checked out", sub: b.checked_out_at ? `${fmtStamp(b.checked_out_at)}${by(checkedOut)}` : "—" },
  ];
  return (
    <div className="glass-1 flex items-center gap-3 overflow-x-auto rounded-[18px] px-5 py-3.5">
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < current || (n === 4 && current === 4);
        const isCurrent = n === current && current !== 4;
        return (
          <div key={s.label} className="flex min-w-[170px] flex-1 items-center gap-2.5">
            <span
              className={cn(
                "flex size-[26px] shrink-0 items-center justify-center rounded-full text-label",
                done ? "bg-success text-white" : isCurrent ? "bg-brand text-on-brand shadow-[0_0_0_4px_rgba(59,130,245,0.5)]" : "border border-glass-divider bg-glass-inset text-ink-3",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : n}
            </span>
            <span className="flex min-w-0 flex-1 flex-col whitespace-nowrap">
              <span className={cn(isCurrent ? "text-body font-semibold text-ink" : done ? "text-label font-medium text-ink" : "text-label font-medium text-ink-3")}>{s.label}</span>
              <span className="truncate text-label text-ink-3">{s.sub}</span>
            </span>
            {n < 4 ? <span className={cn("h-0.5 w-10 shrink-0 rounded-[2px]", done ? "bg-success" : "bg-glass-divider")} aria-hidden /> : null}
          </div>
        );
      })}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-eyebrow whitespace-nowrap text-ink-3 uppercase">{children}</span>
      <span className="h-px flex-1 bg-glass-divider" aria-hidden />
    </div>
  );
}

function Tile({ icon, label, value, action, danger }: { icon: ReactNode; label: string; value: ReactNode; action?: ReactNode; danger?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[14px] border border-glass-divider bg-glass-inset p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint text-brand-text [&_svg]:size-[17px]">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="truncate text-label text-ink-3">{label}</span>
        <span className={cn("truncate text-body font-medium", danger ? "text-warning" : "text-ink")}>{value}</span>
      </span>
      {action}
    </div>
  );
}

function PillAction({ icon, label, href, onClick }: { icon: ReactNode; label: string; href?: string; onClick?: () => void }) {
  const cls = "flex shrink-0 cursor-pointer items-center gap-[5px] rounded-full border border-glass-stroke bg-glass-2 px-2.5 py-1.5 text-label font-medium text-ink outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-[13px]";
  return href ? <a href={href} className={cls}>{icon}{label}</a> : <button type="button" onClick={onClick} className={cls}>{icon}{label}</button>;
}

function GuestCard({ booking: b, idPending }: { booking: Booking; idPending: boolean }) {
  const h = b.guest_history;
  const returning = (h?.stay_number ?? 1) > 1;
  const email = b.guest_email?.endsWith("@stayinn.internal") ? "" : b.guest_email;
  const idLabel = b.id_type === "passport" ? "Passport" : b.id_type === "b_form" ? "B-Form" : "CNIC";
  const idValue = b.id_type === "passport" ? b.guest_passport : b.guest_cnic;
  const sinceDate = h?.since ? new Date(h.since) : null;
  const footer = returning && sinceDate
    ? `Guest since ${sinceDate.getDate()} ${sinceDate.toLocaleDateString("en-GB", { month: "short" })} ${sinceDate.getFullYear()} · ${h!.stays} stays · ${formatMoney(h!.lifetime_paid, b.currency ?? "pkr")} paid lifetime`
    : `First stay · booked ${b.source === "walk_in" ? "as a walk-in" : `via ${channelLabel(b.source)}`} on ${fmtDay(b.created_at?.slice(0, 10), false)}`;
  return (
    <section className="glass-1 flex flex-col gap-[18px] rounded-[20px] p-5">
      <div className="flex items-center gap-3.5">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-white/35 bg-brand-tint text-body font-semibold text-brand-text">{initials(b.guest_name)}</span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-eyebrow text-ink-3 uppercase">Guest</span>
          <span className="truncate text-hero text-ink">{b.guest_name}</span>
          <span className="flex flex-wrap gap-1.5">
            <span className="flex items-center gap-[5px] rounded-full border border-glass-divider bg-glass-inset px-[9px] py-[3px] text-label font-medium text-ink-2"><Building2 className="size-3" aria-hidden />{occupationLine(b)}</span>
            {b.guest_gender ? <span className="flex items-center gap-[5px] rounded-full border border-glass-divider bg-glass-inset px-[9px] py-[3px] text-label font-medium text-ink-2 capitalize"><User className="size-3" aria-hidden />{b.guest_gender}</span> : null}
          </span>
        </div>
        <Tag tone={idPending ? "warning" : "brand"} showDot>
          {returning ? `Returning · ${ordinal(h!.stay_number)} stay` : "New guest"}{idPending ? " · ID pending" : ""}
        </Tag>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>Contact</SectionTitle>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Tile icon={<Phone />} label="Phone" value={b.guest_phone || "—"} action={b.guest_phone ? <PillAction icon={<Phone />} label="Call" href={`tel:${b.guest_phone}`} /> : null} />
          <Tile icon={<ShieldCheck />} label={b.guest_guardian_name ? `Guardian · ${b.guest_guardian_name}` : "Guardian"} value={b.guest_guardian_contact || "—"} action={b.guest_guardian_contact ? <PillAction icon={<Phone />} label="Call" href={`tel:${b.guest_guardian_contact}`} /> : null} />
        </div>
        <Tile
          icon={<Mail />}
          label="Email"
          value={email || "—"}
          action={email ? <PillAction icon={<Copy />} label="Copy" onClick={() => void navigator.clipboard?.writeText(email).then(() => toast.success("Email copied"))} /> : null}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>Identity &amp; stay</SectionTitle>
        <div className="grid grid-cols-1 rounded-[14px] border border-glass-divider bg-glass-inset py-1 sm:grid-cols-3">
          {[
            ["Father / husband", b.guest_father_name || "—", false],
            [idLabel, idValue || (idPending ? "Not provided · ID pending" : "—"), !idValue && idPending],
            ["Stay type", b.stay_unit === "night" ? "Daily guest" : "Monthly member", false],
          ].map(([l, v, warn], i) => (
            <div key={String(l)} className={cn("flex min-w-0 flex-col gap-0.5 px-3.5 py-2.5", i > 0 && "sm:border-l sm:border-glass-divider")}>
              <span className="text-label text-ink-3">{l}</span>
              <span className={cn("truncate text-body font-medium", warn ? "text-warning" : "text-ink")}>{v}</span>
            </div>
          ))}
        </div>
        <Tile
          icon={<MapPin />}
          label="Permanent address · read from CNIC back"
          value={b.guest_permanent_address || "Not provided — fills in from the CNIC back"}
          danger={!b.guest_permanent_address}
        />
      </div>

      <p className="flex items-center gap-1.5 text-label font-medium text-ink-3"><CalendarDays className="size-[13px]" aria-hidden />{footer}</p>
    </section>
  );
}

function IdCard({
  booking: b,
  images,
  idPending,
  onUpload,
  onVerify,
}: {
  booking: Booking;
  images: { front: string; back: string; bForm: string; pdf: string };
  idPending: boolean;
  onUpload: (slot: "front" | "back") => void;
  onVerify: () => void;
}) {
  const [show, setShow] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);
  const slots = b.id_type === "b_form" ? [["B-Form", images.bForm, "front"] as const] : b.id_type === "passport" ? [["Passport", images.front, "front"] as const] : [["CNIC front", images.front, "front"] as const, ["CNIC back", images.back, "back"] as const];
  const any = slots.some(([, src]) => src) || Boolean(images.pdf);
  const viewable = slots.filter(([, src]) => src).map(([label, src]) => ({ label, src }));
  return (
    <Panel
      eyebrow="ID documents"
      action={
        any ? (
          <GlassButton variant="glass" size="sm" onClick={() => setShow((s) => !s)}>{show ? <EyeOff /> : <Eye />} {show ? "Hide" : "Show"}</GlassButton>
        ) : (
          <GlassButton variant="glass" size="sm" onClick={() => onUpload("front")}><Upload /> Upload</GlassButton>
        )
      }
    >
      {idPending && !any ? (
        <div className="flex items-center gap-2.5 rounded-[12px] border border-warning bg-warning-tint px-3.5 py-2.5 text-body font-medium text-warning">
          <AlertTriangle className="size-4 shrink-0" aria-hidden /> ID pending — required before check-in. Upload CNIC front &amp; back or a B-Form.
        </div>
      ) : null}
      <div className={cn("grid gap-3", slots.length > 1 ? "sm:grid-cols-2" : "")}>
        {slots.map(([label, src, slot]) => (
          <div key={label} className="flex flex-col gap-1.5">
            <span className="text-label font-medium text-ink-3">{label}</span>
            {src ? (
              <button
                type="button"
                onClick={() => setViewing(viewable.findIndex((v) => v.label === label))}
                aria-label={`Open ${label}`}
                className="group relative aspect-[1.586] max-h-[320px] w-full cursor-zoom-in overflow-hidden rounded-[14px] bg-glass-inset outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
              >
                <img src={src} alt={`${label} for ${b.guest_name}`} className={cn("size-full object-contain p-2 transition duration-200 group-hover:scale-[1.02]", !show && "blur-md")} />
                {!show ? (
                  <span className="glass-3 absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full px-3 py-1.5 text-label font-medium text-ink"><EyeOff className="size-3.5" aria-hidden /> Hidden · tap to view</span>
                ) : (
                  <span className="glass-3 absolute right-2.5 bottom-2.5 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label font-medium text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><Maximize2 className="size-3.5" aria-hidden /> View</span>
                )}
              </button>
            ) : (
              <button type="button" onClick={() => onUpload(slot)} className="flex aspect-[1.586] max-h-[320px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.2px] border-dashed border-brand-border bg-glass-inset text-ink-2 outline-none hover:bg-brand-tint focus-visible:ring-2 focus-visible:ring-brand-border">
                <Upload className="size-[18px]" aria-hidden />
                <span className="text-label font-medium">{label}</span>
              </button>
            )}
          </div>
        ))}
      </div>
      {images.pdf ? (
        <div className="flex items-center gap-3 rounded-[14px] border border-glass-divider bg-glass-inset px-3.5 py-2.5">
          <span className="flex size-9 items-center justify-center rounded-[10px] bg-brand-tint text-brand-text"><FileText className="size-[18px]" aria-hidden /></span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-body font-medium text-ink">{`${b.id_type === "passport" ? "passport" : "cnic"}-${b.guest_name.toLowerCase().replace(/\s+/g, "-")}.pdf`}</span>
            <span className="text-label text-ink-3">PDF · {Math.max(1, Math.round((images.pdf.length * 3) / 4 / 1024))} KB</span>
          </span>
          <a href={images.pdf} target="_blank" rel="noreferrer" aria-label="Open PDF" className="flex size-8 items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-2 hover:text-ink"><Eye className="size-4" /></a>
          <a href={images.pdf} download={`id-${b.guest_name.replace(/\s+/g, "-")}.pdf`} aria-label="Download PDF" className="flex size-8 items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-2 hover:text-ink"><Download className="size-4" /></a>
        </div>
      ) : null}
      <IdImageViewer images={viewable} index={viewing ?? 0} onIndexChange={setViewing} open={viewing !== null && viewable.length > 0} onOpenChange={(o) => !o && setViewing(null)} owner={b.guest_name} />
      {b.id_verified_at ? (
        <p className="flex items-center gap-1.5 text-label font-medium text-success"><ShieldCheck className="size-3.5" aria-hidden /> ID verified{b.id_verified_by_name ? ` · by ${b.id_verified_by_name}` : ""} · {fmtDay(b.id_verified_at.slice(0, 10), false)}</p>
      ) : any ? (
        <button type="button" onClick={onVerify} className="flex w-fit cursor-pointer items-center gap-1.5 text-label font-semibold text-brand-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-border"><ShieldCheck className="size-3.5" aria-hidden /> Mark ID as verified</button>
      ) : null}
    </Panel>
  );
}

function PaymentsCard({ booking: b, onRecord, onReceipt }: { booking: Booking; onRecord: () => void; onReceipt: () => void }) {
  const rows = b.payments ?? [];
  const total = rows.reduce((s, p) => s + p.amount, 0);
  const money = (n: number) => formatMoney(n, b.currency ?? "pkr");
  return (
    <Panel eyebrow="Payments" action={b.status !== "cancelled" ? <GlassButton variant="glass" size="sm" onClick={onRecord}><Plus /> Record payment</GlassButton> : null}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-glass-divider text-label text-ink-3 uppercase">
              {["Date", "Description", "Method", "Ref #", "Received by"].map((h) => <th key={h} className="px-2 py-2 font-medium">{h}</th>)}
              <th className="px-2 py-2 text-right font-medium">Amount</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="py-6 text-center text-label text-ink-3">No payments recorded yet</td></tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-b border-glass-divider text-label text-ink">
                  <td className="px-2 py-3 whitespace-nowrap">{fmtDay(p.paid_at?.slice(0, 10), false)}</td>
                  <td className="max-w-[160px] px-2 py-3">{p.description}</td>
                  <td className="px-2 py-3">{p.method_label}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{p.reference}</td>
                  <td className="px-2 py-3">{p.received_by_name || "—"}</td>
                  <td className="px-2 py-3 text-right text-body font-semibold whitespace-nowrap">{money(p.amount)}</td>
                  <td className="px-1 py-3"><button type="button" aria-label={`Receipt ${p.reference}`} onClick={onReceipt} className="flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-ink-3 hover:bg-glass-inset hover:text-ink"><Receipt className="size-4" /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-2"><span className="text-body font-medium text-ink-2">Total paid</span><span className="text-body font-semibold text-ink">{money(total || (b.paid_total ?? 0))}</span></div>
    </Panel>
  );
}

function ActivityCard({ booking: b }: { booking: Booking }) {
  const add = useAddBookingNoteMutation();
  const [text, setText] = useState("");
  const items = b.activity ?? [];
  function submit() {
    const t = text.trim();
    if (!t) return;
    add.mutate({ id: b.id, text: t }, { onSuccess: () => setText(""), onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add note") });
  }
  return (
    <Panel eyebrow="Activity">
      {items.length === 0 ? <p className="text-label text-ink-3">Nothing recorded yet.</p> : null}
      <ol className="flex flex-col gap-3.5">
        {items.map((a) => (
          <li key={a.id} className="flex gap-3">
            <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", a.type === "note" ? "bg-ink-3" : "bg-brand")} aria-hidden />
            <span className="flex min-w-0 flex-col">
              <span className="text-body font-semibold text-ink">{a.type === "note" ? a.detail : a.label}</span>
              {a.type !== "note" && a.detail ? <span className="text-label text-ink-2">{a.detail}</span> : null}
              <span className="text-label text-ink-3">{fmtStampDot(a.at)}{a.actor_name ? ` · ${a.actor_name}` : ""}</span>
            </span>
          </li>
        ))}
      </ol>
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="glass-2 flex h-11 items-center gap-2 rounded-[14px] px-3.5 focus-within:ring-2 focus-within:ring-brand-border">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a note for the next shift…" className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-3" aria-label="Add a note" />
        <button type="submit" aria-label="Add note" disabled={!text.trim() || add.isPending} className="flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-ink-2 hover:text-ink disabled:opacity-40"><Plus className="size-4" /></button>
      </form>
    </Panel>
  );
}

function StayCard({ booking: b }: { booking: Booking }) {
  const total = Math.max(1, nights(b.move_in, b.check_out));
  const today = todayKey();
  const left = Math.max(0, nights(today, b.check_out));
  const elapsed = Math.min(1, Math.max(0, nights(b.move_in, today) / total));
  const reserved = bookingDisplayStatus(b) === "reserved";
  const length = b.stay_unit === "night" ? `${b.nights ?? total} night${(b.nights ?? total) === 1 ? "" : "s"}` : `${b.months} month${b.months === 1 ? "" : "s"}`;
  return (
    <Panel eyebrow="Stay" action={b.room_id ? <Link to="/admin/rooms/$id" params={{ id: b.room_id }} className="text-body font-semibold text-brand-text underline outline-none focus-visible:ring-2 focus-visible:ring-brand-border">View room →</Link> : null}>
      <div className="flex items-center gap-3">
        <span className="size-[52px] shrink-0 overflow-hidden rounded-[12px]"><RoomThumbnail src={b.room_image ?? null} iconClassName="size-5" /></span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-body font-semibold text-ink">{[b.room_number != null ? `Room ${b.room_number}` : null, b.seat_label || b.room_name].filter(Boolean).join(" · ")}</span>
          <span className="truncate text-label text-ink-2">{[b.seat_label ? b.room_name : null, b.room_floor != null ? `Floor ${b.room_floor}` : null, b.seat_label ? null : "whole room"].filter(Boolean).join(" · ")}</span>
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {[
          ["Move-in", `${fmtDay(b.move_in, false)}${reserved && b.expected_arrival_time ? ` · ${b.expected_arrival_time}` : ""}`],
          ["Move-out", fmtDay(b.check_out, false)],
          ["Length", length],
          ["Seats", String(b.seats_booked)],
        ].map(([l, v]) => (
          <div key={l} className="flex flex-col"><span className="text-label text-ink-3">{l}</span><span className="text-body font-medium text-ink">{v}</span></div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <span className="text-eyebrow text-ink-2 uppercase">Stay timeline</span>
          <span className="text-label font-medium text-brand-text">{reserved ? `Arrives ${b.move_in === today ? "today" : fmtDay(b.move_in, false)}${b.expected_arrival_time ? ` ${b.expected_arrival_time}` : ""}` : `${left} night${left === 1 ? "" : "s"} left`}</span>
        </div>
        <div className="relative h-2 rounded-[8px] bg-glass-inset">
          <div className="h-2 rounded-[8px] bg-brand" style={{ width: `${(reserved ? 0 : elapsed) * 100}%` }} />
          <span aria-hidden className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-brand bg-glass-3" style={{ left: `${(reserved ? 0 : elapsed) * 100}%` }} />
        </div>
        <div className="flex justify-between text-label text-ink-2"><span>{fmtDay(b.move_in)} · in</span><span>{fmtDay(b.check_out)} · out</span></div>
      </div>
    </Panel>
  );
}

function BillingCard({ booking: b }: { booking: Booking }) {
  const [cur, setCur] = useState<"pkr" | "usd">((b.currency as "pkr" | "usd") ?? "pkr");
  const native = (b.currency ?? "pkr") as "pkr" | "usd";
  const rate = native === cur ? 1 : null; // other-currency view only when amounts exist in that currency
  const money = (n: number | null | undefined) => (rate == null ? "—" : formatMoney((Number(n) || 0) * rate, cur));
  const monthly = b.rent_unit === "night" ? 0 : (b.rent_amount ?? 0);
  const firstMonth = b.rent_ledger?.[0];
  const firstLabel = firstMonth ? pk(`${firstMonth.month}-01`)?.toLocaleDateString("en-GB", { month: "short" }) : null;
  const balance = Math.max(0, b.balance_due ?? 0);
  const payTag = b.no_charge ? null : balance <= 0 && (b.paid_total ?? 0) > 0 ? { tone: "success" as const, label: "Paid" } : (b.paid_total ?? 0) > 0 ? { tone: "warning" as const, label: "Partial" } : { tone: "danger" as const, label: "Unpaid" };
  const lines: [string, number | null | undefined][] = [
    [b.rent_unit === "night" ? "Rate / night" : "Rent / month", b.rent_unit === "night" ? b.rent_amount : monthly],
    ...(firstMonth ? [[`${firstLabel} (${firstMonth.rent_amount && monthly && firstMonth.rent_amount < monthly ? "prorated" : "full month"})`, firstMonth.rent_amount] as [string, number | null]] : []),
    [`Full stay (${b.stay_unit === "night" ? `${b.nights} nights` : `${b.months} mo`})`, b.total_amount],
    ...(b.security_amount ? [["Security deposit (once)", b.security_amount] as [string, number], ["Returnable security", b.security_returnable ?? b.security_amount] as [string, number]] : []),
  ];
  return (
    <Panel
      eyebrow="Billing"
      action={
        <div role="radiogroup" aria-label="Currency" className="flex gap-0.5 rounded-[10px] border border-glass-divider bg-glass-inset p-[3px]">
          {(["pkr", "usd"] as const).map((c) => (
            <button key={c} type="button" role="radio" aria-checked={cur === c} onClick={() => setCur(c)} disabled={c !== native} title={c !== native ? `This booking is billed in ${native.toUpperCase()}` : undefined} className={cn("cursor-pointer rounded-[8px] px-2.5 py-[3px] text-label outline-none disabled:cursor-not-allowed disabled:opacity-50", cur === c ? "bg-brand-tint text-ink" : "text-ink-3")}>
              {c === "pkr" ? "PKR (Rs)" : "USD ($)"}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex flex-col gap-3.5">
        {lines.map(([l, v]) => (
          <div key={l} className="flex justify-between text-label"><span className="text-ink-2">{l}</span><span className="text-body text-ink">{money(v)}</span></div>
        ))}
      </div>
      <div className="mt-2 flex items-end justify-between"><span className="text-body font-medium text-ink">Total paid</span><span className="text-[28px] leading-9 font-semibold tracking-tight text-ink">{money(b.paid_total)}</span></div>
      <div className="flex items-center justify-between">
        <span className="text-body text-ink-2">Balance due</span>
        <span className="flex items-center gap-2"><span className={cn("text-body font-semibold", balance > 0 ? "text-danger" : "text-ink")}>{money(balance)}</span>{payTag ? <Tag tone={payTag.tone} showDot>{payTag.label}</Tag> : null}</span>
      </div>
      <div className="flex justify-between text-label"><span className="text-ink-3">Next due</span><span className="text-ink-2">{b.no_charge || !b.next_due_date ? "—" : b.due_on_arrival ? `On arrival · ${money(b.next_due_amount)}` : `${fmtDay(b.next_due_date, false)} · ${money(b.next_due_amount)}`}</span></div>
    </Panel>
  );
}

function GlassModal({ open, onOpenChange, title, wide, children }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; wide?: boolean; children: ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className={cn("glass-3 fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100svh-32px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 overflow-y-auto rounded-[24px] p-5 font-geist text-ink outline-none", wide ? "w-[min(880px,calc(100vw-32px))]" : "w-[min(560px,calc(100vw-32px))]")}>
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-card-title text-ink">{title}</Dialog.Title>
            <Dialog.Close aria-label="Close" className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-inset hover:text-ink"><X className="size-4" /></Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
