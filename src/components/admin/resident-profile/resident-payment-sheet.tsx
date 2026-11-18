import { useEffect, useMemo, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, CreditCard, Landmark, Loader2, Smartphone, Tag as TagIcon, UserRound, Wallet, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, GlassCheckbox } from "@/components/glass";
import { useRecordPaymentMutation } from "@/queries/bookings/useBookingDetailActions";
import { useUpdateResidentMutation, useEmailMonthReceiptMutation } from "@/queries/residents";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { Booking } from "@/types/domain/booking.types";
import type { ResidentDetail } from "@/types/domain/resident.types";
import { RentStatusPill } from "@/components/admin/residents/rent-status";
import { monLong, monShort, monthKeyOf, monthRows, todayKey } from "./profile-utils";

type Method = "cash" | "card" | "bank_transfer" | "jazzcash" | "easypaisa";
const METHODS: { key: Method; label: string; icon: ReactNode }[] = [
  { key: "cash", label: "Cash", icon: <Wallet /> },
  { key: "jazzcash", label: "JazzCash", icon: <Smartphone /> },
  { key: "easypaisa", label: "Easypaisa", icon: <Smartphone /> },
  { key: "bank_transfer", label: "Bank transfer", icon: <Landmark /> },
  { key: "card", label: "Card", icon: <CreditCard /> },
];

type Item = { key: string; kind: "rent" | "extra" | "security"; title: string; sub: string; amount: number; month?: string; extraId?: string; disabled?: boolean };

