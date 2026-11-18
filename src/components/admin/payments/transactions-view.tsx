import { useMemo } from "react";
import { Check, ChevronDown, CircleDollarSign, ReceiptText } from "lucide-react";
import { GlassSearch } from "@/components/glass";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { Transaction, TransactionsResponse, TxKind } from "@/types/domain/payments.types";
import { METHOD_ICON } from "./payments-overview";

export type TxFilters = { type: "all" | "in" | "refund"; method: string; kinds: TxKind[]; by: string; q: string };

const KIND_LABEL: Record<TxKind, string> = { rent: "Rent", extras: "Extras", deposit: "Deposit", refund: "Refund" };
const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const same = d.toDateString() === today.toDateString();
  const label = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return same ? `Today · ${label}` : label;
};

function Pick({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  const current = options.find(([k]) => k === value)?.[1];
  return (
    <Popover>
      <PopoverTrigger className={cn("glass-3 flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-[12px] px-3.5 text-body font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-border", value && "ring-1 ring-brand-border")}>
        <ChevronDown className="size-4" aria-hidden /> {value ? current : label}
      </PopoverTrigger>
      <PopoverContent align="end" className="glass-3 max-h-[300px] w-[220px] overflow-y-auto rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
        {[["", `Any ${label.toLowerCase()}`] as [string, string], ...options].map(([k, l]) => (
          <button key={k || "any"} type="button" onClick={() => onChange(k)} className={cn("flex w-full cursor-pointer items-center justify-between rounded-[10px] px-3 py-2 text-left text-body hover:bg-glass-inset", value === k && "bg-brand-tint")}>
            {l}
            {value === k ? <Check className="size-4 text-brand-text" aria-hidden /> : null}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export function TxToolbar({ data, f, set }: { data: TransactionsResponse | undefined; f: TxFilters; set: (p: Partial<TxFilters>) => void }) {
  const kinds: TxKind[] = ["rent", "extras", "deposit", "refund"];
  return (
    <div className="glass-2 flex flex-wrap items-center gap-2 rounded-[18px] p-2.5">
      <div className="flex gap-0.5 rounded-[14px] border border-glass-divider bg-glass-inset p-1">
        {(
          [
            ["all", "All", data?.counts.all],
            ["in", "Money in", data?.counts.in],
            ["refund", "Refunds", data?.counts.refund],
          ] as const
        ).map(([k, l, n]) => (
          <button key={k} type="button" aria-pressed={f.type === k} onClick={() => set({ type: k })} className={cn("flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] border px-3 text-body font-medium whitespace-nowrap", f.type === k ? "glass-3 border-glass-stroke text-ink" : "border-transparent text-ink-2 hover:text-ink")}>
            {l}
            {n != null ? <span className="text-label text-ink-3">{n}</span> : null}
          </button>
        ))}
      </div>
      <GlassSearch className="min-w-[200px] flex-1 md:max-w-[260px]" placeholder="Name, receipt or transaction ID" shortcut="" value={f.q} onChange={(e) => set({ q: e.target.value })} aria-label="Search transactions" />
      <span className="hidden flex-1 md:block" />
      <div className="hidden gap-2 md:flex">
        <Pick label="Method" value={f.method} options={(data?.methods ?? []).map((m) => [m.method, m.label])} onChange={(v) => set({ method: v })} />
        <Popover>
          <PopoverTrigger className={cn("glass-3 flex h-10 cursor-pointer items-center gap-2 rounded-[12px] px-3.5 text-body font-semibold text-ink", f.kinds.length !== 4 && "ring-1 ring-brand-border")}>
            <ChevronDown className="size-4" aria-hidden /> For: {f.kinds.length === 4 ? "rent, extras, deposit" : f.kinds.map((k) => KIND_LABEL[k].toLowerCase()).join(", ") || "nothing"}
          </PopoverTrigger>
          <PopoverContent align="end" className="glass-3 w-[200px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
            {kinds.map((k) => {
              const on = f.kinds.includes(k);
              return (
                <button key={k} type="button" onClick={() => set({ kinds: on ? f.kinds.filter((x) => x !== k) : [...f.kinds, k] })} className="flex w-full cursor-pointer items-center justify-between rounded-[10px] px-3 py-2 text-left text-body hover:bg-glass-inset">
                  {KIND_LABEL[k]}
                  {on ? <Check className="size-4 text-brand-text" aria-hidden /> : null}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
        <Pick label="Received by" value={f.by} options={(data?.received_by ?? []).map((n) => [n, n])} onChange={(v) => set({ by: v })} />
      </div>
    </div>
  );
}

export function TransactionsList({ rows, onOpen, footer }: { rows: Transaction[]; onOpen: (t: Transaction) => void; footer: React.ReactNode }) {
  const groups = useMemo(() => {
    const m = new Map<string, Transaction[]>();
    for (const t of rows) {
      const k = t.at.slice(0, 10);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(t);
    }
    return [...m.entries()];
  }, [rows]);
  const cur = rows[0]?.currency ?? "pkr";
  const dayTotals = (list: Transaction[]) => {
    const inn = list.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0);
    const out = list.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0);
    return { inn, out, count: list.filter((t) => t.direction === "in").length };
  };

  if (!rows.length) return <div className="glass-2 rounded-[20px] px-4 py-14 text-center text-body text-ink-2">No transactions match.</div>;

  return (
    <>
      <div className="glass-2 hidden overflow-hidden rounded-[20px] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left font-geist">
            <thead>
              <tr className="border-b border-glass-divider bg-glass-inset text-eyebrow text-ink-3 uppercase">
                <th className="py-3 pl-4 font-medium">Time</th>
                <th className="px-3 py-3 font-medium">Resident</th>
                <th className="px-3 py-3 font-medium">For</th>
                <th className="px-3 py-3 font-medium">Method</th>
                <th className="px-3 py-3 font-medium">Reference</th>
                <th className="px-3 py-3 font-medium">By</th>
                <th className="px-3 py-3 text-right font-medium">Amount</th>
                <th className="pr-4" />
              </tr>
            </thead>
            {groups.map(([day, list]) => {
              const t = dayTotals(list);
              return (
                <tbody key={day}>
                  <tr className="border-b border-glass-divider bg-glass-inset/60">
                    <td colSpan={6} className="py-2.5 pl-4 text-body font-semibold text-ink">{dayLabel(list[0].at)}</td>
                    <td colSpan={2} className="py-2.5 pr-4 text-right text-label text-ink-3">
                      {[t.inn ? `${formatMoney(t.inn, cur)} in${t.count > 1 ? ` · ${t.count} payments` : ""}` : null, t.out ? `${formatMoney(t.out, cur)} out` : null].filter(Boolean).join(" · ")}
                    </td>
                  </tr>
                  {list.map((r) => (
                    <tr key={r.id} onClick={() => onOpen(r)} className="cursor-pointer border-b border-glass-divider last:border-b-0 hover:bg-glass-inset">
                      <td className="py-3 pl-4 text-body whitespace-nowrap text-ink-2">{time(r.at)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-7 text-center text-label font-semibold text-ink-2">{r.initials}</span>
                          <span className="min-w-0"><span className="block truncate text-body font-semibold text-ink">{r.name}</span><span className="block truncate text-label text-ink-3">{r.room_label}</span></span>
                        </div>
                      </td>
                      <td className="max-w-[220px] px-3 py-3">
                        <p className="truncate text-body text-ink">{r.for}</p>
                        <span className="mt-0.5 inline-flex rounded-full border border-glass-stroke px-2 text-[11px] text-ink-2">{KIND_LABEL[r.kind]}</span>
                      </td>
                      <td className="px-3 py-3"><span className="flex items-center gap-2 text-body whitespace-nowrap text-ink-2 [&_svg]:size-4">{METHOD_ICON[r.method ?? "none"] ?? <CircleDollarSign />}{r.method_label}</span></td>
                      <td className="px-3 py-3 text-body text-ink-2">{r.source === "payment" && r.reference && !/^R-|^RF-/.test(r.reference) ? r.reference : "—"}</td>
                      <td className="px-3 py-3 text-body text-ink-2">{r.by ? r.by.split(" ")[0] : "—"}</td>
                      <td className={cn("px-3 py-3 text-right text-body font-semibold whitespace-nowrap", r.direction === "out" ? "text-ink-2" : "text-ink")}>{r.direction === "out" ? "− " : ""}{formatMoney(r.amount, r.currency)}</td>
                      <td className="pr-4"><span className="flex items-center justify-end gap-1 text-label whitespace-nowrap text-ink-3 [&_svg]:size-3.5"><ReceiptText aria-hidden />{/^R-|^RF-/.test(r.reference) ? r.reference : r.source === "security" ? "Ledger" : ""}</span></td>
                    </tr>
                  ))}
                </tbody>
              );
            })}
          </table>
        </div>
        {footer}
      </div>

      {/* Mobile (Figma 08.06) */}
      <div className="flex flex-col gap-3 md:hidden">
        {groups.map(([day, list]) => {
          const t = dayTotals(list);
          return (
            <section key={day} className="flex flex-col gap-1.5">
              <div className="flex justify-between px-1 text-label"><span className="font-semibold text-ink-2">{dayLabel(list[0].at)}</span><span className="text-ink-3">{[t.inn ? `+ ${formatMoney(t.inn, cur)}` : null, t.out ? `− ${formatMoney(t.out, cur)}` : null].filter(Boolean).join(" · ")}</span></div>
              <div className="glass-2 overflow-hidden rounded-[18px]">
                {list.map((r) => (
                  <button key={r.id} type="button" onClick={() => onOpen(r)} className="flex w-full cursor-pointer items-center gap-3 border-b border-glass-divider px-3.5 py-3 text-left last:border-b-0">
                    <span className="text-ink-2 [&_svg]:size-4">{METHOD_ICON[r.method ?? "none"] ?? <CircleDollarSign />}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-body font-semibold text-ink">{r.name}</span><span className="block truncate text-label text-ink-3">{r.for} · {r.method_label} · {time(r.at)}</span></span>
                    <span className={cn("text-body font-semibold whitespace-nowrap", r.direction === "out" ? "text-ink-2" : "text-ink")}>{r.direction === "out" ? "− " : ""}{formatMoney(r.amount, r.currency)}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {footer}
      </div>
    </>
  );
}
