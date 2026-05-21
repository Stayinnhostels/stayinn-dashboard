import { useMemo, useRef, useState } from "react";
import { Download, Eye, FileText, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { Booking } from "@/types/domain/booking.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingInvoiceDocument } from "@/components/invoice/booking-invoice-document";
import {
  buildBookingInvoice,
  buildInvoiceWhatsAppMessage,
  guestWhatsAppUrl,
} from "@/lib/invoice/build-invoice";
import { downloadInvoicePdf } from "@/lib/invoice/download-invoice-pdf";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import { toInvoicePropertySettings } from "@/lib/invoice/property-settings";
import { usePublicPropertySettingsQuery } from "@/queries/settings/usePropertySettingsQuery";

type Props = {
  booking: Booking;
};

export function BookingInvoicePanel({ booking }: Props) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data: propertySettings } = usePublicPropertySettingsQuery();

  const invoiceData = useMemo(() => {
    const property = toInvoicePropertySettings(propertySettings);
    return buildBookingInvoice(booking, property);
  }, [booking, propertySettings]);

  const whatsappMessage = useMemo(() => buildInvoiceWhatsAppMessage(invoiceData), [invoiceData]);
  const guestWaUrl = useMemo(
    () => guestWhatsAppUrl(booking.guest_phone, whatsappMessage),
    [booking.guest_phone, whatsappMessage],
  );

  async function handleDownload() {
    const el = invoiceRef.current;
    if (!el) {
      toast.error("Invoice preview is not ready");
      return;
    }
    setDownloading(true);
    try {
      await downloadInvoicePdf(el, `${invoiceData.invoiceNumber}.pdf`);
      toast.success("Invoice downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate PDF");
    } finally {
      setDownloading(false);
    }
  }

  function openWhatsApp() {
    if (!guestWaUrl) {
      toast.error("Guest phone number is missing or invalid");
      return;
    }
    window.open(guestWaUrl, "_blank", "noopener,noreferrer");
    toast.message("WhatsApp opened — attach the downloaded PDF and send");
  }

  return (
    <>
      <Card className="border-2 border-foreground/80 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Invoice / Bill
          </CardTitle>
          <CardDescription>
            Generate a black &amp; white invoice for this booking. Download the PDF, then send it to your guest on
            WhatsApp yourself.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
            <p className="font-semibold">{invoiceData.invoiceNumber}</p>
            <p className="text-muted-foreground">
              {invoiceData.bookingReference} · Total{" "}
              {formatMoney(invoiceData.total, normalizeMoneyCurrency(booking.currency))}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye className="h-4 w-4" />
              Preview invoice
            </Button>
            <Button type="button" onClick={() => void handleDownload()} disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </Button>
            <Button type="button" variant="secondary" onClick={openWhatsApp} disabled={!guestWaUrl}>
              <MessageCircle className="h-4 w-4" />
              Open guest WhatsApp
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Property details come from{" "}
            <a href="/admin/settings" className="font-semibold underline">
              Settings → Property
            </a>{" "}
            (synced to the website and emails). Attach the PDF in WhatsApp after downloading.
          </p>
        </CardContent>
      </Card>

      {/* Hidden render target for PDF capture (inline styles only — avoids oklch in html2canvas) */}
      <div
        id="invoice-pdf-export-root"
        aria-hidden
        style={{ position: "fixed", left: "-10000px", top: 0, opacity: 0, pointerEvents: "none" }}
      >
        <BookingInvoiceDocument ref={invoiceRef} data={invoiceData} />
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto bg-white p-0">
          <DialogHeader className="border-b border-black/10 px-6 py-4">
            <DialogTitle className="text-black">Invoice preview</DialogTitle>
            <DialogDescription className="text-black/70">
              {invoiceData.invoiceNumber} — white background, black text only
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center bg-neutral-100 p-4">
            <BookingInvoiceDocument data={invoiceData} />
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-black/10 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => void handleDownload()} disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </Button>
            <Button type="button" variant="secondary" onClick={openWhatsApp} disabled={!guestWaUrl}>
              <MessageCircle className="h-4 w-4" />
              WhatsApp guest
            </Button>
            <Button type="button" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

