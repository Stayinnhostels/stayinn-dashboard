import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, FileText, Loader2, Mail, Phone, User, X } from "lucide-react";
import { BookingNotesDisplay } from "@/components/admin/booking-notes-display";
import { BookingRefundDialog } from "@/components/admin/booking-refund-dialog";
import { BookingPricingCard } from "@/components/admin/booking-pricing-card";
import { BookingInvoicePanel } from "@/components/invoice/booking-invoice-panel";
import { toast } from "sonner";
import { useBookingQuery, useUpdateBookingStatusMutation } from "@/queries/bookings";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import type { BookingStatus } from "@/types/domain/booking.types";

export const Route = createFileRoute("/admin/bookings/$id")({ component: BookingDetailPage });

const STATUSES: BookingStatus[] = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];

function BookingDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: booking, isLoading, isError, error } = useBookingQuery(id);
  const updateStatus = useUpdateBookingStatusMutation();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (isLoading || !booking) return;
    if (typeof window !== "undefined" && window.location.hash === "#booking-invoice") {
      window.setTimeout(() => {
        document.getElementById("booking-invoice")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [booking?.id, isLoading]);

  function applyStatus(status: BookingStatus, amountRefunded?: number) {
    updateStatus.mutate(
      { id, status, amount_refunded: amountRefunded },
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

  function onCheckoutConfirm(amountRefunded: number) {
    applyStatus("checked_out", amountRefunded);
  }

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" /> Loading booking…
        </CardContent>
      </Card>
    );
  }

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
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Booking #{booking.id.slice(-6)}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Created {booking.created_at ? new Date(booking.created_at).toLocaleString() : "—"}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">
                {booking.status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Guest name" value={booking.guest_name} />
            <Field label="Guest email" value={booking.guest_email} />
            <Field label="Phone" value={booking.guest_phone || "—"} />
            <Field label="Move-in" value={booking.move_in ?? "—"} />
            <Field label="Check-out" value={booking.check_out ?? "—"} />
            <Field label="Seats booked" value={String(booking.seats_booked)} />
            <Field label="Months" value={String(booking.months)} />
            <Field
              label="Price per seat / month"
              value={formatMoney(booking.price_per_seat, normalizeMoneyCurrency(booking.currency))}
            />
            <Field label="Source" value={booking.source} />
            <Field
              label="Total amount"
              value={formatMoney(booking.total_amount, normalizeMoneyCurrency(booking.currency))}
            />
            {(booking.status === "cancelled" || booking.status === "checked_out") &&
              (booking.amount_refunded != null || booking.amount_retained != null) && (
              <>
                <Field
                  label="Refunded to guest"
                  value={formatMoney(booking.amount_refunded ?? 0, normalizeMoneyCurrency(booking.currency))}
                />
                <Field
                  label="Retained (revenue)"
                  value={formatMoney(booking.amount_retained ?? 0, normalizeMoneyCurrency(booking.currency))}
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

        <div className="space-y-4">
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
