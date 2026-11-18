import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { CheckoutSettleDialog } from "@/components/admin/resident-profile/checkout-settle-dialog";
import { downloadResidentDossierPdfApi } from "@/api/residents";
import { useBookingQuery } from "@/queries/bookings/useBookingQuery";
import { useResidentDetailQuery } from "@/queries/residents";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import type { DepositsOverview } from "@/types/domain/payments.types";

const dayMon = (k: string | null | undefined) => (k ? new Date(k.length === 10 ? `${k}T12:00:00` : k).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "");

/** Figma 08.04 · Refunds & deposits. */
export function DepositsView({ data }: { data: DepositsOverview | undefined }) {
  const token = useAuthStore((s) => s.token);
  const [settle, setSettle] = useState<string | null>(null);
  const [dl, setDl] = useState<string | null>(null);
  const k = data?.kpis;
  const cur = data?.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);

  async function receipt(bookingId: string, id: string) {
    if (!token) return;
    setDl(id);
    try {
      await downloadResidentDossierPdfApi(token, bookingId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDl(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Mini label="Deposits held" value={k ? money(k.held.amount) : "—"} sub={k ? `${k.held.residents} resident${k.held.residents === 1 ? "" : "s"}` : ""} />
        <Mini label="To return soon" value={k ? money(k.to_return_soon.amount) : "—"} sub={k ? `${k.to_return_soon.leaving} leaving this month` : ""} />
        <Mini label="Returned this month" value={k ? money(k.returned.amount) : "—"} sub={k ? `${k.returned.residents} resident${k.returned.residents === 1 ? "" : "s"}` : ""} />
        <Mini label="Kept this month" value={k ? money(k.kept.amount) : "—"} sub={k?.kept.note || "Nothing kept"} />
      </div>

      <section className="glass-2 overflow-hidden rounded-[22px]">
        <div className="border-b border-glass-divider px-5 py-4">
          <p className="text-card-title text-ink">Waiting to be settled</p>
          <p className="text-label text-ink-3">Residents leaving soon — return the deposit minus anything owed</p>
        </div>
        {(data?.waiting ?? []).length === 0 ? <p className="px-5 py-8 text-center text-label text-ink-3">No one is leaving with a deposit this month.</p> : null}
        {(data?.waiting ?? []).map((w) => (
          <div key={w.booking_id} className="flex flex-wrap items-center gap-3 border-b border-glass-divider px-5 py-3.5 last:border-b-0">
            <span className="w-7 text-center text-label font-semibold text-ink-2">{w.initials}</span>
            <Link to="/admin/residents/$id" params={{ id: w.booking_id }} className="min-w-[180px] flex-1">
              <span className="block text-body font-semibold text-ink hover:underline">{w.name}</span>
              <span className="block text-label text-ink-3">{w.room_label}{w.leaves_on ? ` · leaves ${dayMon(w.leaves_on)}` : ""}</span>
            </Link>
            <div className="min-w-[220px] flex-1">
              <p className="text-body font-semibold text-ink">{formatMoney(w.held, w.currency)} held</p>
              <p className="text-label text-ink-3">{w.owed > 0 ? `${formatMoney(w.owed, w.currency)} rent owed · return ${formatMoney(w.to_return, w.currency)}` : `Nothing owed · return ${formatMoney(w.to_return, w.currency)} in full`}</p>
            </div>
            <span className="rounded-full border border-glass-stroke px-2 py-0.5 text-label text-ink-2">● To return</span>
            <GlassButton size="sm" onClick={() => setSettle(w.booking_id)}><ShieldCheck aria-hidden /> Settle</GlassButton>
          </div>
        ))}
      </section>

      <section className="glass-2 overflow-hidden rounded-[22px]">
        <div className="border-b border-glass-divider px-5 py-4">
          <p className="text-card-title text-ink">Refunds this month</p>
          <p className="text-label text-ink-3">Money given back to residents, and deposits kept</p>
        </div>
        {(data?.refunds ?? []).length === 0 ? <p className="px-5 py-8 text-center text-label text-ink-3">No refunds this month.</p> : null}
        {(data?.refunds ?? []).map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-3 border-b border-glass-divider px-5 py-3.5 last:border-b-0">
            <span className="w-7 text-center text-label font-semibold text-ink-2">{r.initials}</span>
            <Link to="/admin/residents/$id" params={{ id: r.booking_id }} className="min-w-[180px] flex-1">
              <span className="block text-body font-semibold text-ink hover:underline">{r.name}</span>
              <span className="block text-label text-ink-3">{r.room_label}{r.left_on ? ` · left ${dayMon(r.left_on)}` : ""}</span>
            </Link>
            <div className="min-w-[240px] flex-1">
              <p className="text-body font-semibold text-ink">
                {r.kind === "deposit_kept" ? `${formatMoney(r.amount, r.currency)} kept` : `− ${formatMoney(r.amount, r.currency)}`} · {r.kind === "rent_refund" ? (r.for?.replace(/^Refund · /, "") || "rent") : "deposit"}
              </p>
              <p className="text-label text-ink-3">{[dayMon(r.at), r.method_label, r.reference, r.note].filter(Boolean).join(" · ")}</p>
            </div>
            <span className="rounded-full border border-glass-stroke px-2 py-0.5 text-label text-ink-2">● {r.kind === "deposit_kept" ? "Kept" : "Returned"}</span>
            <button type="button" onClick={() => void receipt(r.booking_id, r.id)} className="flex cursor-pointer items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-label font-medium text-ink-2 hover:bg-glass-inset [&_svg]:size-3.5">
              {dl === r.id ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />} Record
            </button>
          </div>
        ))}
      </section>

      {settle ? <SettleFor bookingId={settle} onClose={() => setSettle(null)} /> : null}
    </div>
  );
}

function SettleFor({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const { data: booking } = useBookingQuery(bookingId);
  const { data: detail } = useResidentDetailQuery(bookingId);
  if (!booking || !detail) return null;
  return <CheckoutSettleDialog booking={booking} detail={detail} open onOpenChange={(o) => !o && onClose()} />;
}

function Mini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="glass-2 flex flex-col gap-1 rounded-[20px] px-4 py-4">
      <span className="text-label text-ink-3">{label}</span>
      <span className="truncate text-[22px] leading-7 font-semibold text-ink">{value}</span>
      <span className="truncate text-label text-ink-3">{sub}</span>
    </div>
  );
}
