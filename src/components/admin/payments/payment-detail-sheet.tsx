import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Download, Eye, ImagePlus, Loader2, MessageCircle, Pencil, Printer, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { RentStatusPill } from "@/components/admin/residents/rent-status";
import { downloadResidentMonthInvoiceApi } from "@/api/residents";
import { getPaymentProofApi } from "@/api/payments/paymentsOverview.api";
import { useBookingQuery } from "@/queries/bookings/useBookingQuery";
import { useEmailMonthReceiptMutation } from "@/queries/residents";
import { useEditPaymentMutation, useRefundPaymentMutation } from "@/queries/payments/usePaymentsOverview";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { RentPaymentStatus } from "@/types/domain/resident.types";
import type { Transaction } from "@/types/domain/payments.types";

const METHODS = [
  ["cash", "Cash"],
  ["jazzcash", "JazzCash"],
  ["easypaisa", "Easypaisa"],
  ["bank_transfer", "Bank transfer"],
  ["card", "Card"],
] as const;
const dt = (iso?: string | null, withYear = true) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}), hour: "numeric", minute: "2-digit" }) : "—";

/** Figma 08.03 / 08.07 · Payment details. */
export function PaymentDetailSheet({ tx, onClose }: { tx: Transaction | null; onClose: () => void }) {
  return (
    <Dialog.Root open={Boolean(tx)} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="glass-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[92svh] flex-col overflow-hidden rounded-t-[28px] font-geist text-ink outline-none duration-300 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom md:inset-x-auto md:inset-y-3 md:right-3 md:max-h-none md:w-[min(440px,calc(100vw-24px))] md:rounded-[24px] md:data-[state=open]:slide-in-from-right">
          {tx ? <Body tx={tx} onClose={onClose} /> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Body({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const token = useAuthStore((s) => s.token);
  const { data: booking } = useBookingQuery(tx.booking_id);
  const edit = useEditPaymentMutation();
  const refund = useRefundPaymentMutation();
  const resend = useEmailMonthReceiptMutation();
  const fileRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const p = booking?.payments?.find((x) => x.id === tx.payment_id);
  const money = (n: number) => formatMoney(n, tx.currency);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ method: "", reference: "", date: "", note: "" });
  const [refunding, setRefunding] = useState(false);
  const [rf, setRf] = useState({ amount: "", method: "cash", reason: "" });

  useEffect(() => {
    if (!p) return;
    setForm({ method: p.method, reference: p.reference, date: p.paid_at?.slice(0, 10) ?? "", note: p.note ?? "" });
    setRf({ amount: String(Math.max(0, p.amount - (p.refunded_amount ?? 0))), method: p.method === "unspecified" || p.method === "deposit" ? "cash" : p.method, reason: "" });
  }, [p]);

  const isRefund = tx.direction === "out";
  const months = (p?.allocations ?? []).filter((a) => a.kind === "rent" && a.month).map((a) => a.month as string);
  const ledger = (booking?.rent_ledger ?? []) as { month: string; rent_amount?: number | null; payment_status?: RentPaymentStatus; collected_amount?: number | null; receipt_emailed_at?: string | null }[];
  const refundable = p ? Math.max(0, p.amount - (p.refunded_amount ?? 0)) : 0;

  async function attach(file: File | undefined) {
    if (!file || !p) return;
    if (file.size > 3_000_000) return toast.error("File is too large (max 3 MB)");
    const reader = new FileReader();
    reader.onload = () =>
      edit.mutate(
        { bookingId: tx.booking_id, paymentId: p.id, input: { proof: String(reader.result), proof_name: file.name } },
        { onSuccess: () => toast.success("Proof attached"), onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed") },
      );
    reader.readAsDataURL(file);
  }
  async function viewProof() {
    if (!token || !p) return;
    try {
      const r = await getPaymentProofApi(token, tx.booking_id, p.id);
      const w = window.open("", "_blank");
      if (w) w.document.write(r.proof.startsWith("data:application/pdf") ? `<iframe src="${r.proof}" style="border:0;width:100%;height:100vh"></iframe>` : `<img src="${r.proof}" style="max-width:100%">`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open the proof");
    }
  }
  function print() {
    const el = printRef.current;
    if (!el) return;
    const w = window.open("", "_blank", "width=520,height=800");
    if (!w) return toast.error("Allow pop-ups to print");
    const styles = [...document.querySelectorAll('style,link[rel="stylesheet"]')].map((n) => n.outerHTML).join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${tx.reference}</title>${styles}<style>body{background:#fff;padding:24px}</style></head><body class="font-geist">${el.outerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 400);
  }

  return (
    <>
      <div className="flex items-start gap-3 border-b border-glass-divider px-5 py-4">
        <div className="min-w-0 flex-1">
          <Dialog.Title className="text-hero text-ink">{isRefund ? "Refund" : "Payment"} {tx.reference || ""}</Dialog.Title>
          <p className="text-label text-ink-2">{new Date(tx.at).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
        </div>
        <Dialog.Close aria-label="Close" className="glass-2 flex size-9 cursor-pointer items-center justify-center rounded-[12px] text-ink"><X className="size-4" aria-hidden /></Dialog.Close>
      </div>

      <div ref={printRef} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
        <div className="flex flex-col items-center gap-1.5 rounded-[18px] bg-glass-inset px-4 py-5">
          <p className={cn("text-[30px] leading-9 font-semibold", isRefund ? "text-danger" : "text-ink")}>{isRefund ? "− " : ""}{money(tx.amount)}</p>
          <p className="flex items-center gap-2 text-label text-ink-2">
            <span className="rounded-full border border-glass-stroke px-2 py-0.5">● {isRefund ? "Refunded" : (p?.refunded_amount ?? 0) > 0 ? `${money(p!.refunded_amount!)} refunded` : "Received"}</span>
            {tx.method_label && tx.method_label !== "Not recorded" ? `via ${tx.method_label}` : null}
          </p>
        </div>

        <Link to="/admin/residents/$id" params={{ id: tx.booking_id }} onClick={onClose} className="flex items-center gap-3 rounded-[16px] bg-glass-inset px-4 py-3 hover:bg-glass-2">
          <span className="flex size-9 items-center justify-center rounded-full border border-glass-stroke text-label font-semibold text-ink-2">{tx.initials}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-body font-semibold text-ink">{tx.name}</span><span className="block truncate text-label text-ink-3">{[tx.room_label, tx.booking_code].filter(Boolean).join(" · ")}</span></span>
          <span className="flex items-center gap-1 text-label text-ink-2"><ChevronRight className="size-3.5" aria-hidden />Open profile</span>
        </Link>

        <div className="flex flex-col gap-2">
          <p className="text-eyebrow text-ink-3 uppercase">What it paid for</p>
          <div className="overflow-hidden rounded-[16px] border border-glass-divider">
            {(p?.allocations?.length ? p.allocations : [{ kind: "rent" as const, month: null, label: tx.for, amount: tx.amount, extra_id: null }]).map((a, i) => {
              const e = a.kind === "rent" && a.month ? ledger.find((l) => l.month === a.month) : undefined;
              const rent = Number(e?.rent_amount) || 0;
              const st = e?.payment_status;
              const col = st === "paid" ? rent : st === "partial" ? Number(e?.collected_amount ?? rent / 2) : 0;
              return (
                <div key={i} className="flex items-center gap-3 border-b border-glass-divider px-4 py-3 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-ink">{a.label}</p>
                    {e && rent ? <p className="text-label text-ink-3">{money(col)} of {money(rent)}</p> : null}
                  </div>
                  {st ? <RentStatusPill status={st} className="h-5 px-2 text-[11px]" /> : null}
                  <span className="text-body font-semibold text-ink">{money(a.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-eyebrow text-ink-3 uppercase">Details</p>
          {editing && p ? (
            <div className="flex flex-col gap-2 rounded-[16px] bg-glass-inset p-3">
              <select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))} className="glass-2 h-10 rounded-[12px] px-3 text-body text-ink outline-none" aria-label="Method">
                {[...METHODS, ["unspecified", "Marked paid"] as const].map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} placeholder="Transaction ID" className="glass-2 h-10 rounded-[12px] px-3 text-body text-ink outline-none" aria-label="Transaction ID" />
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="glass-2 h-10 rounded-[12px] px-3 text-body text-ink outline-none" aria-label="Paid on" />
              <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Note" className="glass-2 h-10 rounded-[12px] px-3 text-body text-ink outline-none" aria-label="Note" />
              <div className="flex justify-end gap-2">
                <GlassButton size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</GlassButton>
                <GlassButton size="sm" disabled={edit.isPending} onClick={() => edit.mutate({ bookingId: tx.booking_id, paymentId: p.id, input: { method: form.method, reference: form.reference, paid_at: form.date || undefined, paid_time: p.paid_at ? new Date(p.paid_at).toTimeString().slice(0, 5) : undefined, note: form.note } }, { onSuccess: () => { toast.success("Payment updated"); setEditing(false); }, onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save") })}>
                  {edit.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}Save
                </GlassButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col text-body">
              {[
                ["Method", tx.method_label],
                ["Transaction ID", tx.reference || "—"],
                ["Paid on", dt(p?.paid_at ?? tx.at)],
                ["Received by", tx.by || "—"],
                ["Recorded", dt(p?.recorded_at, false)],
                ["Note", p?.note || "—"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-3 py-1.5"><span className="text-ink-2">{l}</span><span className="text-right text-ink">{v}</span></div>
              ))}
            </div>
          )}
        </div>

        {p ? (
          p.has_proof ? (
            <button type="button" onClick={() => void viewProof()} className="flex cursor-pointer items-center gap-3 rounded-[16px] bg-glass-inset px-4 py-3 text-left hover:bg-glass-2">
              <ImagePlus className="size-5 text-ink-3" aria-hidden />
              <span className="min-w-0 flex-1"><span className="block truncate text-body font-medium text-ink">{p.proof_name || "proof"}</span><span className="block text-label text-ink-3">Proof of payment · {Math.round((p.proof_size ?? 0) / 1024)} KB</span></span>
              <Eye className="size-4 text-ink-3" aria-hidden />
            </button>
          ) : !isRefund ? (
            <>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => void attach(e.target.files?.[0])} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={edit.isPending} className="flex cursor-pointer items-center gap-3 rounded-[16px] border border-dashed border-glass-stroke px-4 py-3 text-left hover:bg-glass-inset">
                {edit.isPending ? <Loader2 className="size-5 animate-spin text-ink-3" aria-hidden /> : <ImagePlus className="size-5 text-ink-3" aria-hidden />}
                <span><span className="block text-body font-medium text-ink">Attach screenshot or slip</span><span className="block text-label text-ink-3">Optional · JPG, PNG or PDF</span></span>
              </button>
            </>
          ) : null
        ) : null}

        {months.length ? (
          <div className="flex flex-col gap-1 rounded-[16px] bg-glass-inset px-4 py-3 text-label">
            <p className="text-eyebrow text-ink-3 uppercase">Receipt sent</p>
            {months.map((mk) => {
              const at = ledger.find((l) => l.month === mk)?.receipt_emailed_at;
              return <p key={mk} className="text-ink-2">{new Date(`${mk}-01`).toLocaleDateString("en-GB", { month: "long" })}: {at ? `emailed to ${booking?.guest_email} · ${dt(at, false)}` : "not emailed yet"}</p>;
            })}
          </div>
        ) : null}

        {refunding && p ? (
          <div className="flex flex-col gap-2 rounded-[16px] border border-danger/40 bg-danger-tint/40 p-3">
            <p className="text-body font-semibold text-ink">Refund up to {money(refundable)}</p>
            <input value={rf.amount} inputMode="decimal" onChange={(e) => setRf((f) => ({ ...f, amount: e.target.value.replace(/[^\d.]/g, "") }))} className="glass-2 h-10 rounded-[12px] px-3 text-body text-ink outline-none" aria-label="Refund amount" />
            <select value={rf.method} onChange={(e) => setRf((f) => ({ ...f, method: e.target.value }))} className="glass-2 h-10 rounded-[12px] px-3 text-body text-ink outline-none" aria-label="Refund method">
              {METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <input value={rf.reason} onChange={(e) => setRf((f) => ({ ...f, reason: e.target.value }))} placeholder="Reason (saved in activity)" className="glass-2 h-10 rounded-[12px] px-3 text-body text-ink outline-none" aria-label="Reason" />
            <p className="text-label text-ink-3">The months this payment covered go back to unpaid / part paid.</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 border-t border-glass-divider px-5 py-4">
        {refunding && p ? (
          <div className="flex gap-2">
            <GlassButton variant="ghost" className="flex-1" onClick={() => setRefunding(false)}>Cancel</GlassButton>
            <button
              type="button"
              disabled={refund.isPending || !(Number(rf.amount) > 0) || Number(rf.amount) > refundable}
              onClick={() => refund.mutate({ bookingId: tx.booking_id, paymentId: p.id, input: { amount: Number(rf.amount), method: rf.method, reason: rf.reason || undefined } }, { onSuccess: (r) => { toast.success(`Refund ${r.reference} saved`); onClose(); }, onError: (e) => toast.error(e instanceof Error ? e.message : "Refund failed") })}
              className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-danger text-body font-semibold text-white disabled:opacity-50 [&_svg]:size-4"
            >
              {refund.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <RotateCcw aria-hidden />} Refund {money(Number(rf.amount) || 0)}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <GlassButton size="sm" variant="glass" disabled={!months.length} onClick={() => token && months[0] && toast.promise(downloadResidentMonthInvoiceApi(token, tx.booking_id, months), { loading: "Preparing…", success: "Downloaded", error: "Download failed" })}><Download aria-hidden /> Download</GlassButton>
              <GlassButton size="sm" variant="glass" disabled={!months.length || !booking?.guest_email || resend.isPending} onClick={() => months.forEach((mk) => resend.mutate({ bookingId: tx.booking_id, month: mk }, { onSuccess: () => toast.success(`Receipt emailed to ${booking?.guest_email}`), onError: (e) => toast.error(e instanceof Error ? e.message : "Only paid months can be emailed") }))}><MessageCircle aria-hidden /> Resend</GlassButton>
              <GlassButton size="sm" variant="glass" onClick={print}><Printer aria-hidden /> Print</GlassButton>
            </div>
            {p && !isRefund ? (
              <div className="grid grid-cols-2 gap-2">
                <GlassButton size="sm" variant="glass" onClick={() => setEditing(true)}><Pencil aria-hidden /> Edit payment</GlassButton>
                <button type="button" disabled={refundable <= 0} onClick={() => setRefunding(true)} className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[12px] bg-danger text-label font-semibold text-white disabled:opacity-40 [&_svg]:size-3.5"><RotateCcw aria-hidden /> {refundable <= 0 ? "Fully refunded" : "Refund"}</button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
