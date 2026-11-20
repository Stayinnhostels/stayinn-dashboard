import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type CSSProperties } from "react";
import { Banknote, BedDouble, ChevronRight, Download, Loader2, Receipt, TrendingUp, Wallet } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  BarRow,
  CardHead,
  FinKpi,
  Segmented,
  compactMoney,
  finInput,
  finLabel,
  isMonthKey,
  monthName,
  shiftMonth,
  thisMonthKey,
} from "@/components/admin/finance/finance-kit";
import { downloadFinanceOverviewApi } from "@/api/expenses";
import { useFinanceOverviewQuery } from "@/queries/expenses";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { FinanceMonth, FinanceOverview } from "@/types/domain/expense.types";

type Range = "6m" | "year" | "custom";
type Search = { range?: Range; from?: string; to?: string; currency?: "usd" };

/** Figma 15.01 · Revenue & profit. */
export const Route = createFileRoute("/admin/financials")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ...(s.range === "year" || s.range === "custom" ? { range: s.range } : {}),
    ...(isMonthKey(s.from) ? { from: s.from } : {}),
    ...(isMonthKey(s.to) ? { to: s.to } : {}),
    ...(s.currency === "usd" ? { currency: "usd" as const } : {}),
  }),
  component: RevenuePage,
});

function rangeOf(search: Search) {
  const now = thisMonthKey();
  if (search.range === "year") return { from: `${now.slice(0, 4)}-01`, to: now };
  if (search.range === "custom" && search.from && search.to) {
    const [a, b] = search.from <= search.to ? [search.from, search.to] : [search.to, search.from];
    return { from: a, to: b };
  }
  return { from: shiftMonth(now, -5), to: now };
}

function monthsCount(from: string, to: string) {
  const [ay, am] = from.split("-").map(Number);
  const [by, bm] = to.split("-").map(Number);
  return (by - ay) * 12 + (bm - am) + 1;
}

