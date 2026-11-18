import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, GlassCheckbox, Tag } from "@/components/glass";
import { useUpdateBookingStatusMutation } from "@/queries/bookings";
import { formatMoney } from "@/lib/payments";
import type { Booking } from "@/types/domain/booking.types";

const REASONS = ["None", "Damage", "Missing keys", "Cleaning fee", "Unpaid rent", "Other"];
const CHECKS = [
  ["keys_returned", "Keys & key cards returned"],
  ["no_damage", "No damage to furniture or fixtures"],
  ["minibar_checked", "Minibar / fridge checked"],
  ["flagged_cleaning", "Room flagged for cleaning"],
] as const;
type CheckKey = (typeof CHECKS)[number][0];

const dm = (k?: string | null) => {
  if (!k) return "—";
  const [y, m, d] = k.split("-").map(Number);
  return String(new Date(y, m - 1, d).getDate());
};
const mon = (k?: string | null) => {
  if (!k) return "";
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { month: "short" });
};

/** Figma 06.11 · Check out dialog: final balance, security refund, room checklist. */
export function CheckoutDialog({ booking, open, onOpenChange }: { booking: Booking; open: boolean; onOpenChange: (o: boolean) => void }) {
  const update = useUpdateBookingStatusMutation();
  const cur = booking.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);
  const returnable = Number(booking.security_returnable ?? booking.security_amount ?? 0) || 0;
  const securityHeld = booking.security_status === "paid";
  const [refund, setRefund] = useState("");
  const [reason, setReason] = useState("None");
  const [checks, setChecks] = useState<Record<CheckKey, boolean>>({ keys_returned: true, no_damage: true, minibar_checked: true, flagged_cleaning: false });

  useEffect(() => {
    if (!open) return;
    setRefund(securityHeld ? String(returnable) : "0");
    setReason("None");
    setChecks({ keys_returned: true, no_damage: true, minibar_checked: true, flagged_cleaning: false });
  }, [open, securityHeld, returnable]);

  const charged = Number(booking.total_amount) || 0;
  const paid = booking.paid_total ?? 0;
  const balance = Math.max(0, booking.balance_due ?? charged - paid);
  const refundNum = Number(refund) || 0;
  const tooMuch = securityHeld && refundNum > returnable;

  function confirm() {
    if (tooMuch) return;
    update.mutate(
      {
        id: booking.id,
        status: "checked_out",
        amount_refunded: 0,
        ...(securityHeld ? { security_returned: refundNum } : {}),
        checkout_checklist: checks,
        security_deduction_reason: reason === "None" ? undefined : reason,
      },
      {
        onSuccess: () => {
          toast.success(`${booking.guest_name} checked out`);
          onOpenChange(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Check-out failed"),
      },
    );
  }

  const roomLine = [
    booking.room_number != null ? `Room ${booking.room_number}` : null,
    booking.room_name,
    `${booking.seats_booked} guest${booking.seats_booked === 1 ? "" : "s"}`,
    `${dm(booking.move_in)} → ${dm(booking.check_out)} ${mon(booking.check_out)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="glass-3 fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100svh-32px)] w-[min(460px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-[24px] p-5 font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-tint text-brand-text [&_svg]:size-[18px]">
              <LogOut aria-hidden />
            </span>
            <div className="min-w-0">
              <Dialog.Title className="text-hero text-ink">Check out {booking.guest_name}?</Dialog.Title>
              <p className="truncate text-label text-ink-2">{roomLine}</p>
            </div>
          </div>

          <section className="flex flex-col gap-2 rounded-[16px] border border-glass-divider bg-glass-inset px-3.5 py-3 text-label">
            <p className="text-eyebrow text-ink-2 uppercase">Final balance</p>
            <div className="flex justify-between"><span className="text-ink-2">Total charged</span><span className="text-body font-medium text-ink">{money(charged)}</span></div>
            <div className="flex justify-between"><span className="text-ink-2">Total paid</span><span className="text-body font-medium text-ink">{money(paid)}</span></div>
            <div className="flex items-center justify-between">
              <span className="text-ink-2">Balance</span>
              <span className="flex items-center gap-3">
                <span className={balance > 0 ? "text-body font-semibold text-danger" : "text-body font-semibold text-success"}>{money(balance)}</span>
                <Tag tone={balance > 0 ? "danger" : "success"} showDot>{balance > 0 ? "Due" : "Settled"}</Tag>
              </span>
            </div>
          </section>

          {securityHeld ? (
            <section className="flex flex-col gap-2.5 rounded-[16px] border border-glass-divider bg-glass-inset px-3.5 py-3">
              <p className="text-eyebrow text-ink-2 uppercase">Security refund</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-label font-medium text-ink-2">Refund amount ({cur.toUpperCase()}) <span className="text-danger">*</span></span>
                  <span className={`glass-2 flex h-11 items-center rounded-[14px] px-3.5 focus-within:ring-2 focus-within:ring-brand-border ${tooMuch ? "border-danger!" : ""}`}>
                    <span className="text-body text-ink-2">{cur === "usd" ? "$" : "Rs"}&nbsp;</span>
                    <input value={refund} inputMode="decimal" onChange={(e) => setRefund(e.target.value.replace(/[^\d.]/g, ""))} className="w-full bg-transparent text-body text-ink outline-none" aria-invalid={tooMuch || undefined} />
                  </span>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-label font-medium text-ink-2">Deduction reason</span>
                  <span className="glass-2 flex h-11 items-center rounded-[14px] px-3.5 focus-within:ring-2 focus-within:ring-brand-border">
                    <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full cursor-pointer bg-transparent text-body text-ink outline-none">
                      {REASONS.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </span>
                </label>
              </div>
              <div className="flex justify-between text-label">
                <span className={tooMuch ? "text-danger" : "text-ink-2"}>{tooMuch ? "More than the deposit on file" : "Returnable security on file"}</span>
                <span className="text-ink">{money(returnable)}</span>
              </div>
            </section>
          ) : null}

          <section className="flex flex-col gap-3">
            <p className="text-eyebrow text-ink-2 uppercase">Room condition checklist</p>
            {CHECKS.map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2.5 text-body text-ink">
                <GlassCheckbox checked={checks[key]} onCheckedChange={(v) => setChecks((c) => ({ ...c, [key]: v }))} aria-label={label} />
                {label}
              </label>
            ))}
          </section>

          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <GlassButton variant="ghost">Cancel</GlassButton>
            </Dialog.Close>
            <GlassButton onClick={confirm} disabled={tooMuch || update.isPending}>
              {update.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />} Confirm check-out
            </GlassButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
