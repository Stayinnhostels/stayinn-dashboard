import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, Mail, RotateCcw, User, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bookings/$id")({
  component: BookingDetailPage,
});

const STATUSES = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"] as const;

function BookingDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["admin", "booking", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, rooms(*), payments(*)")
        .eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async (patch: { status?: string; check_in?: string; check_out?: string; notes?: string }) => {
      const { error } = await supabase.from("bookings").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "booking", id] });
      toast.success("Booking updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const refund = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("payments").update({ status: "refunded" }).eq("booking_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "booking", id] });
      toast.success("Payments marked as refunded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !booking) {
    return <Card className="border-border/60"><CardContent className="py-16 text-center text-sm text-muted-foreground">Loading…</CardContent></Card>;
  }

  const room = booking.rooms;
  const payments = booking.payments ?? [];
  const totalPaid = payments.filter((p: any) => p.status === "succeeded").reduce((s: number, p: any) => s + Number(p.amount), 0);

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
                <CardTitle>Booking #{booking.id.slice(0, 8)}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Created {new Date(booking.created_at).toLocaleString()}</p>
              </div>
              <Badge variant="outline" className="capitalize">{booking.status.replace("_", " ")}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Guest name" value={booking.guest_name ?? "—"} />
            <Field label="Guest email" value={booking.guest_email ?? "—"} />
            <Field label="Check-in" value={booking.check_in} />
            <Field label="Check-out" value={booking.check_out} />
            <Field label="Guests" value={String(booking.guests)} />
            <Field label="Source" value={booking.source} />
            <Field label="Total amount" value={`$${Number(booking.total_amount).toLocaleString()}`} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Change status</p>
              <Select value={booking.status} onValueChange={(v) => update.mutate({ status: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}
                </SelectContent>
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
                <p className="text-xs capitalize text-muted-foreground">{room.category} · ${Number(room.price_per_night).toLocaleString()}/night</p>
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
              ) : (
                <>
                  {payments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between border-b py-1 last:border-0">
                      <Badge variant="outline" className="capitalize">{p.status}</Badge>
                      <span className="font-mono font-bold">${Number(p.amount).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-muted-foreground">Total paid</span>
                    <span className="font-bold">${totalPaid.toLocaleString()}</span>
                  </div>
                </>
              )}
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
            {payments.map((p: any) => (
              <TimelineItem key={p.id} label={`Payment ${p.status} — $${Number(p.amount).toLocaleString()}`} at={p.created_at} />
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
