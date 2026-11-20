import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarPlus, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, Eye, FileText, Loader2, LogOut, Mail, MapPin, MessageCircle, Pencil, Phone, Plus } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, Tag } from "@/components/glass";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EditBookingDialog } from "@/components/admin/edit-booking-dialog";
import { RentStatusPill } from "@/components/admin/residents/rent-status";
import { ResidentPaymentSheet } from "@/components/admin/resident-profile/resident-payment-sheet";
import { CheckoutSettleDialog } from "@/components/admin/resident-profile/checkout-settle-dialog";
import { CreateInvoiceDialog } from "@/components/admin/resident-profile/create-invoice-dialog";
import {
  ActivityList,
  Card,
  ContactCard,
  ExtrasCard,
  MoneySummary,
  NotesCard,
  PaymentsLedger,
  SecurityCard,
  StayDetails,
  ThisMonthCard,
  TimelineCard,
} from "@/components/admin/resident-profile/profile-sections";
import { DocumentsTab, InvoicesTab } from "@/components/admin/resident-profile/profile-tabs";
import { dayMonYear, focusMonth, initials, monLong, monShort, monthKeyOf, monthRows, parseKey } from "@/components/admin/resident-profile/profile-utils";
import { downloadResidentDossierPdfApi, downloadResidentMonthInvoiceApi } from "@/api/residents";
import { useBookingQuery } from "@/queries/bookings/useBookingQuery";
import { useUpdateBookingDetailsMutation } from "@/queries/bookings";
import { useAddBookingNoteMutation } from "@/queries/bookings/useBookingDetailActions";
import { useResidentDetailQuery, useResidentsRollQuery, useSendResidentRemindersMutation, useUpdateResidentMutation } from "@/queries/residents";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { RentPaymentStatus } from "@/types/domain/resident.types";
import { CountUp } from "@/components/admin/dashboard/dashboard-motion";

type TabKey = "overview" | "payments" | "invoices" | "documents" | "activity";

/** Figma 07.14–07.19 / 07.28 · Resident profile. */
export const Route = createFileRoute("/admin/residents/$id")({
  validateSearch: (s: Record<string, unknown>): { tab?: TabKey } => (["payments", "invoices", "documents", "activity"].includes(String(s.tab)) ? { tab: s.tab as TabKey } : {}),
  component: ResidentProfilePage,
});

