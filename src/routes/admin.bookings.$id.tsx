import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, Mail, RotateCcw, User, X } from "lucide-react";
import { toast } from "sonner";
import { bookings as bookingStore, payments as paymentStore, getRoom, type BookingStatus } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/bookings/$id")({ component: BookingDetailPage });

const STATUSES: BookingStatus[] = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];

function BookingDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["mock", "booking", id],
    queryFn: async () => {
      const booking = bookingStore.find((b) => b.id === id);
      if (!booking) return null;
      const room = getRoom(booking.room_id ?? "");
      const bookingPayments = paymentStore.filter((p) => p.booking_id === id);
      return { booking, room, payments: bookingPayments };
    },
  });

  const update = useMutation({
    mutationFn: async (patch: { status?: BookingStatus; notes?: string }) => {
      const b = bookingStore.find((x) => x.id === id);
      if (b) Object.assign(b, patch, { updated_at: new Date().toISOString() });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mock"] }); toast.success("Booking updated"); },
  });

  const refund = useMutation({
    mutationFn: async () => { paymentStore.filter((p) => p.booking_id === id).forEach((p) => { p.status = "refunded"; }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mock"] }); toast.success("Payments marked as refunded"); },
  });

  if (!data) return <Card className="border-border/60"><CardContent className="py-16 text-center text-sm text-muted-foreground">Booking not found.</CardContent></Card>;
  const { booking, room, payments } = data;
  const totalPaid = payments.filter((p) => p.status === "succeeded").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/bookings" })}><ArrowLeft className="h-4 w-4" /> Back to bookings</Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => update.mutate({ status: "confirmed" })}><CheckCircle2 className="h-4 w-4" /> Approve</Button>
          <Button variant="outline" onClick={() => update.mutate({ status: "checked_out" })}>Mark completed</Button>
          <Button variant="outline" onClick={() => refund.mutate()}><RotateCcw className="h-4 w-4" /> Refund</Button>
          <Button variant="destructive" onClick={() => update.mutate({ status: "cancelled" })}><X className="h-4 w-4" /> Cancel</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Booking #{booking.id.slice(-6)}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Created {new Date(booking.created_at).toLocaleString()}</p>
              </div>
              <Badge variant="outline" className="capitalize">{booking.status.replace("_", " ")}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Guest name" value={booking.guest_name} />
            <Field label="Guest email" value={booking.guest_email} />
            <Field label="Phone" value={booking.guest_phone || "—"} />
            <Field label="Check-in" value={booking.check_in} />
            <Field label="Check-out" value={booking.check_out} />
            <Field label="Guests" value={String(booking.guests)} />
            <Field label="Source" value={booking.source} />
            <Field label="Total amount" value={`$${booking.total_amount.toLocaleString()}`} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Change status</p>
              <Select value={booking.status} onValueChange={(v) => update.mutate({ status: v as BookingStatus })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {booking.notes && (
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notes</p>
                <p className="mt-1 rounded-lg bg-muted p-3 text-sm">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {room && (
            <Card className="border-border/60">
              <CardHeader><CardTitle className="text-base">Room</CardTitle></CardHeader>
              <CardContent>
                {room.images?.[0] && <img src={room.images[0]} alt="" className="mb-3 aspect-video w-full rounded-md object-cover" />}
                <Link to="/admin/rooms/$id" params={{ id: room.id }} className="font-bold hover:underline">{room.title}</Link>
                <p className="text-xs capitalize text-muted-foreground">{room.category} · ${room.price_per_night}/night</p>
              </CardContent>
            </Card>
          )}

          {booking.user_id && (
            <Card className="border-border/60">
              <CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /> <Link to="/admin/users/$id" params={{ id: booking.user_id }} className="font-semibold hover:underline">View profile</Link></p>
                {booking.guest_email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {booking.guest_email}</p>}
              </CardContent>
            </Card>
          )}

          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-base">Payments</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {payments.length === 0 ? (
                <p className="text-muted-foreground">No payments yet.</p>
              ) : (<>
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border-b py-1 last:border-0">
                    <Badge variant="outline" className="capitalize">{p.status}</Badge>
                    <span className="font-mono font-bold">${p.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground">Total paid</span>
                  <span className="font-bold">${totalPaid.toLocaleString()}</span>
                </div>
              </>)}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader><CardTitle className="text-base">Activity timeline</CardTitle></CardHeader>
        <CardContent>
          <ol className="relative space-y-4 border-l border-border pl-6 text-sm">
            <TimelineItem label="Booking created" at={booking.created_at} />
            {booking.updated_at && booking.updated_at !== booking.created_at && (
              <TimelineItem label="Last updated" at={booking.updated_at} />
            )}
            {payments.map((p) => (
              <TimelineItem key={p.id} label={`Payment ${p.status} — $${p.amount.toLocaleString()}`} at={p.created_at} />
            ))}
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

function TimelineItem({ label, at }: { label: string; at: string }) {
  return (
    <li>
      <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
      <p className="font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">{new Date(at).toLocaleString()}</p>
    </li>
  );
}
