import { useEffect, useState } from "react";
import { Banknote, Check, Loader2, RotateCcw, TriangleAlert } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { RentPaymentStatus } from "@/types/domain/resident.types";

export const RENT_STATUS_META: Record<RentPaymentStatus, { label: string; icon: typeof Check; pill: string; hint: string }> = {
  paid: { label: "Paid", icon: Check, pill: "border-glass-divider bg-glass-inset text-ink-2", hint: "Emails a receipt" },
  partial: { label: "Partial", icon: Banknote, pill: "border-ink/70 bg-transparent text-ink", hint: "Some collected" },
  not_paid: { label: "Not paid", icon: TriangleAlert, pill: "border-transparent bg-danger-tint text-danger", hint: "Nothing collected" },
  returned: { label: "Returned", icon: RotateCcw, pill: "border-glass-divider bg-glass-inset text-ink-2", hint: "Rent given back" },
};

export function RentStatusPill({ status, className, asButton }: { status: RentPaymentStatus; className?: string; asButton?: boolean }) {
  const m = RENT_STATUS_META[status] ?? RENT_STATUS_META.not_paid;
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-label font-medium whitespace-nowrap [&_svg]:size-3.5",
        m.pill,
        asButton && "cursor-pointer transition-[filter] hover:brightness-95",
        className,
      )}
    >
      <Icon aria-hidden />
      {m.label}
    </span>
  );
}

/**
 * Figma 07.03 · Change rent status menu: Paid / Partial (with "Collected Rs … of …") /
 * Not paid / Returned. Paid applies at once (the API emails the receipt).
 */
export function RentStatusMenu({
  status,
  title,
  rent,
  collected,
  currencyPrefix,
  disabled,
  onChange,
}: {
  status: RentPaymentStatus;
  title: string;
  rent: number;
  collected: number;
  currencyPrefix: string;
  disabled?: boolean;
  onChange: (next: RentPaymentStatus, collectedAmount?: number) => Promise<unknown> | void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<RentPaymentStatus>(status);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState<RentPaymentStatus | null>(null);

  useEffect(() => {
    if (!open) return;
    setMode(status);
    setAmount(status === "partial" && collected > 0 ? String(collected) : "");
  }, [open, status, collected]);

  async function apply(next: RentPaymentStatus, value?: number) {
    setBusy(next);
    try {
      await onChange(next, value);
      setOpen(false);
    } finally {
      setBusy(null);
    }
  }

  const amountNum = Number(amount);
  const amountOk = amount !== "" && amountNum > 0 && amountNum < rent;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button type="button" aria-label={`Change rent status · ${RENT_STATUS_META[status]?.label}`} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-border disabled:cursor-not-allowed">
          <RentStatusPill status={status} asButton={!disabled} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="glass-3 w-[300px] rounded-[16px] border-0 p-1.5 font-geist text-ink shadow-none">
        <p className="px-2.5 pt-1.5 pb-1 text-eyebrow text-ink-3 uppercase">{title}</p>
        {(["paid", "partial", "not_paid", "returned"] as RentPaymentStatus[]).map((s) => (
          <div key={s}>
            <button
              type="button"
              onClick={() => (s === "partial" ? setMode("partial") : void apply(s))}
              disabled={busy != null}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left outline-none hover:bg-glass-inset focus-visible:bg-glass-inset disabled:cursor-progress",
                mode === s && s === "partial" && "bg-glass-inset",
              )}
            >
              <RentStatusPill status={s} />
              <span className="flex-1 text-label text-ink-2">{RENT_STATUS_META[s].hint}</span>
              {busy === s ? <Loader2 className="size-3.5 animate-spin text-ink-3" aria-hidden /> : status === s ? <Check className="size-3.5 text-brand-text" aria-hidden /> : null}
            </button>
            {s === "partial" && mode === "partial" ? (
              <form
                className="mx-1 mb-1 flex items-center gap-2 rounded-[10px] bg-glass-inset px-2.5 py-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (amountOk) void apply("partial", amountNum);
                }}
              >
                <span className="text-label text-ink-3">Collected</span>
                <span className="text-label font-semibold text-ink">{currencyPrefix}</span>
                <input
                  autoFocus
                  value={amount}
                  inputMode="decimal"
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                  placeholder="0"
                  aria-label="Amount collected"
                  className="w-20 min-w-0 flex-1 bg-transparent text-body font-semibold text-ink outline-none placeholder:text-ink-3"
                />
                <span className="text-label whitespace-nowrap text-ink-3">of {rent.toLocaleString("en-US")}</span>
                <button type="submit" disabled={!amountOk || busy != null} className="cursor-pointer rounded-[8px] bg-brand px-2 py-1 text-label font-semibold text-on-brand disabled:cursor-not-allowed disabled:opacity-40">
                  Save
                </button>
              </form>
            ) : null}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
