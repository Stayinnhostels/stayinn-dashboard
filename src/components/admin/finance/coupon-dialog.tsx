import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Loader2, Pause, Play, RefreshCw, Ticket, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { DepositModal, todayKey } from "@/components/admin/security/deposit-shared";
import { FinDialogHeader, Segmented, finInput, finLabel } from "@/components/admin/finance/finance-kit";
import { CouponCard } from "@/components/admin/finance/coupon-card";
import { useCreateCouponMutation, useDeleteCouponMutation, useUpdateCouponMutation } from "@/queries/coupons";
import { DEFAULT_SECURITY_PKR } from "@/lib/security-deposit";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { Coupon, CouponAppliesTo, CouponDiscountType, CouponInput, CouponStatus } from "@/types/domain/coupon.types";

type Draft = {
  code: string;
  description: string;
  type: CouponDiscountType;
  value: string;
  maxDiscount: string;
  from: string;
  until: string;
  maxUses: string;
  perGuest: string;
  applies: CouponAppliesTo;
};

const plusDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const blank = (): Draft => ({ code: "", description: "", type: "percent", value: "10", maxDiscount: "", from: todayKey(), until: plusDays(30), maxUses: "50", perGuest: "1", applies: "first_month" });

const num = (s: string) => {
  const n = Number(String(s).replace(/[^\d.]/g, ""));
  return s.trim() === "" || !Number.isFinite(n) ? null : n;
};

function statusOf(d: Draft, used: number, active: boolean): CouponStatus {
  const today = todayKey();
  const maxUses = num(d.maxUses);
  if (d.until && d.until < today) return "expired";
  if (maxUses != null && used >= maxUses) return "used_up";
  if (!active) return "paused";
  if (d.from && d.from > today) return "scheduled";
  return "active";
}

/** Random readable code, e.g. from "Winter offer" + 15% → WINTER15-7K. */
function generateCode(d: Draft) {
  const word = (d.description.match(/[A-Za-z]{3,}/)?.[0] ?? "STAY").toUpperCase().slice(0, 8);
  const v = num(d.value);
  const tail = v != null ? (d.type === "percent" ? String(Math.round(v)) : v >= 1000 ? `${Math.round(v / 1000)}K` : String(Math.round(v))) : "";
  const rand = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `${word}${tail}${rand}`.slice(0, 20);
}

