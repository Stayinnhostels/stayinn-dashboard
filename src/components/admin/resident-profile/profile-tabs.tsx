import { useMemo, useRef, useState } from "react";
import { Download, FileText, Loader2, Mail, MessageCircle, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, LogoMark } from "@/components/glass";
import { DropZone } from "@/components/admin/walk-in/walk-in-modal";
import { RentStatusPill } from "@/components/admin/residents/rent-status";
import { downloadResidentDossierPdfApi, downloadResidentMonthInvoiceApi } from "@/api/residents";
import { useEmailMonthReceiptMutation, useEmailResidentInvoiceMutation, useUpdateResidentMutation } from "@/queries/residents";
import { usePublicPropertySettingsQuery } from "@/queries/settings/usePropertySettingsQuery";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/domain/booking.types";
import type { ResidentDetail } from "@/types/domain/resident.types";
import { Card, PaymentItem } from "./profile-sections";
import { dayMon, isoDateTime, monLong, monShort, monthKeyOf, type MonthRow } from "./profile-utils";

const invNo = (mk: string, id: string) => `INV-${mk.replace("-", "")}-${id.slice(-4).toUpperCase()}`;

/** Figma 07.16 · Invoices & receipts. */
export function InvoicesTab({ booking, detail, rows, onNewInvoice }: { booking: Booking; detail: ResidentDetail; rows: MonthRow[]; onNewInvoice: () => void }) {
  const token = useAuthStore((s) => s.token);
  const emailInv = useEmailResidentInvoiceMutation();
  const emailRec = useEmailMonthReceiptMutation();
  const { data: property } = usePublicPropertySettingsQuery();
  const cur = booking.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);
  const now = monthKeyOf();
  const invoices = useMemo(() => rows.filter((m) => m.month <= now).reverse(), [rows, now]);
  const [kind, setKind] = useState<"invoices" | "receipts">("invoices");
  const [sel, setSel] = useState<string | null>(invoices[0]?.month ?? null);
  const [busy, setBusy] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const sent = (booking.activity ?? []).filter((a) => a.type === "invoice_sent" || /receipt|reminder/i.test(a.label));
  const m = invoices.find((x) => x.month === sel) ?? invoices[0];
  const extrasLines = (detail.extras ?? []).flatMap((e) => (e.timeline ?? e.ledger ?? []).filter((p) => p.month === m?.month).map((p) => ({ label: `${e.label} · ${monLong(p.month)} ${p.month.slice(0, 4)}`, amount: Number(p.amount) || 0 })));
  const total = m ? (Number(m.rent_amount) || 0) + m.extras : 0;
  const paid = m ? m.collected + m.extrasPaid : 0;
  const monthPays = (booking.payments ?? []).filter((p) => p.paid_at?.slice(0, 7) === m?.month);

  async function download(mk: string) {
    if (!token) return;
    setBusy(mk);
    try {
      await downloadResidentMonthInvoiceApi(token, booking.id, mk);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setBusy(null);
    }
  }
  function emailInvoice(mk: string) {
    emailInv.mutate({ bookingId: booking.id, months: [mk] }, { onSuccess: (r) => toast.success(`Invoice emailed to ${r.to}`), onError: (e) => toast.error(e instanceof Error ? e.message : "Could not email") });
  }
  function emailReceipt(mk: string) {
    emailRec.mutate({ bookingId: booking.id, month: mk }, { onSuccess: () => toast.success(`Receipt emailed to ${booking.guest_email}`), onError: (e) => toast.error(e instanceof Error ? e.message : "Could not email") });
  }
  function whatsapp() {
    if (!m) return;
    const digits = (booking.guest_phone ?? "").replace(/\D/g, "").replace(/^0/, "92");
    if (!digits) return toast.error("No phone number on file");
    const text = `Hi ${booking.guest_name.split(" ")[0]}, your ${monLong(m.month)} invoice ${invNo(m.month, booking.id)}: ${money(total)}${total - paid > 0 ? `, ${money(total - paid)} still due` : ", paid in full"}. Thank you — ${property?.hotelName || "StayInn"}`;
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }
  function print() {
    const el = previewRef.current;
    if (!el) return;
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return toast.error("Allow pop-ups to print");
    const styles = [...document.querySelectorAll('style,link[rel="stylesheet"]')].map((n) => n.outerHTML).join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${m ? invNo(m.month, booking.id) : "Invoice"}</title>${styles}<style>body{background:#fff;padding:24px}</style></head><body class="font-geist">${el.outerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 400);
  }
  async function statement() {
    if (!token) return;
    toast.promise(downloadResidentDossierPdfApi(token, booking.id), { loading: "Preparing statement…", success: "Statement downloaded", error: (e) => (e instanceof Error ? e.message : "Download failed") });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="flex flex-col gap-3">
        <div className="glass-2 flex flex-wrap items-center gap-2 rounded-[18px] p-2.5">
          <div className="flex gap-0.5 rounded-[14px] border border-glass-divider bg-glass-inset p-1">
            {(["invoices", "receipts"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setKind(k)} className={cn("h-8 cursor-pointer rounded-[10px] border px-3 text-body font-medium", kind === k ? "glass-3 border-glass-stroke text-ink" : "border-transparent text-ink-2")}>
                {k === "invoices" ? `Invoices · ${invoices.length}` : `Receipts · ${booking.payments?.length ?? 0}`}
              </button>
            ))}
          </div>
          <span className="flex-1" />
          <GlassButton variant="glass" size="sm" onClick={() => void statement()}><FileText aria-hidden /> Statement</GlassButton>
          <GlassButton size="sm" onClick={onNewInvoice}><Plus aria-hidden /> New invoice</GlassButton>
        </div>
        <div className="glass-2 overflow-hidden rounded-[20px]">
          {kind === "invoices" ? (
            invoices.map((x) => {
              const t = (Number(x.rent_amount) || 0) + x.extras;
              const left = Math.max(0, t - x.collected - x.extrasPaid);
              const pays = (booking.payments ?? []).filter((p) => p.paid_at?.slice(0, 7) === x.month);
              const desc = [
                ["Rent", ...(detail.extras ?? []).filter((e) => (e.timeline ?? e.ledger ?? []).some((p) => p.month === x.month)).map((e) => e.label)].join(" + "),
                left > 0 && x.payment_status !== "returned" ? `${money(left)} due` : pays.length ? `Paid ${dayMon(pays[0].paid_at)} · receipt ${pays.map((p) => p.reference).join(", ")}` : x.payment_status === "paid" ? "Paid" : "",
              ].filter(Boolean).join(" · ");
              return (
                <div key={x.month} className={cn("flex cursor-pointer items-center gap-3 border-b border-glass-divider px-4 py-3 last:border-b-0 hover:bg-glass-inset", sel === x.month && "bg-glass-inset")} onClick={() => setSel(x.month)}>
                  <FileText className="size-4 shrink-0 text-ink-3" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-semibold text-ink">{monLong(x.month)} {x.month.slice(0, 4)} <span className="font-normal text-label text-ink-3">{invNo(x.month, booking.id)}</span></p>
                    <p className="truncate text-label text-ink-3">{desc}</p>
                  </div>
                  <RentStatusPill status={x.payment_status} className="h-5 px-2 text-[11px]" />
                  <span className="w-24 text-right text-body font-semibold text-ink">{money(t)}</span>
                  <button type="button" aria-label="Download invoice" onClick={(e) => { e.stopPropagation(); void download(x.month); }} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-2">{busy === x.month ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Download className="size-4" aria-hidden />}</button>
                  <button type="button" aria-label={x.payment_status === "paid" ? "Email receipt" : "Email invoice"} disabled={!booking.guest_email} onClick={(e) => { e.stopPropagation(); if (x.payment_status === "paid") emailReceipt(x.month); else emailInvoice(x.month); }} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-2 disabled:opacity-40"><MessageCircle className="size-4" aria-hidden /></button>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col gap-2 p-3">
              {(booking.payments ?? []).length === 0 ? <p className="px-2 py-6 text-center text-label text-ink-3">No receipts yet.</p> : null}
              {(booking.payments ?? []).slice().reverse().map((p) => <PaymentItem key={p.id} p={p} currency={cur} />)}
            </div>
          )}
        </div>
      </div>

      {m ? (
        <div className="flex flex-col gap-3">
          <p className="text-eyebrow text-ink-2 uppercase">Preview · {invNo(m.month, booking.id)}</p>
          <div ref={previewRef} className="glass-2 flex flex-col gap-4 rounded-[22px] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2"><LogoMark className="size-7" /><div><p className="text-body font-semibold text-ink">{property?.hotelName || "Stay Inn Hostels"}</p><p className="text-label text-ink-3">{[property?.address, property?.phone].filter(Boolean).join(" · ")}</p></div></div>
              <div className="text-right"><p className="text-eyebrow text-ink-3 uppercase">Invoice</p><p className="text-label font-semibold text-ink">{invNo(m.month, booking.id)}</p><p className="text-[11px] text-ink-3">1 {monShort(m.month)} {m.month.slice(0, 4)} · due 1 {monShort(m.month)}</p></div>
            </div>
            <div className="rounded-[14px] bg-glass-inset px-3.5 py-3"><p className="text-eyebrow text-ink-3 uppercase">Bill to</p><p className="text-body font-medium text-ink">{booking.guest_name}</p><p className="text-label text-ink-3">{[booking.room_number != null ? `Room ${booking.room_number}` : booking.room_title, booking.seat_label, booking.guest_email].filter(Boolean).join(" · ")}</p></div>
            <div className="flex flex-col text-body">
              <div className="flex justify-between border-b border-glass-divider py-2.5"><span className="text-ink-2">Room rent · {monLong(m.month)} {m.month.slice(0, 4)}</span><span className="text-ink">{money(Number(m.rent_amount) || 0)}</span></div>
              {extrasLines.map((l) => <div key={l.label} className="flex justify-between border-b border-glass-divider py-2.5"><span className="text-ink-2">{l.label}</span><span className="text-ink">{money(l.amount)}</span></div>)}
              <div className="flex justify-between border-b border-glass-divider py-2.5 font-semibold"><span className="text-ink">Total</span><span className="text-ink">{money(total)}</span></div>
              {monthPays.map((p) => <div key={p.id} className="flex justify-between border-b border-glass-divider py-2.5"><span className="text-ink-2">Paid {dayMon(p.paid_at)} · {p.method_label}</span><span className="text-ink">− {money(p.amount)}</span></div>)}
              {monthPays.length === 0 && paid > 0 ? <div className="flex justify-between border-b border-glass-divider py-2.5"><span className="text-ink-2">Already paid</span><span className="text-ink">− {money(paid)}</span></div> : null}
              <div className={cn("flex justify-between py-2.5 font-semibold", total - paid > 0 ? "text-danger" : "text-success")}><span>{total - paid > 0 ? "Balance due" : "Paid in full"}</span><span>{money(Math.max(0, total - paid))}</span></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <GlassButton size="sm" onClick={() => void download(m.month)}><Download aria-hidden /> Download PDF</GlassButton>
            <GlassButton size="sm" variant="glass" disabled={!booking.guest_email || emailInv.isPending} onClick={() => emailInvoice(m.month)}><Mail aria-hidden /> Email</GlassButton>
            <GlassButton size="sm" variant="glass" onClick={whatsapp}><MessageCircle aria-hidden /> WhatsApp</GlassButton>
            <GlassButton size="sm" variant="glass" onClick={print}><Printer aria-hidden /> Print</GlassButton>
          </div>
          <div className="flex flex-col gap-1.5 rounded-[16px] bg-glass-inset px-4 py-3 text-label">
            <p className="text-eyebrow text-ink-3 uppercase">Sent</p>
            {sent.length === 0 ? <p className="text-ink-3">Nothing sent yet.</p> : sent.slice(0, 4).map((a) => <p key={a.id} className="text-ink-2">{a.label}{a.detail ? ` · ${a.detail}` : ""} · {isoDateTime(a.at)}</p>)}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Documents tab: ID images and PDF, replaceable. */
export function DocumentsTab({ booking, detail }: { booking: Booking; detail: ResidentDetail }) {
  const update = useUpdateResidentMutation();
  const r = detail.resident;
  const save = (field: "guest_cnic_image_front" | "guest_cnic_image_back" | "guest_b_form_image", value: string) =>
    update.mutate({ bookingId: booking.id, input: { [field]: value } }, { onSuccess: () => toast.success(value ? "Document saved" : "Document removed"), onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed") });
  return (
    <Card title="Documents" sub="ID images are only visible to staff">
      <div className="grid gap-4 md:grid-cols-3">
        <DropZone label="CNIC front" value={r.cnic_image_front} onChange={(v) => save("guest_cnic_image_front", v)} />
        <DropZone label="CNIC back" value={r.cnic_image_back} onChange={(v) => save("guest_cnic_image_back", v)} />
        <DropZone label="B-Form" value={r.b_form_image} onChange={(v) => save("guest_b_form_image", v)} />
      </div>
      {r.cnic_pdf ? (
        <a href={r.cnic_pdf} download={`${booking.guest_name}-id.pdf`} className="glass-3 flex w-fit items-center gap-2 rounded-[12px] px-3 py-2 text-label font-semibold text-ink"><FileText className="size-4" aria-hidden />ID PDF · download</a>
      ) : null}
    </Card>
  );
}
