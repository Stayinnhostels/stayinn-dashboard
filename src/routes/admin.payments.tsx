import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, RotateCcw, Search, Wallet, CheckCircle2, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/admin/stat-card";
import { payments as store, getBooking, getRoom, type Payment } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/payments")({ component: PaymentsPage });

function PaymentsPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: payments = [] } = useQuery({
    queryKey: ["mock", "payments"],
    queryFn: async () => [...store].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  });

  const refund = useMutation({
    mutationFn: async (id: string) => {
      const p = store.find((x) => x.id === id);
      if (p) p.status = "refunded";
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mock"] }); toast.success("Refunded"); },
  });

  const enriched = useMemo(() => payments.map((p) => {
    const b = getBooking(p.booking_id);
    const r = b ? getRoom(b.room_id ?? "") : null;
    return { ...p, guest_name: b?.guest_name ?? "—", guest_email: b?.guest_email ?? "", room_title: r?.title ?? "—" };
  }), [payments]);

  const filtered = enriched.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return p.guest_name.toLowerCase().includes(q) || p.guest_email.toLowerCase().includes(q) ||
      p.room_title.toLowerCase().includes(q) || p.id.includes(query);
  });

  const succeeded = payments.filter((p) => p.status === "succeeded");
  const total = succeeded.reduce((s, p) => s + p.amount, 0);
  const pendingTotal = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const refundedTotal = payments.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount, 0);

  function downloadInvoice(p: typeof enriched[number]) {
    const html = `<!doctype html><html><head><title>Invoice ${p.id.slice(-6)}</title>
<style>body{font-family:system-ui;padding:40px;max-width:720px;margin:auto;color:#111}
h1{font-size:28px;margin:0}.muted{color:#666;font-size:13px}
table{width:100%;border-collapse:collapse;margin-top:24px}
td,th{padding:10px;border-bottom:1px solid #eee;text-align:left}
.right{text-align:right}.total{font-size:20px;font-weight:800}
.brand{display:flex;justify-content:space-between;align-items:start}</style></head>
<body><div class="brand"><div><h1>Stay Inn Hostels</h1><p class="muted">stayinn.example.com</p></div>
<div class="right"><h2>INVOICE</h2><p class="muted">${p.id.slice(-6).toUpperCase()}<br>${new Date(p.created_at).toLocaleDateString()}</p></div></div>
<p style="margin-top:32px"><strong>Billed to</strong><br>${p.guest_name}<br>${p.guest_email}</p>
<table><thead><tr><th>Description</th><th class="right">Amount</th></tr></thead>
<tbody><tr><td>${p.room_title}</td><td class="right">$${p.amount.toLocaleString()} ${p.currency}</td></tr></tbody>
<tfoot><tr><td class="total">Total</td><td class="right total">$${p.amount.toLocaleString()}</td></tr></tfoot></table>
<p class="muted" style="margin-top:32px">Status: ${p.status} · Thank you for your stay.</p>
<script>window.print()</script></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={`$${total.toLocaleString()}`} icon={Wallet} accent="success" />
        <StatCard label="Successful" value={succeeded.length} icon={CheckCircle2} accent="success" />
        <StatCard label="Pending" value={`$${pendingTotal.toLocaleString()}`} icon={Clock} accent="warning" />
        <StatCard label="Refunded" value={`$${refundedTotal.toLocaleString()}`} icon={X} accent="info" />
      </div>

      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search payments…" className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Payment</TableHead><TableHead>Guest</TableHead><TableHead>Room</TableHead>
              <TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No payments.</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">#{p.id.slice(-6)}</TableCell>
                  <TableCell>{p.guest_name}<div className="text-xs text-muted-foreground">{p.guest_email}</div></TableCell>
                  <TableCell>{p.room_title}</TableCell>
                  <TableCell className="font-bold">${p.amount.toLocaleString()} {p.currency}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{p.status}</Badge></TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => downloadInvoice(p)}><Download className="h-4 w-4" /></Button>
                    {p.status === "succeeded" && <Button size="sm" variant="ghost" onClick={() => refund.mutate(p.id)}><RotateCcw className="h-4 w-4" /></Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
