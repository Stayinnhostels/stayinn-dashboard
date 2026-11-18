import { useEffect, useMemo, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Banknote, CalendarDays, Check, Download, Landmark, Loader2, LogOut, Plus, Smartphone, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, GlassCheckbox } from "@/components/glass";
import { useUpdateBookingDetailsMutation, useUpdateBookingStatusMutation } from "@/queries/bookings";
import { useRecordPaymentMutation } from "@/queries/bookings/useBookingDetailActions";
import { downloadResidentDossierPdfApi } from "@/api/residents";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/domain/booking.types";
import type { ResidentDetail } from "@/types/domain/resident.types";
import { dayMon, monLong, monShort, monthRows, todayKey } from "./profile-utils";

type Refund = "cash" | "jazzcash" | "bank_transfer";
const REFUNDS: { key: Refund; label: string; icon: ReactNode }[] = [
  { key: "cash", label: "Cash", icon: <Wallet /> },
  { key: "jazzcash", label: "JazzCash", icon: <Smartphone /> },
  { key: "bank_transfer", label: "Bank transfer", icon: <Landmark /> },
];
const CONDITIONS = [
  ["good", "Good"],
  ["cleaning", "Needs cleaning"],
  ["damaged", "Damaged"],
] as const;

/** Figma 07.19 · Check out & settle deposit. */
export function CheckoutSettleDialog({ booking, detail, open, onOpenChange }: { booking: Booking; detail: ResidentDetail; open: boolean; onOpenChange: (o: boolean) => void }) {
  const token = useAuthStore((s) => s.token);
  const me = useAuthStore((s) => s.user);
  const status = useUpdateBookingStatusMutation();
  const details = useUpdateBookingDetailsMutation();
  const record = useRecordPaymentMutation();
  const cur = booking.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);
  const first = booking.guest_name.split(" ")[0];

  const owedRows = useMemo(() => {
    const rows = monthRows(detail).filter((m) => m.month <= todayKey().slice(0, 7) && (m.left > 0 || m.extras - m.extrasPaid > 0));
    return {
      rent: rows.map((m) => ({ label: `${monLong(m.month)} rent`, amount: m.left })).filter((r) => r.amount > 0),
      extras: rows.reduce((s, m) => s + Math.max(0, m.extras - m.extrasPaid), 0),
    };
  }, [detail]);
  const seats = Math.max(1, booking.seats_booked || 1);
  const held = booking.security_status === "paid" || booking.security_status === "held" ? Math.max(0, (Number(booking.security_amount) || 0) - (Number(booking.security_returned) || 0) - (Number(booking.security_retained) || 0)) : 0;

  const [date, setDate] = useState(todayKey());
  const [condition, setCondition] = useState<(typeof CONDITIONS)[number][0]>("good");
  const [keys, setKeys] = useState(seats);
  const [charge, setCharge] = useState<{ open: boolean; label: string; amount: string }>({ open: false, label: "", amount: "" });
  const [fromDeposit, setFromDeposit] = useState(true);
  const [refund, setRefund] = useState<Refund>("cash");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const co = booking.check_out?.slice(0, 10);
    setDate(co && co < todayKey() ? co : todayKey());
    setCondition("good");
    setKeys(seats);
    setCharge({ open: false, label: "", amount: "" });
    setFromDeposit(held > 0);
    setRefund("cash");
  }, [open, booking.check_out, seats, held]);

  const rentOwed = owedRows.rent.reduce((s, r) => s + r.amount, 0);
  const chargeNum = Math.max(0, Number(charge.amount) || 0);
  const totalOwed = rentOwed + owedRows.extras + chargeNum;
  const take = fromDeposit ? Math.min(held, totalOwed) : 0;
  const giveBack = Math.max(0, held - take);
  const stillOwed = Math.max(0, totalOwed - take);
  const rentFromDeposit = Math.min(take, rentOwed);

  async function confirm() {
    setBusy(true);
    try {
      if (booking.check_out?.slice(0, 10) !== date) {
        await details.mutateAsync({ id: booking.id, input: { check_out: date, recalculate_total: false } });
      }
      if (rentFromDeposit > 0) {
        await record.mutateAsync({ id: booking.id, input: { amount: rentFromDeposit, method: "deposit", paid_at: todayKey(), note: "Owed rent taken from the security deposit at check-out" } });
      }
      const reasons = [rentFromDeposit > 0 ? "Unpaid rent" : null, owedRows.extras > 0 && fromDeposit ? "Unpaid extras" : null, chargeNum > 0 ? charge.label.trim() || "Damage" : null].filter(Boolean).join(", ");
      await status.mutateAsync({
        id: booking.id,
        status: "checked_out",
        amount_refunded: 0,
        ...(held > 0 ? { security_returned: giveBack } : {}),
        checkout_checklist: { keys_returned: keys >= seats, no_damage: condition !== "damaged", minibar_checked: true, flagged_cleaning: condition !== "good" },
        security_deduction_reason: reasons || undefined,
      });
      toast.success(held > 0 ? `${first} checked out · return ${money(giveBack)} by ${REFUNDS.find((r) => r.key === refund)?.label}` : `${first} checked out`);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Check-out failed");
    } finally {
      setBusy(false);
    }
  }

  async function statement() {
    if (!token) return;
    toast.promise(downloadResidentDossierPdfApi(token, booking.id), { loading: "Preparing statement…", success: "Statement downloaded", error: (e) => (e instanceof Error ? e.message : "Download failed") });
  }

  const box = "flex flex-col gap-1.5";
  const field = "glass-2 flex h-11 items-center gap-2 rounded-[14px] px-3 text-body text-ink";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="glass-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[94svh] flex-col overflow-hidden rounded-t-[28px] font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-[min(720px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px]">
          <div className="flex items-start gap-3 border-b border-glass-divider px-6 py-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-tint text-brand-text [&_svg]:size-[18px]"><LogOut aria-hidden /></span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-hero text-ink">Check out &amp; settle deposit</Dialog.Title>
              <p className="truncate text-label text-ink-2">{[booking.guest_name, booking.room_number != null ? `Room ${booking.room_number}` : booking.room_title, booking.seat_label, booking.check_out ? `stay ends ${dayMon(booking.check_out)}` : null].filter(Boolean).join(" · ")}</p>
            </div>
            <Dialog.Close aria-label="Close" className="glass-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] text-ink"><X className="size-[18px]" aria-hidden /></Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className={box}>
                <span className="text-label font-medium text-ink-2">Check-out date</span>
                <span className={field}><CalendarDays className="size-4 text-ink-3" aria-hidden /><input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} onClick={(e) => e.currentTarget.showPicker?.()} className="w-full cursor-pointer bg-transparent outline-none [&::-webkit-calendar-picker-indicator]:hidden" /></span>
              </label>
              <label className={box}>
                <span className="text-label font-medium text-ink-2">Room condition</span>
                <span className={field}>
                  <select value={condition} onChange={(e) => setCondition(e.target.value as typeof condition)} className="w-full cursor-pointer bg-transparent outline-none">
                    {CONDITIONS.map(([k, l]) => <option key={k} value={k}>{l} · checked by {me?.fullName?.split(" ")[0] ?? "you"}</option>)}
                  </select>
                </span>
              </label>
              <label className={box}>
                <span className="text-label font-medium text-ink-2">Keys returned</span>
                <span className={field}>
                  <Check className="size-4 text-ink-3" aria-hidden />
                  <select value={keys} onChange={(e) => setKeys(Number(e.target.value))} className="w-full cursor-pointer bg-transparent outline-none">
                    {Array.from({ length: seats + 1 }, (_, i) => seats - i).map((n) => <option key={n} value={n}>{n} of {seats}</option>)}
                  </select>
                </span>
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <section className="flex flex-col gap-2 rounded-[16px] border border-glass-divider bg-glass-inset px-4 py-3 text-label">
                <p className="text-eyebrow text-ink-3 uppercase">Still owed</p>
                {owedRows.rent.length === 0 ? <div className="flex justify-between"><span className="text-ink-2">Rent</span><span className="text-ink">{money(0)}</span></div> : null}
                {owedRows.rent.map((r) => <div key={r.label} className="flex justify-between"><span className="text-ink-2">{r.label}</span><span className="text-ink">{money(r.amount)}</span></div>)}
                <div className="flex justify-between"><span className="text-ink-2">Extras</span><span className="text-ink">{money(owedRows.extras)}</span></div>
                {charge.open ? (
                  <div className="grid grid-cols-[1fr_96px] gap-2">
                    <input value={charge.label} onChange={(e) => setCharge((c) => ({ ...c, label: e.target.value }))} placeholder="Damage or charge" className="glass-2 h-9 rounded-[10px] px-2.5 text-label text-ink outline-none" aria-label="Charge" />
                    <input value={charge.amount} inputMode="decimal" onChange={(e) => setCharge((c) => ({ ...c, amount: e.target.value.replace(/[^\d.]/g, "") }))} placeholder="Amount" className="glass-2 h-9 rounded-[10px] px-2.5 text-label text-ink outline-none" aria-label="Charge amount" />
                  </div>
                ) : (
                  <button type="button" onClick={() => setCharge((c) => ({ ...c, open: true }))} className="flex w-fit cursor-pointer items-center gap-1 text-label font-medium text-brand-text"><Plus className="size-3.5" aria-hidden />Add damage or other charge</button>
                )}
                <div className="mt-1 flex justify-between border-t border-glass-divider pt-2"><span className="font-semibold text-ink">Total owed</span><span className={cn("font-semibold", totalOwed > 0 ? "text-danger" : "text-ink")}>{money(totalOwed)}</span></div>
              </section>
              <section className="flex flex-col gap-2 rounded-[16px] border border-glass-divider bg-glass-inset px-4 py-3 text-label">
                <p className="text-eyebrow text-ink-3 uppercase">Security deposit</p>
                <div className="flex justify-between"><span className="text-ink-2">Held{booking.move_in ? ` since ${dayMon(booking.move_in)}` : ""}</span><span className="text-ink">{money(held)}</span></div>
                <div className="flex justify-between"><span className="text-ink-2">Take owed amount from deposit</span><span className="text-ink">− {money(take)}</span></div>
                <label className={cn("flex items-center gap-2", held <= 0 && "opacity-50")}><GlassCheckbox checked={fromDeposit && held > 0} disabled={held <= 0} onCheckedChange={setFromDeposit} aria-label="Deduct what is owed" />Deduct what is owed</label>
                <div className="mt-auto flex justify-between border-t border-glass-divider pt-2"><span className="font-semibold text-ink">Return to {first}</span><span className="font-semibold text-ink">{money(giveBack)}</span></div>
              </section>
            </div>

            <div className="glass-2 flex items-center gap-3 rounded-[18px] px-4 py-3.5">
              <span className="flex size-10 items-center justify-center rounded-[12px] bg-glass-inset text-ink-2 [&_svg]:size-5"><Banknote aria-hidden /></span>
              <div>
                <p className="text-[22px] leading-7 font-semibold text-ink">{held > 0 ? `Give back ${money(giveBack)}` : "No deposit to return"}</p>
                <p className="text-label text-ink-2">{stillOwed > 0 ? `${money(stillOwed)} still owed after the deposit` : take > 0 ? "Rent is settled from the deposit · balance becomes Rs 0" : "Nothing owed"}</p>
              </div>
            </div>

            {held > 0 && giveBack > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-label font-medium text-ink-2">Refund method</p>
                <div role="radiogroup" aria-label="Refund method" className="flex flex-wrap gap-2">
                  {REFUNDS.map((r) => (
                    <button key={r.key} type="button" role="radio" aria-checked={refund === r.key} onClick={() => setRefund(r.key)} className={cn("flex h-10 cursor-pointer items-center gap-2 rounded-[12px] border px-3.5 text-body font-medium [&_svg]:size-4", refund === r.key ? "border-ink/60 bg-glass-3 text-ink" : "glass-2 border-transparent text-ink-2 hover:text-ink")}>{r.icon}{r.label}</button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[14px] bg-glass-inset px-4 py-3 text-label text-ink-2">
              <p className="mb-1 text-eyebrow text-ink-3 uppercase">What happens</p>
              <ul className="flex flex-col gap-0.5">
                <li>• {first} moves to Residents · Moved out</li>
                <li>• {booking.seat_label || "The bed"} in {booking.room_number != null ? `Room ${booking.room_number}` : "the room"} becomes free from {monShort(date) ? dayMon(date) : "today"}</li>
                <li>• The check-out and deposit are saved in the activity log</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-glass-divider px-6 py-4">
            <button type="button" onClick={() => void statement()} className="flex cursor-pointer items-center gap-1.5 text-label font-semibold text-ink-2 hover:text-ink"><Download className="size-4" aria-hidden />Final statement</button>
            <span className="flex-1" />
            <Dialog.Close asChild><GlassButton variant="ghost">Cancel</GlassButton></Dialog.Close>
            <GlassButton onClick={() => void confirm()} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />} {held > 0 ? `Check out & return ${money(giveBack)}` : "Check out"}
            </GlassButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
