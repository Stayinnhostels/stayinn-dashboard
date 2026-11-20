import { useState } from "react";
import { Banknote, Check, Copy, Percent } from "lucide-react";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { CouponDiscountType, CouponStatus } from "@/types/domain/coupon.types";

export const STATUS_LABEL: Record<CouponStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  used_up: "Used up",
  expired: "Expired",
  paused: "Paused",
};

const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function discountTitle(type: CouponDiscountType, value: number) {
  return type === "percent" ? `${value || 0}% off` : `${formatMoney(value || 0, "pkr")} off`;
}

export type CouponCardData = {
  code: string;
  description: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  max_uses: number | null;
  used: number;
  valid_until: string | null;
  status: CouponStatus;
};

/** Figma 15.04 "Coupon" ticket card — top (icon, offer, tag), dashed cut, code + usage. */
export function CouponCard({ c, onOpen, className, compact }: { c: CouponCardData; onOpen?: () => void; className?: string; /** Tag under the text (dialog preview). */ compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const ended = c.status === "expired" || c.status === "used_up";
  const Icon = c.discount_type === "percent" ? Percent : Banknote;
  const pct = c.max_uses ? Math.min(100, (c.used / c.max_uses) * 100) : 0;

  const tag = (
    <span className={cn("inline-flex shrink-0 items-center gap-[5px] rounded-full border border-ink-2 bg-glass-inset px-2 py-0.5 text-label font-medium text-ink-2", compact ? "mt-0.5 self-start" : "self-center")}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_LABEL[c.status]}
    </span>
  );

  function copy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!c.code) return;
    void navigator.clipboard?.writeText(c.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={(e) => onOpen && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      className={cn("glass-2 flex min-w-0 flex-col overflow-hidden rounded-[22px] text-left", onOpen && "cursor-pointer outline-none transition-[filter] hover:brightness-[1.02] focus-visible:ring-2 focus-visible:ring-brand-border", (ended || c.status === "paused") && "opacity-60", className)}
    >
      <div className="flex items-center gap-3 p-[18px]">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-brand-tint text-brand-text"><Icon className="size-5" aria-hidden /></span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-[24px] leading-[30px] font-semibold tracking-[-0.24px] text-ink">{discountTitle(c.discount_type, c.discount_value)}</p>
          <p className="truncate text-label text-ink-2">{c.description || "No description"}</p>
          {compact ? tag : null}
        </div>
        {compact ? null : tag}
      </div>
      <div className="border-t border-dashed border-glass-stroke" aria-hidden />
      <div className="flex flex-col gap-2.5 p-[18px]">
        <div className="flex items-center gap-2 rounded-[10px] bg-glass-inset py-1 pr-1 pl-3">
          <p className="min-w-0 flex-1 truncate text-body font-semibold text-ink">{c.code || "CODE"}</p>
          <button type="button" aria-label={`Copy ${c.code}`} onClick={copy} className="flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-ink-2 hover:bg-glass-2 hover:text-ink">
            {copied ? <Check className="size-3.5 text-success" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          </button>
        </div>
        <div className="flex items-center gap-2 text-label">
          <p className="min-w-0 flex-1 truncate text-ink-2">{c.max_uses ? `${c.used} of ${c.max_uses} used` : `${c.used} used · no limit`}</p>
          <p className="shrink-0 text-ink-3">{c.valid_until ? `Until ${longDate(c.valid_until)}` : "No end date"}</p>
        </div>
        {c.max_uses ? (
          <div className="h-[5px] overflow-hidden rounded-[3px] bg-glass-divider">
            <div className="dash-fill h-full bg-brand" style={{ width: `${pct}%` }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
