import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, FileText, Loader2, Mail, MessageCircle, Printer, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Tag } from "@/components/glass";
import { BookingInvoiceDocument } from "@/components/invoice/booking-invoice-document";
import { buildBookingInvoice, buildInvoiceWhatsAppMessage, guestWhatsAppUrl } from "@/lib/invoice/build-invoice";
import { downloadInvoicePdf } from "@/lib/invoice/download-invoice-pdf";
import { toInvoicePropertySettings } from "@/lib/invoice/property-settings";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import { usePublicPropertySettingsQuery } from "@/queries/settings/usePropertySettingsQuery";
import { useEmailInvoiceMutation, useLogInvoiceSharedMutation } from "@/queries/bookings/useBookingDetailActions";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/domain/booking.types";

/** A4 width at 96dpi — the invoice document is laid out at 210mm. */
const DOC_W = 794;

/**
 * Receipt & invoice (Glass): live invoice preview with Print, Download PDF and
 * WhatsApp guest. Replaces the old shadcn BookingInvoicePanel + nested preview dialog;
 * same invoice data, PDF export and WhatsApp message as before.
 */
export function ReceiptDialog({ booking, open, onOpenChange }: { booking: Booking; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: propertySettings } = usePublicPropertySettingsQuery();
  const exportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [docH, setDocH] = useState(1123);
  const [downloading, setDownloading] = useState(false);
  const emailInvoice = useEmailInvoiceMutation();
  const logShare = useLogInvoiceSharedMutation();

  const invoice = useMemo(() => buildBookingInvoice(booking, toInvoicePropertySettings(propertySettings)), [booking, propertySettings]);
  const waUrl = useMemo(() => guestWhatsAppUrl(booking.guest_phone, buildInvoiceWhatsAppMessage(invoice)), [booking.guest_phone, invoice]);
  const cur = normalizeMoneyCurrency(booking.currency);
  const paid = booking.paid_total ?? 0;
  const due = Math.max(0, booking.balance_due ?? 0);

  // Fit the A4 preview to the modal width.
  useLayoutEffect(() => {
    if (!open) return;
    let ro: ResizeObserver | null = null;
    const raf = requestAnimationFrame(() => {
      const frame = previewRef.current ?? frameRef.current;
      if (!frame) return;
      const fit = () => {
        setScale(Math.min(1, (frame.clientWidth - 32) / DOC_W));
        if (docRef.current) setDocH(docRef.current.offsetHeight);
      };
      fit();
      ro = new ResizeObserver(fit);
      ro.observe(frame);
      if (docRef.current) ro.observe(docRef.current);
    });
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [open]);

  useEffect(() => {
    if (!open) setDownloading(false);
  }, [open]);

  async function download() {
    const el = exportRef.current;
    if (!el) return toast.error("Invoice is not ready yet");
    setDownloading(true);
    try {
      await downloadInvoicePdf(el, `${invoice.invoiceNumber}.pdf`);
      toast.success("Invoice downloaded");
      logShare.mutate({ id: booking.id, channel: "download", invoice_number: invoice.invoiceNumber });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate PDF");
    } finally {
      setDownloading(false);
    }
  }

  function print() {
    const el = exportRef.current;
    if (!el) return toast.error("Invoice is not ready yet");
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return toast.error("Allow pop-ups to print the receipt");
    w.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${invoice.invoiceNumber}</title><style>@page{size:A4;margin:0}html,body{margin:0;background:#fff}</style></head><body>${el.outerHTML}</body></html>`,
    );
    w.document.close();
    w.focus();
    logShare.mutate({ id: booking.id, channel: "print", invoice_number: invoice.invoiceNumber });
    setTimeout(() => {
      w.print();
      w.close();
    }, 250);
  }

  function whatsapp() {
    if (!waUrl) return toast.error("Guest phone number is missing or invalid");
    window.open(waUrl, "_blank", "noopener,noreferrer");
    toast.message("WhatsApp opened — attach the downloaded PDF and send");
    logShare.mutate({ id: booking.id, channel: "whatsapp", invoice_number: invoice.invoiceNumber, to: booking.guest_phone || undefined });
  }

  function email() {
    if (!booking.guest_email) return toast.error("This guest has no email address — add one with Edit");
    emailInvoice.mutate(
      { id: booking.id },
      {
        onSuccess: (r) => toast.success(`Invoice emailed to ${r.to}`),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not email the invoice"),
      },
    );
  }

  const sent = (booking.activity ?? []).filter((a) => a.type === "invoice_sent").slice(0, 4);
  const receipts = (booking.payments ?? []).slice().reverse().slice(0, 4);
  const lastPay = booking.payments?.length ? booking.payments[booking.payments.length - 1] : null;
  const when = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";
  const billLine = [booking.room_number != null ? `Room ${booking.room_number}` : booking.room_title, booking.seat_label, booking.guest_email || booking.guest_phone].filter(Boolean).join(" · ");
  const actionBtn =
    "flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] px-3 text-label font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand-border disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-3.5";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="glass-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[94svh] flex-col overflow-hidden rounded-t-[28px] font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:max-h-[calc(100svh-48px)] md:w-[min(1120px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px] md:data-[state=open]:zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-glass-divider px-6 py-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-tint text-brand-text [&_svg]:size-[18px]">
              <FileText aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <Dialog.Title className="text-hero text-ink">Receipt &amp; invoice</Dialog.Title>
              <p className="truncate text-label text-ink-2">
                {[booking.guest_name, booking.booking_code, booking.room_number != null ? `Room ${booking.room_number}` : null].filter(Boolean).join(" · ")}
              </p>
            </div>
            <Dialog.Close aria-label="Close" className="glass-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] text-ink outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border">
              <X className="size-[18px]" aria-hidden />
            </Dialog.Close>
          </div>

          <div ref={frameRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-4 pb-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              {/* Preview — the invoice document itself is unchanged */}
              <section className="flex min-w-0 flex-1 flex-col gap-2.5">
                <p className="text-eyebrow text-ink-2 uppercase">Preview · {invoice.invoiceNumber}</p>
                <div ref={previewRef} className="glass-2 flex justify-center rounded-[24px] p-4">
                  <div style={{ width: DOC_W * scale, height: docH * scale }} className="relative shrink-0">
                    <div
                      ref={docRef}
                      style={{ width: DOC_W, transform: `scale(${scale})`, transformOrigin: "top left" }}
                      className="absolute top-0 left-0 overflow-hidden rounded-[8px] bg-white shadow-[0_8px_32px_rgba(15,23,42,0.16)]"
                    >
                      <BookingInvoiceDocument data={invoice} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Side: bill summary, actions, receipts, sent */}
              <aside className="flex w-full shrink-0 flex-col gap-3 md:sticky md:top-0 md:w-[320px]">
                <p className="text-eyebrow text-ink-2 uppercase">Summary</p>
                <div className="glass-2 flex flex-col gap-4 rounded-[24px] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-body font-semibold text-ink">{invoice.property.hotelName || "Stay Inn Hostels"}</p>
                      <p className="text-label text-ink-3">Issued {invoice.issueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-eyebrow text-ink-3 uppercase">Invoice</p>
                      <p className="text-label font-semibold text-ink">{invoice.invoiceNumber}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 rounded-[14px] bg-glass-inset px-3 py-2.5">
                    <p className="text-eyebrow text-ink-3 uppercase">Bill to</p>
                    <p className="truncate text-body font-medium text-ink">{booking.guest_name}</p>
                    {billLine ? <p className="truncate text-label text-ink-2">{billLine}</p> : null}
                  </div>
                  <div className="flex flex-col text-body">
                    <div className="flex justify-between border-b border-glass-divider py-2.5"><span className="text-ink-2">Total</span><span className="font-semibold text-ink">{formatMoney(invoice.total, cur)}</span></div>
                    <div className="flex justify-between gap-3 border-b border-glass-divider py-2.5">
                      <span className="truncate text-ink-2">Paid{lastPay ? ` · last ${lastPay.method_label}` : ""}</span>
                      <span className="text-ink">− {formatMoney(paid, cur)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2.5">
                      <span className={cn("font-medium", due > 0 ? "text-danger" : "text-success")}>{due > 0 ? "Balance due" : "Paid in full"}</span>
                      <span className="flex items-center gap-2">
                        <span className={cn("font-semibold", due > 0 ? "text-danger" : "text-success")}>{formatMoney(due, cur)}</span>
                        {due > 0 && booking.overdue ? <Tag tone="danger" showDot>Overdue</Tag> : null}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => void download()} disabled={downloading} className={cn(actionBtn, "bg-brand text-white shadow-[0_6px_18px_-6px_var(--color-brand)] hover:brightness-105")}>
                    {downloading ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />} Download PDF
                  </button>
                  <button type="button" onClick={email} disabled={emailInvoice.isPending} title={booking.guest_email || "No email on file"} className={cn(actionBtn, "glass-2 text-ink hover:bg-glass-inset")}>
                    {emailInvoice.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Mail aria-hidden />} Email
                  </button>
                  <button type="button" onClick={whatsapp} disabled={!waUrl} className={cn(actionBtn, "glass-2 text-ink hover:bg-glass-inset")}>
                    <MessageCircle aria-hidden /> WhatsApp
                  </button>
                  <button type="button" onClick={print} className={cn(actionBtn, "glass-2 text-ink hover:bg-glass-inset")}>
                    <Printer aria-hidden /> Print
                  </button>
                </div>

                {receipts.length ? (
                  <div className="flex flex-col gap-2 rounded-[18px] bg-glass-inset px-4 py-3">
                    <p className="text-eyebrow text-ink-3 uppercase">Receipts · {booking.payments?.length ?? 0}</p>
                    {receipts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-3 text-label">
                        <span className="min-w-0 truncate text-ink-2">{p.reference} · {p.method_label} · {when(p.paid_at)}</span>
                        <span className="shrink-0 font-semibold text-ink">{formatMoney(p.amount, cur)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-col gap-2 rounded-[18px] bg-glass-inset px-4 py-3">
                  <p className="text-eyebrow text-ink-3 uppercase">Sent</p>
                  {sent.length ? (
                    sent.map((a) => (
                      <p key={a.id} className="text-label text-ink-2">
                        <span className="text-ink">{a.label}</span>
                        {a.detail ? ` · ${a.detail.replace(`${invoice.invoiceNumber} · `, "")}` : ""} · {when(a.at)}
                      </p>
                    ))
                  ) : (
                    <p className="flex items-center gap-1.5 text-label text-ink-3"><Send className="size-3.5" aria-hidden /> Not sent yet — email or WhatsApp it to the guest.</p>
                  )}
                </div>
              </aside>
            </div>
          </div>

          {/* Off-screen render target for PDF / print (inline styles only — html2canvas can't read oklch). */}
          <div aria-hidden style={{ position: "fixed", left: "-10000px", top: 0, opacity: 0, pointerEvents: "none" }}>
            <BookingInvoiceDocument ref={exportRef} data={invoice} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
