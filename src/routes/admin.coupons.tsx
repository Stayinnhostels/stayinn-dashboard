import { createFileRoute } from "@tanstack/react-router";
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
import { AdminCardGridSkeleton, StatCardsRowSkeleton } from "@/components/admin/admin-page-skeletons";
import { toast } from "sonner";
import {
  useCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from "@/queries/coupons";
import type { Coupon, CouponInput } from "@/types/domain/coupon.types";

export const Route = createFileRoute("/admin/coupons")({ component: CouponsPage });

type Draft = CouponInput;

const blank: Draft = {
  code: "",
  description: "",
  discount_type: "percent",
  discount_value: 10,
  max_uses: 100,
  valid_until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  active: true,
};

function CouponsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [draft, setDraft] = useState<Draft>(blank);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: coupons = [], isLoading, isError } = useCouponsQuery();
  const createCoupon = useCreateCouponMutation();
  const updateCoupon = useUpdateCouponMutation();
  const removeCoupon = useDeleteCouponMutation();

  function openCreate() {
    setEditing(null);
    setDraft(blank);
    setOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditing(c);
    setDraft({
      code: c.code,
      description: c.description,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      max_uses: c.max_uses,
      valid_until: c.valid_until.slice(0, 10),
      active: c.active,
    });
    setOpen(true);
  }

  function copy(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  function save() {
    const payload: CouponInput = {
      ...draft,
      code: draft.code.trim().toUpperCase(),
    };
    if (editing) {
      updateCoupon.mutate(
        { id: editing.id, input: payload },
        {
          onSuccess: () => {
            toast.success("Coupon updated");
            setOpen(false);
            setEditing(null);
            setDraft(blank);
          },
          onError: (e) => toast.error(e.message),
        },
      );
    } else {
      createCoupon.mutate(payload, {
        onSuccess: () => {
          toast.success("Coupon created");
          setOpen(false);
          setDraft(blank);
        },
        onError: (e) => toast.error(e.message),
      });
    }
  }

  function toggleActive(c: Coupon) {
    updateCoupon.mutate(
      { id: c.id, input: { active: !c.active } },
      { onError: (e) => toast.error(e.message) },
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const active = coupons.filter((c) => c.active && c.valid_until >= today).length;
  const expired = coupons.filter((c) => c.valid_until < today).length;
  const totalRedemptions = coupons.reduce((s, c) => s + c.used, 0);
  const saving = createCoupon.isPending || updateCoupon.isPending;

  return (
    <div className="space-y-4">
      {isLoading ? (
        <>
          <StatCardsRowSkeleton count={4} />
          <Card className="border-border/60">
            <CardContent className="flex items-center justify-between p-4">
              <p className="text-sm font-semibold">All coupons</p>
              <Button disabled className="rounded-full font-semibold">
                <Plus className="h-4 w-4" /> New coupon
              </Button>
            </CardContent>
          </Card>
          <AdminCardGridSkeleton count={6} />
        </>
      ) : (
        <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active coupons" value={active} icon={TicketPercent} accent="success" />
        <StatCard label="Expired" value={expired} icon={TicketPercent} accent="warning" />
        <StatCard label="Total coupons" value={coupons.length} icon={TicketPercent} accent="info" />
        <StatCard label="Redemptions" value={totalRedemptions} icon={Check} accent="primary" />
      </div>

      <Card className="border-border/60">
        <CardContent className="flex items-center justify-between p-4">
          <p className="text-sm font-semibold">All coupons</p>
          <Button onClick={openCreate} className="rounded-full font-semibold">
            <Plus className="h-4 w-4" /> New coupon
          </Button>
        </CardContent>
      </Card>

      {isError ? (
        <Card className="border-border/60">
          <CardContent className="py-12 text-center text-sm text-destructive">
            Could not load coupons. Is the API running?
          </CardContent>
        </Card>
      ) : coupons.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No coupons yet. Create one for guests to use when booking rooms.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coupons.map((c) => {
            const isExpired = c.valid_until < today;
            return (
              <Card key={c.id} className="border-border/60">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <button
                        type="button"
                        onClick={() => copy(c.code)}
                        className="group flex items-center gap-2 font-mono text-lg font-extrabold tracking-tight"
                      >
                        {c.code}
                        {copied === c.code ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        )}
                      </button>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        isExpired
                          ? "bg-rose-500/10 text-rose-600"
                          : c.active
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                      }
                    >
                      {isExpired ? "Expired" : c.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-y py-3 text-center text-xs">
                    <div>
                      <p className="font-extrabold text-base">
                        {c.discount_type === "percent"
                          ? `${c.discount_value}%`
                          : `Rs ${c.discount_value.toLocaleString("en-PK")}`}
                      </p>
                      <p className="text-muted-foreground">Discount</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-base">
                        {c.used}/{c.max_uses}
                      </p>
                      <p className="text-muted-foreground">Used</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-base">
                        {new Date(c.valid_until).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground">Expires</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <Switch checked={c.active} onCheckedChange={() => toggleActive(c)} />
                      <span className="text-muted-foreground">{c.active ? "Active" : "Paused"}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          removeCoupon.mutate(c.id, {
                            onSuccess: () => toast.success("Deleted"),
                            onError: (e) => toast.error(e.message),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit coupon" : "New coupon"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label required>Code</Label>
              <Input
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SUMMER20"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Input
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select
                  value={draft.discount_type}
                  onValueChange={(v) => setDraft({ ...draft, discount_type: v as "percent" | "fixed" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                    <SelectItem value="fixed">Fixed (Rs PKR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={draft.discount_value}
                  onChange={(e) => setDraft({ ...draft, discount_value: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Max uses</Label>
                <Input
                  type="number"
                  value={draft.max_uses}
                  onChange={(e) => setDraft({ ...draft, max_uses: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Valid until</Label>
                <Input
                  type="date"
                  value={draft.valid_until.slice(0, 10)}
                  onChange={(e) => setDraft({ ...draft, valid_until: e.target.value })}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!draft.code || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
