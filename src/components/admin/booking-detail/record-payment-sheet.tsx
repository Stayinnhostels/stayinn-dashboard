import { useEffect, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, CreditCard, Landmark, Loader2, Printer, Smartphone, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, Tag } from "@/components/glass";
import { useRecordPaymentMutation } from "@/queries/bookings/useBookingDetailActions";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/domain/booking.types";

type Method = "cash" | "card" | "bank_transfer" | "jazzcash" | "easypaisa";
const METHODS: { key: Method; label: string; icon: ReactNode }[] = [
  { key: "cash", label: "Cash", icon: <Wallet /> },
  { key: "card", label: "Card", icon: <CreditCard /> },
  { key: "bank_transfer", label: "Bank transfer", icon: <Landmark /> },
  { key: "jazzcash", label: "JazzCash", icon: <Smartphone /> },
  { key: "easypaisa", label: "Easypaisa", icon: <Smartphone /> },
];

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const dayMonth = (k?: string | null) => {
  if (!k) return "";
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

/** Figma 06.10 · Record payment side sheet. */
export function RecordPaymentSheet({
  booking,
  open,
  onOpenChange,
  onRecorded,
}: {
  booking: Booking;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** Called after saving; `print` = "Record & print receipt". */
  onRecorded?: (print: boolean) => void;
}) {
  const record = useRecordPaymentMutation();
  const cur = booking.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);
  const due = Math.max(0, booking.balance_due ?? 0);
  const monthly = booking.rent_unit === "night" ? 0 : (booking.rent_amount ?? 0);
  const [amount, setAmount] = useState("");
  const [preset, setPreset] = useState<"full" | "month" | "custom">("full");
  const [method, setMethod] = useState<Method>("cash");
  const [date, setDate] = useState(todayKey());
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setAmount(due > 0 ? String(due) : monthly > 0 ? String(monthly) : "");
    setPreset(due > 0 ? "full" : "month");
    setMethod("cash");
    setDate(todayKey());
    setReference("");
    setNote("");
  }, [open, due, monthly]);

  const value = Number(amount) || 0;
  const newBalance = Math.max(0, due - value);
  const invalid = !(value > 0);

  function save(print: boolean) {
    if (invalid) return;
    record.mutate(
      {
        id: booking.id,
        input: { amount: value, method, paid_at: date, reference: reference.trim() || undefined, note: note.trim() || undefined },
      },
      {
        onSuccess: (r) => {
          toast.success(`Payment recorded · ${money(value)} · ${r.reference}`);
          onOpenChange(false);
          onRecorded?.(print);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not record the payment"),
      },
    );
  }

  const chip = (on: boolean) =>
    cn(
      "cursor-pointer rounded-full border px-2.5 py-1 text-label font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand-border",
      on ? "border-brand-border bg-brand-tint text-ink" : "border-glass-stroke bg-glass-inset text-ink-2 hover:text-ink",
    );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="glass-3 fixed inset-y-3 right-3 z-50 flex w-[min(420px,calc(100vw-24px))] flex-col overflow-hidden rounded-[24px] font-geist text-ink outline-none duration-300 data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
        >
          <div className="flex items-start gap-3 border-b border-glass-divider px-5 py-4">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-hero text-ink">Record payment</Dialog.Title>
              <p className="truncate text-label text-ink-2">
                {[booking.guest_name, booking.booking_code, booking.room_number != null ? `Room ${booking.room_number}` : null, booking.seat_label]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <Dialog.Close aria-label="Close" className="glass-2 flex size-9 cursor-pointer items-center justify-center rounded-[12px] text-ink outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border">
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
            <div className="flex items-center justify-between rounded-[16px] border border-glass-divider bg-glass-inset px-4 py-3">
              <div className="flex flex-col">
                <span className="text-label text-ink-2">Balance due</span>
                <span className={cn("text-[28px] leading-9 font-semibold tracking-tight", due > 0 ? "text-danger" : "text-ink")}>{money(due)}</span>
              </div>
              {booking.overdue && booking.next_due_date ? (
                <Tag tone="danger" showDot>Overdue since {dayMonth(booking.next_due_date)}</Tag>
              ) : due === 0 ? (
                <Tag tone="success" showDot>Paid up</Tag>
              ) : null}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-label font-medium text-ink-2">
                Amount ({cur.toUpperCase()}) <span className="text-danger">*</span>
              </span>
              <span className="glass-2 flex h-11 items-center rounded-[14px] bg-glass-inset px-3.5 focus-within:ring-2 focus-within:ring-brand-border">
                <span className="text-body text-ink-2">{cur === "usd" ? "$" : "Rs"}&nbsp;</span>
                <input
                  value={amount}
                  inputMode="decimal"
                  onChange={(e) => {
                    setAmount(e.target.value.replace(/[^\d.]/g, ""));
                    setPreset("custom");
                  }}
                  className="w-full bg-transparent text-body text-ink outline-none"
                  aria-invalid={invalid || undefined}
                />
              </span>
            </label>
            <div className="-mt-2 flex flex-wrap gap-2">
              {due > 0 ? (
                <button type="button" className={chip(preset === "full")} onClick={() => { setAmount(String(due)); setPreset("full"); }}>
                  Full balance
                </button>
              ) : null}
              {monthly > 0 ? (
                <button type="button" className={chip(preset === "month")} onClick={() => { setAmount(String(monthly)); setPreset("month"); }}>
                  {money(monthly)} · 1 month
                </button>
              ) : null}
              <button type="button" className={chip(preset === "custom")} onClick={() => { setAmount(""); setPreset("custom"); }}>
                Custom
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-label font-medium text-ink-2">Method</span>
              <div role="radiogroup" aria-label="Payment method" className="flex flex-wrap gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    role="radio"
                    aria-checked={method === m.key}
                    onClick={() => setMethod(m.key)}
                    className={cn(
                      "flex h-10 cursor-pointer items-center gap-2 rounded-[12px] border px-3.5 text-body font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-[18px]",
                      method === m.key ? "border-brand-border bg-brand-tint text-ink" : "glass-2 text-ink-2 hover:text-ink",
                    )}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-label font-medium text-ink-2">
                  Date <span className="text-danger">*</span>
                </span>
                <span className="glass-2 flex h-11 items-center gap-2 rounded-[14px] bg-glass-inset px-3.5 focus-within:ring-2 focus-within:ring-brand-border">
                  <CalendarDays className="size-4 shrink-0 text-ink-3" aria-hidden />
                  <input
                    type="date"
                    value={date}
                    max={todayKey()}
                    onChange={(e) => e.target.value && setDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="w-full cursor-pointer bg-transparent text-body text-ink outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                </span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-label font-medium text-ink-2">Reference #</span>
                <span className="glass-2 flex h-11 items-center rounded-[14px] bg-glass-inset px-3.5 focus-within:ring-2 focus-within:ring-brand-border">
                  <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Auto" className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-3" />
                </span>
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-label font-medium text-ink-2">Note</span>
              <span className="glass-2 flex h-11 items-center rounded-[14px] bg-glass-inset px-3.5 focus-within:ring-2 focus-within:ring-brand-border">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Salary received — cleared in full" className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-3" />
              </span>
            </label>

            <div className="flex flex-col gap-2 rounded-[16px] border border-glass-divider bg-glass-inset px-4 py-3 text-label">
              <div className="flex justify-between"><span className="text-ink-2">Balance due</span><span className="font-medium text-ink">{money(due)}</span></div>
              <div className="flex justify-between"><span className="text-ink-2">This payment</span><span className="font-medium text-ink">− {money(value)}</span></div>
              <div className="mt-1 flex items-center justify-between border-t border-glass-divider pt-2">
                <span className="text-ink-2">New balance</span>
                <span className="flex items-center gap-3">
                  <span className={cn("text-body font-semibold", newBalance > 0 ? "text-danger" : "text-success")}>{money(newBalance)}</span>
                  <Tag tone={newBalance > 0 ? "warning" : "success"} showDot>{newBalance > 0 ? "Partial" : "Paid"}</Tag>
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-glass-divider px-5 py-4">
            <Dialog.Close asChild>
              <GlassButton variant="ghost">Cancel</GlassButton>
            </Dialog.Close>
            <GlassButton onClick={() => save(true)} disabled={invalid || record.isPending}>
              {record.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Printer aria-hidden />} Record &amp; print receipt
            </GlassButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
