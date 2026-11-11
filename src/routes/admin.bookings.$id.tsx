import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BedDouble, CalendarRange, FileText, Mail, Pencil, Phone, User, UserRound, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingDetailSkeleton } from "@/components/admin/bookings-page-skeletons";
import { BookingNotesDisplay } from "@/components/admin/booking-notes-display";
import { BookingRefundDialog } from "@/components/admin/booking-refund-dialog";
import { BookingSecurityCard } from "@/components/admin/booking-security-card";
import { ChangeRoomDialog } from "@/components/admin/change-room-dialog";
import { EditBookingDialog } from "@/components/admin/edit-booking-dialog";
import { SECURITY_STATUS_LABELS, RESIDENT_TYPE_LABELS, affiliationForResident } from "@/types/domain/resident.types";
import { bookingSecurityAmount, isMonthlyBooking } from "@/lib/security-deposit";
import type { CheckoutConfirmExtras } from "@/components/admin/booking-refund-dialog";
import { BookingInvoicePanel } from "@/components/invoice/booking-invoice-panel";
import { HostelPropertyBadge } from "@/components/admin/hostel-property-badge";
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

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  checked_out: "Checked out",
  cancelled: "Cancelled",
};

const statusColor: Record<BookingStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  confirmed: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  checked_in: "bg-violet-500/15 text-violet-600 border-violet-500/30",
  checked_out: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-600 border-rose-500/30",
};

