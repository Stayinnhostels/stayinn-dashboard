import { useMemo, useState, type ReactNode } from "react";
import {
  Banknote,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag as TagIcon,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GlassButton, GlassProgress } from "@/components/glass";
import { RentStatusPill } from "@/components/admin/residents/rent-status";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { Booking, BookingActivity, BookingPayment } from "@/types/domain/booking.types";
import type { RentPaymentStatus, ResidentDetail, ResidentExtra } from "@/types/domain/resident.types";
import { dayMon, isoDateTime, monLong, monShort, monthKeyOf, payingHabit, weekdayDate, type MonthRow } from "./profile-utils";

export function Card({ title, sub, action, children, className }: { title?: ReactNode; sub?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("glass-2 flex flex-col gap-4 rounded-[22px] p-5", className)}>
      {title ? (
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-card-title text-ink">{title}</p>
            {sub ? <p className="text-label text-ink-3">{sub}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Row({ label, value, strong, danger, className }: { label: ReactNode; value: ReactNode; strong?: boolean; danger?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 py-1.5 text-body", className)}>
      <span className="text-ink-2">{label}</span>
      <span className={cn("text-right", strong ? "font-semibold" : "font-medium", danger ? "text-danger" : "text-ink")}>{value}</span>
    </div>
  );
}

const METHOD_ICON: Record<string, ReactNode> = { cash: <Wallet />, jazzcash: <Smartphone />, easypaisa: <Smartphone />, bank_transfer: <Banknote />, card: <Banknote />, deposit: <ShieldCheck /> };

export function PaymentItem({ p, currency }: { p: BookingPayment; currency: "pkr" | "usd" }) {
  return (
    <div className="flex items-start gap-3 rounded-[14px] bg-glass-inset px-3.5 py-3">
      <span className="mt-0.5 text-ink-2 [&_svg]:size-4">{METHOD_ICON[p.method] ?? <Wallet />}</span>
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold text-ink">{formatMoney(p.amount, currency)} · {p.method_label}</p>
        <p className="text-label text-ink-3">{[isoDateTime(p.paid_at), p.reference ? `Ref ${p.reference}` : null, p.received_by_name ? `received by ${p.received_by_name}` : null, p.description].filter(Boolean).join(" · ")}</p>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-label text-ink-2"><ReceiptText className="size-3.5" aria-hidden />{p.reference}</span>
    </div>
  );
}

/** This month's rent + extras with actions (Figma 07.14 top-left card). */
export function ThisMonthCard({
  booking,
  detail,
  month,
  row,
  busy,
  onCollect,
  onOther,
  onRemind,
  onInvoice,
  onDiscount,
}: {
  booking: Booking;
  detail: ResidentDetail;
  month: string;
  row: MonthRow | undefined;
  busy: boolean;
  onCollect: () => void;
  onOther: () => void;
  onRemind: () => void;
  onInvoice: () => void;
  onDiscount: (newRent: number, forward: boolean) => Promise<unknown>;
}) {
  const cur = booking.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);
  const extras = (detail.extras ?? []).filter((e) => e.this_month || (e.timeline ?? []).some((p) => p.month === month));
  const rent = Number(row?.rent_amount) || 0;
  const total = rent + (row?.extras ?? 0);
  const paid = (row?.collected ?? 0) + (row?.extrasPaid ?? 0);
  const left = Math.max(0, total - paid);
  const status: RentPaymentStatus = left <= 0 && total > 0 ? "paid" : paid > 0 ? "partial" : row?.payment_status === "returned" ? "returned" : "not_paid";
  const pays = (booking.payments ?? []).filter((p) => p.paid_at?.slice(0, 7) === month);
  const [discount, setDiscount] = useState("");
  const [forward, setForward] = useState(false);
  const room = [booking.room_number != null ? `Room ${booking.room_number}` : booking.room_title, booking.seat_label].filter(Boolean).join(" · ");
  return (
    <Card title={`${monLong(month)} ${month.slice(0, 4)}`} sub="Rent + extras for this month" action={<RentStatusPill status={status} />}>
      <div className="overflow-hidden rounded-[16px] border border-glass-divider">
        <div className="flex items-center gap-3 border-b border-glass-divider px-4 py-3">
          <div className="min-w-0 flex-1"><p className="text-body font-medium text-ink">Room rent</p><p className="text-label text-ink-3">{room} · due 1 {monShort(month)}</p></div>
          {row ? <RentStatusPill status={row.payment_status} className="h-5 px-2 text-[11px]" /> : null}
          <span className="w-24 text-right text-body font-semibold text-ink">{money(rent)}</span>
        </div>
        {extras.map((e) => {
          const p = (e.timeline ?? e.ledger ?? []).find((x) => x.month === month) ?? e.this_month;
          if (!p) return null;
          return (
            <div key={e.id} className="flex items-center gap-3 border-b border-glass-divider px-4 py-3">
              <div className="min-w-0 flex-1"><p className="text-body font-medium text-ink">{e.label}</p><p className="text-label text-ink-3">Extra facility · {e.billing_cycle === "monthly" ? "monthly" : "one-time"}</p></div>
              <RentStatusPill status={p.payment_status} className="h-5 px-2 text-[11px]" />
              <span className="w-24 text-right text-body font-semibold text-ink">{money(Number(p.amount) || 0)}</span>
            </div>
          );
        })}
        <div className="flex items-center justify-between gap-3 bg-glass-inset px-4 py-3">
          <span className="text-body font-semibold text-ink">Total this month</span>
          <span className="text-body text-ink-2">{money(paid)} paid{left > 0 ? <> · <span className="font-semibold text-danger">{money(left)} left</span></> : null}</span>
        </div>
      </div>
      <GlassProgress value={total > 0 ? Math.round((paid / total) * 100) : 0} />
      {pays.length ? (
        <div className="flex flex-col gap-2">
          <p className="text-eyebrow text-ink-3 uppercase">Payments received</p>
          {pays.map((p) => <PaymentItem key={p.id} p={p} currency={cur} />)}
        </div>
      ) : null}
      <p className="flex items-center gap-1.5 text-label text-ink-3"><CalendarClock className="size-3.5" aria-hidden />Due 1 {monShort(month)}{booking.rent_reminders_enabled === false ? " · automatic reminders off" : " · automatic reminders on"}</p>
      <div className="flex flex-wrap gap-2">
        {left > 0 ? <GlassButton size="sm" onClick={onCollect} disabled={busy}>{busy ? <Loader2 className="animate-spin" aria-hidden /> : <Banknote aria-hidden />} Collect {money(left)}</GlassButton> : null}
        <GlassButton size="sm" variant="glass" onClick={onOther}>Other amount</GlassButton>
        {left > 0 && booking.guest_email ? <GlassButton size="sm" variant="glass" onClick={onRemind}><MessageCircle aria-hidden /> Send reminder</GlassButton> : null}
        <GlassButton size="sm" variant="glass" onClick={onInvoice}><Download aria-hidden /> Invoice</GlassButton>
        <Popover>
          <PopoverTrigger asChild><GlassButton size="sm" variant="ghost"><Sparkles aria-hidden /> Discount / change rent</GlassButton></PopoverTrigger>
          <PopoverContent align="end" className="glass-3 w-[280px] rounded-[16px] border-0 p-3 font-geist text-ink shadow-none">
            <p className="text-body font-semibold">{monLong(month)} rent</p>
            <p className="mb-2 text-label text-ink-3">Now {money(rent)}. Enter the new rent — 0 waives it.</p>
            <input value={discount} inputMode="decimal" autoFocus onChange={(e) => setDiscount(e.target.value.replace(/[^\d.]/g, ""))} placeholder={String(rent)} className="glass-2 mb-2 h-10 w-full rounded-[12px] px-3 text-body outline-none" aria-label="New rent" />
            <label className="mb-3 flex cursor-pointer items-center gap-2 text-label text-ink-2"><input type="checkbox" checked={forward} onChange={(e) => setForward(e.target.checked)} className="accent-[var(--color-brand)]" />Apply to later months too (rent change)</label>
            <div className="flex justify-end gap-2">
              <PopoverClose className="cursor-pointer rounded-[10px] px-3 py-1.5 text-label font-semibold hover:bg-glass-inset">Cancel</PopoverClose>
              <PopoverClose disabled={discount === "" || (!forward && Number(discount) >= rent) || Number(discount) === rent} onClick={() => void onDiscount(Number(discount), forward).then(() => { setDiscount(""); setForward(false); })} className="cursor-pointer rounded-[10px] bg-brand px-3 py-1.5 text-label font-semibold text-on-brand disabled:opacity-40">Save</PopoverClose>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </Card>
  );
}

/** Every month of the stay (Figma 07.14 Payment timeline). */
export function TimelineCard({ rows, booking, onLedger }: { rows: MonthRow[]; booking: Booking; onLedger: () => void }) {
  const cur = booking.currency ?? "pkr";
  const now = monthKeyOf();
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const past = rows.filter((m) => m.month < now).reverse();
  const list = all ? past : past.slice(0, 4);
  const paysFor = (mk: string) => (booking.payments ?? []).filter((p) => p.description?.toLowerCase().includes(monShort(mk).toLowerCase()) || p.paid_at?.slice(0, 7) === mk);
  return (
    <Card title="Payment timeline" sub="Every month of the stay · tap a month for details" action={<button type="button" onClick={onLedger} className="flex cursor-pointer items-center gap-1 text-label font-medium text-ink-2 hover:text-ink"><ChevronRight className="size-3.5" aria-hidden />Full ledger</button>}>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {rows.map((m) => {
          const current = m.month === now;
          const future = m.month > now;
          const Icon = m.payment_status === "paid" ? Check : m.payment_status === "partial" ? Banknote : future ? CalendarClock : TriangleAlert;
          return (
            <button key={m.month} type="button" onClick={() => setOpen(open === m.month ? null : m.month)} className={cn("flex w-[64px] shrink-0 cursor-pointer flex-col items-center gap-0.5 rounded-[14px] border px-1 py-2 text-center", current ? "border-ink/70 bg-glass-3" : "border-glass-divider bg-glass-inset", open === m.month && "ring-2 ring-brand-border")}>
              <span className="text-label font-semibold text-ink">{monShort(m.month)}</span>
              <Icon className={cn("size-3.5", m.payment_status === "not_paid" && !future ? "text-danger" : "text-ink-3")} aria-hidden />
              <span className="text-[11px] font-medium text-ink-2">{future && m.payment_status !== "paid" ? "—" : (m.collected + m.extrasPaid).toLocaleString("en-US")}</span>
              <span className="text-[10px] text-ink-3">{m.payment_status === "partial" ? "part" : future && m.payment_status !== "paid" ? "upcoming" : m.payment_status === "not_paid" ? "unpaid" : ""}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        {list.map((m) => {
          const ps = paysFor(m.month);
          const isOpen = open === m.month;
          return (
            <div key={m.month} className="overflow-hidden rounded-[14px] bg-glass-inset">
              <button type="button" onClick={() => setOpen(isOpen ? null : m.month)} className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-3 text-left">
                <span className="w-20 shrink-0 text-body font-semibold text-ink">{monShort(m.month)} {m.month.slice(0, 4)}</span>
                <RentStatusPill status={m.payment_status} className="h-5 px-2 text-[11px]" />
                <span className="min-w-0 flex-1 truncate text-label text-ink-3">{ps.length ? ps.map((p) => `${dayMon(p.paid_at)} · ${p.method_label} · ${p.reference}`).join(" + ") : m.payment_status === "paid" ? "Marked paid" : "No payment yet"}</span>
                <span className="text-body font-semibold text-ink">{formatMoney((Number(m.rent_amount) || 0) + m.extras, cur)}</span>
                <ChevronDown className={cn("size-4 text-ink-3 transition-transform", isOpen && "rotate-180")} aria-hidden />
              </button>
              {isOpen ? (
                <div className="flex flex-col gap-1 border-t border-glass-divider px-3.5 py-2.5 text-label">
                  <Row label="Rent" value={formatMoney(Number(m.rent_amount) || 0, cur)} className="py-0.5 text-label" />
                  {m.extras ? <Row label="Extras" value={formatMoney(m.extras, cur)} className="py-0.5 text-label" /> : null}
                  <Row label="Collected" value={formatMoney(m.collected + m.extrasPaid, cur)} className="py-0.5 text-label" />
                  {ps.map((p) => <p key={p.id} className="text-ink-3">{isoDateTime(p.paid_at)} · {formatMoney(p.amount, cur)} · {p.method_label} · {p.description}</p>)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {past.length > 4 ? (
        <button type="button" onClick={() => setAll((v) => !v)} className="mx-auto flex cursor-pointer items-center gap-1 text-label font-semibold text-brand-text">
          {all ? "Show fewer" : `Show all ${past.length} months`} <ChevronDown className={cn("size-3.5", all && "rotate-180")} aria-hidden />
        </button>
      ) : null}
    </Card>
  );
}

export function ExtrasCard({ extras, currency, month, onAdd, onRemove, onEnd }: { extras: ResidentExtra[]; currency: "pkr" | "usd"; month: string; onAdd: (x: { label: string; amount: number; billing_cycle: "monthly" | "one_time" }) => Promise<unknown>; onRemove: (id: string) => void; onEnd: (id: string) => void }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<"monthly" | "one_time">("monthly");
  return (
    <Card
      title="Extra facilities"
      sub="Billed with rent · each has its own status"
      action={
        <Popover>
          <PopoverTrigger className="flex cursor-pointer items-center gap-1 text-label font-medium text-ink-2 hover:text-ink"><Plus className="size-3.5" aria-hidden />Add facility</PopoverTrigger>
          <PopoverContent align="end" className="glass-3 w-[300px] rounded-[16px] border-0 p-3 font-geist text-ink shadow-none">
            <p className="mb-2 text-body font-semibold">Add facility</p>
            <div className="flex flex-col gap-2">
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Cooler, Extra mattress" className="glass-2 h-10 rounded-[12px] px-3 text-body outline-none placeholder:text-ink-3" aria-label="Facility" />
              <input value={amount} inputMode="decimal" onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} placeholder="Amount" className="glass-2 h-10 rounded-[12px] px-3 text-body outline-none placeholder:text-ink-3" aria-label="Amount" />
              <div className="grid grid-cols-2 gap-1 rounded-[12px] border border-glass-divider bg-glass-inset p-1">
                {(["monthly", "one_time"] as const).map((c) => <button key={c} type="button" onClick={() => setCycle(c)} className={cn("h-8 cursor-pointer rounded-[9px] text-label font-medium", cycle === c ? "glass-3 text-ink" : "text-ink-2")}>{c === "monthly" ? "Monthly" : "One-time"}</button>)}
              </div>
              <PopoverClose disabled={!label.trim() || !(Number(amount) > 0)} onClick={() => void onAdd({ label: label.trim(), amount: Number(amount), billing_cycle: cycle }).then(() => { setLabel(""); setAmount(""); })} className="h-9 cursor-pointer rounded-[12px] bg-brand text-label font-semibold text-on-brand disabled:opacity-40">Add from {monLong(month)}</PopoverClose>
            </div>
          </PopoverContent>
        </Popover>
      }
    >
      {extras.length === 0 ? <p className="text-label text-ink-3">No extra facilities.</p> : null}
      <div className="flex flex-col gap-2">
        {extras.map((e) => {
          const tm = e.this_month;
          return (
            <div key={e.id} className="flex items-center gap-3 rounded-[14px] bg-glass-inset px-3.5 py-3">
              <Sparkles className="size-4 shrink-0 text-ink-3" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-body font-medium text-ink">{e.label}</p>
                <p className="truncate text-label text-ink-3">{e.billing_cycle === "monthly" ? `Monthly · since ${monShort(e.start_month)} ${e.start_month?.slice(0, 4) ?? ""}${e.status === "ended" ? ` · ended ${monShort(e.end_month)}` : " · ends with stay"}` : `One-time · ${monLong(e.start_month)} ${e.start_month?.slice(0, 4) ?? ""}`}</p>
              </div>
              <div className="text-right">
                <p className="text-body font-semibold text-ink">{formatMoney(e.amount, currency)}{e.billing_cycle === "monthly" ? " / mo" : ""}</p>
                <p className="text-label text-ink-3">{tm ? `${monShort(tm.month)} ${tm.payment_status === "paid" ? "paid" : tm.payment_status === "partial" ? "part paid" : "not paid"}` : ""}{e.total_collected ? ` · ${formatMoney(e.total_collected, currency)} collected` : ""}</p>
              </div>
              {tm ? <RentStatusPill status={tm.payment_status} className="h-5 px-2 text-[11px]" /> : null}
              <DropdownMenu>
                <DropdownMenuTrigger aria-label={`More for ${e.label}`} className="flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-ink-2 hover:bg-glass-2"><MoreHorizontal className="size-4" aria-hidden /></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-3 rounded-[12px] border-0 p-1 font-geist text-ink shadow-none">
                  {e.status !== "ended" && e.billing_cycle === "monthly" ? <DropdownMenuItem className="cursor-pointer rounded-[8px]" onSelect={() => onEnd(e.id)}>End from {monLong(month)}</DropdownMenuItem> : null}
                  <DropdownMenuItem className="cursor-pointer rounded-[8px] text-danger" onSelect={() => onRemove(e.id)}>Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function ActivityList({ items, limit }: { items: BookingActivity[]; limit?: number }) {
  const list = limit ? items.slice(0, limit) : items;
  if (!list.length) return <p className="text-label text-ink-3">Nothing yet.</p>;
  return (
    <ol className="relative flex flex-col gap-3.5 pl-4">
      <span className="absolute top-1.5 bottom-1.5 left-[3px] w-px bg-glass-divider" aria-hidden />
      {list.map((a) => (
        <li key={a.id} className="relative">
          <span className="absolute top-1.5 -left-4 size-[7px] rounded-full bg-brand" aria-hidden />
          <p className="text-body font-medium text-ink">{a.label}{a.detail ? <span className="font-normal text-ink-2"> · {a.detail}</span> : null}</p>
          <p className="text-label text-ink-3">{[a.actor_name || "System", isoDateTime(a.at)].join(" · ")}</p>
        </li>
      ))}
    </ol>
  );
}

export function MoneySummary({ booking, detail, rows }: { booking: Booking; detail: ResidentDetail; rows: MonthRow[] }) {
  const cur = booking.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);
  const now = monthKeyOf();
  const billed = rows.filter((m) => m.month <= now);
  const rentBilled = billed.reduce((s, m) => s + (Number(m.rent_amount) || 0), 0);
  const extrasBilled = billed.reduce((s, m) => s + m.extras, 0);
  const listRent = (Number(booking.price_per_seat) || 0) * Math.max(1, booking.seats_booked || 1);
  const discounts = listRent > 0 ? billed.reduce((s, m) => s + Math.max(0, listRent - (Number(m.rent_amount) || 0)), 0) : 0;
  const paid = booking.paid_total ?? 0;
  const pays = booking.payments ?? [];
  const habit = payingHabit(booking);
  const due = booking.balance_due ?? 0;
  const pct = rentBilled + extrasBilled > 0 ? Math.min(100, Math.round(((detail.rent_summary.total_rent_collected ?? 0) / (rentBilled + extrasBilled)) * 100)) : 0;
  return (
    <Card title="Money summary" sub="Whole stay">
      <GlassProgress value={pct} />
      <div className="flex flex-col">
        <Row label="Rent billed" value={money(rentBilled)} />
        <Row label="Extras billed" value={money(extrasBilled)} />
        <Row label="Discounts" value={money(discounts)} />
        <Row label="Total paid" value={money(paid)} />
        <Row label="Payments" value={`${pays.length} · ${new Set(pays.map((p) => p.method)).size} method${new Set(pays.map((p) => p.method)).size === 1 ? "" : "s"}`} />
      </div>
      <div className={cn("flex items-center justify-between rounded-[14px] px-4 py-3", due > 0 ? "bg-danger-tint" : "bg-success-tint")}>
        <span className={cn("text-body font-medium", due > 0 ? "text-danger" : "text-success")}>{due > 0 ? "Balance due" : "Paid up"}</span>
        <span className={cn("text-[22px] font-semibold", due > 0 ? "text-danger" : "text-success")}>{money(due)}</span>
      </div>
      {habit ? (
        <div className="flex items-start gap-2.5 rounded-[14px] bg-glass-inset px-3.5 py-3">
          <CalendarDays className="mt-0.5 size-4 text-ink-3" aria-hidden />
          <div><p className="text-label font-semibold text-ink">{habit.headline}</p><p className="text-[11px] text-ink-3">{habit.detail}</p></div>
        </div>
      ) : null}
    </Card>
  );
}

export function SecurityCard({ booking, onSettle }: { booking: Booking; onSettle: () => void }) {
  const cur = booking.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);
  const amount = Number(booking.security_amount) || 0;
  const st = booking.security_status;
  const label = st === "paid" || st === "held" ? "Held" : st === "returned" ? "Returned" : st === "not_paid" ? "Not paid" : "None";
  const ledgerPay = (booking.security_ledger ?? []).find((e) => (e as { type?: string }).type === "collected") as { at?: string; method?: string } | undefined;
  const returnable = Number(booking.security_returnable ?? amount) || 0;
  const deductions = Number(booking.security_retained) || 0;
  const owed = booking.balance_due ?? 0;
  const ifToday = Math.max(0, returnable - deductions - owed);
  return (
    <Card title="Security deposit" sub="Separate from rent">
      <div className="flex items-center gap-2"><span className="text-[26px] leading-8 font-semibold text-ink">{money(amount)}</span><span className="rounded-full border border-glass-stroke px-2 py-0.5 text-label text-ink-2">● {label}</span></div>
      <div className="flex flex-col">
        <Row label="Paid on" value={st === "not_paid" ? "—" : ledgerPay?.at ? dayMon(ledgerPay.at) : booking.move_in ? dayMon(booking.move_in) : "—"} />
        <Row label="Planned return" value={money(returnable)} />
        <Row label="Deductions" value={deductions ? money(deductions) : "None yet"} />
        {st === "paid" || st === "held" ? <Row label="If settled today" value={`${money(ifToday)} back`} /> : st === "returned" ? <Row label="Returned" value={money(Number(booking.security_returned) || 0)} /> : null}
      </div>
      {(st === "paid" || st === "held") && owed > 0 ? <p className="text-label text-ink-3">{money(owed)} unpaid rent would be taken from the deposit.</p> : null}
      {st === "paid" || st === "held" ? <GlassButton size="sm" variant="glass" onClick={onSettle}><ShieldCheck aria-hidden /> Settle deposit</GlassButton> : null}
    </Card>
  );
}

export function StayDetails({ booking, rows, onEdit, onHistory, onToggleReminders, togglingReminders }: { booking: Booking; rows: MonthRow[]; onEdit: () => void; onHistory: () => void; onToggleReminders: (on: boolean) => void; togglingReminders: boolean }) {
  const cur = booking.currency ?? "pkr";
  const now = monthKeyOf();
  const upto = rows.filter((m) => m.month <= now);
  let fromIdx = upto.length - 1;
  while (fromIdx > 0 && upto[fromIdx - 1].rent_amount === upto[fromIdx]?.rent_amount) fromIdx -= 1;
  const from = upto[fromIdx];
  const habit = payingHabit(booking);
  const on = booking.rent_reminders_enabled !== false;
  return (
    <Card title="Stay details" action={<button type="button" onClick={onEdit} className="flex cursor-pointer items-center gap-1 text-label font-medium text-ink-2 hover:text-ink"><Pencil className="size-3.5" aria-hidden />Edit</button>}>
      <div className="flex flex-col">
        <Row label="Check-in" value={weekdayDate(booking.move_in)} />
        <Row label="Check-out" value={weekdayDate(booking.check_out)} />
        <Row label="Room" value={[booking.room_number != null ? `Room ${booking.room_number}` : booking.room_title, booking.seat_label].filter(Boolean).join(" · ")} />
        {from ? <Row label="Rent from" value={<span>{monShort(from.month)} · {formatMoney(Number(from.rent_amount) || 0, cur)} <button type="button" onClick={onHistory} className="cursor-pointer text-label font-medium text-brand-text">History</button></span>} /> : null}
        <Row label="Bill date" value="1st of each month" />
        <Row label="Pays by" value={habit?.prefers ?? "—"} />
      </div>
      <div className="flex items-center gap-3 rounded-[14px] bg-glass-inset px-3.5 py-3">
        <div className="min-w-0 flex-1"><p className="text-label font-semibold text-ink">Automatic reminders</p><p className="text-[11px] text-ink-3">{booking.guest_email ? "Email on the reminder days set in Settings" : "No email on file"}</p></div>
        <button type="button" role="switch" aria-checked={on} aria-label="Automatic reminders" disabled={togglingReminders} onClick={() => onToggleReminders(!on)} className={cn("relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:opacity-60", on ? "bg-brand" : "bg-glass-2 ring-1 ring-glass-stroke")}>
          <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform", on && "translate-x-5")} />
        </button>
      </div>
    </Card>
  );
}

export function ContactCard({ detail, booking }: { detail: ResidentDetail; booking: Booking }) {
  const r = detail.resident;
  const [showCnic, setShowCnic] = useState(false);
  const [showImg, setShowImg] = useState(false);
  const masked = r.cnic ? r.cnic.replace(/^(\d{5}-)(\d{7})(-\d)$/, "$1•••••••$3") : "";
  const imgs = [
    r.cnic_image_front ? { src: r.cnic_image_front, label: "CNIC front" } : null,
    r.cnic_image_back ? { src: r.cnic_image_back, label: "CNIC back" } : null,
    r.b_form_image ? { src: r.b_form_image, label: "B-Form" } : null,
  ].filter(Boolean) as { src: string; label: string }[];
  return (
    <Card title="Contact & ID">
      <div className="flex flex-col">
        <Row label="Father" value={r.father_name || "—"} />
        <Row label="Guardian phone" value={r.guardian_contact || "—"} />
        <Row label="CNIC" value={r.cnic ? <span>{showCnic ? r.cnic : masked} <button type="button" onClick={() => setShowCnic((v) => !v)} className="cursor-pointer text-label font-medium text-brand-text">{showCnic ? "Hide" : "Show"}</button></span> : "—"} />
        <Row label={booking.resident_type === "employee" ? "Company" : "Institution"} value={(booking.resident_type === "employee" ? r.company : r.institution) || "—"} />
      </div>
      {imgs.length ? (
        <div className="grid grid-cols-2 gap-2">
          {imgs.map((i) => (
            <figure key={i.label} className="flex flex-col gap-1">
              <button type="button" onClick={() => setShowImg((v) => !v)} className="relative h-20 cursor-pointer overflow-hidden rounded-[12px]">
                <img src={i.src} alt={i.label} className={cn("size-full object-cover transition", !showImg && "scale-110 blur-md")} />
                <span className="absolute inset-0 flex items-center justify-center"><span className="flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium text-white">{showImg ? <EyeOff className="size-3" aria-hidden /> : <Eye className="size-3" aria-hidden />}{showImg ? "Hide" : "Show"}</span></span>
              </button>
              <figcaption className="text-[11px] text-ink-3">{i.label}</figcaption>
            </figure>
          ))}
        </div>
      ) : <p className="text-label text-ink-3">No ID images on file.</p>}
    </Card>
  );
}

export function NotesCard({ notes, onAdd, adding }: { notes: BookingActivity[]; onAdd: (text: string) => Promise<unknown>; adding: boolean }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <Card title="Notes" action={<button type="button" onClick={() => setOpen((v) => !v)} className="flex cursor-pointer items-center gap-1 text-label font-medium text-ink-2 hover:text-ink"><Plus className="size-3.5" aria-hidden />Add</button>}>
      {open ? (
        <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) void onAdd(text.trim()).then(() => { setText(""); setOpen(false); }); }}>
          <textarea value={text} autoFocus onChange={(e) => setText(e.target.value)} rows={2} placeholder="A note for the next shift…" className="glass-2 w-full resize-none rounded-[12px] px-3 py-2 text-body text-ink outline-none placeholder:text-ink-3" />
          <div className="flex justify-end"><GlassButton size="sm" type="submit" disabled={!text.trim() || adding}>{adding ? <Loader2 className="animate-spin" aria-hidden /> : null}Save note</GlassButton></div>
        </form>
      ) : null}
      {notes.length === 0 && !open ? <p className="text-label text-ink-3">No notes yet.</p> : null}
      {notes.map((n) => (
        <div key={n.id} className="rounded-[14px] bg-glass-inset px-3.5 py-3">
          <p className="text-body text-ink">{n.detail}</p>
          <p className="text-[11px] text-ink-3">{[n.actor_name, n.at ? dayMon(n.at) : null].filter(Boolean).join(" · ")}</p>
        </div>
      ))}
    </Card>
  );
}

/** Payments tab (Figma 07.15): month ledger + every payment. */
export function PaymentsLedger({ booking, rows }: { booking: Booking; rows: MonthRow[] }) {
  const cur = booking.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);
  const pays = useMemo(() => (booking.payments ?? []).slice().reverse(), [booking.payments]);
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card title="Month by month" sub="Rent and extras billed, what came in, and what is left">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] border-collapse text-left text-body">
            <thead><tr className="border-b border-glass-divider text-eyebrow text-ink-3 uppercase"><th className="py-2 font-medium">Month</th><th className="py-2 text-right font-medium">Billed</th><th className="py-2 text-right font-medium">Paid</th><th className="py-2 text-right font-medium">Left</th><th className="py-2 pl-3 font-medium">Status</th></tr></thead>
            <tbody>
              {rows.map((m) => {
                const billed = (Number(m.rent_amount) || 0) + m.extras;
                const got = m.collected + m.extrasPaid;
                return (
                  <tr key={m.month} className="border-b border-glass-divider last:border-b-0">
                    <td className="py-2.5 font-medium text-ink">{monShort(m.month)} {m.month.slice(0, 4)}</td>
                    <td className="py-2.5 text-right text-ink">{money(billed)}</td>
                    <td className="py-2.5 text-right text-ink-2">{money(got)}</td>
                    <td className={cn("py-2.5 text-right font-semibold", billed - got > 0 && m.month <= monthKeyOf() ? "text-danger" : "text-ink-3")}>{money(Math.max(0, billed - got))}</td>
                    <td className="py-2.5 pl-3">{m.month > monthKeyOf() && m.payment_status === "not_paid" ? <span className="text-label text-ink-3">Upcoming</span> : <RentStatusPill status={m.payment_status} className="h-5 px-2 text-[11px]" />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title={`Payments · ${pays.length}`} sub="Every amount received, newest first">
        {pays.length === 0 ? <p className="text-label text-ink-3">No payments recorded yet.</p> : null}
        <div className="flex flex-col gap-2">{pays.map((p) => <PaymentItem key={p.id} p={p} currency={cur} />)}</div>
      </Card>
    </div>
  );
}

export { FileText, TagIcon };
