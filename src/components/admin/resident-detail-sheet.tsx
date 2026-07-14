import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  downloadResidentDossierExcelApi,
  downloadResidentDossierPdfApi,
} from "@/api/residents";
import { useResidentDetailQuery } from "@/queries/residents";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import {
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

  const r = data?.resident;
  const stay = data?.stay;
  const summary = data?.rent_summary;
  const timeline = data?.rent_timeline ?? [];
  const totalCollected = summary?.total_rent_collected ?? summary?.total_rent_paid ?? 0;

  async function handleDownloadPdf() {
    if (!token || !bookingId) {
      toast.error("You must be signed in to download");
      return;
    }
    setDownloadingPdf(true);
    try {
      await downloadResidentDossierPdfApi(token, bookingId, month);
      toast.success("Resident record PDF downloaded");
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

  return (
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
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="text-xs font-medium text-primary">Official resident record</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Download a complete dossier for government or verification — check-in/out dates, room,
                  months lived, monthly rent, and total collected.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
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
                    Download PDF
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
                    Download Excel
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
                  <DetailField label="Email" value={r.email} />
                  <DetailField label="Contact number" value={r.contact_number} />
                  <DetailField label="Guardian contact number" value={r.guardian_contact} />
                  <DetailField label="Permanent address" value={r.permanent_address} />
                  <DetailField label="Channel / company" value={r.channel} />
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
                <h3 className="mb-3 text-sm font-semibold">Monthly rent history</h3>
                <div className="overflow-x-auto rounded-xl border border-border/60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Rent</TableHead>
                        <TableHead className="text-right">Collected</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeline.map((m) => (
                        <TableRow key={m.month} className={m.month === month ? "bg-primary/5" : undefined}>
                          <TableCell className="font-medium">{m.label}</TableCell>
                          <TableCell>{RENT_PAYMENT_STATUS_LABELS[m.payment_status]}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatMoney(m.rent_amount, summary.currency)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatMoney(m.collected_amount ?? 0, summary.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Highlighted row is the month selected in the register filter.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pb-4">
                <Button type="button" variant="outline" size="sm" onClick={onEdit}>
                  Edit record
                </Button>
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
  );
}
