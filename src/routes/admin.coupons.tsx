import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatCard } from "@/components/admin/stat-card";
import { Plus, TicketPercent, Trash2, Pencil, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { coupons as store, newId, nowIso, type Coupon } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/coupons")({ component: CouponsPage });

type Draft = Omit<Coupon, "id" | "created_at" | "used">;
const blank: Draft = { code: "", description: "", discount_type: "percent", discount_value: 10, max_uses: 100, valid_until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), active: true };

function CouponsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [draft, setDraft] = useState<Draft>(blank);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: coupons = [] } = useQuery({
    queryKey: ["mock", "coupons"],
    queryFn: async () => [...store].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        Object.assign(editing, draft);
      } else {
        store.unshift({ ...draft, id: newId("c"), used: 0, created_at: nowIso() });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mock"] }); toast.success("Coupon saved"); setOpen(false); setEditing(null); setDraft(blank); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const i = store.findIndex((x) => x.id === id); if (i >= 0) store.splice(i, 1); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mock"] }); toast.success("Deleted"); },
  });

  const toggleActive = useMutation({
    mutationFn: async (id: string) => { const c = store.find((x) => x.id === id); if (c) c.active = !c.active; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mock"] }),
  });

  function openCreate() { setEditing(null); setDraft(blank); setOpen(true); }
  function openEdit(c: Coupon) {
    setEditing(c);
    setDraft({ code: c.code, description: c.description, discount_type: c.discount_type, discount_value: c.discount_value, max_uses: c.max_uses, valid_until: c.valid_until, active: c.active });
    setOpen(true);
  }

  function copy(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  const today = new Date().toISOString().slice(0, 10);
  const active = coupons.filter((c) => c.active && c.valid_until >= today).length;
  const expired = coupons.filter((c) => c.valid_until < today).length;
  const totalRedemptions = coupons.reduce((s, c) => s + c.used, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active coupons" value={active} icon={TicketPercent} accent="success" />
        <StatCard label="Expired" value={expired} icon={TicketPercent} accent="warning" />
        <StatCard label="Total coupons" value={coupons.length} icon={TicketPercent} accent="info" />
        <StatCard label="Redemptions" value={totalRedemptions} icon={Check} accent="primary" />
      </div>

      <Card className="border-border/60">
        <CardContent className="flex items-center justify-between p-4">
          <p className="text-sm font-semibold">All coupons</p>
          <Button onClick={openCreate} className="rounded-full font-semibold"><Plus className="h-4 w-4" /> New coupon</Button>
        </CardContent>
      </Card>

      {coupons.length === 0 ? (
        <Card className="border-border/60"><CardContent className="py-16 text-center text-sm text-muted-foreground">No coupons yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coupons.map((c) => {
            const isExpired = c.valid_until < today;
            return (
              <Card key={c.id} className="border-border/60">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <button onClick={() => copy(c.code)} className="group flex items-center gap-2 font-mono text-lg font-extrabold tracking-tight">
                        {c.code}
                        {copied === c.code ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />}
                      </button>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                    </div>
                    <Badge variant="outline" className={isExpired ? "bg-rose-500/10 text-rose-600" : c.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}>
                      {isExpired ? "Expired" : c.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-y py-3 text-center text-xs">
                    <div><p className="font-extrabold text-base">{c.discount_type === "percent" ? `${c.discount_value}%` : `$${c.discount_value}`}</p><p className="text-muted-foreground">Discount</p></div>
                    <div><p className="font-extrabold text-base">{c.used}/{c.max_uses}</p><p className="text-muted-foreground">Used</p></div>
                    <div><p className="font-extrabold text-base">{new Date(c.valid_until).toLocaleDateString()}</p><p className="text-muted-foreground">Expires</p></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <Switch checked={c.active} onCheckedChange={() => toggleActive.mutate(c.id)} />
                      <span className="text-muted-foreground">{c.active ? "Active" : "Paused"}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit coupon" : "New coupon"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Code</Label><Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER20" /></div>
            <div className="grid gap-1.5"><Label>Description</Label><Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5"><Label>Type</Label>
                <Select value={draft.discount_type} onValueChange={(v) => setDraft({ ...draft, discount_type: v as "percent" | "fixed" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Value</Label><Input type="number" value={draft.discount_value} onChange={(e) => setDraft({ ...draft, discount_value: Number(e.target.value) })} /></div>
              <div className="grid gap-1.5"><Label>Max uses</Label><Input type="number" value={draft.max_uses} onChange={(e) => setDraft({ ...draft, max_uses: Number(e.target.value) })} /></div>
              <div className="grid gap-1.5"><Label>Valid until</Label><Input type="date" value={draft.valid_until.slice(0, 10)} onChange={(e) => setDraft({ ...draft, valid_until: e.target.value })} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!draft.code}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