function ResidentProfilePage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const tab: TabKey = search.tab ?? "overview";
  const navigate = useNavigate({ from: "/admin/residents/$id" });
  const token = useAuthStore((s) => s.token);
  const { hostelId } = useHostelScope();
  const { data: booking, isLoading: bLoading, isError } = useBookingQuery(id);
  const { data: detail, isLoading: dLoading } = useResidentDetailQuery(id);
  const nav = useResidentsRollQuery({ month: monthKeyOf(), hostel: hostelId ?? undefined, sort: "not_paid_first", limit: 100 }, { enabled: Boolean(hostelId) });
  const update = useUpdateResidentMutation();
  const details = useUpdateBookingDetailsMutation();
  const addNote = useAddBookingNoteMutation();
  const remind = useSendResidentRemindersMutation();

  const [payOpen, setPayOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [collecting, setCollecting] = useState(false);

  const rows = useMemo(() => (detail ? monthRows(detail) : []), [detail]);
  const month = detail ? focusMonth(detail) : monthKeyOf();
  const mRow = rows.find((m) => m.month === month);

  if (bLoading || dLoading) return <ProfileSkeleton />;
  if (isError || !booking || !detail) {
    return (
      <div className="glass-2 flex flex-col items-center gap-3 rounded-[22px] px-6 py-16 text-center">
        <p className="text-card-title text-ink">Resident not found</p>
        <Link to="/admin/residents" className="text-body font-medium text-brand-text">Back to Residents</Link>
      </div>
    );
  }

  const cur = booking.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);
  const living = ["pending", "confirmed", "checked_in"].includes(booking.status);
  const ids = nav.data?.residents.map((r) => r.booking_id) ?? [];
  const idx = ids.indexOf(id);
  const prev = idx > 0 ? ids[idx - 1] : null;
  const next = idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null;
  const monthStatus: RentPaymentStatus = mRow ? (mRow.left <= 0 && mRow.extras - mRow.extrasPaid <= 0 ? "paid" : mRow.collected + mRow.extrasPaid > 0 ? "partial" : mRow.payment_status) : "not_paid";
  const activeExtras = (detail.extras ?? []).filter((e) => e.status !== "ended" && e.billing_cycle === "monthly");
  const monthIndex = rows.findIndex((m) => m.month === month) + 1;
  const billedToDate = rows.filter((m) => m.month <= monthKeyOf()).reduce((s, m) => s + (Number(m.rent_amount) || 0) + m.extras, 0);
  const dueMonths = rows.filter((m) => m.month <= monthKeyOf() && m.left > 0).map((m) => monLong(m.month));
  const notes = (booking.activity ?? []).filter((a) => a.type === "note");
  const daysLeft = booking.check_out ? Math.ceil((parseKey(booking.check_out).getTime() - Date.now()) / 86400000) : null;
  const ending = living && daysLeft != null && daysLeft <= 30 && daysLeft >= 0;
  const phoneDigits = (booking.guest_phone ?? "").replace(/\D/g, "").replace(/^0/, "92");
  const roomTag = [booking.room_number != null ? `Room ${booking.room_number}` : booking.room_title, booking.seat_label, booking.room_name && booking.room_name !== booking.room_title ? booking.room_name : null].filter(Boolean).join(" · ");
  const occupation = booking.resident_type === "student" ? ["Student", booking.guest_institution].filter(Boolean).join(" · ") : booking.resident_type === "employee" ? ["Employee", booking.guest_company].filter(Boolean).join(" · ") : null;
  const setTab = (t: TabKey) => void navigate({ search: { tab: t === "overview" ? undefined : t } });

  async function collect() {
    setCollecting(true);
    try {
      await update.mutateAsync({ bookingId: id, input: { month, payment_status: "paid" } });
      for (const e of detail!.extras ?? []) {
        const p = (e.timeline ?? e.ledger ?? []).find((x) => x.month === month);
        if (p && p.payment_status !== "paid") await update.mutateAsync({ bookingId: id, input: { month, update_extra: { extra_id: e.id, payment_status: "paid", month } } });
      }
      toast.success(`${monLong(month)} marked paid${booking!.guest_email ? " · receipt emailed" : ""}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update");
    } finally {
      setCollecting(false);
    }
  }
  const extend = (n: number) =>
    details.mutate(
      { id, input: { months: (booking.months || 1) + n, recalculate_total: true } },
      { onSuccess: () => toast.success(`Stay extended by ${n} month${n === 1 ? "" : "s"}`), onError: (e) => toast.error(e instanceof Error ? e.message : "Could not extend") },
    );
  const download = (kind: "invoice" | "record") => {
    if (!token) return;
    const run = kind === "invoice" ? downloadResidentMonthInvoiceApi(token, id, month) : downloadResidentDossierPdfApi(token, id);
    toast.promise(run, { loading: "Preparing PDF…", success: "Downloaded", error: (e) => (e instanceof Error ? e.message : "Download failed") });
  };

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "payments", label: "Payments", count: booking.payments?.length ?? 0 },
    { key: "invoices", label: "Invoices & receipts", count: rows.filter((m) => m.month <= monthKeyOf()).length },
    { key: "documents", label: "Documents", count: [detail.resident.cnic_image_front, detail.resident.cnic_image_back, detail.resident.b_form_image, detail.resident.cnic_pdf].filter(Boolean).length },
    { key: "activity", label: "Activity" },
  ];

  const ExtendMenu = (
    <Popover>
      <PopoverTrigger asChild><GlassButton size="sm"><CalendarPlus aria-hidden /> Extend stay</GlassButton></PopoverTrigger>
      <PopoverContent align="end" className="glass-3 w-[220px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
        <p className="px-3 pt-2 pb-1 text-eyebrow text-ink-3 uppercase">Add months</p>
        {[1, 2, 3, 6].map((n) => (
          <PopoverClose key={n} onClick={() => extend(n)} className="flex w-full cursor-pointer items-center justify-between rounded-[10px] px-3 py-2 text-left text-body hover:bg-glass-inset">
            +{n} month{n === 1 ? "" : "s"}
            {booking.check_out ? <span className="text-label text-ink-3">to {dayMonYear(shiftDate(booking.check_out, n))}</span> : null}
          </PopoverClose>
        ))}
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="flex flex-col gap-4 pb-24 md:pb-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/admin/residents" search={living ? {} : { tab: "moved_out" }} className="flex items-center gap-1 text-body font-medium text-ink-2 hover:text-ink"><ChevronLeft className="size-4" aria-hidden />Residents · {living ? "Living here" : "Moved out"}</Link>
        {idx >= 0 ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-label text-ink-3 sm:inline">Not paid first</span>
            <div className="glass-3 flex items-center gap-1 rounded-[12px] p-1">
              {prev ? <Link to="/admin/residents/$id" params={{ id: prev }} aria-label="Previous resident" className="flex size-7 items-center justify-center rounded-[8px] text-ink hover:bg-glass-inset"><ChevronLeft className="size-4" aria-hidden /></Link> : <span className="flex size-7 items-center justify-center text-ink-3 opacity-40"><ChevronLeft className="size-4" aria-hidden /></span>}
              <span className="px-1 text-label font-medium text-ink">{idx + 1} of {ids.length}</span>
              {next ? <Link to="/admin/residents/$id" params={{ id: next }} aria-label="Next resident" className="flex size-7 items-center justify-center rounded-[8px] text-ink hover:bg-glass-inset"><ChevronRight className="size-4" aria-hidden /></Link> : <span className="flex size-7 items-center justify-center text-ink-3 opacity-40"><ChevronRight className="size-4" aria-hidden /></span>}
            </div>
          </div>
        ) : null}
      </div>

      {/* Header + KPI strip */}
      <section className="glass-2 flex flex-col gap-5 rounded-[24px] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full border border-glass-stroke bg-glass-inset text-[22px] font-semibold text-ink-2 md:size-[76px]">{initials(booking.guest_name)}</span>
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-page-title text-ink">{booking.guest_name}</h1>
                {living ? <RentStatusPill status={monthStatus} /> : <Tag tone="neutral" showDot>Moved out</Tag>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {occupation ? <span className="rounded-full border border-glass-stroke px-2 py-0.5 text-label text-ink-2">{occupation}</span> : null}
                {roomTag ? <span className="rounded-full border border-glass-stroke px-2 py-0.5 text-label text-ink-2">{roomTag}</span> : null}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-label text-ink-2 [&_svg]:size-3.5">
                {booking.guest_phone ? <span className="flex items-center gap-1"><Phone aria-hidden />{booking.guest_phone}</span> : null}
                {booking.guest_email ? <span className="flex items-center gap-1"><Mail aria-hidden />{booking.guest_email}</span> : null}
                <span className="flex items-center gap-1"><MapPin aria-hidden />Booking {booking.booking_code ?? booking.id.slice(-6).toUpperCase()} · {booking.source?.replace(/_/g, "-") || "direct"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {booking.guest_phone ? <a href={`tel:${booking.guest_phone}`} aria-label="Call" className="glass-3 flex size-10 items-center justify-center rounded-[12px] text-ink [&_svg]:size-4"><Phone aria-hidden /></a> : null}
            {phoneDigits ? <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer" aria-label="Message on WhatsApp" className="glass-3 flex size-10 items-center justify-center rounded-[12px] text-ink [&_svg]:size-4"><MessageCircle aria-hidden /></a> : null}
            <button type="button" aria-label="Edit booking" onClick={() => setEditOpen(true)} className="glass-3 flex size-10 cursor-pointer items-center justify-center rounded-[12px] text-ink [&_svg]:size-4"><Pencil aria-hidden /></button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><GlassButton variant="glass"><ChevronDown aria-hidden /> More</GlassButton></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-3 min-w-[210px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-[10px]" onSelect={() => setInvoiceOpen(true)}><FileText className="size-4" />Create invoice</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-[10px]" onSelect={() => download("record")}><Download className="size-4" />Download full record</DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-[10px]"><Link to="/admin/bookings/$id" params={{ id }}><Eye className="size-4" />Open booking</Link></DropdownMenuItem>
                {living ? (
                  <>
                    <DropdownMenuSeparator className="bg-glass-divider" />
                    <DropdownMenuItem className="cursor-pointer gap-2 rounded-[10px]" onSelect={() => setCheckoutOpen(true)}><LogOut className="size-4" />Check out &amp; settle</DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
            <GlassButton className="hidden md:inline-flex" onClick={() => setPayOpen(true)}><Plus aria-hidden /> Record payment</GlassButton>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-glass-divider pt-5 md:grid-cols-5">
          <Kpi label="Monthly rent" value={money(Number(mRow?.rent_amount ?? booking.rent_amount ?? 0))} sub={activeExtras.length ? activeExtras.map((e) => `+ ${e.label} ${money(e.amount)}`).join(" · ") : "No extras"} />
          <Kpi label="Balance due" value={money(booking.balance_due ?? 0)} danger={(booking.balance_due ?? 0) > 0} sub={dueMonths.length ? `${dueMonths.slice(0, 2).join(", ")} rent` : "Nothing due"} />
          <Kpi label="Paid so far" value={money(booking.paid_total ?? 0)} sub={`of ${money(billedToDate)} billed`} />
          <Kpi label="Security deposit" value={money(Number(booking.security_amount) || 0)} sub={booking.security_status === "paid" || booking.security_status === "held" ? "Held · refundable" : booking.security_status === "returned" ? "Returned" : booking.security_status === "not_paid" ? "Not paid yet" : "None"} />
          <Kpi label="Stay" value={monthIndex > 0 ? `Month ${monthIndex} of ${rows.length}` : `${rows.length} months`} sub={booking.move_in && booking.check_out ? `${monShort(booking.move_in)} – ${dayMonYear(booking.check_out)}` : ""} />
        </div>
      </section>

      <div role="tablist" aria-label="Profile" className="no-scrollbar flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-[14px] border border-glass-divider bg-glass-inset p-1">
        {tabs.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)} className={cn("flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] border px-3.5 text-body font-medium whitespace-nowrap", tab === t.key ? "glass-3 border-glass-stroke text-ink" : "border-transparent text-ink-2 hover:text-ink")}>
            {t.label}
            {t.count != null ? <span className="rounded-full bg-glass-2 px-1.5 text-label text-ink-3">{t.count}</span> : null}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
          {ending ? (
            <div className="glass-2 flex flex-wrap items-center gap-3 rounded-[18px] px-4 py-3">
              <Clock className="size-5 shrink-0 text-ink-2" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-body font-semibold text-ink">Stay ends {dayMonYear(booking.check_out)} · {daysLeft} day{daysLeft === 1 ? "" : "s"} left</p>
                <p className="text-label text-ink-3">Extend the stay to keep billing from {monLong(shiftDate(booking.check_out!, 1))}, or start check-out to settle the deposit.</p>
              </div>
              <GlassButton size="sm" variant="glass" onClick={() => setCheckoutOpen(true)}><LogOut aria-hidden /> Start check-out</GlassButton>
              {ExtendMenu}
            </div>
          ) : null}
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-4">
              <ThisMonthCard
                booking={booking}
                detail={detail}
                month={month}
                row={mRow}
                busy={collecting}
                onCollect={() => void collect()}
                onOther={() => setPayOpen(true)}
                onRemind={() =>
                  remind.mutate(
                    { month, booking_ids: [id], statuses: ["not_paid", "partial"] },
                    { onSuccess: (r) => (r.sent ? toast.success("Reminder emailed") : toast.error("Reminder not sent")), onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send") },
                  )
                }
                onInvoice={() => download("invoice")}
                onDiscount={(rent, forward) => update.mutateAsync({ bookingId: id, input: { month, monthly_rent: rent, ...(forward ? { apply_rent_forward: true } : {}) } }).then(() => toast.success(rent === 0 && !forward ? `${monLong(month)} rent waived` : `Rent set to ${money(rent)}${forward ? ` from ${monLong(month)}` : ` for ${monLong(month)}`}`))}
              />
              <TimelineCard rows={rows} booking={booking} onLedger={() => setTab("payments")} />
              <ExtrasCard
                extras={detail.extras ?? []}
                currency={cur}
                month={month}
                onAdd={(x) => update.mutateAsync({ bookingId: id, input: { month, add_extra: { ...x, start_month: month } } }).then(() => toast.success(`${x.label} added`))}
                onRemove={(extraId) => update.mutate({ bookingId: id, input: { remove_extra: extraId } }, { onSuccess: () => toast.success("Removed") })}
                onEnd={(extraId) => update.mutate({ bookingId: id, input: { month, update_extra: { extra_id: extraId, status: "ended", end_month: month } } }, { onSuccess: () => toast.success("Ended") })}
              />
              <Card title="Activity" sub="Every change, payment and message" action={<button type="button" onClick={() => setTab("activity")} className="flex cursor-pointer items-center gap-1 text-label font-medium text-ink-2 hover:text-ink"><ChevronRight className="size-3.5" aria-hidden />View all</button>}>
                <ActivityList items={booking.activity ?? []} limit={5} />
              </Card>
            </div>
            <div className="flex flex-col gap-4">
              <MoneySummary booking={booking} detail={detail} rows={rows} />
              <SecurityCard booking={booking} onSettle={() => setCheckoutOpen(true)} />
              <StayDetails
                booking={booking}
                rows={rows}
                onEdit={() => setEditOpen(true)}
                onHistory={() => setTab("payments")}
                togglingReminders={update.isPending}
                onToggleReminders={(on) => update.mutate({ bookingId: id, input: { rent_reminders_enabled: on } }, { onSuccess: () => toast.success(on ? "Automatic reminders on" : "Automatic reminders off") })}
              />
              <ContactCard detail={detail} booking={booking} />
              <NotesCard notes={notes} adding={addNote.isPending} onAdd={(text) => addNote.mutateAsync({ id, text }).then(() => toast.success("Note saved"))} />
            </div>
          </div>
        </>
      ) : tab === "payments" ? (
        <PaymentsLedger booking={booking} rows={rows} />
      ) : tab === "invoices" ? (
        <InvoicesTab booking={booking} detail={detail} rows={rows} onNewInvoice={() => setInvoiceOpen(true)} />
      ) : tab === "documents" ? (
        <DocumentsTab booking={booking} detail={detail} />
      ) : (
        <Card title="Activity" sub="Every change, payment and message">
          <ActivityList items={booking.activity ?? []} />
        </Card>
      )}

      {/* Mobile sticky actions (Figma 07.28) */}
      <div className="glass-3 fixed inset-x-3 bottom-[96px] z-30 flex gap-2 rounded-[18px] p-2 md:hidden">
        <GlassButton variant="glass" className="flex-1" onClick={() => setInvoiceOpen(true)}><FileText aria-hidden /> Invoice</GlassButton>
        <GlassButton className="flex-1" onClick={() => setPayOpen(true)}>{collecting ? <Loader2 className="animate-spin" aria-hidden /> : <Plus aria-hidden />} Record payment</GlassButton>
      </div>

      <ResidentPaymentSheet booking={booking} detail={detail} open={payOpen} onOpenChange={setPayOpen} />
      <CreateInvoiceDialog booking={booking} detail={detail} open={invoiceOpen} onOpenChange={setInvoiceOpen} />
      <CheckoutSettleDialog booking={booking} detail={detail} open={checkoutOpen} onOpenChange={setCheckoutOpen} />
      <EditBookingDialog booking={booking} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}

function shiftDate(k: string, months: number) {
  const d = parseKey(k.slice(0, 10));
  d.setMonth(d.getMonth() + months);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Kpi({ label, value, sub, danger }: { label: string; value: string; sub: string; danger?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 md:border-l md:border-glass-divider md:pl-4 md:first:border-l-0 md:first:pl-0">
      <span className="text-eyebrow text-ink-3 uppercase">{label}</span>
      <span className={cn("truncate text-[22px] leading-7 font-semibold tracking-tight md:text-[26px] md:leading-8", danger ? "text-danger" : "text-ink")}><CountUp value={value} delay={250} /></span>
      <span className="truncate text-label text-ink-3">{sub}</span>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-6 w-48 animate-pulse rounded-full bg-glass-inset" />
      <div className="glass-2 h-[220px] animate-pulse rounded-[24px]" />
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="glass-2 h-[420px] animate-pulse rounded-[22px]" />
        <div className="glass-2 h-[420px] animate-pulse rounded-[22px]" />
      </div>
    </div>
  );
}
