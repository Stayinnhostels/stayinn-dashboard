import { useMemo, useState } from "react";
import { Banknote, Check, CircleDollarSign, Clock, CreditCard, Landmark, MessageCircle, ShieldCheck, Smartphone, Sparkles, TriangleAlert, Wallet } from "lucide-react";
import { GlassButton, GlassProgress } from "@/components/glass";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { PaymentsOverview } from "@/types/domain/payments.types";

export const METHOD_ICON: Record<string, React.ReactNode> = {
  cash: <Wallet />,
  jazzcash: <Smartphone />,
  easypaisa: <Smartphone />,
  bank_transfer: <Landmark />,
  card: <CreditCard />,
  deposit: <ShieldCheck />,
  unspecified: <Check />,
  none: <Banknote />,
};

const short = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, "")}k` : String(n));

export function PaymentsKpis({ data, onRate }: { data: PaymentsOverview | undefined; onRate?: () => void }) {
  const k = data?.kpis;
  const cur = data?.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
      <Kpi icon={<Banknote />} label="Collected" value={k ? money(k.collected.amount) : "—"} sub={k ? <><span className="hidden md:inline">Rent {money(k.collected.rent)} · Extras {money(k.collected.extras)}</span><span className="md:hidden">Rent {short(k.collected.rent)} · Extras {short(k.collected.extras)}</span></> : ""} />
      <Kpi icon={<Clock />} label="Still to collect" value={k ? money(k.still_to_collect.amount) : "—"} danger={(k?.still_to_collect.amount ?? 0) > 0} sub={k ? <><span className="hidden md:inline">{k.still_to_collect.not_paid} not paid · {k.still_to_collect.partly_paid} partly paid</span><span className="md:hidden">{k.still_to_collect.not_paid + k.still_to_collect.partly_paid} residents</span></> : ""} />
      <Kpi icon={<Sparkles />} label="Net revenue" value={k ? money(k.net_revenue.amount) : "—"} sub={<><span className="hidden md:inline">After refunds & kept deposits</span><span className="md:hidden">After refunds</span></>} />
      <Kpi
        icon={<Check />}
        label="Collection rate"
        value={k?.collection_rate.percent != null ? `${k.collection_rate.percent}%` : "—"}
        sub={k ? <><span className="hidden md:inline">{k.collection_rate.fully_paid} of {k.collection_rate.residents} residents fully paid</span><span className="md:hidden">{k.collection_rate.fully_paid} of {k.collection_rate.residents} paid</span></> : ""}
        progress={k?.collection_rate.percent ?? 0}
        onClick={onRate}
      />
    </div>
  );
}

function Kpi({ icon, label, value, sub, danger, progress, onClick }: { icon: React.ReactNode; label: string; value: string; sub: React.ReactNode; danger?: boolean; progress?: number; onClick?: () => void }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp type={onClick ? "button" : undefined} onClick={onClick} className={cn("glass-2 flex flex-col gap-2 rounded-[22px] px-4 py-4 text-left md:px-5 md:py-5", onClick && "cursor-pointer hover:brightness-[1.02]")}>
      <span className="flex items-center gap-2 text-label font-medium text-ink-2 [&_svg]:size-4">{icon}{label}</span>
      <span className={cn("truncate text-[22px] leading-7 font-semibold tracking-tight md:text-[30px] md:leading-9", danger ? "text-danger" : "text-ink")}>{value}</span>
      <span className="truncate text-label text-ink-3">{sub}</span>
      {progress != null ? <GlassProgress value={progress} /> : null}
    </Comp>
  );
}

/** "Money received · November" — single series, one hue, hover tooltip per bar. */
export function MoneyChart({ data, monthName }: { data: PaymentsOverview | undefined; monthName: string }) {
  const [mode, setMode] = useState<"daily" | "weekly">("daily");
  const [hover, setHover] = useState<number | null>(null);
  const cur = data?.currency ?? "pkr";
  const bars = useMemo(() => {
    const days = data?.chart.by_day ?? [];
    if (mode === "daily") return days.map((d) => ({ key: d.day, label: `${d.day} ${monthName.slice(0, 3)}`, amount: d.amount }));
    const weeks: { key: number; label: string; amount: number }[] = [];
    days.forEach((d) => {
      const w = Math.floor((d.day - 1) / 7);
      if (!weeks[w]) weeks[w] = { key: w, label: `${w * 7 + 1}–${Math.min(days.length, w * 7 + 7)} ${monthName.slice(0, 3)}`, amount: 0 };
      weeks[w].amount += d.amount;
    });
    return weeks;
  }, [data, mode, monthName]);
  const max = Math.max(1, ...bars.map((b) => b.amount));
  const best = data?.chart.best_day;
  const total = data?.chart.total ?? 0;
  const ticks = mode === "daily" ? [1, 8, 15, 22, bars.length] : bars.map((b) => b.key + 1);

  return (
    <section className="glass-2 relative flex min-w-0 flex-col gap-4 rounded-[22px] p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-card-title text-ink">Money received · {monthName}</p>
          <p className="text-label text-ink-3">{formatMoney(total, cur)} so far{best ? ` · best day ${best.day} ${monthName.slice(0, 3)} (${formatMoney(best.amount, cur)})` : ""}</p>
        </div>
        <div role="radiogroup" aria-label="Group by" className="flex gap-0.5 rounded-[12px] border border-glass-divider bg-glass-inset p-1">
          {(["daily", "weekly"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={cn("h-7 cursor-pointer rounded-[9px] px-3 text-label font-medium capitalize", mode === m ? "glass-3 text-ink" : "text-ink-2")}>{m}</button>
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="flex h-[120px] items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
          {bars.map((b, i) => (
            <div key={b.key} className="group relative flex h-full flex-1 cursor-default items-end" onMouseEnter={() => setHover(i)}>
              <div
                className={cn("w-full rounded-t-[4px] transition-opacity", b.amount > 0 ? "bg-brand" : "bg-glass-inset", hover != null && hover !== i && "opacity-50")}
                style={{ height: b.amount > 0 ? `${Math.max(4, (b.amount / max) * 100)}%` : "3px" }}
              />
            </div>
          ))}
        </div>
        {hover != null && bars[hover] ? (
          <div className="glass-3 pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-[10px] px-2.5 py-1.5 text-label whitespace-nowrap" style={{ left: `${((hover + 0.5) / bars.length) * 100}%` }}>
            <span className="text-ink-2">{bars[hover].label}</span> <span className="font-semibold text-ink">{formatMoney(bars[hover].amount, cur)}</span>
          </div>
        ) : null}
        <div className="mt-2 flex justify-between text-[11px] text-ink-3">
          {mode === "daily" ? ticks.map((t) => <span key={t}>{t === 1 ? `1 ${monthName.slice(0, 3)}` : t === bars.length ? `${t} ${monthName.slice(0, 3)}` : t}</span>) : bars.map((b) => <span key={b.key}>W{b.key + 1}</span>)}
        </div>
      </div>
      {/* Data table for screen readers */}
      <div className="sr-only">
        <table>
          <caption>Money received per {mode === "daily" ? "day" : "week"}</caption>
          <tbody>{bars.map((b) => <tr key={b.key}><th>{b.label}</th><td>{formatMoney(b.amount, cur)}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

export function MethodsCard({ data }: { data: PaymentsOverview | undefined }) {
  const cur = data?.currency ?? "pkr";
  const list = data?.methods ?? [];
  return (
    <section className="glass-2 flex flex-col gap-4 rounded-[22px] p-5">
      <p className="text-card-title text-ink">How residents paid</p>
      {list.length === 0 ? <p className="text-label text-ink-3">No payments recorded this month.</p> : null}
      {list.map((m) => (
        <div key={m.method} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-body">
            <span className="text-ink-2 [&_svg]:size-4">{METHOD_ICON[m.method] ?? <CircleDollarSign />}</span>
            <span className="flex-1 text-ink">{m.label}</span>
            <span className="font-semibold text-ink">{formatMoney(m.amount, cur)}</span>
            <span className="w-9 text-right text-label text-ink-3">{m.percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-glass-inset"><div className="h-full rounded-full bg-brand" style={{ width: `${m.percent}%` }} /></div>
        </div>
      ))}
    </section>
  );
}

export function OwingBanner({ data, monthName, onShow, onRemind }: { data: PaymentsOverview | undefined; monthName: string; onShow: () => void; onRemind: () => void }) {
  const r = data?.reminders;
  if (!r || r.owing_count === 0) return null;
  const cur = data?.currency ?? "pkr";
  const last = r.last_sent_at ? new Date(r.last_sent_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null;
  return (
    <div className="glass-2 flex flex-wrap items-center gap-3 rounded-[18px] px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-danger-tint text-danger [&_svg]:size-4"><TriangleAlert aria-hidden /></span>
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold text-ink">{r.owing_count} resident{r.owing_count === 1 ? "" : "s"} still owe {formatMoney(r.owing_amount, cur)} for {monthName}</p>
        <p className="text-label text-ink-3">{r.not_paid} haven't paid anything · {r.partly_paid} paid part{last ? ` · last reminder went out ${last}` : ""}</p>
      </div>
      <GlassButton size="sm" variant="glass" className="hidden md:inline-flex" onClick={onShow}>Show them</GlassButton>
      {r.can_email > 0 ? <GlassButton size="sm" onClick={onRemind}><MessageCircle aria-hidden /> <span className="hidden md:inline">Send reminders ({r.can_email})</span><span className="md:hidden">Remind</span></GlassButton> : null}
    </div>
  );
}
