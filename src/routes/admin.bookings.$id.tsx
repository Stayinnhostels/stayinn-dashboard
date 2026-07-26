import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, FileText, Mail, Pencil, Phone, User, X } from "lucide-react";
import { BookingDetailSkeleton } from "@/components/admin/bookings-page-skeletons";
import { BookingNotesDisplay } from "@/components/admin/booking-notes-display";
import { BookingRefundDialog } from "@/components/admin/booking-refund-dialog";
import { BookingPricingCard } from "@/components/admin/booking-pricing-card";
import { EditBookingDialog } from "@/components/admin/edit-booking-dialog";
import { SECURITY_STATUS_LABELS } from "@/types/domain/resident.types";
import { bookingSecurityAmount, isMonthlyBooking } from "@/lib/security-deposit";
import type { CheckoutConfirmExtras } from "@/components/admin/booking-refund-dialog";
import { BookingInvoicePanel } from "@/components/invoice/booking-invoice-panel";
import { toast } from "sonner";
import { useBookingQuery, useUpdateBookingStatusMutation } from "@/queries/bookings";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import type { BookingStatus } from "@/types/domain/booking.types";

export const Route = createFileRoute("/admin/bookings/$id")({
  component: BookingDetailPage,
  validateSearch: (search: Record<string, unknown>) => ({
    edit: search.edit === true || search.edit === "1" || search.edit === "true" ? true : undefined,
  }),
});

const STATUSES: BookingStatus[] = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];

