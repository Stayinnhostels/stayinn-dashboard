import { Banknote, Clock, RefreshCw, Shield, TriangleAlert } from "lucide-react";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { DepositRow, DepositStatus, DepositsResponse } from "@/types/domain/security-deposits.types";
import { CountUp } from "@/components/admin/dashboard/dashboard-motion";

export const dayMon = (key: string | null | undefined) =>
  key ? new Date(`${key.slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";

export const DEPOSIT_STATUS_LABEL: Record<DepositStatus, string> = {
  leaving: "Leaving",
  not_paid: "Not paid",
  part_paid: "Part paid",
  held: "Held",
  returned: "Returned",
  kept: "Kept",
};

/** Figma 09 status tag: outlined pill with a dot. */
export function DepositStatusPill({ status, className }: { status: DepositStatus; className?: string }) {
  return (
    <span className={cn("inline-flex h-[22px] items-center gap-1.5 rounded-full border border-ink-2/70 px-2 text-[12px] leading-4 font-medium whitespace-nowrap text-ink-2", className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {DEPOSIT_STATUS_LABEL[status]}
    </span>
  );
}

export function Initials({ text, size = 34, className }: { text: string; size?: number; className?: string }) {
  return (
    <span style={{ width: size, height: size }} className={cn("flex shrink-0 items-center justify-center rounded-full bg-glass-inset text-[12px] font-semibold text-ink", className)}>
      {text}
    </span>
  );
}

/** Figma 09.01 KPI row: Held right now · Planned to give back · Returned this year · Kept. */
export function DepositKpis({ data }: { data: DepositsResponse | undefined }) {
  const k = data?.kpis;
  const c = data?.currency ?? "pkr";
  const m = (n: number) => formatMoney(n, c);
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
      <Kpi className="col-span-2 xl:col-span-1" icon={<Shield />} label="Held right now" value={k ? m(k.held.amount) : "—"} sub={k ? `${k.held.residents} residents${k.held.standard ? ` · ${m(k.held.standard)} standard` : ""}` : ""} mobileSub={k ? `${k.held.residents} residents · ${m(k.planned_return.amount)} planned to give back` : ""} hero />
      <Kpi className="hidden xl:flex" icon={<RefreshCw />} label="Planned to give back" value={k ? m(k.planned_return.amount) : "—"} sub={k ? `${m(k.planned_return.expected_deductions)} expected deductions` : ""} />
      <Kpi icon={<Banknote />} label="Returned this year" short="Returned" value={k ? m(k.returned_year.amount) : "—"} sub={k ? `${k.returned_year.residents} residents · ${k.returned_year.this_month} this month` : ""} />
      <Kpi icon={<TriangleAlert />} label="Kept (deductions)" short="Kept" value={k ? m(k.kept_year.amount) : "—"} sub={k?.kept_year.note ?? ""} />
    </div>
  );
}

function Kpi({ icon, label, short, value, sub, mobileSub, hero, className }: { icon: React.ReactNode; label: string; short?: string; value: string; sub: string; mobileSub?: string; hero?: boolean; className?: string }) {
  return (
    <div className={cn("glass-2 flex min-w-0 flex-col rounded-[22px]", hero ? "gap-1.5 px-4 py-4 md:gap-2" : "gap-1 px-4 py-3.5 md:gap-2", "md:px-5 md:py-5", className)}>
      <span className={cn("items-center gap-2 text-body font-medium text-ink-2 [&_svg]:size-4", hero ? "hidden md:flex" : "hidden md:flex")}>
        <span className="flex size-8 items-center justify-center rounded-[10px] text-ink-2">{icon}</span>
        {label}
      </span>
      <span className={cn("md:hidden", hero ? "text-eyebrow font-semibold tracking-wide text-ink-3 uppercase" : "text-label text-ink-2")}>{hero ? label : short ?? label}</span>
      <span className={cn("truncate font-semibold tracking-tight text-ink", hero ? "text-[30px] leading-9 md:text-[30px]" : "text-[15px] leading-5 md:text-[30px] md:leading-9")}><CountUp value={value} delay={250} /></span>
      <span className={cn("truncate text-label text-ink-3", !hero && "hidden md:block")}>
        <span className="hidden md:inline">{sub}</span>
        <span className="md:hidden">{mobileSub ?? sub}</span>
      </span>
    </div>
  );
}

function ToDoCard({ icon, title, sub, action, children }: { icon: React.ReactNode; title: string; sub: string; action: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass-2 flex flex-col gap-3 rounded-[22px] p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center text-ink [&_svg]:size-[18px]">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] leading-5 font-semibold text-ink">{title}</p>
          <p className="truncate text-label text-ink-2">{sub}</p>
        </div>
        {action}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function PersonLine({ r, sub, amount, onClick }: { r: DepositRow; sub: string; amount: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-[58px] w-full cursor-pointer items-center gap-2.5 rounded-[14px] bg-glass-inset px-3 text-left transition-[filter] hover:brightness-[0.98]">
      <Initials text={r.initials} size={30} className="bg-glass-3" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body font-medium text-ink">{r.name}</span>
        <span className="block truncate text-label text-ink-2">{sub}</span>
      </span>
      <span className="shrink-0 text-body font-semibold text-ink">{amount}</span>
    </button>
  );
}

const smallBtn = "glass-3 inline-flex h-8 shrink-0 cursor-pointer items-center rounded-[10px] px-3 text-label font-semibold text-ink hover:brightness-105 disabled:opacity-60";

/** Figma 09.01 "Leaving soon · settle" and "Deposit not collected". */
export function DepositToDo({ data, onReturn, onSettleAll, onCollect, onRemind, reminding }: { data: DepositsResponse | undefined; onReturn: (r: DepositRow) => void; onSettleAll: (rows: DepositRow[]) => void; onCollect: (r: DepositRow) => void; onRemind: (rows: DepositRow[]) => void; reminding?: boolean }) {
  const leaving = data?.leaving_soon.rows ?? [];
  const notPaid = data?.not_collected.rows ?? [];
  if (!leaving.length && !notPaid.length) return null;
  const c = data?.currency ?? "pkr";
  return (
    <div className={cn("hidden gap-4 md:grid", leaving.length && notPaid.length ? "md:grid-cols-2" : "md:grid-cols-1")}>
      {leaving.length ? (
        <ToDoCard
          icon={<Clock />}
          title="Leaving soon · settle"
          sub={`${leaving.length} resident${leaving.length === 1 ? "" : "s"} check${leaving.length === 1 ? "s" : ""} out by ${dayMon(data?.leaving_soon.by)}`}
          action={<button type="button" className={smallBtn} onClick={() => onSettleAll(leaving)}>{leaving.length === 1 ? "Settle" : leaving.length === 2 ? "Settle both" : `Settle ${leaving.length}`}</button>}
        >
          {leaving.slice(0, 3).map((r) => (
            <PersonLine key={r.booking_id} r={r} onClick={() => onReturn(r)} sub={`${r.room_label} · ${dayMon(r.check_out)} · ${r.owed > 0 ? `owes ${formatMoney(r.owed, c)}` : "nothing owed"}`} amount={`Return ${formatMoney(r.planned_return, c)}`} />
          ))}
        </ToDoCard>
      ) : null}
      {notPaid.length ? (
        <ToDoCard
          icon={<TriangleAlert />}
          title="Deposit not collected"
          sub={`${notPaid.length} resident${notPaid.length === 1 ? "" : "s"} moved in without paying it`}
          action={<button type="button" className={smallBtn} disabled={reminding} onClick={() => onRemind(notPaid)}>Remind {notPaid.length}</button>}
        >
          {notPaid.slice(0, 3).map((r) => (
            <PersonLine
              key={r.booking_id}
              r={r}
              onClick={() => onCollect(r)}
              sub={`${r.room_label} · ${r.status === "part_paid" ? `${formatMoney(r.deposited, c)} paid` : `since ${dayMon(r.move_in)}`}`}
              amount={r.status === "part_paid" ? `${formatMoney(r.left_to_collect, c)} left` : formatMoney(r.left_to_collect, c)}
            />
          ))}
        </ToDoCard>
      ) : null}
    </div>
  );
}

/** Figma 09.04 mobile banner: "2 leaving by 30 Nov · Rs 17,500 to give back · Settle". */
export function LeavingBanner({ data, onSettle }: { data: DepositsResponse | undefined; onSettle: (rows: DepositRow[]) => void }) {
  const rows = data?.leaving_soon.rows ?? [];
  if (!rows.length) return null;
  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-glass-divider bg-glass-inset px-4 py-3 md:hidden">
      <Clock className="size-5 shrink-0 text-ink-2" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-semibold text-ink">{rows.length} leaving by {dayMon(data?.leaving_soon.by)}</p>
        <p className="truncate text-label text-ink-2">{formatMoney(data?.leaving_soon.to_return ?? 0, data?.currency)} to give back</p>
      </div>
      <button type="button" onClick={() => onSettle(rows)} className="h-8 cursor-pointer rounded-[10px] bg-brand px-3 text-label font-semibold text-on-brand shadow-[0_4px_14px_-4px_var(--gl-brand)]">Settle</button>
    </div>
  );
}