/** Figma 07.17 / 07.29 · Record payment: pick what it is for, amount, method; saves and emails the receipt. */
export function ResidentPaymentSheet({ booking, detail, open, onOpenChange }: { booking: Booking; detail: ResidentDetail; open: boolean; onOpenChange: (o: boolean) => void }) {
  const record = useRecordPaymentMutation();
  const update = useUpdateResidentMutation();
  const emailReceipt = useEmailMonthReceiptMutation();
  const user = useAuthStore((s) => s.user);
  const cur = booking.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);
  const now = monthKeyOf();

  const items = useMemo<Item[]>(() => {
    const rows = monthRows(detail);
    const out: Item[] = [];
    const due = rows.filter((m) => m.month <= now && (m.payment_status === "not_paid" || m.payment_status === "partial"));
    for (const m of due)
      out.push({ key: `rent-${m.month}`, kind: "rent", month: m.month, title: `${monLong(m.month)} rent`, sub: m.payment_status === "partial" ? `${money(m.collected)} paid · balance` : "Not paid", amount: m.left });
    const ahead = rows.find((m) => m.month > now && m.payment_status !== "paid");
    if (ahead) out.push({ key: `rent-${ahead.month}`, kind: "rent", month: ahead.month, title: `${monLong(ahead.month)} rent`, sub: "Next month · paying ahead", amount: ahead.left });
    for (const e of detail.extras ?? []) {
      if (e.status === "ended") continue;
      const tm = e.this_month;
      if (tm && tm.payment_status !== "paid" && Number(tm.amount) > 0)
        out.push({ key: `extra-${e.id}`, kind: "extra", extraId: e.id, month: tm.month, title: `${monLong(tm.month)} ${e.label.toLowerCase()}`, sub: "Extra facility", amount: Number(tm.amount) - Number(tm.collected_amount ?? 0) });
    }
    const sec = Number(booking.security_amount) || 0;
    out.push({
      key: "security",
      kind: "security",
      title: "Security deposit",
      sub: booking.security_status === "not_paid" ? "Not paid yet" : `Already paid${booking.move_in ? ` on ${monShort(booking.move_in)}` : ""}`,
      amount: booking.security_status === "not_paid" ? sec : 0,
      disabled: booking.security_status !== "not_paid" || sec <= 0,
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, booking, now]);

  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [amount, setAmount] = useState("");
  const [preset, setPreset] = useState<string>("auto");
  const [method, setMethod] = useState<Method>("cash");
  const [date, setDate] = useState(todayKey());
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discount, setDiscount] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const first = items.filter((i) => !i.disabled && i.kind === "rent" && i.month && i.month <= now).map((i) => i.key);
    setPicked(new Set(first.length ? first : items.filter((i) => !i.disabled).slice(0, 1).map((i) => i.key)));
    setPreset("auto");
    setMethod("cash");
    setDate(todayKey());
    setReference("");
    setNote("");
    setDiscountOpen(false);
    setDiscount("");
    setDiscountReason("");
    setSendEmail(Boolean(booking.guest_email));
  }, [open, items, now, booking.guest_email]);

  const selected = items.filter((i) => picked.has(i.key));
  const discountNum = Math.max(0, Number(discount) || 0);
  const selectedTotal = Math.max(0, selected.reduce((s, i) => s + i.amount, 0) - discountNum);
  useEffect(() => {
    if (preset === "auto") setAmount(selectedTotal ? String(selectedTotal) : "");
  }, [selectedTotal, preset]);

  const value = Number(amount) || 0;
  const firstRent = selected.find((i) => i.kind === "rent");
  const presets = [
    firstRent ? { key: "first", label: `${money(firstRent.amount - (discountNum && firstRent === selected[0] ? discountNum : 0))} · ${monShort(firstRent.month)} only`, value: firstRent.amount - (discountNum && firstRent === selected[0] ? discountNum : 0) } : null,
    selected.length > 1 ? { key: "auto", label: `${money(selectedTotal)} · ${selected.map((i) => (i.month ? monShort(i.month) : "deposit")).join(" + ")}`, value: selectedTotal } : null,
  ].filter(Boolean) as { key: string; label: string; value: number }[];

  // Preview of what each month becomes after saving (money goes to deposit first, then months in order).
  const after = useMemo(() => {
    let left = value;
    const extrasPart = selected.filter((i) => i.kind === "extra").reduce((s, i) => s + i.amount, 0);
    const extrasPaid = left >= selectedTotal && extrasPart > 0;
    if (extrasPaid) left -= extrasPart;
    const rows: { title: string; from: string; to: "paid" | "partial" | "not_paid" }[] = [];
    for (const i of selected.filter((x) => x.kind !== "extra")) {
      const need = i.amount - (i === firstRent ? discountNum : 0);
      const status = left >= need ? "paid" : left > 0 ? "partial" : "not_paid";
      rows.push({ title: i.title.replace(" rent", " rent"), from: i.sub.includes("paid ·") ? "partial" : i.sub.startsWith("Next") ? "upcoming" : "not_paid", to: status });
      left = Math.max(0, left - need);
    }
    for (const i of selected.filter((x) => x.kind === "extra")) rows.push({ title: i.title, from: "not_paid", to: extrasPaid ? "paid" : "not_paid" });
    const balanceAfter = Math.max(0, (booking.balance_due ?? 0) - value - discountNum);
    return { rows, balanceAfter, extrasPaid };
  }, [value, selected, selectedTotal, firstRent, discountNum, booking.balance_due]);

  const extends_ = selected.some((i) => i.kind === "rent" && i.month && booking.check_out && i.month > booking.check_out.slice(0, 7));
  const invalid = value <= 0 || selected.length === 0;

  async function save() {
    if (invalid) return;
    setBusy(true);
    try {
      if (discountNum > 0 && firstRent?.month) {
        const m = monthRows(detail).find((r) => r.month === firstRent.month);
        if (m) {
          await update.mutateAsync({ bookingId: booking.id, input: { month: m.month, monthly_rent: Math.max(0, Number(m.rent_amount) - discountNum) } });
        }
      }
      const extrasPart = selected.filter((i) => i.kind === "extra").reduce((s, i) => s + i.amount, 0);
      const rentPart = after.extrasPaid ? value - extrasPart : value;
      let ref = "";
      if (rentPart > 0) {
        const r = await record.mutateAsync({
          id: booking.id,
          input: {
            amount: rentPart,
            method,
            paid_at: date,
            reference: reference.trim() || undefined,
            note: [note.trim(), discountNum > 0 ? `Discount ${money(discountNum)}${discountReason ? ` — ${discountReason}` : ""}` : ""].filter(Boolean).join(" · ") || undefined,
          },
        });
        ref = r.reference;
      }
      if (after.extrasPaid) {
        for (const i of selected.filter((x) => x.kind === "extra" && x.extraId)) {
          await update.mutateAsync({ bookingId: booking.id, input: { month: i.month, update_extra: { extra_id: i.extraId!, payment_status: "paid", month: i.month } } });
        }
      }
      if (sendEmail && booking.guest_email) {
        for (const r of after.rows) {
          const item = selected.find((i) => i.title === r.title && i.kind === "rent");
          if (item?.month && r.to === "paid") emailReceipt.mutate({ bookingId: booking.id, month: item.month });
        }
      }
      toast.success(`Saved ${money(value)}${ref ? ` · ${ref}` : ""}${sendEmail && booking.guest_email ? " · receipt emailed" : ""}`);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not record the payment");
    } finally {
      setBusy(false);
    }
  }

  const chip = (on: boolean) =>
    cn("cursor-pointer rounded-full border px-2.5 py-1 text-label font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand-border", on ? "border-ink/60 bg-glass-3 text-ink" : "border-glass-stroke bg-glass-inset text-ink-2 hover:text-ink");
  const owes = booking.balance_due ?? 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="glass-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[94svh] flex-col overflow-hidden rounded-t-[28px] font-geist text-ink outline-none duration-300 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom md:inset-x-auto md:inset-y-3 md:right-3 md:max-h-none md:w-[min(480px,calc(100vw-24px))] md:rounded-[24px] md:data-[state=open]:slide-in-from-right">
          <div className="flex items-start gap-3 border-b border-glass-divider px-5 py-4">
            <span className="w-7 pt-1 text-label font-semibold text-ink-2">{booking.guest_name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-hero text-ink">Record payment</Dialog.Title>
              <p className="truncate text-label text-ink-2">{[booking.guest_name, booking.room_number != null ? `Room ${booking.room_number}` : booking.room_title, booking.seat_label, owes > 0 ? `owes ${money(owes)}` : "paid up"].filter(Boolean).join(" · ")}</p>
            </div>
            <Dialog.Close aria-label="Close" className="glass-2 flex size-9 cursor-pointer items-center justify-center rounded-[12px] text-ink outline-none hover:bg-glass-inset"><X className="size-4" aria-hidden /></Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-label font-semibold text-ink-3">1</span>
                <p className="flex-1 text-body font-semibold text-ink">What is this payment for?</p>
                <button type="button" onClick={() => { setPicked(new Set(items.filter((i) => !i.disabled && (i.kind !== "rent" || (i.month ?? "") <= now)).map((i) => i.key))); setPreset("auto"); }} className="cursor-pointer text-label font-medium text-brand-text hover:underline">Pay all due</button>
              </div>
              <div className="overflow-hidden rounded-[16px] border border-glass-divider bg-glass-inset">
                {items.map((i) => {
                  const on = picked.has(i.key);
                  return (
                    <label key={i.key} className={cn("flex items-center gap-3 border-b border-glass-divider px-3.5 py-3 last:border-b-0", i.disabled ? "opacity-50" : "cursor-pointer hover:bg-glass-2", on && "bg-brand-tint")}>
                      <GlassCheckbox checked={on} disabled={i.disabled} onCheckedChange={() => { setPreset("auto"); setPicked((cur) => { const n = new Set(cur); if (n.has(i.key)) n.delete(i.key); else n.add(i.key); return n; }); }} aria-label={i.title} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-body font-medium text-ink">{i.title}</span>
                        <span className="block text-label text-ink-3">{i.sub}{i.kind === "rent" && extends_ && i.month && booking.check_out && i.month > booking.check_out.slice(0, 7) ? " (stay will be extended)" : ""}</span>
                      </span>
                      <span className="text-body font-semibold text-ink">{i.disabled ? "—" : money(i.amount)}</span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-2"><span className="text-label font-semibold text-ink-3">2</span><p className="text-body font-semibold text-ink">Amount received</p></div>
              <label className="glass-2 flex h-12 items-center gap-2 rounded-[14px] px-3.5 focus-within:ring-2 focus-within:ring-brand-border">
                <span className="text-body text-ink-2">{cur === "usd" ? "$" : "Rs"}</span>
                <input value={amount} inputMode="decimal" onChange={(e) => { setAmount(e.target.value.replace(/[^\d.]/g, "")); setPreset("custom"); }} className="min-w-0 flex-1 bg-transparent text-[20px] font-semibold text-ink outline-none" aria-label="Amount received" />
                <span className="text-label text-ink-3">= selected total</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => <button key={p.key} type="button" className={chip(preset === p.key || (p.key === "auto" && preset === "auto"))} onClick={() => { setAmount(String(p.value)); setPreset(p.key); }}>{p.label}</button>)}
                <button type="button" className={chip(preset === "custom")} onClick={() => { setAmount(""); setPreset("custom"); }}>Other</button>
              </div>
              <button type="button" onClick={() => setDiscountOpen((v) => !v)} className="glass-2 flex cursor-pointer items-center gap-3 rounded-[14px] px-3.5 py-3 text-left hover:bg-glass-inset">
                <TagIcon className="size-4 text-ink-2" aria-hidden />
                <span className="min-w-0 flex-1"><span className="block text-body font-medium text-ink">{discountNum > 0 ? `Discount ${money(discountNum)}` : "Add a discount"}</span><span className="block text-label text-ink-3">{firstRent ? `Lowers ${monLong(firstRent.month)} rent · reason is saved in activity` : "Pick a rent month first"}</span></span>
                <ChevronRight className={cn("size-4 text-ink-3 transition-transform", discountOpen && "rotate-90")} aria-hidden />
              </button>
              {discountOpen && firstRent ? (
                <div className="grid grid-cols-2 gap-2">
                  <input value={discount} inputMode="decimal" onChange={(e) => setDiscount(e.target.value.replace(/[^\d.]/g, ""))} placeholder="Amount" className="glass-2 h-10 rounded-[12px] px-3 text-body text-ink outline-none placeholder:text-ink-3" aria-label="Discount amount" />
                  <input value={discountReason} onChange={(e) => setDiscountReason(e.target.value)} placeholder="Reason" className="glass-2 h-10 rounded-[12px] px-3 text-body text-ink outline-none placeholder:text-ink-3" aria-label="Discount reason" />
                </div>
              ) : null}
            </section>

            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-2"><span className="text-label font-semibold text-ink-3">3</span><p className="text-body font-semibold text-ink">How was it paid?</p></div>
              <div role="radiogroup" aria-label="Payment method" className="flex flex-wrap gap-2">
                {METHODS.map((m) => (
                  <button key={m.key} type="button" role="radio" aria-checked={method === m.key} onClick={() => setMethod(m.key)} className={cn("flex h-10 cursor-pointer items-center gap-2 rounded-[12px] border px-3.5 text-body font-medium [&_svg]:size-4", method === m.key ? "border-ink/60 bg-glass-3 text-ink" : "glass-2 border-transparent text-ink-2 hover:text-ink")}>
                    {m.icon}{m.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-label font-medium text-ink-2">Date</span>
                  <span className="glass-2 flex h-11 items-center gap-2 rounded-[14px] px-3"><CalendarDays className="size-4 text-ink-3" aria-hidden /><input type="date" value={date} max={todayKey()} onChange={(e) => e.target.value && setDate(e.target.value)} onClick={(e) => e.currentTarget.showPicker?.()} className="w-full cursor-pointer bg-transparent text-body text-ink outline-none [&::-webkit-calendar-picker-indicator]:hidden" /></span>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-label font-medium text-ink-2">Transaction ID</span>
                  <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder={method === "cash" ? "Auto" : "e.g. JC-81144207"} className="glass-2 h-11 rounded-[14px] px-3 text-body text-ink outline-none placeholder:text-ink-3" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-label font-medium text-ink-2">Received by</span>
                  <span className="glass-2 flex h-11 items-center gap-2 rounded-[14px] px-3 text-body text-ink"><UserRound className="size-4 text-ink-3" aria-hidden />{user?.fullName ?? "You"}</span>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-label font-medium text-ink-2">Note</span>
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" className="glass-2 h-11 rounded-[14px] px-3 text-body text-ink outline-none placeholder:text-ink-3" />
                </label>
              </div>
            </section>

            {after.rows.length ? (
              <section className="flex flex-col gap-2 rounded-[16px] border border-glass-divider bg-glass-inset px-4 py-3">
                <p className="text-eyebrow text-ink-3 uppercase">After saving</p>
                {after.rows.map((r) => (
                  <div key={r.title} className="flex items-center justify-between gap-2 text-label">
                    <span className="text-ink-2">{r.title}</span>
                    <span className="flex items-center gap-1.5">
                      {r.from === "upcoming" ? <span className="text-ink-3">Upcoming</span> : <RentStatusPill status={r.from as "partial" | "not_paid"} className="h-5 px-2 text-[11px]" />}
                      <ChevronRight className="size-3 text-ink-3" aria-hidden />
                      <RentStatusPill status={r.to} className="h-5 px-2 text-[11px]" />
                    </span>
                  </div>
                ))}
                <div className="mt-1 flex items-center justify-between border-t border-glass-divider pt-2"><span className="text-body text-ink-2">Balance after</span><span className="text-[20px] font-semibold text-ink">{money(after.balanceAfter)}</span></div>
                {extends_ && booking.check_out ? <p className="text-label text-ink-3">Paying a month after {monLong(booking.check_out)}? Extend the stay first so it can be billed.</p> : null}
              </section>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 border-t border-glass-divider px-5 py-4">
            <div className="flex items-center gap-3 text-label text-ink-2">
              <span>Send receipt by</span>
              <label className={cn("flex items-center gap-1.5", !booking.guest_email && "opacity-50")}><GlassCheckbox checked={sendEmail && Boolean(booking.guest_email)} disabled={!booking.guest_email} onCheckedChange={setSendEmail} aria-label="Email" />Email</label>
            </div>
            <div className="flex gap-2">
              <Dialog.Close asChild><GlassButton variant="ghost">Cancel</GlassButton></Dialog.Close>
              <GlassButton className="flex-1" onClick={() => void save()} disabled={invalid || busy}>
                {busy ? <Loader2 className="animate-spin" aria-hidden /> : null} Save {money(value)}{sendEmail && booking.guest_email ? " & send receipt" : ""}
              </GlassButton>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
