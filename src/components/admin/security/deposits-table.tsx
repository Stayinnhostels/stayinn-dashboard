import { Link } from "@tanstack/react-router";
import { FileText, History, MoreHorizontal, Pencil, ReceiptText, ShieldMinus, UserRound, Wallet } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { DepositRow } from "@/types/domain/security-deposits.types";
import { DepositStatusPill, Initials } from "./deposits-overview";

export type DepositActions = {
  onHistory: (r: DepositRow) => void;
  onReturn: (r: DepositRow) => void;
  onCollect: (r: DepositRow) => void;
  onAdjust: (r: DepositRow) => void;
  onKeep: (r: DepositRow) => void;
  onReceipt: (r: DepositRow) => void;
};

const dash = <span className="text-ink-3">—</span>;
const actionCls = "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-label font-semibold whitespace-nowrap [&_svg]:size-4";

function PrimaryAction({ r, a, mobile }: { r: DepositRow; a: DepositActions; mobile?: boolean }) {
  const m = (n: number) => formatMoney(n, r.currency);
  if (r.status === "leaving") return <button type="button" onClick={() => a.onReturn(r)} className={cn(actionCls, "glass-3 text-ink hover:brightness-105")}>{mobile ? "Return" : `Return ${m(r.planned_return)}`}</button>;
  if (r.status === "not_paid" || r.status === "part_paid") return <button type="button" onClick={() => a.onCollect(r)} className={cn(actionCls, "glass-3 text-ink hover:brightness-105")}>Collect</button>;
  return <button type="button" onClick={() => a.onHistory(r)} className={cn(actionCls, "font-medium text-ink-2 hover:bg-glass-inset")}><FileText aria-hidden />{mobile ? "History" : "Ledger"}</button>;
}

