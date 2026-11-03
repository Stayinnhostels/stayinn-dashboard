import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, Loader2, Mail, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  downloadResidentDossierExcelApi,
  downloadResidentDossierPdfApi,
  downloadResidentMonthInvoiceApi,
  emailResidentMonthReceiptApi,
} from "@/api/residents";
import { ChangeRoomDialog } from "@/components/admin/change-room-dialog";
import { ResidentExtrasEditor } from "@/components/admin/resident-extras-editor";
import { ZoomableImageLightbox } from "@/components/admin/zoomable-image-lightbox";
import { useResidentDetailQuery } from "@/queries/residents";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import {
  affiliationForResident,
  EXTRA_BILLING_CYCLE_LABELS,
  GENDER_LABELS,
  RENT_PAYMENT_STATUS_LABELS,
  RESIDENT_TYPE_LABELS,
  SECURITY_STATUS_LABELS,
} from "@/types/domain/resident.types";

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">{value || "—"}</p>
    </div>
  );
}

function ResidentCnicThumb({ src, label }: { src: string; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-block w-full overflow-hidden rounded-lg border cursor-zoom-in text-left"
        aria-label={`View CNIC ${label}`}
      >
        <img src={src} alt={`CNIC ${label}`} className="h-24 w-full object-cover" />
      </button>
      <ZoomableImageLightbox
        open={open}
        onOpenChange={setOpen}
        src={src}
        alt={`CNIC ${label}`}
        title={`CNIC ${label}`}
      />
    </>
  );
}

