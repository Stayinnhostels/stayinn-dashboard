import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Info, Mail, X, Loader2 } from "lucide-react";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { RentPaymentStatus } from "@/types/domain/resident.types";
import type { RollCell, RollMonthTotal, RollRow } from "@/types/domain/resident-roll.types";

const monName = (k: string, style: "short" | "long" = "short") => {
  const [y, m] = k.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: style });
};
const n = (v: number) => v.toLocaleString("en-US");

type SaveFn = (row: RollRow, month: string, status: RentPaymentStatus, collected?: number) => Promise<unknown>;

/** Figma 07.12 / 07.26 · Monthly rent (simplified): one column per month; click an amount to fix it (07.13 / 07.27). */
export function RentGrid({ rows, months, onSave, footer }: { rows: RollRow[]; months: RollMonthTotal[]; onSave: SaveFn; footer?: ReactNode }) {
  const cur = rows[0]?.currency ?? "pkr";
  const totalBalance = rows.reduce((s, r) => s + r.balance, 0);
  return (
    <div className="flex flex-col gap-3">
      <Legend currency={cur} />

      <MobileRentGrid rows={rows} months={months} onSave={onSave} footer={footer} />
      <div className="glass-2 hidden overflow-hidden rounded-[20px] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left font-geist">
            <thead>
              <tr className="border-b border-glass-divider">
                <th className="w-[220px] py-3.5 pl-4 text-label font-medium text-ink-3">Resident</th>
                {months.map((m) => (
                  <th key={m.month} className={cn("px-3 py-3.5 text-body font-semibold", m.state === "current" ? "bg-brand-tint text-ink" : m.state === "closed" ? "text-ink-2" : "text-ink-3")}>
                    <span className="flex items-center gap-1.5">
                      {monName(m.month)}
                      {m.state === "current" ? <span className="rounded-full bg-brand px-1.5 py-px text-[10px] font-semibold text-on-brand">Now</span> : null}
                    </span>
                  </th>
                ))}
                <th className="py-3.5 pr-4 text-right text-label font-medium text-ink-3">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.booking_id} className="border-b border-glass-divider last:border-b-0 hover:bg-glass-inset">
                  <td className="py-2.5 pl-4">
                    <Link to="/admin/residents/$id" params={{ id: r.booking_id }} className="group block min-w-0">
                      <span className="block truncate text-body font-semibold text-ink group-hover:underline">{r.name}</span>
                      <span className="block truncate text-label text-ink-3">{r.room_label}</span>
                    </Link>
                  </td>
                  {(r.cells ?? []).map((c, i) => (
                    <td key={c.month} className={cn("px-1.5 py-1.5", months[i]?.state === "current" && "bg-brand-tint/60")}>
                      <Cell row={r} cell={c} state={months[i]?.state ?? "closed"} onSave={onSave} />
                    </td>
                  ))}
                  <td className={cn("py-2.5 pr-4 text-right text-body font-semibold whitespace-nowrap", r.balance > 0 ? "text-danger" : "text-ink-3")}>{r.balance > 0 ? n(r.balance) : "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-glass-divider bg-glass-inset">
                <td className="py-3 pl-4 text-label font-medium text-ink-2">Collected</td>
                {months.map((m) => (
                  <td key={m.month} className={cn("px-3 py-3", m.state === "current" && "bg-brand-tint")}>
                    {m.state === "upcoming" && m.collected === 0 ? (
                      <span className="text-label text-ink-3">—</span>
                    ) : (
                      <span className="flex items-baseline gap-1.5">
                        <span className="text-label font-semibold text-ink">{n(m.collected)}</span>
                        {m.percent != null && m.state !== "upcoming" ? <span className={cn("text-[11px]", (m.percent ?? 0) >= 100 ? "text-success" : "text-ink-3")}>{m.percent}%</span> : null}
                      </span>
                    )}
                  </td>
                ))}
                <td className={cn("py-3 pr-4 text-right text-body font-semibold", totalBalance > 0 ? "text-danger" : "text-ink-3")}>{totalBalance > 0 ? n(totalBalance) : "—"}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {footer}
      </div>
    </div>
  );
}

/** One quiet line: what the colours mean + how to edit. Amounts are shown without "Rs". */
function Legend({ currency }: { currency: "pkr" | "usd" }) {
  const dot = (cls: string) => <span className={cn("size-2 rounded-full", cls)} aria-hidden />;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-label text-ink-2">
      <span className="flex items-center gap-1.5">{dot("bg-success")}Paid</span>
      <span className="flex items-center gap-1.5">{dot("bg-warning")}Part paid</span>
      <span className="flex items-center gap-1.5">{dot("bg-danger")}Not paid</span>
      <span className="flex items-center gap-1.5">{dot("bg-ink-3/40")}Not due yet</span>
      <span className="text-ink-3">— not living here</span>
      <span className="ml-auto text-ink-3">Amounts in {currency === "usd" ? "$" : "Rs"} · click an amount to change it</span>
    </div>
  );
}

