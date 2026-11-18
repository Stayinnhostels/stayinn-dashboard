import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, Download, FileText, Loader2, Printer, Send, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, GlassCheckbox, LogoMark } from "@/components/glass";
import { downloadResidentMonthInvoiceApi } from "@/api/residents";
import { useEmailResidentInvoiceMutation } from "@/queries/residents";
import { usePublicPropertySettingsQuery } from "@/queries/settings/usePropertySettingsQuery";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/domain/booking.types";
import type { ResidentDetail } from "@/types/domain/resident.types";
import { RentStatusPill } from "@/components/admin/residents/rent-status";
import { dayMonYear, monLong, monShort, monthKeyOf, monthRows, todayKey } from "./profile-utils";

type Preset = "this" | "unpaid" | "stay" | "custom";
const addDays = (k: string, n: number) => {
  const [y, m, d] = k.split("-").map(Number);
  const x = new Date(y, m - 1, d + n);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

/** Figma 07.18 · Create invoice (with preview). */
export function CreateInvoiceDialog({ booking, detail, open, onOpenChange }: { booking: Booking; detail: ResidentDetail; open: boolean; onOpenChange: (o: boolean) => void }) {
  const token = useAuthStore((s) => s.token);
  const email = useEmailResidentInvoiceMutation();
  const { data: property } = usePublicPropertySettingsQuery();
  const previewRef = useRef<HTMLDivElement>(null);
  const cur = booking.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);
  const now = monthKeyOf();
  const rows = useMemo(() => monthRows(detail).filter((m) => m.month <= now).reverse(), [detail, now]);

  const [preset, setPreset] = useState<Preset>("unpaid");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [withExtras, setWithExtras] = useState(true);
  const [withPayments, setWithPayments] = useState(true);
  const [withSecurity, setWithSecurity] = useState(false);
  const [date, setDate] = useState(todayKey());
  const [payBy, setPayBy] = useState(addDays(todayKey(), 4));
  const [note, setNote] = useState("");
  const [downloading, setDownloading] = useState(false);

  const apply = (p: Preset) => {
    setPreset(p);
    if (p === "this") setPicked(new Set(rows.filter((m) => m.month === now).map((m) => m.month)));
    if (p === "unpaid") setPicked(new Set(rows.filter((m) => m.payment_status !== "paid" && m.payment_status !== "returned").map((m) => m.month)));
    if (p === "stay") setPicked(new Set(rows.map((m) => m.month)));
  };
  useEffect(() => {
    if (!open) return;
    apply(rows.some((m) => m.payment_status !== "paid" && m.payment_status !== "returned") ? "unpaid" : "this");
    setWithExtras(true);
    setWithPayments(true);
    setWithSecurity(false);
    setDate(todayKey());
    setPayBy(addDays(todayKey(), 4));
    setNote("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const chosen = rows.filter((m) => picked.has(m.month)).sort((a, b) => a.month.localeCompare(b.month));
  const months = chosen.map((m) => m.month);
  const extrasForMonths = (detail.extras ?? []).flatMap((e) =>
    (e.timeline ?? e.ledger ?? []).filter((p) => months.includes(p.month)).map((p) => ({ label: `${e.label} · ${monLong(p.month)} ${p.month.slice(0, 4)}`, amount: Number(p.amount) || 0, paid: Number(p.collected_amount ?? (p.payment_status === "paid" ? p.amount : 0)) || 0 })),
  );
  const lines = [
    ...chosen.map((m) => ({ label: `Room rent · ${monLong(m.month)} ${m.month.slice(0, 4)}`, amount: Number(m.rent_amount) || 0 })),
    ...(withExtras ? extrasForMonths.map((e) => ({ label: e.label, amount: e.amount })) : []),
  ];
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const paidLines = withPayments
    ? (booking.payments ?? [])
        .filter((p) => p.paid_at && months.includes(p.paid_at.slice(0, 7)))
        .map((p) => ({ label: `Paid ${new Date(p.paid_at as string).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${p.method_label} · ${p.reference}`, amount: p.amount }))
    : [];
  const paidFromMonths = chosen.reduce((s, m) => s + m.collected, 0) + (withExtras ? extrasForMonths.reduce((s, e) => s + e.paid, 0) : 0);
  const paidShown = withPayments ? paidFromMonths : 0;
  const balance = Math.max(0, subtotal - paidShown);
  const invNo = months.length ? `INV-${months[0].replace("-", "")}-${booking.id.slice(-4).toUpperCase()}` : "—";
  const stayRange = [booking.move_in, booking.check_out].map((k) => (k ? `${monShort(k)} ${k.slice(0, 4)}` : "")).join(" – ");

  async function download() {
    if (!token || !months.length) return;
    setDownloading(true);
    try {
      await downloadResidentMonthInvoiceApi(token, booking.id, months);
      toast.success("Invoice downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  function print() {
    const el = previewRef.current;
    if (!el) return;
    const w = window.open("", "_blank", "width=820,height=1000");
    if (!w) return toast.error("Allow pop-ups to print the invoice");
    const styles = [...document.querySelectorAll('style,link[rel="stylesheet"]')].map((n) => n.outerHTML).join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${invNo}</title>${styles}<style>body{background:#fff;padding:24px}</style></head><body class="font-geist">${el.outerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => {
      w.focus();
      w.print();
    }, 400);
  }

  function send() {
    if (!months.length) return;
    email.mutate(
      { bookingId: booking.id, months, note: note.trim() || undefined },
      { onSuccess: (r) => { toast.success(`Invoice emailed to ${r.to}`); onOpenChange(false); }, onError: (e) => toast.error(e instanceof Error ? e.message : "Could not email the invoice") },
    );
  }

  const presetBtn = (p: Preset, label: string) => (
    <button key={p} type="button" onClick={() => apply(p)} className={cn("h-8 cursor-pointer rounded-full border px-3 text-label font-medium", preset === p ? "border-ink/60 bg-glass-3 text-ink" : "border-glass-divider bg-glass-inset text-ink-2 hover:text-ink")}>{label}</button>
  );
  const toggle = (on: boolean, set: (v: boolean) => void, title: string, sub: string) => (
    <label className="flex cursor-pointer items-center gap-3 rounded-[12px] bg-glass-inset px-3 py-2.5">
      <span className="min-w-0 flex-1"><span className="block text-body font-medium text-ink">{title}</span><span className="block text-label text-ink-3">{sub}</span></span>
      <button type="button" role="switch" aria-checked={on} onClick={() => set(!on)} className={cn("relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors", on ? "bg-brand" : "bg-glass-2 ring-1 ring-glass-stroke")}>
        <span className={cn("absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform", on && "translate-x-4")} />
      </button>
    </label>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="glass-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[94svh] flex-col overflow-hidden rounded-t-[28px] font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:max-h-[calc(100svh-48px)] md:w-[min(1040px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px]">
          <div className="flex items-start gap-3 border-b border-glass-divider px-6 py-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-tint text-brand-text [&_svg]:size-[18px]"><FileText aria-hidden /></span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-hero text-ink">Create invoice</Dialog.Title>
              <p className="text-label text-ink-2">{booking.guest_name} · choose what to include and how to send it</p>
            </div>
            <Dialog.Close aria-label="Close" className="glass-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] text-ink"><X className="size-[18px]" aria-hidden /></Dialog.Close>
          </div>

          <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[minmax(0,420px)_1fr]">
            <div className="flex flex-col gap-4 border-glass-divider px-6 py-4 md:border-r">
              <div className="flex flex-col gap-2">
                <p className="text-body font-semibold text-ink">Months</p>
                <div className="flex flex-wrap gap-2">{presetBtn("this", "This month")}{presetBtn("unpaid", "Unpaid only")}{presetBtn("stay", "Whole stay")}{presetBtn("custom", "Custom")}</div>
                <div className="max-h-[220px] overflow-y-auto rounded-[14px] border border-glass-divider bg-glass-inset">
                  {rows.map((m) => {
                    const on = picked.has(m.month);
                    return (
                      <label key={m.month} className={cn("flex cursor-pointer items-center gap-3 border-b border-glass-divider px-3 py-2.5 last:border-b-0", on && "bg-brand-tint")}>
                        <GlassCheckbox checked={on} onCheckedChange={() => { setPreset("custom"); setPicked((c) => { const nx = new Set(c); if (nx.has(m.month)) nx.delete(m.month); else nx.add(m.month); return nx; }); }} aria-label={monLong(m.month)} />
                        <span className="flex-1 text-body text-ink">{monLong(m.month)} {m.month.slice(0, 4)}</span>
                        <RentStatusPill status={m.payment_status} className="h-5 px-2 text-[11px]" />
                        <span className="w-20 text-right text-body font-semibold text-ink">{money((Number(m.rent_amount) || 0) + m.extras)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-body font-semibold text-ink">Include</p>
                {toggle(withExtras, setWithExtras, "Extra facilities", (detail.extras ?? []).map((e) => `${e.label} ${money(e.amount)}`).join(" · ") || "None on this stay")}
                {toggle(withPayments, setWithPayments, "Payments already made", `Shows ${money(paidFromMonths)} paid and the balance`)}
                {toggle(withSecurity, setWithSecurity, "Security deposit", `${money(Number(booking.security_amount) || 0)} held · shown as a note`)}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5"><span className="text-label font-medium text-ink-2">Invoice date</span><span className="glass-2 flex h-11 items-center gap-2 rounded-[14px] px-3"><CalendarDays className="size-4 text-ink-3" aria-hidden /><input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} onClick={(e) => e.currentTarget.showPicker?.()} className="w-full cursor-pointer bg-transparent text-body text-ink outline-none [&::-webkit-calendar-picker-indicator]:hidden" /></span></label>
                <label className="flex flex-col gap-1.5"><span className="text-label font-medium text-ink-2">Pay by</span><span className="glass-2 flex h-11 items-center gap-2 rounded-[14px] px-3"><CalendarDays className="size-4 text-ink-3" aria-hidden /><input type="date" value={payBy} min={date} onChange={(e) => e.target.value && setPayBy(e.target.value)} onClick={(e) => e.currentTarget.showPicker?.()} className="w-full cursor-pointer bg-transparent text-body text-ink outline-none [&::-webkit-calendar-picker-indicator]:hidden" /></span></label>
              </div>
              <label className="flex flex-col gap-1.5"><span className="text-label font-medium text-ink-2">Note on invoice</span><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Please clear the balance before check-out." className="glass-2 h-11 rounded-[14px] px-3 text-body text-ink outline-none placeholder:text-ink-3" /></label>
            </div>

            <div className="flex flex-col gap-2 bg-glass-inset px-6 py-4">
              <p className="text-eyebrow text-ink-3 uppercase">Preview</p>
              <div ref={previewRef} className="flex flex-col gap-4 rounded-[18px] bg-white p-5 text-[#0f172a] shadow-[0_8px_30px_rgba(15,23,42,0.12)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5"><LogoMark className="size-8" /><div><p className="text-body font-semibold">{property?.hotelName || "Stay Inn Hostels"}</p><p className="text-label text-[#64748b]">{property?.address || ""}</p></div></div>
                  <div className="text-right"><p className="text-[11px] font-semibold tracking-wider text-[#64748b] uppercase">Invoice</p><p className="text-body font-semibold">{invNo}</p><p className="text-label text-[#64748b]">{dayMonYear(date)} · pay by {dayMonYear(payBy)}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[12px] bg-[#f1f5f9] p-3"><p className="text-[11px] font-semibold tracking-wider text-[#64748b] uppercase">Bill to</p><p className="text-body font-semibold">{booking.guest_name}</p><p className="text-label text-[#64748b]">{[booking.room_number != null ? `Room ${booking.room_number}` : booking.room_title, booking.seat_label, booking.guest_phone].filter(Boolean).join(" · ")}</p></div>
                  <div className="rounded-[12px] bg-[#f1f5f9] p-3"><p className="text-[11px] font-semibold tracking-wider text-[#64748b] uppercase">Stay</p><p className="text-body font-semibold">{stayRange}</p><p className="text-label text-[#64748b]">{detail.stay.months_in_stay} months · {money(booking.rent_amount ?? booking.price_per_seat)} / month</p></div>
                </div>
                <div className="flex flex-col text-label">
                  <div className="flex justify-between border-b border-[#e2e8f0] pb-1.5 text-[11px] font-semibold tracking-wider text-[#64748b] uppercase"><span>Description</span><span>Amount</span></div>
                  {lines.length === 0 ? <p className="py-3 text-[#64748b]">Pick at least one month.</p> : null}
                  {lines.map((l, i) => <div key={i} className="flex justify-between border-b border-[#f1f5f9] py-2"><span>{l.label}</span><span>{money(l.amount)}</span></div>)}
                  <div className="flex justify-between py-2 font-semibold"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                  {withPayments ? paidLines.map((p, i) => <div key={i} className="flex justify-between py-1 text-[#64748b]"><span>{p.label}</span><span>− {money(p.amount)}</span></div>) : null}
                  {withPayments && paidShown > 0 && paidLines.length === 0 ? <div className="flex justify-between py-1 text-[#64748b]"><span>Already paid</span><span>− {money(paidShown)}</span></div> : null}
                  <div className="mt-1 flex items-center justify-between rounded-[10px] bg-[#f1f5f9] px-3 py-2.5"><span className="font-semibold">Balance due</span><span className="text-[20px] font-semibold">{money(balance)}</span></div>
                </div>
                {note || withSecurity ? <p className="text-label text-[#64748b]">{[note ? `Note: ${note}` : null, withSecurity ? `Security deposit of ${money(Number(booking.security_amount) || 0)} is held and returned at check-out.` : null].filter(Boolean).join(" ")}</p> : null}
              </div>
              <p className="text-label text-ink-3">Print uses this preview. Download and email use the standard PDF invoice for the chosen months.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-glass-divider px-6 py-4">
            <p className="min-w-0 flex-1 text-label text-ink-2">{booking.guest_email ? `Sends to ${booking.guest_email}` : "No email on file — download or print instead"}</p>
            <GlassButton variant="glass" onClick={() => void download()} disabled={!months.length || downloading}>{downloading ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />} Download PDF</GlassButton>
            <GlassButton variant="glass" onClick={print} disabled={!months.length}><Printer aria-hidden /> Print</GlassButton>
            <GlassButton onClick={send} disabled={!months.length || !booking.guest_email || email.isPending}>{email.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />} Save &amp; send invoice</GlassButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