const dayMonth = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export function CouponDialog({ open, onOpenChange, editing, sampleBed }: { open: boolean; onOpenChange: (o: boolean) => void; editing: Coupon | null; sampleBed: number }) {
  const [d, setD] = useState<Draft>(blank);
  const create = useCreateCouponMutation();
  const update = useUpdateCouponMutation();
  const remove = useDeleteCouponMutation();
  const saving = create.isPending || update.isPending;

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setD({
        code: editing.code,
        description: editing.description,
        type: editing.discount_type,
        value: String(editing.discount_value),
        maxDiscount: editing.max_discount != null ? String(editing.max_discount) : "",
        from: editing.valid_from ?? "",
        until: editing.valid_until ?? "",
        maxUses: editing.max_uses != null ? String(editing.max_uses) : "",
        perGuest: editing.uses_per_guest != null ? String(editing.uses_per_guest) : "",
        applies: editing.applies_to,
      });
    } else setD(blank());
  }, [open, editing]);

  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }));
  const value = num(d.value) ?? 0;
  const status = statusOf(d, editing?.used ?? 0, editing?.active ?? true);

  const example = useMemo(() => {
    const base = d.applies === "deposit" ? DEFAULT_SECURITY_PKR : sampleBed;
    let off = d.type === "percent" ? (base * Math.min(100, value)) / 100 : value;
    const cap = num(d.maxDiscount);
    if (d.type === "percent" && cap) off = Math.min(off, cap);
    off = Math.min(base, Math.round(off));
    return { base, off, after: base - off };
  }, [d.applies, d.type, d.maxDiscount, value, sampleBed]);

  function payload(): CouponInput | null {
    const code = d.code.trim().toUpperCase();
    if (code.length < 2) return toast.error("Enter a code (at least 2 letters)"), null;
    if (!value || value <= 0) return toast.error("Enter the discount"), null;
    if (d.type === "percent" && value > 100) return toast.error("A percent discount cannot be more than 100%"), null;
    if (d.from && d.until && d.from > d.until) return toast.error("The end date must be after the start date"), null;
    return {
      code,
      description: d.description.trim(),
      discount_type: d.type,
      discount_value: value,
      max_discount: d.type === "percent" ? num(d.maxDiscount) : null,
      valid_from: d.from || null,
      valid_until: d.until || null,
      max_uses: num(d.maxUses) ? Math.round(num(d.maxUses)!) : null,
      uses_per_guest: num(d.perGuest) ? Math.round(num(d.perGuest)!) : null,
      applies_to: d.applies,
    };
  }

  function save() {
    const p = payload();
    if (!p) return;
    if (editing) {
      update.mutate({ id: editing.id, input: p }, { onSuccess: () => { toast.success("Coupon updated"); onOpenChange(false); }, onError: (e) => toast.error(e.message) });
    } else {
      create.mutate({ ...p, active: true }, { onSuccess: () => { toast.success("Coupon created"); onOpenChange(false); }, onError: (e) => toast.error(e.message) });
    }
  }

  const footerNote =
    status === "scheduled" ? `Starts automatically on ${dayMonth(d.from)}` : status === "expired" ? "This code has ended" : status === "used_up" ? "Every use has been taken" : status === "paused" ? "Paused · guests can't use it" : d.until ? `Works until ${dayMonth(d.until)}` : "Works right away · no end date";
  const appliesLabel = d.applies === "deposit" ? "Security deposit" : d.applies === "every_month" ? "Every month" : "First month";

  return (
    <DepositModal open={open} onOpenChange={onOpenChange} width={780}>
      <FinDialogHeader icon={<Ticket />} title={editing ? "Edit coupon" : "Create coupon"} sub="Guests type the code at checkout on your website" />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 md:flex-row md:p-6">
        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          <div className="flex items-end gap-2">
            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className={finLabel}>Code</span>
              <input className={cn(finInput, "uppercase")} value={d.code} maxLength={40} placeholder="e.g. WINTER15" autoFocus={!editing} onChange={(e) => set({ code: e.target.value.toUpperCase().replace(/\s+/g, "") })} />
            </label>
            <GlassButton variant="glass" onClick={() => set({ code: generateCode(d) })}><RefreshCw aria-hidden /> Generate</GlassButton>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>What is it for? (guests see this)</span>
            <input className={finInput} value={d.description} maxLength={500} placeholder="e.g. Winter offer · Dec & Jan" onChange={(e) => set({ description: e.target.value })} />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className={finLabel}>Discount type</span>
            <Segmented stretch label="Discount type" value={d.type} onChange={(t) => set({ type: t })} options={[["percent", "Percent %"], ["fixed", "Fixed amount Rs"]] as const} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className={cn("flex flex-col gap-1.5", d.type === "fixed" && "col-span-2")}>
              <span className={finLabel}>Discount</span>
              <span className={cn(finInput, "flex items-center gap-1.5 focus-within:border-brand-border")}>
                {d.type === "fixed" ? <span className="text-ink-3">Rs</span> : null}
                <input inputMode="decimal" className="min-w-0 flex-1 bg-transparent outline-none" value={d.value} onChange={(e) => set({ value: e.target.value.replace(/[^\d.]/g, "") })} />
                {d.type === "percent" ? <span className="text-ink-3">%</span> : null}
              </span>
            </label>
            {d.type === "percent" ? (
              <label className="flex flex-col gap-1.5">
                <span className={finLabel}>Max discount</span>
                <span className={cn(finInput, "flex items-center gap-1.5 focus-within:border-brand-border")}>
                  <span className="text-ink-3">Rs</span>
                  <input inputMode="numeric" placeholder="No cap" className="min-w-0 flex-1 bg-transparent outline-none placeholder:font-normal placeholder:text-ink-3" value={d.maxDiscount} onChange={(e) => set({ maxDiscount: e.target.value.replace(/[^\d]/g, "") })} />
                </span>
              </label>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DateField label="Starts" value={d.from} onChange={(v) => set({ from: v })} placeholder="Straight away" />
            <DateField label="Ends" value={d.until} onChange={(v) => set({ until: v })} placeholder="No end date" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={finLabel}>Total uses allowed</span>
              <input inputMode="numeric" className={finInput} placeholder="No limit" value={d.maxUses} onChange={(e) => set({ maxUses: e.target.value.replace(/[^\d]/g, "") })} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={finLabel}>Uses per guest</span>
              <input inputMode="numeric" className={finInput} placeholder="No limit" value={d.perGuest} onChange={(e) => set({ perGuest: e.target.value.replace(/[^\d]/g, "") })} />
            </label>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={finLabel}>Applies to</span>
            <Segmented stretch label="Applies to" value={d.applies} onChange={(a) => set({ applies: a })} options={[["first_month", "First month only"], ["every_month", "Every month"], ["deposit", "Deposit"]] as const} />
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2.5 md:w-[260px]">
          <p className="text-eyebrow text-ink-3 uppercase">Preview</p>
          <CouponCard
            compact
            c={{ code: d.code.trim().toUpperCase(), description: d.description.trim(), discount_type: d.type, discount_value: value, max_uses: num(d.maxUses), used: editing?.used ?? 0, valid_until: d.until || null, status }}
          />
          {example.base > 0 ? (
            <div className="flex flex-col gap-1.5 rounded-[14px] bg-glass-inset p-3.5">
              <p className="text-eyebrow text-ink-3 uppercase">Example</p>
              <div className="flex text-label">
                <span className="flex-1 text-ink-2">{d.applies === "deposit" ? "Security deposit" : "Dorm bed"}</span>
                <span className="font-medium text-ink">{formatMoney(example.base, "pkr")}</span>
              </div>
              <div className="flex text-label">
                <span className="min-w-0 flex-1 truncate text-ink-2">{d.code.trim().toUpperCase() || "Coupon"}</span>
                <span className="font-medium text-ink">− {formatMoney(example.off, "pkr")}</span>
              </div>
              <div className="flex items-baseline">
                <span className="flex-1 text-label text-ink-2">{appliesLabel}</span>
                <span className="text-body font-semibold text-ink">{formatMoney(example.after, "pkr")}</span>
              </div>
            </div>
          ) : null}
          {editing ? <p className="px-1 text-label text-ink-3">{editing.bookings_count} booking{editing.bookings_count === 1 ? "" : "s"} so far · {formatMoney(editing.discount_given, "pkr")} given</p> : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 border-t border-glass-divider px-5 py-4 md:px-6">
        {editing ? (
          <>
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => update.mutate({ id: editing.id, input: { active: !editing.active } }, { onSuccess: () => { toast.success(editing.active ? "Coupon paused" : "Coupon resumed"); onOpenChange(false); }, onError: (e) => toast.error(e.message) })}
            >
              {editing.active ? <Pause aria-hidden /> : <Play aria-hidden />} {editing.active ? "Pause" : "Resume"}
            </GlassButton>
            <GlassButton
              variant="ghost"
              size="sm"
              className="text-danger hover:text-danger"
              disabled={remove.isPending}
              onClick={() => {
                if (!window.confirm(`Delete ${editing.code}? Guests will no longer be able to use it.`)) return;
                remove.mutate(editing.id, { onSuccess: () => { toast.success("Deleted"); onOpenChange(false); }, onError: (e) => toast.error(e.message) });
              }}
            >
              <Trash2 aria-hidden /> Delete
            </GlassButton>
          </>
        ) : (
          <p className="hidden text-label text-ink-3 sm:block">{footerNote}</p>
        )}
        <span className="flex-1" />
        <GlassButton variant="glass" onClick={() => onOpenChange(false)}>Cancel</GlassButton>
        <GlassButton onClick={save} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
          {editing ? "Save changes" : "Create coupon"}
        </GlassButton>
      </div>
    </DepositModal>
  );
}

function DateField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={finLabel}>{label}</span>
      <span className={cn(finInput, "relative flex items-center gap-2 focus-within:border-brand-border")}>
        <CalendarDays className="size-4 shrink-0 text-ink-2" aria-hidden />
        <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={cn("min-w-0 flex-1 bg-transparent font-medium outline-none [&::-webkit-calendar-picker-indicator]:opacity-0", value ? "text-ink" : "text-transparent")} />
        {!value ? <span className="pointer-events-none absolute left-9 font-normal text-ink-3">{placeholder}</span> : null}
        {value ? (
          <button type="button" aria-label={`Clear ${label}`} title={`Clear ${label.toLowerCase()} date`} onClick={(e) => { e.preventDefault(); onChange(""); }} className="flex size-6 cursor-pointer items-center justify-center rounded-[6px] text-ink-3 hover:bg-glass-2 hover:text-ink">
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </span>
    </label>
  );
}