const TONE: Record<RentPaymentStatus | "upcoming", { dot: string; text: string }> = {
  paid: { dot: "bg-success", text: "text-ink" },
  partial: { dot: "bg-warning", text: "text-warning" },
  not_paid: { dot: "bg-danger", text: "font-semibold text-danger" },
  returned: { dot: "bg-ink-3/60", text: "text-ink-3" },
  upcoming: { dot: "bg-ink-3/40", text: "text-ink-3" },
};

export function CellChip({ status, text, className }: { status: RentPaymentStatus | "upcoming"; text: string; className?: string }) {
  const t = TONE[status];
  return (
    <span className={cn("inline-flex items-center gap-2 text-label whitespace-nowrap", t.text, className)}>
      <span className={cn("size-2 shrink-0 rounded-full", t.dot)} aria-hidden />
      {text}
    </span>
  );
}

function cellText(c: Extract<RollCell, { in_stay: true }>, compact = false) {
  if (c.status === "returned") return "Returned";
  if (c.status === "partial") return compact ? `${n(c.left)} left` : `${n(c.collected)} of ${n(c.rent)}`;
  return n(c.status === "not_paid" ? c.left : c.rent);
}

function Cell({ row, cell, state, onSave, compact }: { row: RollRow; cell: RollCell; state: RollMonthTotal["state"]; onSave: SaveFn; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  if (!cell.in_stay) return <span className="block px-2 text-label text-ink-3">—</span>;
  const upcoming = state === "upcoming" && cell.status === "not_paid";
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={`${monName(cell.month, "long")} · ${row.name}`} className={cn("flex h-9 w-full cursor-pointer items-center rounded-[10px] px-2 outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border", open && "ring-2 ring-brand-border")}>
        <CellChip status={upcoming ? "upcoming" : cell.status} text={cellText(cell, compact)} />
      </PopoverTrigger>
      <PopoverContent align="center" sideOffset={6} className="glass-3 w-[min(320px,calc(100vw-24px))] rounded-[18px] border-0 p-4 font-geist text-ink shadow-none">
        <CellEditor row={row} cell={cell} onClose={() => setOpen(false)} onSave={onSave} />
      </PopoverContent>
    </Popover>
  );
}