function RowMenu({ r, a }: { r: DepositRow; a: DepositActions }) {
  const item = "cursor-pointer gap-2 rounded-[10px]";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={`More for ${r.name}`} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-inset"><MoreHorizontal className="size-4" aria-hidden /></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-3 min-w-[200px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
        <DropdownMenuItem className={item} onSelect={() => a.onHistory(r)}><History className="size-4" />Deposit history</DropdownMenuItem>
        {r.held > 0 ? <DropdownMenuItem className={item} onSelect={() => a.onReturn(r)}><Wallet className="size-4" />Return deposit</DropdownMenuItem> : null}
        {r.living && r.left_to_collect > 0 ? <DropdownMenuItem className={item} onSelect={() => a.onCollect(r)}><Wallet className="size-4" />Collect deposit</DropdownMenuItem> : null}
        {r.held > 0 ? <DropdownMenuItem className={item} onSelect={() => a.onAdjust(r)}><Pencil className="size-4" />Adjust planned return</DropdownMenuItem> : null}
        {r.held > 0 ? <DropdownMenuItem className={item} onSelect={() => a.onKeep(r)}><ShieldMinus className="size-4" />Keep part</DropdownMenuItem> : null}
        {r.deposited > 0 ? <DropdownMenuItem className={item} onSelect={() => a.onReceipt(r)}><ReceiptText className="size-4" />Download receipt</DropdownMenuItem> : null}
        <DropdownMenuSeparator className="bg-glass-divider" />
        <DropdownMenuItem asChild className={item}><Link to="/admin/residents/$id" params={{ id: r.booking_id }}><UserRound className="size-4" />Open resident</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Figma 09.01 deposits table (desktop) and 09.04 cards (mobile). */
export function DepositsTable({ rows, actions, footer }: { rows: DepositRow[]; actions: DepositActions; footer: React.ReactNode }) {
  const maxHeld = Math.max(1, ...rows.map((r) => r.held));
  return (
    <>
      <div className="glass-2 hidden overflow-hidden rounded-[22px] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] table-fixed border-collapse text-left font-geist">
            <colgroup>
              <col className="w-[226px]" />
              <col className="w-[128px]" />
              <col className="w-[100px]" />
              <col className="w-[105px]" />
              <col className="w-[90px]" />
              <col className="w-[126px]" />
              <col className="w-[115px]" />
              <col />
            </colgroup>
            <thead>
              <tr className="h-11 border-b border-glass-divider bg-glass-inset text-eyebrow text-ink-3 uppercase">
                <th className="pl-3.5 font-medium">Resident / payer</th>
                <th className="font-medium">Room · stay</th>
                <th className="font-medium">Deposited</th>
                <th className="font-medium">To return</th>
                <th className="font-medium">Returned</th>
                <th className="font-medium">Still held</th>
                <th className="font-medium">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const m = (n: number) => formatMoney(n, r.currency);
                return (
                  <tr key={r.booking_id} className="h-[65px] border-b border-glass-divider last:border-b-0 hover:bg-glass-inset/60">
                    <td className="pl-3.5">
                      <button type="button" onClick={() => actions.onHistory(r)} className="group flex w-full min-w-0 cursor-pointer items-center gap-3 text-left">
                        <Initials text={r.initials} />
                        <span className="min-w-0">
                          <span className="block truncate text-body font-semibold text-ink group-hover:underline">{r.name}</span>
                          <span className="block truncate text-label text-ink-2">{r.deposited > 0 || r.payer.relation !== "self" ? `Paid by ${r.payer.label}` : "—"}</span>
                        </span>
                      </button>
                    </td>
                    <td className="pr-2"><p className="truncate text-body text-ink">{r.room_label}</p><p className="truncate text-label text-ink-2">{r.stay_label}</p></td>
                    <td className="text-body text-ink">{r.deposited > 0 ? m(r.deposited) : dash}</td>
                    <td className="pr-2">{r.to_return > 0 ? <><p className="text-body text-ink">{m(r.to_return)}</p>{r.after_deductions ? <p className="truncate text-label text-ink-2">after deductions</p> : null}</> : dash}</td>
                    <td className="text-body text-ink">{r.returned > 0 ? m(r.returned) : dash}</td>
                    <td className="pr-6">
                      <p className={cn("text-body", r.held > 0 ? "font-semibold text-ink" : "text-ink-3")}>{m(r.held)}</p>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-glass-inset"><div className="dash-fill h-full rounded-full bg-brand" style={{ width: `${(r.held / maxHeld) * 100}%` }} /></div>
                    </td>
                    <td><DepositStatusPill status={r.status} /></td>
                    <td className="pr-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <PrimaryAction r={r} a={actions} />
                        <RowMenu r={r} a={actions} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {footer}
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((r) => {
          const m = (n: number) => formatMoney(n, r.currency);
          const sub =
            r.status === "not_paid" || r.status === "part_paid"
              ? `${m(r.left_to_collect)} not collected`
              : r.status === "leaving"
                ? `Give back ${m(r.planned_return)}${r.planned_return < r.held ? (r.owed > 0 ? " · owes rent" : " · after deductions") : " in full"}`
                : r.status === "returned" || r.status === "kept"
                  ? `${m(r.returned)} returned${r.kept > 0 ? ` · ${m(r.kept)} kept` : ""}`
                  : r.payer.self ? "Paid by resident" : `Paid by ${r.payer.name}`;
          return (
            <div key={r.booking_id} className="glass-2 rounded-[18px] px-3.5 py-3.5">
              <div className="flex items-center gap-3 border-b border-glass-divider pb-3">
                <Initials text={r.initials} />
                <button type="button" onClick={() => actions.onHistory(r)} className="min-w-0 flex-1 cursor-pointer text-left">
                  <span className="block truncate text-[15px] leading-5 font-semibold text-ink">{r.name}</span>
                  <span className="block truncate text-label text-ink-2">{r.room_label} · {r.stay_label.replace(/^(\w)/, (c) => c.toLowerCase())}</span>
                </button>
                <DepositStatusPill status={r.status} />
              </div>
              <div className="flex items-center gap-2 pt-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-5 font-semibold text-ink">Held {m(r.held)}</p>
                  <p className="truncate text-label text-ink-2">{sub}</p>
                </div>
                <PrimaryAction r={r} a={actions} mobile />
              </div>
            </div>
          );
        })}
        {footer}
      </div>
    </>
  );
}
