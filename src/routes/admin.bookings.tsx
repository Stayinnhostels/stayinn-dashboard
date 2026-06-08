import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Eye, FileText, LayoutGrid, List as ListIcon, Loader2, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BookingRefundDialog } from "@/components/admin/booking-refund-dialog";
import { useBookingsQuery, useUpdateBookingStatusMutation } from "@/queries/bookings";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import type { Booking, BookingStatus } from "@/types/domain/booking.types";

export const Route = createFileRoute("/admin/bookings")({ component: BookingsAdminPage });

const PAGE_SIZE = 50;
const STATUSES: BookingStatus[] = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  confirmed: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  checked_in: "bg-violet-500/15 text-violet-600 border-violet-500/30",
  checked_out: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-600 border-rose-500/30",
};

function BookingsAdminPage() {
  const detailMatch = useMatch({ from: "/admin/bookings/$id", shouldThrow: false });
  if (detailMatch) return <Outlet />;
  return <BookingsListPage />;
}

function BookingsListPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "table" | "calendar">("grid");
  const [page, setPage] = useState(1);

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(statusFilter !== "all" ? { status: statusFilter as BookingStatus } : {}),
      ...(query.trim() ? { search: query.trim() } : {}),
    }),
    [page, statusFilter, query],
  );

  const { data, isLoading, isError, error } = useBookingsQuery(listParams);
  const bookings = data?.bookings ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  const updateStatus = useUpdateBookingStatusMutation();
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [checkoutBookingId, setCheckoutBookingId] = useState<string | null>(null);
  const cancelBooking = bookings.find((b) => b.id === cancelBookingId) ?? null;
  const checkoutBooking = bookings.find((b) => b.id === checkoutBookingId) ?? null;

  function applyStatus(id: string, status: BookingStatus, amountRefunded?: number) {
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
          setCancelBookingId(null);
          setCheckoutBookingId(null);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
      },
    );
  }

  function onStatusChange(id: string, status: BookingStatus, currentStatus: BookingStatus) {
    if (status === currentStatus) return;
    if (status === "cancelled") {
      setCancelBookingId(id);
      return;
    }
    if (status === "checked_out") {
      setCheckoutBookingId(id);
      return;
    }
    applyStatus(id, status);
  }

  function onCancelConfirm(amountRefunded: number) {
    if (!cancelBookingId) return;
    applyStatus(cancelBookingId, "cancelled", amountRefunded);
  }

  function onCheckoutConfirm(amountRefunded: number) {
    if (!checkoutBookingId) return;
    applyStatus(checkoutBookingId, "checked_out", amountRefunded);
  }

  function exportCsv() {
    const rows = [
      ["ID", "Guest", "Email", "Room", "Seats", "Move-in", "Check-out", "Status", "Total"],
      ...bookings.map((b) => [
        b.id,
        b.guest_name,
        b.guest_email,
        b.room_title ?? "",
        String(b.seats_booked),
        b.move_in ?? "",
        b.check_out ?? "",
        b.status,
        String(b.total_amount),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <BookingRefundDialog
        open={cancelBookingId != null}
        booking={cancelBooking}
        mode="cancel"
        submitting={updateStatus.isPending}
        onClose={() => setCancelBookingId(null)}
        onConfirm={onCancelConfirm}
      />

      <BookingRefundDialog
        open={checkoutBookingId != null}
        booking={checkoutBooking}
        mode="checkout"
        submitting={updateStatus.isPending}
        onClose={() => setCheckoutBookingId(null)}
        onConfirm={onCheckoutConfirm}
      />

      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by guest, room, ID…"
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "table" | "calendar")}>
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="table">
                <ListIcon className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarCheck className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={exportCsv} disabled={bookings.length === 0}>
            Export CSV
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="border-border/60">
          <CardContent className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" /> Loading bookings…
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load bookings"}
          </CardContent>
        </Card>
      ) : bookings.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">No bookings found.</CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bookings.map((b) => (
            <Card key={b.id} className="overflow-hidden border-border/60 transition-shadow hover:shadow-lg">
              <div className="relative flex aspect-[4/3] items-center justify-center bg-muted">
                <CalendarCheck className="h-12 w-12 text-muted-foreground/40" />
                <Badge variant="outline" className={`absolute right-2 top-2 capitalize ${statusColor[b.status]}`}>
                  {b.status.replace("_", " ")}
                </Badge>
              </div>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="truncate font-bold tracking-tight">{b.guest_name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">#{b.id.slice(-6)}</p>
                </div>
                <p className="truncate text-xs text-muted-foreground">{b.room_title ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {b.move_in} → {b.check_out} · {b.seats_booked} seat(s)
                </p>
                <p className="text-lg font-extrabold">
                  {formatMoney(b.total_amount, normalizeMoneyCurrency(b.currency))}
                </p>
                <div className="flex gap-2 pt-1">
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link to="/admin/bookings/$id" params={{ id: b.id }}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </Link>
                  </Button>
                  <Select
                    value={b.status}
                    onValueChange={(v) => onStatusChange(b.id, v as BookingStatus, b.status)}
                  >
                    <SelectTrigger className="h-8 w-32 text-xs">
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : view === "table" ? (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-44">Quick action</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">#{b.id.slice(-6)}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{b.guest_name}</div>
                      <div className="text-xs text-muted-foreground">{b.guest_email}</div>
                    </TableCell>
                    <TableCell>{b.room_title ?? "—"}</TableCell>
                    <TableCell className="text-sm">
                      {b.move_in} → {b.check_out}
                    </TableCell>
                    <TableCell>{b.seats_booked}</TableCell>
                    <TableCell>{formatMoney(b.total_amount, normalizeMoneyCurrency(b.currency))}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${statusColor[b.status]}`}>
                        {b.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                    value={b.status}
                    onValueChange={(v) => onStatusChange(b.id, v as BookingStatus, b.status)}
                  >
                        <SelectTrigger className="h-8">
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
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild size="sm" variant="ghost" title="View booking">
                          <Link to="/admin/bookings/$id" params={{ id: b.id }}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost" title="Invoice / Bill">
                          <Link to="/admin/bookings/$id" params={{ id: b.id }} hash="booking-invoice">
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <CalendarView bookings={bookings} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
            {pagination ? ` · ${pagination.total} bookings` : ""}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function CalendarView({ bookings }: { bookings: Booking[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const month = cursor.getMonth();
  const year = cursor.getFullYear();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const total = startPad + last.getDate();
  const cells: (Date | null)[] = Array.from({ length: total }).map((_, i) =>
    i < startPad ? null : new Date(year, month, i - startPad + 1),
  );
  while (cells.length % 7 !== 0) cells.push(null);

  function bookingsForDay(d: Date) {
    const iso = d.toISOString().slice(0, 10);
    return bookings.filter((b) => b.move_in && b.check_out && iso >= b.move_in && iso <= b.check_out);
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date(year, month - 1, 1))}>
            ‹ Prev
          </Button>
          <p className="font-bold">{cursor.toLocaleString("en", { month: "long", year: "numeric" })}</p>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date(year, month + 1, 1))}>
            Next ›
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((d, i) => (
            <div key={i} className="min-h-20 rounded-md border border-border/60 bg-card/40 p-1 text-xs">
              {d && (
                <>
                  <p className="font-bold">{d.getDate()}</p>
                  <div className="mt-1 space-y-0.5">
                    {bookingsForDay(d)
                      .slice(0, 2)
                      .map((b) => (
                        <Link
                          key={b.id}
                          to="/admin/bookings/$id"
                          params={{ id: b.id }}
                          className="block truncate rounded bg-primary/15 px-1 text-[10px] font-semibold text-primary hover:bg-primary/25"
                        >
                          {b.guest_name}
                        </Link>
                      ))}
                    {bookingsForDay(d).length > 2 && (
                      <p className="text-[10px] text-muted-foreground">+{bookingsForDay(d).length - 2} more</p>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
