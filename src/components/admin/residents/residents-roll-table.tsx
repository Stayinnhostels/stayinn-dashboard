import { useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Eye, FileText, Loader2, Mail, MessageCircle, MoreHorizontal, ReceiptText, UserRound } from "lucide-react";
import { GlassCheckbox } from "@/components/glass";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { RentPaymentStatus } from "@/types/domain/resident.types";
import type { RollRow } from "@/types/domain/resident-roll.types";
import { RentStatusMenu, RentStatusPill } from "./rent-status";

export type RollActions = {
  monthName: string;
  busyId: string | null;
  setStatus: (row: RollRow, status: RentPaymentStatus, collected?: number) => Promise<unknown>;
  markPaid: (row: RollRow) => void;
  downloadInvoice: (row: RollRow) => void;
  emailReceipt: (row: RollRow) => void;
  remind: (row: RollRow) => void;
};

const mon = (k: string | null) => {
  if (!k) return "";
  const [y, m] = k.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "short" });
};
const dayMon = (k: string | null) => {
  if (!k) return "";
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

/** "Rs 7,500 not paid · incl. deposit" etc. under the status pill. */
export function thisMonthLine(r: RollRow) {
  const t = r.this_month;
  const m = (n: number) => formatMoney(n, r.currency);
  if (t.status === "paid") {
    if (t.paid_ahead_until) {
      const [y, m] = t.month.split("-").map(Number);
      const next = `${new Date(y, m, 1).getFullYear()}-${String(new Date(y, m, 1).getMonth() + 1).padStart(2, "0")}`;
      return `Paid for ${mon(t.month)} ${t.paid_ahead_until === next ? "&" : "–"} ${mon(t.paid_ahead_until)}`;
    }
    return t.receipt_emailed ? "Paid · receipt emailed" : "Paid";
  }
  if (t.status === "partial") return `${m(t.collected)} paid · ${m(t.left)} left`;
  if (t.status === "returned") return `${m(t.rent)} returned${t.leaving_on ? ` · leaving ${dayMon(t.leaving_on)}` : ""}`;
  return `${m(t.left)} not paid${t.deposit_due > 0 ? " · incl. deposit" : ""}`;
}

function historyTitle(r: RollRow) {
  return r.history.month_index ? `Month ${r.history.month_index} of ${r.history.months_total}` : `${r.history.months_total} months`;
}

const prefix = (c: "pkr" | "usd") => (c === "usd" ? "$" : "Rs");

function ActionButton({ row, actions }: { row: RollRow; actions: RollActions }) {
  const busy = actions.busyId === row.booking_id;
  const cls =
    "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-label font-semibold whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-brand-border disabled:cursor-progress disabled:opacity-60 [&_svg]:size-3.5";
  if (row.action === "receipt")
    return (
      <button type="button" onClick={() => actions.downloadInvoice(row)} className={cn(cls, "text-ink-2 hover:bg-glass-inset hover:text-ink")}>
        <ReceiptText aria-hidden /> Receipt
      </button>
    );
  if (row.action === "view")
    return (
      <Link to="/admin/residents/$id" params={{ id: row.booking_id }} className={cn(cls, "text-ink-2 hover:bg-glass-inset hover:text-ink")}>
        View
      </Link>
    );
  return (
    <button type="button" disabled={busy} onClick={() => actions.markPaid(row)} className={cn(cls, "glass-2 text-ink hover:bg-glass-inset")}>
      {busy ? <Loader2 className="animate-spin" aria-hidden /> : row.action === "mark_paid" ? <Check aria-hidden /> : null}
      {row.action === "collect" ? `Collect ${formatMoney(row.this_month.left, row.currency)}` : "Mark paid"}
    </button>
  );
}

function RowMenu({ row, actions }: { row: RollRow; actions: RollActions }) {
  const unpaid = row.this_month.status === "not_paid" || row.this_month.status === "partial";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={`More for ${row.name}`} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 outline-none hover:bg-glass-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border">
        <MoreHorizontal className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-3 min-w-[200px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
        <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-[10px] text-body">
          <Link to="/admin/residents/$id" params={{ id: row.booking_id }}><UserRound className="size-4" /> Open profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-[10px] text-body">
          <Link to="/admin/bookings/$id" params={{ id: row.booking_id }}><Eye className="size-4" /> Open booking</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-glass-divider" />
        <DropdownMenuItem className="cursor-pointer gap-2 rounded-[10px] text-body" onSelect={() => actions.downloadInvoice(row)}>
          <FileText className="size-4" /> Download {actions.monthName} invoice
        </DropdownMenuItem>
        {row.this_month.status === "paid" && row.has_email ? (
          <DropdownMenuItem className="cursor-pointer gap-2 rounded-[10px] text-body" onSelect={() => actions.emailReceipt(row)}>
            <Mail className="size-4" /> Email receipt again
          </DropdownMenuItem>
        ) : null}
        {unpaid && row.has_email ? (
          <DropdownMenuItem className="cursor-pointer gap-2 rounded-[10px] text-body" onSelect={() => actions.remind(row)}>
            <MessageCircle className="size-4" /> Send reminder
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatusCell({ row, actions }: { row: RollRow; actions: RollActions }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <RentStatusMenu
        status={row.this_month.status}
        title={`${actions.monthName} rent · ${row.name}`}
        rent={row.this_month.rent}
        collected={row.this_month.collected}
        currencyPrefix={prefix(row.currency)}
        disabled={actions.busyId === row.booking_id}
        onChange={(s, c) => actions.setStatus(row, s, c)}
      />
      <span className="text-label text-ink-2">{thisMonthLine(row)}</span>
    </div>
  );
}

function NameCell({ row }: { row: RollRow }) {
  return (
    <Link to="/admin/residents/$id" params={{ id: row.booking_id }} className="group flex min-w-0 items-center gap-3 outline-none">
      <span className="w-7 shrink-0 text-center text-label font-semibold text-ink-2">{row.initials}</span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-body font-semibold text-ink group-hover:underline group-focus-visible:underline">{row.name}</span>
        {row.occupation ? <span className="truncate text-label text-ink-3">{row.occupation}</span> : null}
      </span>
    </Link>
  );
}

export function ResidentsRollTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
  actions,
  footer,
}: {
  rows: RollRow[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (on: boolean) => void;
  actions: RollActions;
  footer: ReactNode;
}) {
  const allOn = rows.length > 0 && rows.every((r) => selected.has(r.booking_id));
  const someOn = rows.some((r) => selected.has(r.booking_id));
  return (
    <>
      {/* Desktop table */}
      <div className="glass-2 hidden overflow-hidden rounded-[20px] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left font-geist">
            <thead>
              <tr className="border-b border-glass-divider bg-glass-inset text-eyebrow text-ink-3 uppercase">
                <th className="w-12 py-3 pl-4">
                  <GlassCheckbox checked={allOn} indeterminate={!allOn && someOn} onCheckedChange={(v) => onToggleAll(v)} aria-label="Select all" />
                </th>
                <th className="py-3 pr-3 font-medium">Resident</th>
                <th className="border-l border-glass-divider px-3 py-3 font-medium">Room · Bed</th>
                <th className="border-l border-glass-divider px-3 py-3 font-medium">This month</th>
                <th className="border-l border-glass-divider px-3 py-3 font-medium">Payment history</th>
                <th className="border-l border-glass-divider px-3 py-3 text-right font-medium">Balance</th>
                <th className="px-3 py-3 font-medium">Action</th>
                <th className="w-10 pr-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const on = selected.has(r.booking_id);
                return (
                  <tr key={r.booking_id} className={cn("border-b border-glass-divider transition-colors last:border-b-0 hover:bg-glass-inset", on && "bg-brand-tint hover:bg-brand-tint")}>
                    <td className="py-3 pl-4"><GlassCheckbox checked={on} onCheckedChange={() => onToggle(r.booking_id)} aria-label={`Select ${r.name}`} /></td>
                    <td className="max-w-[220px] py-3 pr-3"><NameCell row={r} /></td>
                    <td className="border-l border-glass-divider px-3 py-3 text-body whitespace-nowrap text-ink">{r.room_label}</td>
                    <td className="border-l border-glass-divider px-3 py-3"><StatusCell row={r} actions={actions} /></td>
                    <td className="border-l border-glass-divider px-3 py-3">
                      <p className="text-body font-medium text-ink">{historyTitle(r)}</p>
                      <p className="text-label text-ink-3">{r.history.note}</p>
                    </td>
                    <td className={cn("border-l border-glass-divider px-3 py-3 text-right text-body font-semibold whitespace-nowrap", r.balance > 0 ? "text-ink" : "text-ink-3")}>{formatMoney(r.balance, r.currency)}</td>
                    <td className="px-3 py-3"><ActionButton row={r} actions={actions} /></td>
                    <td className="pr-3"><RowMenu row={r} actions={actions} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {footer}
      </div>

      {/* Mobile cards (Figma 07.21 / 07.25 swipe to mark paid) */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {rows.map((r) => (
          <SwipeCard key={r.booking_id} row={r} actions={actions} />
        ))}
        {footer}
      </div>
    </>
  );
}

/** Mobile card (Figma 07.21); swipe left on an unpaid card to reveal "Mark paid" (07.25). */
function SwipeCard({ row, actions }: { row: RollRow; actions: RollActions }) {
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  const canSwipe = row.action === "mark_paid" || row.action === "collect";
  const REVEAL = 112;
  const t = row.this_month;
  return (
    <div className="relative overflow-hidden rounded-[18px]">
      {canSwipe && dx < 0 ? (
        <button
          type="button"
          onClick={() => {
            setDx(0);
            actions.markPaid(row);
          }}
          className="absolute inset-y-0 right-0 flex w-[112px] cursor-pointer flex-col items-center justify-center gap-1 rounded-r-[18px] bg-success text-label font-semibold text-white [&_svg]:size-5"
        >
          <Check aria-hidden /> {row.action === "collect" ? "Collect" : "Mark paid"}
        </button>
      ) : null}
      <div
        className="relative flex touch-pan-y flex-col gap-2.5 rounded-[18px] border border-glass-stroke bg-[var(--gl-bg-base)] p-3.5 transition-transform duration-200"
        style={{ transform: `translateX(${dx}px)` }}
        onPointerDown={(e) => {
          if (!canSwipe || e.pointerType === "mouse") return;
          start.current = e.clientX - dx;
        }}
        onPointerMove={(e) => {
          if (start.current == null) return;
          setDx(Math.min(0, Math.max(-REVEAL, e.clientX - start.current)));
        }}
        onPointerUp={() => {
          if (start.current == null) return;
          start.current = null;
          setDx((d) => (d < -REVEAL / 2 ? -REVEAL : 0));
        }}
        onPointerCancel={() => {
          start.current = null;
          setDx(0);
        }}
      >
        <div className="flex items-start gap-2">
          <Link to="/admin/residents/$id" params={{ id: row.booking_id }} className="flex min-w-0 flex-1 items-start gap-3">
            <span className="w-7 shrink-0 pt-0.5 text-center text-label font-semibold text-ink-2">{row.initials}</span>
            <span className="min-w-0">
              <span className="block truncate text-body font-semibold text-ink">{row.name}</span>
              <span className="block truncate text-label text-ink-3">{row.room_label}</span>
            </span>
          </Link>
          <span className="shrink-0 text-right">
            <span className={cn("block text-body font-semibold", row.balance > 0 ? "text-ink" : "text-ink-3")}>{formatMoney(row.balance, row.currency)}</span>
            <span className="block text-label text-ink-3">owed</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RentStatusMenu
            status={t.status}
            title={`${actions.monthName} rent · ${row.name}`}
            rent={t.rent}
            collected={t.collected}
            currencyPrefix={prefix(row.currency)}
            disabled={actions.busyId === row.booking_id}
            onChange={(s, c) => actions.setStatus(row, s, c)}
          />
          <span className="min-w-0 truncate text-label text-ink-2">{thisMonthLine(row)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-glass-divider pt-2.5">
          <span className="min-w-0 truncate text-label text-ink-3">{historyTitle(row)} · {row.history.note.toLowerCase()}</span>
          <ActionButton row={row} actions={actions} />
        </div>
      </div>
    </div>
  );
}

export { RentStatusPill };
