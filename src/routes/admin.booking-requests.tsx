import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, ClipboardList, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { StatCard } from "@/components/admin/stat-card";
import { StatCardsRowSkeleton } from "@/components/admin/admin-page-skeletons";
import {
  useBookingRequestsQuery,
  useResolveBookingRequestMutation,
} from "@/queries/booking-requests";
import { useHostelScope } from "@/lib/use-hostel-scope";
import type {
  BookingRequest,
  BookingRequestStatus,
} from "@/types/domain/booking-request.types";

export const Route = createFileRoute("/admin/booking-requests")({
  component: BookingRequestsPage,
});

const statusBadge: Record<BookingRequestStatus, string> = {
  pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  withdrawn: "bg-muted text-muted-foreground border-border",
};

function BookingRequestsPage() {
  const { hostelId } = useHostelScope();
  const [filter, setFilter] = useState<"all" | BookingRequestStatus>("pending");
  const listParams =
    filter === "all"
      ? { limit: 100, ...(hostelId ? { hostel: hostelId } : {}) }
      : { status: filter, limit: 100, ...(hostelId ? { hostel: hostelId } : {}) };
  const { data, isLoading, isError } = useBookingRequestsQuery(listParams, {
    enabled: Boolean(hostelId),
  });
  const resolveRequest = useResolveBookingRequestMutation();

  const requests = data?.requests ?? [];
  const stats = data?.stats;

  return (
    <div className="space-y-4">
      {isLoading ? (
        <StatCardsRowSkeleton count={2} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Pending" value={stats?.pending ?? 0} icon={ClipboardList} accent="warning" />
          <StatCard label="Total shown" value={stats?.total ?? 0} icon={Check} accent="primary" />
        </div>
      )}

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({stats?.pending ?? 0})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="withdrawn">Withdrawn</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Loading requests…
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-destructive">
            Could not load booking requests.
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 font-bold">No requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              resolving={resolveRequest.isPending}
              onResolve={(payload) =>
                resolveRequest.mutate(
                  { id: request.id, ...payload },
                  {
                    onSuccess: () =>
                      toast.success(payload.status === "approved" ? "Request approved" : "Request rejected"),
                    onError: (err) =>
                      toast.error(err instanceof Error ? err.message : "Could not update request"),
                  },
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
  onResolve,
  resolving,
}: {
  request: BookingRequest;
  onResolve: (payload: {
    status: "approved" | "rejected";
    admin_note?: string;
    amount_refunded?: number;
  }) => void;
  resolving: boolean;
}) {
  const [note, setNote] = useState("");
  const [refund, setRefund] = useState("0");

  const detail =
    request.type === "room_change"
      ? `Preferred room: ${request.payload.requested_room_title ?? request.payload.requested_room_id ?? "—"}`
      : request.type === "additional_seat"
        ? `Add ${request.payload.additional_seats ?? 1} seat(s) → total ${request.payload.target_seats ?? "—"}`
        : request.type === "extend_stay"
          ? `Checkout ${request.payload.current_check_out ?? "—"} → ${request.payload.requested_check_out ?? "—"}${
              request.payload.target_months
                ? ` (${request.payload.current_months ?? "?"} → ${request.payload.target_months} months)`
                : request.payload.target_nights
                  ? ` (${request.payload.current_nights ?? "?"} → ${request.payload.target_nights} nights)`
                  : ""
            }`
          : request.reason || "Cancellation request";

  return (
    <Card className="border-border/60">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-extrabold">{request.type_label}</p>
              <Badge variant="outline" className={statusBadge[request.status]}>
                {request.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {request.guest_name} · #{request.booking_ref} · {request.room_title ?? "Room"}
            </p>
            <p className="mt-1 text-sm">{detail}</p>
            {request.reason ? (
              <p className="mt-1 text-sm text-muted-foreground">Guest note: {request.reason}</p>
            ) : null}
            {request.created_at ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </p>
            ) : null}
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/bookings/$id" params={{ id: request.booking_id }}>
              Open booking
            </Link>
          </Button>
        </div>

        {request.status === "pending" ? (
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4">
            {request.type === "cancel" ? (
              <div className="space-y-1.5">
                <Label htmlFor={`refund-${request.id}`}>Refund amount (if paid)</Label>
                <Input
                  id={`refund-${request.id}`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={refund}
                  onChange={(e) => setRefund(e.target.value)}
                />
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor={`note-${request.id}`}>Staff note (optional)</Label>
              <Textarea
                id={`note-${request.id}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={resolving}
                onClick={() =>
                  onResolve({
                    status: "approved",
                    admin_note: note.trim() || undefined,
                    amount_refunded:
                      request.type === "cancel" ? Number(refund) || 0 : undefined,
                  })
                }
              >
                <Check className="h-4 w-4" />
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={resolving}
                onClick={() =>
                  onResolve({
                    status: "rejected",
                    admin_note: note.trim() || undefined,
                  })
                }
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        ) : request.admin_note ? (
          <p className="text-sm text-muted-foreground">Staff note: {request.admin_note}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