function BookingDetailPage() {
  const { id } = Route.useParams();
  const { edit: editFromSearch } = Route.useSearch();
  const navigate = useNavigate();
  const { data: booking, isLoading, isError, error } = useBookingQuery(id);
  const updateStatus = useUpdateBookingStatusMutation();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (isLoading || !booking) return;
    if (typeof window !== "undefined" && window.location.hash === "#booking-invoice") {
      window.setTimeout(() => {
        document.getElementById("booking-invoice")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [booking?.id, isLoading]);

  useEffect(() => {
    if (!booking || !editFromSearch) return;
    setEditOpen(true);
    void navigate({
      to: "/admin/bookings/$id",
      params: { id },
      search: {},
      replace: true,
    });
  }, [booking?.id, editFromSearch, id, navigate]);

  function applyStatus(
    status: BookingStatus,
    amountRefunded?: number,
    checkoutExtras?: CheckoutConfirmExtras,
  ) {
    updateStatus.mutate(
      {
        id,
        status,
        amount_refunded: amountRefunded,
        ...(status === "checked_out" &&
        checkoutExtras &&
        booking?.security_status === "paid"
          ? { security_returned: checkoutExtras.securityReturned }
          : {}),
      },
      {
        onSuccess: () => {
          toast.success(
            status === "cancelled"
              ? "Booking cancelled"
              : status === "checked_out"
                ? "Guest checked out"
                : "Booking updated",
          );
          setCancelOpen(false);
          setCheckoutOpen(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
      },
    );
  }

  function onStatusChange(status: BookingStatus) {
    if (!booking || status === booking.status) return;
    if (status === "cancelled") {
      setCancelOpen(true);
      return;
    }
    if (status === "checked_out") {
      setCheckoutOpen(true);
      return;
    }
    applyStatus(status);
  }

  function onCancelConfirm(amountRefunded: number) {
    applyStatus("cancelled", amountRefunded);
  }

  function onCheckoutConfirm(amountRefunded: number, checkoutExtras?: CheckoutConfirmExtras) {
    applyStatus("checked_out", amountRefunded, checkoutExtras);
  }

  if (isLoading) {
    return <BookingDetailSkeleton />;
  }

  const cur = booking ? normalizeMoneyCurrency(booking.currency) : "pkr";
  const isMonthlyStay = booking ? isMonthlyBooking(booking) : false;
  const securityAmount = booking ? bookingSecurityAmount(booking, cur) : null;

  if (isError || !booking) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Booking not found."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/bookings" })}>
          <ArrowLeft className="h-4 w-4" /> Back to bookings
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit booking
          </Button>
          <Button
            variant="default"
            onClick={() => document.getElementById("booking-invoice")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            <FileText className="h-4 w-4" /> Invoice / Bill
          </Button>
          <Button variant="outline" onClick={() => onStatusChange("confirmed")}>
            <CheckCircle2 className="h-4 w-4" /> Confirm
          </Button>
          <Button variant="outline" onClick={() => setCheckoutOpen(true)}>
            Mark completed
          </Button>
          <Button variant="destructive" onClick={() => onStatusChange("cancelled")}>
            <X className="h-4 w-4" /> Cancel
          </Button>
        </div>
      </div>

      <EditBookingDialog booking={booking} open={editOpen} onOpenChange={setEditOpen} />

      <BookingRefundDialog
        open={cancelOpen}
        booking={booking ?? null}
        mode="cancel"
        submitting={updateStatus.isPending}
        onClose={() => setCancelOpen(false)}
        onConfirm={onCancelConfirm}
      />

      <BookingRefundDialog
        open={checkoutOpen}
        booking={booking ?? null}
        mode="checkout"
        submitting={updateStatus.isPending}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={onCheckoutConfirm}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Booking #{booking.id.slice(-6)}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Created {booking.created_at ? new Date(booking.created_at).toLocaleString() : "—"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {booking.status.replace("_", " ")}
                </Badge>
                <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Guest name" value={booking.guest_name} />
            <Field label="Guest email" value={booking.guest_email} />
            <Field label="Phone" value={booking.guest_phone || "—"} />
            <Field label="Move-in" value={booking.move_in ?? "—"} />
            <Field label="Check-out" value={booking.check_out ?? "—"} />
            <Field label="Seats booked" value={String(booking.seats_booked)} />
            <Field
              label={booking.stay_unit === "night" ? "Nights" : "Months"}
              value={
                booking.stay_unit === "night"
                  ? String(booking.nights ?? "—")
                  : String(booking.months)
              }
            />
            <Field
              label="Price per seat / month"
              value={formatMoney(booking.price_per_seat, normalizeMoneyCurrency(booking.currency))}
            />
            <Field label="Source" value={booking.source} />
            <Field
              label="Rent total"
              value={formatMoney(booking.total_amount, normalizeMoneyCurrency(booking.currency))}
            />
            {isMonthlyStay && securityAmount != null && (
              <>
                <Field
                  label="Security deposit"
                  value={formatMoney(securityAmount, normalizeMoneyCurrency(booking.currency))}
                />
                <Field
                  label="Security status"
                  value={SECURITY_STATUS_LABELS[booking.security_status ?? "not_paid"]}
                />
              </>
            )}
            {isMonthlyStay && booking.months_paid_upfront != null && booking.months > 1 && (
              <Field
                label="Rent months committed upfront"
                value={`${booking.months_paid_upfront} of ${booking.months}`}
              />
            )}
            {booking.amount_paid_upfront != null && (
              <Field
                label="Rent collected so far"
                value={formatMoney(booking.amount_paid_upfront, normalizeMoneyCurrency(booking.currency))}
              />
            )}
            {booking.amount_outstanding != null && booking.amount_outstanding > 0 && (
              <Field
                label="Rent still due"
                value={formatMoney(booking.amount_outstanding, normalizeMoneyCurrency(booking.currency))}
              />
            )}
            {isMonthlyStay && securityAmount != null && (
              <Field
                label="Est. due at check-in"
                value={formatMoney(
                  (booking.months > 0
                    ? Math.round(
                        (booking.total_amount / booking.months) *
                          (booking.months_paid_upfront ?? 1) *
                          100,
                      ) / 100
                    : 0) + (booking.security_status === "paid" ? 0 : securityAmount),
                  normalizeMoneyCurrency(booking.currency),
                )}
              />
            )}
            {(booking.status === "cancelled" || booking.status === "checked_out") &&
              (booking.amount_refunded != null || booking.amount_retained != null) && (
              <>
                <Field
                  label="Rent refunded to guest"
                  value={formatMoney(booking.amount_refunded ?? 0, normalizeMoneyCurrency(booking.currency))}
                />
                <Field
                  label="Rent kept (revenue)"
                  value={formatMoney(booking.amount_retained ?? 0, normalizeMoneyCurrency(booking.currency))}
                />
              </>
            )}
            {booking.status === "checked_out" &&
              (booking.security_returned != null || booking.security_retained != null) && (
              <>
                <Field
                  label="Security returned to guest"
                  value={formatMoney(booking.security_returned ?? 0, normalizeMoneyCurrency(booking.currency))}
                />
                <Field
                  label="Security kept (revenue)"
                  value={formatMoney(booking.security_retained ?? 0, normalizeMoneyCurrency(booking.currency))}
                />
              </>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Change status</p>
              <Select value={booking.status} onValueChange={(v) => onStatusChange(v as BookingStatus)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <BookingNotesDisplay booking={booking} />
          </CardContent>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
          {booking.room_id && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Room</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/admin/rooms/$id" params={{ id: booking.room_id }} className="font-bold hover:underline">
                  {booking.room_title ?? "View room"}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {booking.seats_booked} seat(s) · {booking.months} month(s)
                </p>
              </CardContent>
            </Card>
          )}

          <BookingPricingCard booking={booking} />

          {booking.user_id && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <Link to="/admin/users/$id" params={{ id: booking.user_id }} className="font-semibold hover:underline">
                    View profile
                  </Link>
                </p>
                {booking.guest_email && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {booking.guest_email}
                  </p>
                )}
                {booking.guest_phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {booking.guest_phone}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      <section id="booking-invoice" className="scroll-mt-24">
        <BookingInvoicePanel booking={booking} />
      </section>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Activity timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-4 border-l border-border pl-6 text-sm">
            <TimelineItem label="Booking created" at={booking.created_at} />
            {booking.updated_at && booking.updated_at !== booking.created_at && (
              <TimelineItem label={`Status: ${booking.status.replace("_", " ")}`} at={booking.updated_at} />
            )}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function TimelineItem({ label, at }: { label: string; at: string | null }) {
  if (!at) return null;
  return (
    <li>
      <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
      <p className="font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">{new Date(at).toLocaleString()}</p>
    </li>
  );
}
