import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { CountUp } from "@/components/admin/dashboard/dashboard-motion";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";

/**
 * Shared pieces for Figma 15 · Finance (Revenue & profit, Monthly expenses, Coupons).
 */

export const pad2 = (n: number) => String(n).padStart(2, "0");
export const thisMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};
export const shiftMonth = (k: string, by: number) => {
  const [y, m] = k.split("-").map(Number);
  const d = new Date(y, m - 1 + by, 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};
export const monthName = (k: string, style: "long" | "short" = "long") => {
  const [y, m] = k.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: style });
};
export const monthTitle = (k: string) => {
  const [y, m] = k.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};
export const isMonthKey = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}$/.test(v);

/** "Rs 1.23M", "Rs 490k", "Rs 9,500" — the 6-month KPI style in Figma 15.01. */
export function compactMoney(n: number, cur: string) {
  const sign = n < 0 ? "−" : "";
  const a = Math.abs(n);
  const unit = cur === "usd" ? "$" : "Rs ";
  if (a >= 1_000_000) return `${sign}${unit}${(a / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (a >= 10_000) return `${sign}${unit}${Math.round(a / 1000)}k`;
  return `${sign}${formatMoney(a, cur)}`;
}

/** Figma "KPI" — 32px icon tile, 14/20 label, 32/36 value, 12/16 context. */
export function FinKpi({ icon, label, value, sub, danger, className }: { icon: React.ReactNode; label: React.ReactNode; value: string; sub?: React.ReactNode; danger?: boolean; className?: string }) {
  return (
    <div className={cn("dash-sheen glass-2 flex min-w-0 flex-col gap-2.5 rounded-[22px] p-4 md:p-5", className)}>
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-[10px] [&_svg]:size-4", danger ? "bg-danger-tint text-danger" : "bg-glass-2 text-ink")}>{icon}</span>
        <span className="truncate text-body font-medium text-ink-2">{label}</span>
      </div>
      <p className={cn("truncate text-[24px] leading-8 font-semibold tracking-[-0.48px] md:text-[32px] md:leading-9", danger ? "text-danger" : "text-ink")}>
        <CountUp value={value} delay={200} />
      </p>
      {sub ? <p className="truncate text-label text-ink-3">{sub}</p> : null}
    </div>
  );
}

/** Figma segmented control — inset well, active pill glass-2 with stroke. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  stretch,
}: {
  options: readonly (readonly [T, React.ReactNode, (number | undefined)?])[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
  stretch?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("no-scrollbar flex max-w-full gap-0.5 overflow-x-auto rounded-[12px] bg-glass-inset p-1", className)}>
      {options.map(([k, l, n]) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={value === k}
          onClick={() => onChange(k)}
          className={cn(
            "flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border px-3 text-body font-medium whitespace-nowrap transition-colors",
            stretch && "flex-1",
            value === k ? "border-glass-stroke bg-glass-3 text-ink" : "border-transparent text-ink-2 hover:text-ink",
          )}
        >
          {l}
          {n != null ? <span className="text-label text-ink-3">{n}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** Figma "Month switcher" — ‹ 📅 November 2026 ›. */
export function MonthSwitcher({ month, onChange, max }: { month: string; onChange: (k: string) => void; max?: string }) {
  const atMax = max ? month >= max : false;
  return (
    <div className="flex items-center gap-1 rounded-[12px] border border-glass-divider bg-glass-inset p-1">
      <button type="button" aria-label="Previous month" onClick={() => onChange(shiftMonth(month, -1))} className="flex size-8 cursor-pointer items-center justify-center rounded-[8px] text-ink-2 hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      <span className="flex h-8 items-center gap-2 px-2 text-body font-semibold whitespace-nowrap text-ink">
        <CalendarDays className="size-4 text-brand-text" aria-hidden />
        {monthTitle(month)}
      </span>
      <button type="button" aria-label="Next month" disabled={atMax} onClick={() => onChange(shiftMonth(month, 1))} className="flex size-8 cursor-pointer items-center justify-center rounded-[8px] text-ink-2 hover:text-ink disabled:cursor-default disabled:opacity-40">
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function CardHead({ title, sub, right }: { title: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-card-title text-ink">{title}</p>
        {sub ? <p className="truncate text-label text-ink-3">{sub}</p> : null}
      </div>
      {right}
    </div>
  );
}

/** Label · amount over a 6px track (Figma "Where money comes from" / "By category"). */
export function BarRow({ label, value, pct }: { label: React.ReactNode; value: string; pct: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-2 text-body text-ink">
        <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
        <span className="shrink-0 font-semibold">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[3px] bg-glass-divider">
        <div className="dash-fill h-full rounded-[3px] bg-brand" style={{ width: `${Math.max(pct > 0 ? 2 : 0, Math.min(100, pct))}%` }} />
      </div>
    </div>
  );
}

/** Dialog header — 40px icon tile, 24/30 title, 12/16 subtitle, 40px close button. */
export function FinDialogHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-glass-divider px-5 py-4 md:px-6 md:py-5">
      <span className="hidden size-10 shrink-0 items-center justify-center rounded-[12px] bg-glass-2 text-ink md:flex [&_svg]:size-5">{icon}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Dialog.Title className="truncate text-[22px] leading-7 font-semibold tracking-[-0.24px] text-ink md:text-[24px] md:leading-[30px]">{title}</Dialog.Title>
        {sub ? <p className="truncate text-label text-ink-2">{sub}</p> : null}
      </div>
      <Dialog.Close aria-label="Close" className="glass-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] text-ink hover:brightness-95">
        <X className="size-[18px]" aria-hidden />
      </Dialog.Close>
    </div>
  );
}

/** Small switch matching the Figma 40×24 toggle. */
export function FinToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-10 shrink-0 cursor-pointer rounded-full border transition-colors", checked ? "border-transparent bg-brand" : "border-glass-stroke bg-glass-inset")}
    >
      <span className={cn("absolute top-0.5 size-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.25)] transition-[left]", checked ? "left-[19px]" : "left-0.5")} />
    </button>
  );
}

export const finInput = "h-10 w-full rounded-[10px] border border-glass-stroke bg-glass-inset px-3 text-body font-medium text-ink outline-none placeholder:font-normal placeholder:text-ink-3 focus:border-brand-border";
export const finLabel = "text-label font-medium text-ink-2";