function BookingDetailPage() {
  const { id } = Route.useParams();
  const { edit: editFromSearch } = Route.useSearch();
  const navigate = useNavigate();
  const { data: booking, isLoading, isError, error } = useBookingQuery(id);
  const updateStatus = useUpdateBookingStatusMutation();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [changeRoomOpen, setChangeRoomOpen] = useState(false);

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
        checkoutExtras?.rentCollected != null
          ? { checkout_rent_collected: checkoutExtras.rentCollected }
          : {}),
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

  const affiliation = affiliationForResident(booking);
  const money = (amount: number) => formatMoney(amount, cur);
  const securityStatus = booking.security_status ?? "not_paid";
  const collected = booking.amount_paid_upfront;
  const stillDue = booking.amount_outstanding;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/bookings" })}>
          <ArrowLeft className="h-4 w-4" /> Back to bookings
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit booking
          </Button>
          <Button
            onClick={() =>
              document.getElementById("booking-invoice")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            <FileText className="h-4 w-4" /> Invoice / Bill
          </Button>
          <Select value={booking.status} onValueChange={(v) => onStatusChange(v as BookingStatus)}>
            <SelectTrigger className="w-[160px]" aria-label="Booking status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <EditBookingDialog booking={booking} open={editOpen} onOpenChange={setEditOpen} />

      <ChangeRoomDialog
        open={changeRoomOpen}
        onOpenChange={setChangeRoomOpen}
        bookingId={booking.id}
        currentRoomId={booking.room_id}
        currentRoomTitle={booking.room_title}
        seatsBooked={booking.seats_booked}
        hostelId={booking.hostel_id}
        bookingStatus={booking.status}
      />

      <BookingRefundDialog
        open={cancelOpen}
        booking={booking}
        mode="cancel"
        submitting={updateStatus.isPending}
        onClose={() => setCancelOpen(false)}
        onConfirm={onCancelConfirm}
      />

      <BookingRefundDialog
        open={checkoutOpen}
        booking={booking}
        mode="checkout"
        submitting={updateStatus.isPending}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={onCheckoutConfirm}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-xl">{booking.guest_name}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Booking #{booking.id.slice(-6)}</p>
                <div className="mt-2">
                  <HostelPropertyBadge
                    hostelId={booking.hostel_id}
                    hostelName={booking.hostel_name}
                    showAllProperties={false}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Created {booking.created_at ? new Date(booking.created_at).toLocaleString() : "—"}
                </p>
              </div>
              <Badge variant="outline" className={cn("px-2.5 py-0.5", statusColor[booking.status])}>
                {STATUS_LABELS[booking.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailGroup title="Guest" icon={UserRound}>
                <DetailRow label="Name" value={booking.guest_name} />
                <DetailRow
                  label="Email"
                  value={
                    booking.guest_email ? (
                      <a href={`mailto:${booking.guest_email}`} className="hover:underline">
                        {booking.guest_email}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <DetailRow
                  label="Phone"
                  value={
                    booking.guest_phone ? (
                      <a href={`tel:${booking.guest_phone}`} className="hover:underline">
                        {booking.guest_phone}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <DetailRow label="Type" value={RESIDENT_TYPE_LABELS[booking.resident_type || ""] || "—"} />
                {affiliation ? <DetailRow label={affiliation.label} value={affiliation.value || "—"} /> : null}
                <DetailRow label="Source" value={booking.source || "—"} />
              </DetailGroup>

              <DetailGroup title="Stay" icon={CalendarRange}>
                <DetailRow label="Move-in" value={formatStayDate(booking.move_in)} />
                <DetailRow label="Check-out" value={formatStayDate(booking.check_out)} />
                <DetailRow label="Seats" value={String(booking.seats_booked)} />
                <DetailRow
                  label={booking.stay_unit === "night" ? "Nights" : "Months"}
                  value={booking.stay_unit === "night" ? String(booking.nights ?? "—") : String(booking.months)}
                />
                <DetailRow
                  label={booking.stay_unit === "night" ? "Price / seat / night" : "Price / seat / month"}
                  value={money(booking.price_per_seat)}
                />
              </DetailGroup>
            </div>

            <DetailGroup title="Payment" icon={Wallet} columns={2}>
              <DetailRow label="Rent total" value={money(booking.total_amount)} />
              {collected != null && (
                <DetailRow label="Collected" value={money(collected)} accent={collected > 0 ? "paid" : undefined} />
              )}
              {stillDue != null && (
                <DetailRow label="Still due" value={money(stillDue)} accent={stillDue > 0 ? "due" : "paid"} />
              )}
              {isMonthlyStay && securityAmount != null && (
                <>
                  <DetailRow label="Security deposit" value={money(securityAmount)} />
                  <DetailRow
                    label="Security status"
                    value={
                      <Badge variant="outline" className={cn("font-semibold", securityColor[securityStatus])}>
                        {SECURITY_STATUS_LABELS[securityStatus]}
                      </Badge>
                    }
                  />
                </>
              )}
              {isMonthlyStay && booking.months_paid_upfront != null && booking.months > 1 && (
                <DetailRow
                  label="Months paid upfront"
                  value={`${booking.months_paid_upfront} of ${booking.months}`}
                />
              )}
              {(booking.status === "cancelled" || booking.status === "checked_out") &&
                (booking.amount_refunded != null || booking.amount_retained != null) && (
                  <>
                    <DetailRow label="Rent refunded" value={money(booking.amount_refunded ?? 0)} />
                    <DetailRow label="Rent kept" value={money(booking.amount_retained ?? 0)} />
                  </>
                )}
              {booking.status === "checked_out" &&
                (booking.security_returned != null || booking.security_retained != null) && (
                  <>
                    <DetailRow label="Security returned" value={money(booking.security_returned ?? 0)} />
                    <DetailRow label="Security kept" value={money(booking.security_retained ?? 0)} />
                  </>
                )}
            </DetailGroup>

            <BookingNotesDisplay booking={booking} />
          </CardContent>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {booking.room_id && (
            <Card className="border-border/60">
              <CardContent className="flex items-start gap-3 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BedDouble className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">Room</p>
                  <Link
                    to="/admin/rooms/$id"
                    params={{ id: booking.room_id }}
                    className="mt-0.5 block truncate font-semibold hover:underline"
                  >
                    {booking.room_title ?? "View room"}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {booking.seats_booked} seat(s) ·{" "}
                    {booking.stay_unit === "night"
                      ? `${booking.nights ?? "—"} night(s)`
                      : `${booking.months} month(s)`}
                  </p>
                  {booking.status !== "cancelled" && booking.status !== "checked_out" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setChangeRoomOpen(true)}
                    >
                      Change room
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )}

          <BookingSecurityCard booking={booking} />

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
                  <p className="flex items-center gap-2 break-all">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> {booking.guest_email}
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
              <TimelineItem label={`Status: ${STATUS_LABELS[booking.status]}`} at={booking.updated_at} />
            )}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

const securityColor: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  not_paid: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  returned: "bg-sky-500/15 text-sky-700 border-sky-500/30",
  held: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  not_applicable: "bg-muted text-muted-foreground border-border",
};

function formatStayDate(value: string | null | undefined) {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DetailGroup({
  title,
  icon: Icon,
  children,
  columns = 1,
}: {
  title: string;
  icon: typeof UserRound;
  children: ReactNode;
  columns?: 1 | 2;
}) {
  return (
    <section className="rounded-xl bg-muted/30 p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-background text-primary shadow-sm ring-1 ring-border/70">
          <Icon className="h-3.5 w-3.5" />
        </span>
        {title}
      </h2>
      <div className={columns === 2 ? "grid gap-x-8 gap-y-3 sm:grid-cols-2" : "grid gap-y-3"}>{children}</div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: ReactNode;
  accent?: "paid" | "due";
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div
        className={cn(
          "mt-0.5 break-words text-sm font-semibold leading-snug",
          accent === "due" && "text-rose-600 dark:text-rose-400",
          accent === "paid" && "text-emerald-700 dark:text-emerald-400",
          !accent && "text-foreground",
        )}
      >
        {value}
      </div>
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