function RevenuePage() {
  const navigate = useNavigate({ from: "/admin/financials" });
  const search = Route.useSearch();
  const range: Range = search.range ?? "6m";
  const currency = search.currency ?? "pkr";
  const { from, to } = rangeOf(search);
  const { hostelId } = useHostelScope();
  const token = useAuthStore((s) => s.token);
  const hostel = hostelId ?? undefined;
  const { data, isLoading, isError } = useFinanceOverviewQuery({ from, to, currency, hostel }, Boolean(hostelId));
  const [downloading, setDownloading] = useState(false);

  const span = monthsCount(from, to);
  const periodLabel = range === "6m" ? "6 months" : range === "year" ? "this year" : span === 1 ? monthName(from, "short") : `${monthName(from, "short")}–${monthName(to, "short")}`;
  const set = (patch: Partial<Search>) => void navigate({ search: { ...search, ...patch } });

  async function download() {
    if (!token) return;
    setDownloading(true);
    try {
      await downloadFinanceOverviewApi(token, { from, to, currency, hostel });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Revenue & profit"
        subtitle="Money in, money out and what is left · rent, extras and expenses together"
        actions={
          <>
            <RangePicker range={range} from={from} to={to} onPick={(r, f, t) => set({ range: r === "6m" ? undefined : r, from: r === "custom" ? f : undefined, to: r === "custom" ? t : undefined })} />
            <Segmented label="Currency" value={currency} onChange={(c) => set({ currency: c === "usd" ? "usd" : undefined })} options={[["pkr", "PKR"], ["usd", "USD"]] as const} />
            <GlassButton variant="glass" onClick={() => void download()} disabled={downloading || !data}>
              {downloading ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />}
              <span className="hidden sm:inline">Download report</span>
            </GlassButton>
          </>
        }
      />

      {isError ? (
        <div className="glass-2 rounded-[22px] px-4 py-14 text-center text-body text-danger">Could not load revenue. Check your connection and try again.</div>
      ) : (
        <div className="flex flex-col gap-4 md:gap-5">
          <Kpis data={data} periodLabel={periodLabel} span={span} />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <RevenueChart data={data} loading={isLoading} />
            <Sources data={data} loading={isLoading} />
          </div>
          <ByMonth data={data} loading={isLoading} onOpen={(m) => void navigate({ to: "/admin/expenses", search: { month: m.key } })} />
        </div>
      )}
    </>
  );
}

function RangePicker({ range, from, to, onPick }: { range: Range; from: string; to: string; onPick: (r: Range, from?: string, to?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(from);
  const [t, setT] = useState(to);
  const max = thisMonthKey();
  const tooLong = f && t && monthsCount(f <= t ? f : t, f <= t ? t : f) > 24;
  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setF(from);
          setT(to);
        }
      }}
    >
      <div className="flex gap-0.5 rounded-[12px] bg-glass-inset p-1" role="radiogroup" aria-label="Period">
        {(
          [
            ["6m", "6 months"],
            ["year", "This year"],
          ] as const
        ).map(([k, l]) => (
          <button key={k} type="button" role="radio" aria-checked={range === k} onClick={() => onPick(k)} className={cn("h-8 cursor-pointer rounded-[9px] border px-3 text-body font-medium whitespace-nowrap", range === k ? "border-glass-stroke bg-glass-3 text-ink" : "border-transparent text-ink-2 hover:text-ink")}>
            {l}
          </button>
        ))}
        <PopoverTrigger asChild>
          <button type="button" role="radio" aria-checked={range === "custom"} className={cn("h-8 cursor-pointer rounded-[9px] border px-3 text-body font-medium whitespace-nowrap", range === "custom" ? "border-glass-stroke bg-glass-3 text-ink" : "border-transparent text-ink-2 hover:text-ink")}>
            Custom
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="end" className="glass-3 w-[300px] rounded-[16px] border-0 p-4 font-geist text-ink shadow-none">
        <p className="mb-3 text-card-title">Pick months</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>From</span>
            <input type="month" className={finInput} value={f} max={max} onChange={(e) => setF(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>To</span>
            <input type="month" className={finInput} value={t} max={max} onChange={(e) => setT(e.target.value)} />
          </label>
        </div>
        {tooLong ? <p className="mt-2 text-label text-danger">Pick 24 months or fewer.</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <GlassButton size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</GlassButton>
          <GlassButton
            size="sm"
            disabled={!f || !t || Boolean(tooLong)}
            onClick={() => {
              onPick("custom", f <= t ? f : t, f <= t ? t : f);
              setOpen(false);
            }}
          >
            Show
          </GlassButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Kpis({ data, periodLabel, span }: { data: FinanceOverview | undefined; periodLabel: string; span: number }) {
  const cur = data?.currency ?? "pkr";
  const t = data?.totals;
  const change = data?.profit_change_percent;
  const biggest = data?.biggest_categories ?? [];
  const still = data?.still_to_collect;
  const lastN = span === 1 ? "last month" : `last ${span}`;
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
      <FinKpi
        icon={<TrendingUp />}
        label={`Revenue · ${periodLabel}`}
        value={t ? compactMoney(t.revenue, cur) : "—"}
        sub={t ? `Rent ${compactMoney(t.rent, cur)} · extras ${compactMoney(t.extras, cur)}` : ""}
      />
      <FinKpi
        icon={<Receipt />}
        label={`Expenses · ${periodLabel}`}
        value={t ? compactMoney(t.expenses, cur) : "—"}
        sub={biggest.length ? `Biggest: ${biggest.map((b) => b.label).join(" & ")}` : t ? "No expenses recorded" : ""}
      />
      <FinKpi
        icon={<Wallet />}
        label={`Profit · ${periodLabel}`}
        value={t ? compactMoney(t.profit, cur) : "—"}
        danger={(t?.profit ?? 0) < 0}
        sub={
          t
            ? [t.margin != null ? `${t.margin}% margin` : null, change != null ? `${change >= 0 ? "up" : "down"} ${Math.abs(change)}% vs ${lastN}` : null].filter(Boolean).join(" · ") || "Nothing earned yet"
            : ""
        }
      />
      <FinKpi
        icon={<Banknote />}
        label="Still to collect"
        value={still ? formatMoney(still.amount, cur) : "—"}
        danger={(still?.amount ?? 0) > 0}
        sub={still ? (still.residents > 0 ? `${still.name} · ${still.residents} resident${still.residents === 1 ? "" : "s"}` : `${still.name} · everyone has paid`) : ""}
      />
    </div>
  );
}

function RevenueChart({ data, loading }: { data: FinanceOverview | undefined; loading: boolean }) {
  const [mode, setMode] = useState<"bars" | "profit">("bars");
  const [hover, setHover] = useState<number | null>(null);
  const cur = data?.currency ?? "pkr";
  const months = useMemo(() => [...(data?.months ?? [])].reverse(), [data]);
  const max = Math.max(1, ...months.map((m) => (mode === "bars" ? Math.max(m.revenue, m.expenses) : Math.abs(m.profit))));
  const h = (v: number) => (v > 0 ? `${Math.max(3, (v / max) * 100)}%` : "0%");
  const best = data?.best_month;
  const many = months.length > 8;

  return (
    <section className="glass-2 flex min-w-0 flex-col gap-3.5 rounded-[22px] p-5">
      <CardHead
        title="Revenue vs expenses"
        sub="Profit is the gap between the two"
        right={<Segmented label="Chart" value={mode} onChange={setMode} options={[["bars", "Bars"], ["profit", "Profit only"]] as const} />}
      />
      {loading && !data ? (
        <div className="h-[244px] animate-pulse rounded-[14px] bg-glass-inset" />
      ) : (
        <div className="relative">
          <div className={cn("flex h-[220px] items-end", many ? "gap-2" : "gap-3 md:gap-6")} onMouseLeave={() => setHover(null)}>
            {months.map((m, i) => (
              <div key={m.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2" onMouseEnter={() => setHover(i)}>
                <div className={cn("flex h-full w-full items-end justify-center gap-1 transition-opacity", hover != null && hover !== i && "opacity-50")}>
                  {mode === "bars" ? (
                    <>
                      <div className="dash-bar w-[22px] max-w-[45%] rounded-t-[6px] bg-brand" style={{ height: h(m.revenue), "--dash-d": `${200 + i * 50}ms` } as CSSProperties} />
                      <div className="dash-bar w-[22px] max-w-[45%] rounded-t-[6px] bg-glass-stroke" style={{ height: h(m.expenses), "--dash-d": `${240 + i * 50}ms` } as CSSProperties} />
                    </>
                  ) : (
                    <div className={cn("dash-bar w-[26px] max-w-[70%] rounded-t-[6px]", m.profit < 0 ? "bg-danger-solid" : "bg-brand")} style={{ height: h(Math.abs(m.profit)), "--dash-d": `${200 + i * 50}ms` } as CSSProperties} />
                  )}
                </div>
                <span className="truncate text-label text-ink-3">{m.short}{m.in_progress && !many ? " · so far" : ""}</span>
              </div>
            ))}
          </div>
          {hover != null && months[hover] ? (
            <div className="glass-3 pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-[10px] px-3 py-2 text-label whitespace-nowrap" style={{ left: `${((hover + 0.5) / months.length) * 100}%` }}>
              <p className="font-semibold text-ink">{months[hover].label}{months[hover].in_progress ? " · so far" : ""}</p>
              <p className="text-ink-2">Revenue <span className="font-semibold text-ink">{formatMoney(months[hover].revenue, cur)}</span></p>
              <p className="text-ink-2">Expenses <span className="font-semibold text-ink">{formatMoney(months[hover].expenses, cur)}</span></p>
              <p className="text-ink-2">Profit <span className={cn("font-semibold", months[hover].profit < 0 ? "text-danger" : "text-ink")}>{formatMoney(months[hover].profit, cur)}</span></p>
            </div>
          ) : null}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {mode === "bars" ? (
          <>
            <span className="flex items-center gap-1.5 text-label text-ink-2"><span className="size-2.5 rounded-[3px] bg-brand" aria-hidden />Revenue</span>
            <span className="flex items-center gap-1.5 text-label text-ink-2"><span className="size-2.5 rounded-[3px] bg-glass-stroke" aria-hidden />Expenses</span>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-label text-ink-2"><span className="size-2.5 rounded-[3px] bg-brand" aria-hidden />Profit</span>
        )}
        <span className="flex-1" />
        {best ? <span className="text-label text-ink-3">Best month: {best.name} · {formatMoney(best.profit, cur)} profit</span> : null}
      </div>
      <div className="sr-only">
        <table>
          <caption>Revenue, expenses and profit per month</caption>
          <tbody>
            {months.map((m) => (
              <tr key={m.key}>
                <th>{m.label}</th>
                <td>{formatMoney(m.revenue, cur)}</td>
                <td>{formatMoney(m.expenses, cur)}</td>
                <td>{formatMoney(m.profit, cur)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Sources({ data, loading }: { data: FinanceOverview | undefined; loading: boolean }) {
  const cur = data?.currency ?? "pkr";
  const s = data?.sources;
  const rows: [string, number][] = s ? [["Dorm beds", s.dorm], ["Private rooms", s.private], ["Extras (AC, cooler…)", s.extras], ["Meals", s.meals]] : [];
  const total = rows.reduce((n, [, v]) => n + v, 0);
  const occ = data?.occupancy;
  return (
    <section className="glass-2 flex flex-col gap-3.5 rounded-[22px] p-5">
      <CardHead title="Where money comes from" sub={s ? `${s.name}${s.in_progress ? " so far" : ""}` : " "} />
      {loading && !data ? (
        <div className="h-[220px] animate-pulse rounded-[14px] bg-glass-inset" />
      ) : (
        <>
          {rows.map(([label, v]) => (
            <BarRow key={label} label={label} value={formatMoney(v, cur)} pct={total > 0 ? (v / total) * 100 : 0} />
          ))}
          {total === 0 ? <p className="text-label text-ink-3">Nothing collected yet this month.</p> : null}
          {occ && occ.beds > 0 ? (
            <div className="flex items-center gap-2.5 rounded-[12px] bg-glass-inset px-3.5 py-3">
              <BedDouble className="size-4 shrink-0 text-ink-2" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-medium text-ink">{occ.filled_percent}% beds filled</p>
                <p className="truncate text-label text-ink-3">
                  {occ.free_beds === 0 ? "Every bed is taken" : `${occ.free_beds} free bed${occ.free_beds === 1 ? "" : "s"} = ${formatMoney(occ.missed_per_month, cur)} / month missed`}
                </p>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function ByMonth({ data, loading, onOpen }: { data: FinanceOverview | undefined; loading: boolean; onOpen: (m: FinanceMonth) => void }) {
  const cur = data?.currency ?? "pkr";
  const months = data?.months ?? [];
  const cols = "grid grid-cols-[minmax(130px,1.4fr)_minmax(80px,1fr)_minmax(110px,1.3fr)_minmax(110px,1.3fr)_minmax(110px,1.3fr)_minmax(70px,1fr)_24px]";
  return (
    <section className="glass-2 flex flex-col gap-3.5 rounded-[22px] p-4 md:p-5">
      <CardHead title="Month by month" sub="Click a month to see every payment and expense" />
      <div className="overflow-x-auto rounded-[16px] border border-glass-divider">
        <div className="min-w-[760px]">
          <div className={cn(cols, "h-11 items-center border-b border-glass-divider bg-glass-inset px-0 text-eyebrow text-ink-3 uppercase")}>
            <span className="px-3.5">Month</span>
            <span className="px-3.5">Residents</span>
            <span className="px-3.5 text-right">Revenue</span>
            <span className="px-3.5 text-right">Expenses</span>
            <span className="px-3.5 text-right">Profit</span>
            <span className="px-3.5 text-right">Margin</span>
            <span />
          </div>
          {loading && !data
            ? Array.from({ length: 6 }, (_, i) => <div key={i} className="h-[52px] animate-pulse border-b border-glass-divider bg-glass-inset/40 last:border-b-0" />)
            : months.map((m) => (
                <button key={m.key} type="button" onClick={() => onOpen(m)} className={cn(cols, "group h-[52px] w-full cursor-pointer items-center border-b border-glass-divider text-left text-body font-medium last:border-b-0 hover:bg-glass-inset")}>
                  <span className="flex min-w-0 flex-col px-3.5">
                    <span className="truncate text-ink">{m.label}</span>
                    {m.in_progress ? <span className="text-label font-normal text-ink-3">In progress</span> : null}
                  </span>
                  <span className="px-3.5 text-ink-2">{m.residents}</span>
                  <span className="px-3.5 text-right text-ink tabular-nums">{formatMoney(m.revenue, cur)}</span>
                  <span className="px-3.5 text-right text-ink-2 tabular-nums">{formatMoney(m.expenses, cur)}</span>
                  <span className={cn("px-3.5 text-right tabular-nums", m.profit < 0 ? "text-danger" : "text-ink")}>{formatMoney(m.profit, cur)}</span>
                  <span className="px-3.5 text-right text-ink-2">{m.margin != null ? `${m.margin}%` : "—"}</span>
                  <ChevronRight className="size-4 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </button>
              ))}
        </div>
      </div>
    </section>
  );
}