export function ResidentDetailSheet({
  bookingId,
  month,
  open,
  onOpenChange,
  onEdit,
}: {
  bookingId: string | null;
  month: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}) {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useResidentDetailQuery(open ? bookingId : null, month);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [invoiceMonth, setInvoiceMonth] = useState<string | null>(null);
  const [emailingMonth, setEmailingMonth] = useState<string | null>(null);
  const [invoiceMonths, setInvoiceMonths] = useState<string[]>([]);
  const [downloadingCombined, setDownloadingCombined] = useState(false);
  const [changeRoomOpen, setChangeRoomOpen] = useState(false);

  const r = data?.resident;
  const stay = data?.stay;
  const summary = data?.rent_summary;
  const timeline = data?.rent_timeline ?? [];
  const extras = data?.extras ?? [];
  const extrasSummary = data?.extras_summary;
  const affiliation = r ? affiliationForResident(r) : null;
  const monthKeysJoined = `${bookingId ?? ""}|${timeline.map((m) => m.month).join(",")}`;
  const totalCollected = summary?.total_rent_collected ?? summary?.total_rent_paid ?? 0;
  const selectedSet = useMemo(() => new Set(invoiceMonths), [invoiceMonths]);
  const allMonthsSelected = timeline.length > 0 && invoiceMonths.length === timeline.length;

  useEffect(() => {
    const keys = monthKeysJoined.split("|")[1]?.split(",").filter(Boolean) ?? [];
    setInvoiceMonths(keys.includes(month) ? [month] : keys.slice(0, 1));
  }, [monthKeysJoined, month]);

  async function handleDownloadPdf() {
    if (!token || !bookingId) {
      toast.error("You must be signed in to download");
      return;
    }
    setDownloadingPdf(true);
    try {
      await downloadResidentDossierPdfApi(token, bookingId, month);
      toast.success("Full resident record PDF downloaded (includes ID card images)");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleDownloadExcel() {
    if (!token || !bookingId) {
      toast.error("You must be signed in to download");
      return;
    }
    setDownloadingExcel(true);
    try {
      await downloadResidentDossierExcelApi(token, bookingId, month);
      toast.success("Resident record Excel downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Excel download failed");
    } finally {
      setDownloadingExcel(false);
    }
  }

  async function handleDownloadMonthInvoice(monthKey: string) {
    if (!token || !bookingId) {
      toast.error("You must be signed in to download");
      return;
    }
    setInvoiceMonth(monthKey);
    try {
      await downloadResidentMonthInvoiceApi(token, bookingId, monthKey);
      toast.success(`Rent invoice for ${monthKey} downloaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invoice download failed");
    } finally {
      setInvoiceMonth(null);
    }
  }

  async function handleEmailMonthReceipt(monthKey: string) {
    if (!token || !bookingId) {
      toast.error("You must be signed in");
      return;
    }
    setEmailingMonth(monthKey);
    try {
      const res = await emailResidentMonthReceiptApi(token, bookingId, monthKey);
      toast.success(res.message || `Receipt for ${monthKey} emailed to resident`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to email receipt");
    } finally {
      setEmailingMonth(null);
    }
  }

  async function handleDownloadSelectedInvoices() {
    if (!token || !bookingId) {
      toast.error("You must be signed in to download");
      return;
    }
    if (invoiceMonths.length === 0) {
      toast.error("Select at least one month");
      return;
    }
    setDownloadingCombined(true);
    try {
      await downloadResidentMonthInvoiceApi(token, bookingId, invoiceMonths);
      toast.success(
        invoiceMonths.length === 1
          ? `Rent invoice for ${invoiceMonths[0]} downloaded`
          : `Combined invoice for ${invoiceMonths.length} months downloaded`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invoice download failed");
    } finally {
      setDownloadingCombined(false);
    }
  }

  function toggleInvoiceMonth(monthKey: string, checked: boolean) {
    setInvoiceMonths((prev) => {
      if (checked) return [...new Set([...prev, monthKey])].sort();
      return prev.filter((m) => m !== monthKey);
    });
  }

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border/60 px-6 py-4 text-left">
          <SheetTitle>{r?.name ?? "Resident details"}</SheetTitle>
          {r ? (
            <p className="text-xs text-muted-foreground">
              {r.booking_ref} · {r.room_seat}
            </p>
          ) : null}
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : isError || !r || !stay || !summary ? (
            <p className="py-12 text-center text-sm text-destructive">Could not load resident details.</p>
          ) : (
            <>
              <div className="rounded-xl border border-border/60 px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={downloadingPdf}
                    onClick={() => void handleDownloadPdf()}
                  >
                    {downloadingPdf ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    PDF
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={downloadingExcel}
                    onClick={() => void handleDownloadExcel()}
                  >
                    {downloadingExcel ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                    )}
                    Excel
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={invoiceMonth === month}
                    onClick={() => void handleDownloadMonthInvoice(month)}
                  >
                    {invoiceMonth === month ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Receipt className="mr-2 h-4 w-4" />
                    )}
                    This month invoice
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={downloadingCombined || invoiceMonths.length === 0}
                    onClick={() => void handleDownloadSelectedInvoices()}
                  >
                    {downloadingCombined ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Receipt className="mr-2 h-4 w-4" />
                    )}
                    {invoiceMonths.length > 1
                      ? `Invoice ${invoiceMonths.length} months`
                      : "Invoice selected"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Living</p>
                  <p className="text-lg font-bold tabular-nums">{stay.months_living}</p>
                  <p className="text-[10px] text-muted-foreground">months so far</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Total stay</p>
                  <p className="text-lg font-bold tabular-nums">{stay.months_in_stay}</p>
                  <p className="text-[10px] text-muted-foreground">booked months</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Remaining</p>
                  <p className="text-lg font-bold tabular-nums">{stay.months_remaining}</p>
                  <p className="text-[10px] text-muted-foreground">months left</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Collected</p>
                  <p className="text-sm font-bold tabular-nums leading-tight">
                    {formatMoney(totalCollected, summary.currency)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">total earned</p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold">Personal information</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailField label="Name" value={r.name} />
                  <DetailField label="Father name" value={r.father_name} />
                  <DetailField label="Gender" value={GENDER_LABELS[r.gender]} />
                  <DetailField label="Type" value={RESIDENT_TYPE_LABELS[r.resident_type]} />
                  <DetailField label="CNIC number" value={r.cnic} />
                  <DetailField
                    label="CNIC images"
                    value={
                      r.cnic_image_front || r.cnic_image_back ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">Front</p>
                            {r.cnic_image_front ? (
                              <ResidentCnicThumb src={r.cnic_image_front} label="Front" />
                            ) : (
                              <p className="text-xs text-muted-foreground">Not uploaded</p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">Back</p>
                            {r.cnic_image_back ? (
                              <ResidentCnicThumb src={r.cnic_image_back} label="Back" />
                            ) : (
                              <p className="text-xs text-muted-foreground">Not uploaded</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <DetailField label="Email" value={r.email} />
                  <DetailField label="Contact number" value={r.contact_number} />
                  <DetailField label="Guardian contact number" value={r.guardian_contact} />
                  <DetailField label="Permanent address" value={r.permanent_address} />
                  <DetailField label="Channel" value={r.channel} />
                  {affiliation ? (
                    <DetailField label={affiliation.label} value={affiliation.value || "—"} />
                  ) : null}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold">Stay & booking</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailField label="Booking ID" value={r.booking_ref} />
                  <DetailField label="Booking date" value={r.booking_date} />
                  <DetailField label="Check-in" value={stay.move_in} />
                  <DetailField label="Check-out" value={stay.check_out} />
                  <DetailField label="Living since" value={stay.living_since} />
                  <DetailField label="Until" value={stay.living_until} />
                  <DetailField label="Room + seat" value={r.room_seat} />
                  <DetailField label="Seats booked" value={String(stay.seats_booked)} />
                  <DetailField label="Status" value={r.status.replace(/_/g, " ")} />
                  <DetailField
                    label="Security"
                    value={`${SECURITY_STATUS_LABELS[r.security_status]}${r.security_amount != null ? ` · ${formatMoney(r.security_amount, r.currency)}` : ""}`}
                  />
                  <DetailField
                    label="Returnable security"
                    value={
                      r.security_returnable != null
                        ? formatMoney(r.security_returnable, r.currency)
                        : r.security_amount != null
                          ? formatMoney(r.security_amount, r.currency)
                          : "—"
                    }
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Rent summary</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="secondary">
                    Total due: {formatMoney(summary.total_rent_due, summary.currency)}
                  </Badge>
                  <Badge variant="secondary">
                    Collected: {formatMoney(totalCollected, summary.currency)}
                  </Badge>
                  {(summary.amount_refunded ?? 0) > 0 ? (
                    <Badge variant="outline" className="text-rose-700 border-rose-500/30">
                      Rent refunded: {formatMoney(summary.amount_refunded ?? 0, summary.currency)}
                    </Badge>
                  ) : null}
                  {(summary.security_returned ?? 0) > 0 ? (
                    <Badge variant="outline" className="text-rose-700 border-rose-500/30">
                      Security returned: {formatMoney(summary.security_returned ?? 0, summary.currency)}
                    </Badge>
                  ) : null}
                  {(summary.security_retained ?? 0) > 0 ? (
                    <Badge variant="secondary">
                      Security kept: {formatMoney(summary.security_retained ?? 0, summary.currency)}
                    </Badge>
                  ) : null}
                  {(summary.net_collected ?? totalCollected) !== totalCollected ||
                  (summary.amount_retained ?? 0) > 0 ? (
                    <Badge variant="secondary">
                      Net kept: {formatMoney(summary.net_collected ?? totalCollected, summary.currency)}
                    </Badge>
                  ) : null}
                  <Badge variant="outline">{summary.paid_months} paid month(s)</Badge>
                  {(summary.partial_months ?? 0) > 0 ? (
                    <Badge variant="outline">{summary.partial_months} partial</Badge>
                  ) : null}
                  <Badge variant="outline">{summary.unpaid_months} unpaid month(s)</Badge>
                </div>
              </div>

              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Monthly rent history</h3>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() =>
                      setInvoiceMonths(allMonthsSelected ? [] : timeline.map((m) => m.month))
                    }
                  >
                    {allMonthsSelected ? "Clear invoice months" : "Select all months"}
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border/60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <span className="sr-only">Select</span>
                        </TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Rent</TableHead>
                        <TableHead className="text-right">Collected</TableHead>
                        <TableHead className="w-[1%] text-right">Invoice</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeline.map((m) => (
                        <TableRow key={m.month} className={m.month === month ? "bg-primary/5" : undefined}>
                          <TableCell>
                            <Checkbox
                              checked={selectedSet.has(m.month)}
                              onCheckedChange={(v) => toggleInvoiceMonth(m.month, v === true)}
                              aria-label={`Include ${m.label} in combined invoice`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{m.label}</TableCell>
                          <TableCell>{RENT_PAYMENT_STATUS_LABELS[m.payment_status]}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatMoney(m.rent_amount, summary.currency)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatMoney(m.collected_amount ?? 0, summary.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {m.payment_status === "paid" ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-primary hover:text-primary"
                                  title="Email PDF receipt to resident"
                                  disabled={emailingMonth === m.month}
                                  onClick={() => void handleEmailMonthReceipt(m.month)}
                                >
                                  {emailingMonth === m.month ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Mail className="h-3.5 w-3.5" />
                                  )}
                                  <span className="sr-only">Email receipt</span>
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                title="Download invoice/receipt PDF"
                                disabled={invoiceMonth === m.month}
                                onClick={() => void handleDownloadMonthInvoice(m.month)}
                              >
                                {invoiceMonth === m.month ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Receipt className="h-3.5 w-3.5" />
                                )}
                                <span className="sr-only">Download invoice</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Tick two or more months, then use Invoice selected to download them as one PDF.
                  Highlighted row is the month selected in the register filter.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold">Extra facilities</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Charged separately from rent, with their own paid / unpaid cycle.
                </p>
                {bookingId ? (
                  <ResidentExtrasEditor
                    bookingId={bookingId}
                    month={month}
                    extras={r.extras ?? []}
                    currency={r.currency}
                  />
                ) : null}
                {extrasSummary && extras.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <Badge variant="secondary">
                      Due: {formatMoney(extrasSummary.total_due, extrasSummary.currency)}
                    </Badge>
                    <Badge variant="secondary">
                      Collected: {formatMoney(extrasSummary.total_collected, extrasSummary.currency)}
                    </Badge>
                  </div>
                ) : null}
                {extras.map((extra) => (
                  <div key={extra.id} className="mt-3 overflow-x-auto rounded-xl border border-border/60">
                    <div className="border-b border-border/60 px-3 py-2 text-sm font-medium">
                      {extra.label} · {EXTRA_BILLING_CYCLE_LABELS[extra.billing_cycle]}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Charge</TableHead>
                          <TableHead className="text-right">Collected</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(extra.timeline ?? []).map((m) => (
                          <TableRow key={`${extra.id}-${m.month}`}>
                            <TableCell>{m.label ?? m.month}</TableCell>
                            <TableCell>{RENT_PAYMENT_STATUS_LABELS[m.payment_status]}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatMoney(m.amount, summary.currency)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatMoney(m.collected_amount ?? 0, summary.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pb-4">
                <Button type="button" variant="outline" size="sm" onClick={onEdit}>
                  Edit record
                </Button>
                {r.status !== "cancelled" && r.status !== "checked_out" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setChangeRoomOpen(true)}
                  >
                    Change room
                  </Button>
                ) : null}
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link to="/admin/bookings/$id" params={{ id: r.booking_id }}>
                    Open booking
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>

    {r ? (
      <ChangeRoomDialog
        open={changeRoomOpen}
        onOpenChange={setChangeRoomOpen}
        bookingId={r.booking_id}
        currentRoomId={
          r.room_id ??
          (typeof data?.booking?.room_id === "string" ? data.booking.room_id : null)
        }
        currentRoomTitle={r.room_title}
        seatsBooked={stay?.seats_booked ?? r.seats_booked ?? 1}
        hostelId={
          r.hostel_id ??
          (typeof data?.booking?.hostel_id === "string" ? data.booking.hostel_id : null)
        }
        bookingStatus={r.status}
      />
    ) : null}
    </>
  );
}
