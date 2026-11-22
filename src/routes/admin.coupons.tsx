import { StickyBar } from "@/components/admin/sticky-bar";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Percent, Plus, Sparkles, Ticket, Users } from "lucide-react";
import { GlassButton } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { FinKpi, Segmented } from "@/components/admin/finance/finance-kit";
import { CouponCard } from "@/components/admin/finance/coupon-card";
import { CouponDialog } from "@/components/admin/finance/coupon-dialog";
import { useCouponsQuery } from "@/queries/coupons";
import { useRoomsQuery } from "@/queries/rooms";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { formatMoney } from "@/lib/payments";
import type { Coupon } from "@/types/domain/coupon.types";

/** Figma 15.04 · Coupons (+ 15.05 Create coupon). */
export const Route = createFileRoute("/admin/coupons")({ component: CouponsPage });

type Filter = "all" | "active" | "scheduled" | "ended";

const dayMonth = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function CouponsPage() {
  const { data, isLoading, isError } = useCouponsQuery();
  const { hostelId } = useHostelScope();
  const rooms = useRoomsQuery({ limit: 100, ...(hostelId ? { hostel: hostelId } : {}) });
  const [filter, setFilter] = useState<Filter>("all");
  const [dialog, setDialog] = useState<{ editing: Coupon | null } | null>(null);

  const coupons = data?.coupons ?? [];
  const counts = data?.counts;
  const s = data?.stats;
  const shown = coupons.filter((c) => filter === "all" || (filter === "ended" ? c.status === "expired" || c.status === "used_up" : c.status === filter));
  // Ended codes last, like the Figma grid.
  const order = { active: 0, scheduled: 1, paused: 2, used_up: 3, expired: 4 } as const;
  const sorted = [...shown].sort((a, b) => order[a.status] - order[b.status]);

  // "Example" in the dialog uses a real bed price: the most common monthly price per bed.
  const sampleBed = useMemo(() => {
    const prices = (rooms.data?.rooms ?? []).map((r) => Number(r.price_per_night_pkr) || 0).filter((p) => p > 0);
    if (!prices.length) return 0;
    const freq = new Map<number, number>();
    prices.forEach((p) => freq.set(p, (freq.get(p) ?? 0) + 1));
    return [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
  }, [rooms.data]);

  const discount = s ? (s.discount_this_month.usd > 0 && s.discount_this_month.pkr === 0 ? formatMoney(s.discount_this_month.usd, "usd") : formatMoney(s.discount_this_month.pkr, "pkr")) : "—";

  return (
    <>
      <PageHeader
        title="Coupons"
        subtitle="Discount codes guests enter when booking on your website"
        actions={
          <GlassButton onClick={() => setDialog({ editing: null })}>
            <Plus aria-hidden /> Create coupon
          </GlassButton>
        }
      />

      <div className="flex flex-col gap-4 md:gap-5">
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          <FinKpi icon={<Ticket />} label="Active codes" value={s ? String(s.active) : "—"} sub={s ? (s.next_scheduled ? `${s.scheduled} start${s.scheduled === 1 ? "s" : ""} on ${dayMonth(s.next_scheduled.starts)}` : "None scheduled") : ""} />
          <FinKpi icon={<Users />} label="Used this month" value={s ? String(s.used_this_month) : "—"} sub={s ? `Brought ${s.bookings_this_month} new booking${s.bookings_this_month === 1 ? "" : "s"}` : ""} />
          <FinKpi icon={<Percent />} label="Discount given" value={discount} sub="This month" />
          <FinKpi icon={<Sparkles />} label="Best code" value={s?.best ? s.best.code : "—"} sub={s ? (s.best ? `${s.best.bookings} booking${s.best.bookings === 1 ? "" : "s"} so far` : "No bookings with a code yet") : ""} />
        </div>

        <StickyBar><Segmented
          className="self-start"
          label="Show"
          value={filter}
          onChange={setFilter}
          options={[
            ["all", "All", counts?.all],
            ["active", "Active", counts?.active],
            ["scheduled", "Scheduled", counts?.scheduled],
            ["ended", "Ended", counts?.ended],
          ] as const}
        /></StickyBar>

        {isError ? (
          <div className="glass-2 rounded-[22px] px-4 py-14 text-center text-body text-danger">Could not load coupons. Is the API running?</div>
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="glass-2 h-[176px] animate-pulse rounded-[22px]" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="glass-2 flex flex-col items-center gap-3 rounded-[22px] px-4 py-14 text-center">
            <p className="text-body text-ink-2">{coupons.length === 0 ? "No coupons yet. Create one for guests to use when booking rooms." : "No coupons here."}</p>
            {coupons.length === 0 ? <GlassButton size="sm" variant="glass" onClick={() => setDialog({ editing: null })}><Plus aria-hidden /> Create coupon</GlassButton> : null}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((c) => <CouponCard key={c.id} c={c} onOpen={() => setDialog({ editing: c })} />)}
          </div>
        )}
      </div>

      <CouponDialog open={dialog != null} onOpenChange={(o) => !o && setDialog(null)} editing={dialog?.editing ?? null} sampleBed={sampleBed} />
    </>
  );
}
