import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/stat-card";
import { Wallet, TrendingUp, CreditCard } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const Route = createFileRoute("/admin/financials")({
  component: FinancialsPage,
});

type Payment = {
  id: string;
  booking_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
  bookings?: { guest_name: string | null; rooms: { title: string } | null } | null;
};

function FinancialsPage() {
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, bookings(guest_name, rooms(title))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Payment[];
    },
  });

  const succeeded = payments.filter((p) => p.status === "succeeded");
  const totalRevenue = succeeded.reduce((s, p) => s + Number(p.amount), 0);
  const pending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);
  const refunded = payments.filter((p) => p.status === "refunded").reduce((s, p) => s + Number(p.amount), 0);

  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en", { month: "short" }), value: 0 };
  });
  succeeded.forEach((p) => {
    const d = new Date(p.created_at);
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((mm) => mm.key === k);
    if (m) m.value += Number(p.amount);
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total revenue" value={`$${totalRevenue.toLocaleString()}`} icon={Wallet} delta="Successful payments" />
        <StatCard label="Pending" value={`$${pending.toLocaleString()}`} icon={CreditCard} delta="Awaiting capture" />
        <StatCard label="Refunded" value={`$${refunded.toLocaleString()}`} icon={TrendingUp} delta="Last period" />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Revenue by month</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="oklch(0.62 0.22 35)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Recent payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stripe ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">Loading…</TableCell></TableRow>
              ) : payments.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No payments.</TableCell></TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{p.bookings?.guest_name ?? "—"}</TableCell>
                    <TableCell>{p.bookings?.rooms?.title ?? "—"}</TableCell>
                    <TableCell className="font-mono">${Number(p.amount).toLocaleString()} {p.currency.toUpperCase()}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{p.status}</Badge></TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.stripe_payment_intent_id ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
