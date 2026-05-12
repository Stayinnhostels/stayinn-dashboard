import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Eye, Search } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsAdminPage,
});

type Booking = {
  id: string;
  user_id: string | null;
  room_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
  total_amount: number;
  source: string;
  notes: string | null;
  created_at: string;
  rooms?: { title: string } | null;
};

const STATUSES = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"] as const;

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  confirmed: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  checked_in: "bg-violet-500/15 text-violet-600 border-violet-500/30",
  checked_out: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-600 border-rose-500/30",
};

function BookingsAdminPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"list" | "calendar">("list");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, rooms(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Booking[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Booking["status"] }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
      toast.success("Booking updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = bookings.filter(
    (b) =>
      (statusFilter === "all" || b.status === statusFilter) &&
      (!query ||
        b.guest_name?.toLowerCase().includes(query.toLowerCase()) ||
        b.guest_email?.toLowerCase().includes(query.toLowerCase()) ||
        b.rooms?.title.toLowerCase().includes(query.toLowerCase()) ||
        b.id.toLowerCase().includes(query.toLowerCase())),
  );

  function exportCsv() {
    const rows = [
      ["ID", "Guest", "Email", "Room", "Check-in", "Check-out", "Status", "Total"],
      ...filtered.map((b) => [b.id, b.guest_name ?? "", b.guest_email ?? "", b.rooms?.title ?? "", b.check_in, b.check_out, b.status, String(b.total_amount)]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bookings-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by guest, room, ID…" className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "calendar")}>
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
        </CardContent>
      </Card>

      {view === "list" ? (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-44">Quick action</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">No bookings.</TableCell></TableRow>
                ) : filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">#{b.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{b.guest_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{b.guest_email}</div>
                    </TableCell>
                    <TableCell>{b.rooms?.title ?? "—"}</TableCell>
                    <TableCell className="text-sm">{b.check_in} → {b.check_out}</TableCell>
                    <TableCell>${Number(b.total_amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${statusColor[b.status]}`}>{b.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={b.status} onValueChange={(v) => updateStatus.mutate({ id: b.id, status: v as Booking["status"] })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost"><Link to="/admin/bookings/$id" params={{ id: b.id }}><Eye className="h-4 w-4" /></Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <CalendarView bookings={filtered} />
      )}
    </div>
  );
}

function CalendarView({ bookings }: { bookings: Booking[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
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
    return bookings.filter((b) => iso >= b.check_in && iso <= b.check_out);
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date(year, month - 1, 1))}>‹ Prev</Button>
          <p className="font-bold">{cursor.toLocaleString("en", { month: "long", year: "numeric" })}</p>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date(year, month + 1, 1))}>Next ›</Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((d, i) => (
            <div key={i} className="min-h-20 rounded-md border border-border/60 bg-card/40 p-1 text-xs">
              {d && (
                <>
                  <p className="font-bold">{d.getDate()}</p>
                  <div className="mt-1 space-y-0.5">
                    {bookingsForDay(d).slice(0, 2).map((b) => (
                      <Link key={b.id} to="/admin/bookings/$id" params={{ id: b.id }}
                        className="block truncate rounded bg-primary/15 px-1 text-[10px] font-semibold text-primary hover:bg-primary/25">
                        {b.guest_name ?? "Guest"}
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
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarCheck className="h-3.5 w-3.5" /> Click a booking to view details
        </div>
      </CardContent>
    </Card>
  );
}
