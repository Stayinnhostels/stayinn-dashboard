import { Link } from "@tanstack/react-router";
import { Eye, FileText, MoreHorizontal, ReceiptText, UserRound } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RentStatusPill } from "@/components/admin/residents/rent-status";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { RentPaymentStatus } from "@/types/domain/resident.types";
import type { RollRow } from "@/types/domain/resident-roll.types";

/** Due / collected for the month including extras and an unpaid move-in deposit. */
export function rowMoney(r: RollRow) {
  const due = r.this_month.rent + r.this_month.deposit_due + (r.extras?.due ?? 0);
  const collected = r.this_month.collected + (r.extras?.collected ?? 0);
  const left = Math.max(0, due - collected);
  const status: RentPaymentStatus = r.this_month.status === "returned" ? "returned" : left <= 0 && due > 0 ? "paid" : collected > 0 ? "partial" : "not_paid";
  const what = r.this_month.deposit_due > 0 ? "incl. deposit" : r.extras?.labels.length ? `Rent + ${r.extras.labels.join(" + ")}` : "Rent";
  return { due, collected, left, status, what };
}

const dayMon = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "");

type Props = {
  rows: RollRow[];
  onCollect: (r: RollRow) => void;
  onReceipt: (r: RollRow) => void;
  footer: React.ReactNode;
};

export function RentByResident({ rows, onCollect, onReceipt, footer }: Props) {
  return (
    <>
      <div className="glass-2 hidden overflow-hidden rounded-[20px] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left font-geist">
            <thead>
              <tr className="border-b border-glass-divider bg-glass-inset text-eyebrow text-ink-3 uppercase">
                <th className="py-3 pl-4 font-medium">Resident</th>
                <th className="px-3 py-3 font-medium">Room</th>
                <th className="px-3 py-3 font-medium">Due</th>
                <th className="px-3 py-3 font-medium">Collected</th>
                <th className="px-3 py-3 font-medium">Last payment</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="pr-4" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const m = rowMoney(r);
                return (
                  <tr key={r.booking_id} className="border-b border-glass-divider last:border-b-0 hover:bg-glass-inset">
                    <td className="py-3 pl-4">
                      <Link to="/admin/residents/$id" params={{ id: r.booking_id }} className="group flex items-center gap-3">
                        <span className="w-7 text-center text-label font-semibold text-ink-2">{r.initials}</span>
                        <span className="min-w-0"><span className="block truncate text-body font-semibold text-ink group-hover:underline">{r.name}</span><span className="block text-label text-ink-3">{r.booking_code ?? ""}</span></span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-body whitespace-nowrap text-ink">{r.room_label}</td>
                    <td className="px-3 py-3"><p className="text-body font-semibold text-ink">{formatMoney(m.due, r.currency)}</p><p className="text-label text-ink-3">{m.what}</p></td>
                    <td className="w-[180px] px-3 py-3">
                      <p className="text-label text-ink-3"><span className="text-body font-semibold text-ink">{formatMoney(m.collected, r.currency)}</span> of {formatMoney(m.due, r.currency).replace(/^Rs\s/, "")}</p>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-glass-inset"><div className="h-full rounded-full bg-brand" style={{ width: `${m.due ? Math.min(100, (m.collected / m.due) * 100) : 0}%` }} /></div>
                    </td>
                    <td className="px-3 py-3">
                      {r.last_payment ? (
                        <><p className="text-body text-ink">{dayMon(r.last_payment.at)} · {r.last_payment.method_label}</p><p className="max-w-[200px] truncate text-label text-ink-3">{r.last_payment.description || formatMoney(r.last_payment.amount, r.currency)}</p></>
                      ) : (
                        <><p className="text-body text-ink-3">—</p><p className="text-label text-ink-3">No payment yet</p></>
                      )}
                    </td>
                    <td className="px-3 py-3"><RentStatusPill status={m.status} /></td>
                    <td className="pr-3">
                      <div className="flex items-center justify-end gap-1">
                        <RowAction r={r} m={m} onCollect={onCollect} onReceipt={onReceipt} />
                        <RowMenu r={r} onReceipt={onReceipt} />
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

      {/* Mobile cards (Figma 08.05) */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {rows.map((r) => {
          const m = rowMoney(r);
          return (
            <div key={r.booking_id} className="glass-2 flex flex-col gap-2.5 rounded-[18px] p-3.5">
              <div className="flex items-start gap-3">
                <span className="w-7 pt-0.5 text-center text-label font-semibold text-ink-2">{r.initials}</span>
                <Link to="/admin/residents/$id" params={{ id: r.booking_id }} className="min-w-0 flex-1">
                  <span className="block truncate text-body font-semibold text-ink">{r.name}</span>
                  <span className="block truncate text-label text-ink-3">{r.room_label} · {r.last_payment ? `${dayMon(r.last_payment.at)} · ${r.last_payment.method_label}` : "No payment yet"}</span>
                </Link>
                <RentStatusPill status={m.status} />
              </div>
              <div className="flex items-center justify-between gap-2 pl-10">
                <p className="text-label text-ink-3"><span className="text-body font-semibold text-ink">{formatMoney(m.collected, r.currency)}</span> of {formatMoney(m.due, r.currency).replace(/^Rs\s/, "")}</p>
                <RowAction r={r} m={m} onCollect={onCollect} onReceipt={onReceipt} />
              </div>
              <div className="ml-10 h-1 overflow-hidden rounded-full bg-glass-inset"><div className="h-full rounded-full bg-brand" style={{ width: `${m.due ? Math.min(100, (m.collected / m.due) * 100) : 0}%` }} /></div>
            </div>
          );
        })}
        {footer}
      </div>
    </>
  );
}

function RowAction({ r, m, onCollect, onReceipt }: { r: RollRow; m: ReturnType<typeof rowMoney>; onCollect: (r: RollRow) => void; onReceipt: (r: RollRow) => void }) {
  const cls = "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-label font-semibold whitespace-nowrap [&_svg]:size-3.5";
  if (m.status === "returned") return <Link to="/admin/residents/$id" params={{ id: r.booking_id }} className={cn(cls, "text-ink-2 hover:bg-glass-inset")}>View</Link>;
  if (m.status === "paid") return <button type="button" onClick={() => onReceipt(r)} className={cn(cls, "text-ink-2 hover:bg-glass-inset")}><ReceiptText aria-hidden /> Receipt</button>;
  return <button type="button" onClick={() => onCollect(r)} className={cn(cls, "glass-3 text-ink hover:brightness-105")}>Collect {formatMoney(m.left, r.currency)}</button>;
}

function RowMenu({ r, onReceipt }: { r: RollRow; onReceipt: (r: RollRow) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={`More for ${r.name}`} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-inset"><MoreHorizontal className="size-4" aria-hidden /></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-3 min-w-[190px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
        <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-[10px]"><Link to="/admin/residents/$id" params={{ id: r.booking_id }}><UserRound className="size-4" />Open resident</Link></DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-[10px]"><Link to="/admin/residents/$id" params={{ id: r.booking_id }} search={{ tab: "payments" }}><Eye className="size-4" />Payment history</Link></DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer gap-2 rounded-[10px]" onSelect={() => onReceipt(r)}><FileText className="size-4" />Download invoice</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