function CellEditor({ row, cell, onClose, onSave }: { row: RollRow; cell: Extract<RollCell, { in_stay: true }>; onClose: () => void; onSave: SaveFn }) {
  const [status, setStatus] = useState<RentPaymentStatus>(cell.status);
  const [amount, setAmount] = useState(String(cell.status === "partial" ? cell.collected : cell.status === "paid" ? cell.rent : ""));
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (status === "paid") setAmount(String(cell.rent));
    if (status === "not_paid" || status === "returned") setAmount("");
  }, [status, cell.rent]);

  const amt = Number(amount) || 0;
  // Typing the full rent means Paid; anything between 0 and rent is Partial.
  const effective: RentPaymentStatus = status === "partial" || status === "paid" ? (amt >= cell.rent ? "paid" : amt > 0 ? "partial" : status === "paid" ? "paid" : "partial") : status;
  const left = Math.max(0, cell.rent - amt);
  const invalid = effective === "partial" && !(amt > 0 && amt < cell.rent);
  const prefix = row.currency === "usd" ? "$" : "Rs";

  async function save() {
    if (invalid) return;
    setBusy(true);
    try {
      await onSave(row, cell.month, effective, effective === "partial" ? amt : undefined);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold text-ink">Edit {monName(cell.month, "long")} · {row.name}</p>
          <p className="truncate text-label text-ink-3">Rent {formatMoney(cell.rent, row.currency)} · {row.room_label}</p>
        </div>
        <PopoverClose aria-label="Close" className="cursor-pointer rounded-md p-0.5 text-ink-3 hover:text-ink"><X className="size-4" aria-hidden /></PopoverClose>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-label font-medium text-ink-2">Status</span>
        <div role="radiogroup" aria-label="Status" className="grid grid-cols-4 gap-0.5 rounded-[12px] border border-glass-divider bg-glass-inset p-1">
          {(
            [
              ["paid", "Paid"],
              ["partial", "Partial"],
              ["returned", "Returned"],
              ["not_paid", "Not paid"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} type="button" role="radio" aria-checked={status === k} onClick={() => setStatus(k)} className={cn("h-8 cursor-pointer rounded-[9px] border text-label font-medium", status === k ? "glass-3 border-glass-stroke text-ink" : "border-transparent text-ink-2 hover:text-ink")}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {status === "partial" || status === "paid" ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-label font-medium text-ink-2">Amount received</span>
          <span className={cn("flex h-11 items-center gap-1.5 rounded-[12px] border bg-glass-inset px-3 focus-within:ring-2 focus-within:ring-brand-border", invalid ? "border-danger" : "border-glass-divider")}>
            <span className="text-body text-ink-2">{prefix}</span>
            <input autoFocus value={amount} inputMode="decimal" onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} className="min-w-0 flex-1 bg-transparent text-body font-semibold text-ink outline-none" aria-label="Amount received" />
            <span className="text-label text-ink-3">of {formatMoney(cell.rent, row.currency)}</span>
          </span>
        </label>
      ) : null}
      <div className="flex flex-col gap-1 text-label text-ink-3">
        {effective === "partial" && amt > 0 ? <span className="flex items-center gap-1.5"><Info className="size-3.5" aria-hidden />{formatMoney(left, row.currency)} left · saved as Partial</span> : null}
        <span className="flex items-center gap-1.5"><Mail className="size-3.5" aria-hidden />Choosing Paid emails a receipt to the resident</span>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button type="button" onClick={() => { setStatus("paid"); setAmount(String(cell.rent)); }} className="flex cursor-pointer items-center gap-1.5 text-label font-medium text-ink-2 hover:text-ink"><Check className="size-3.5" aria-hidden />Mark fully paid</button>
        <span className="flex-1" />
        <PopoverClose className="cursor-pointer rounded-[10px] px-3 py-1.5 text-label font-semibold text-ink hover:bg-glass-inset">Cancel</PopoverClose>
        <button type="button" onClick={() => void save()} disabled={invalid || busy} className="flex cursor-pointer items-center gap-1.5 rounded-[10px] bg-brand px-3.5 py-1.5 text-label font-semibold text-on-brand disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}Save
        </button>
      </div>
    </div>
  );
}

/** Figma 07.26 · Mobile monthly rent: this month + next, tap a month to change it (07.27). */
function MobileRentGrid({ rows, months, onSave, footer }: { rows: RollRow[]; months: RollMonthTotal[]; onSave: SaveFn; footer?: ReactNode }) {
  const ci = Math.max(0, months.findIndex((m) => m.state === "current"));
  const cols = [ci, ci + 1].filter((i) => i < months.length);
  const curM = months[ci];
  const cur = rows[0]?.currency ?? "pkr";
  const shortRoom = (label: string) => label.replace(/^Room (\d+) · Bed (\d+)$/, "Bed $1·$2").replace(/^Room (\d+) · Single$/, "Single $1");
  return (
    <div className="flex flex-col gap-2 md:hidden">
      <div className="glass-2 overflow-hidden rounded-[18px]">
        <table className="w-full border-collapse font-geist">
          <thead>
            <tr className="border-b border-glass-divider text-left">
              <th className="py-2.5 pl-3 text-label font-medium text-ink-3">Resident</th>
              {cols.map((i) => (
                <th key={i} className={cn("w-[34%] px-2.5 py-2.5", months[i].state === "current" ? "bg-brand-tint" : "")}>
                  <span className={cn("flex items-center gap-1.5 text-body font-semibold", months[i].state === "current" ? "text-ink" : "text-ink-3")}>
                    {monName(months[i].month)}
                    {months[i].state === "current" ? <span className="rounded-full bg-brand px-1.5 py-px text-[10px] font-semibold text-on-brand">Now</span> : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.booking_id} className="border-b border-glass-divider last:border-b-0">
                <td className="max-w-0 py-2 pl-3">
                  <Link to="/admin/residents/$id" params={{ id: r.booking_id }} className="block">
                    <span className="block truncate text-label font-semibold text-ink">{r.name.length > 14 ? `${r.name.split(" ")[0]} ${r.name.split(" ")[1]?.[0] ?? ""}.` : r.name}</span>
                    <span className="block truncate text-[11px] text-ink-3">{shortRoom(r.room_label)}</span>
                  </Link>
                </td>
                {cols.map((i) => (
                  <td key={i} className={cn("px-1 py-1", months[i].state === "current" && "bg-brand-tint/60")}>
                    {r.cells?.[i] ? <Cell row={r} cell={r.cells[i]} state={months[i].state} onSave={onSave} compact /> : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between gap-2 border-t border-glass-divider px-3 py-2.5 text-label">
          <span className="text-ink-2">{curM ? `${monName(curM.month)} collected: ${formatMoney(curM.collected, cur)}${curM.percent != null ? ` (${curM.percent}%)` : ""}` : ""}</span>
          <span className="text-ink-3">‹ › other months</span>
        </div>
        {footer}
      </div>
    </div>
  );
}
