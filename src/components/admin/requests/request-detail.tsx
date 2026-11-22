import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  BedDouble,
  Building2,
  CalendarPlus,
  Check,
  ChevronRight,
  CircleAlert,
  MessageCircle,
  MessageSquareQuote,
  Phone,
  Smartphone,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { waLink } from "@/components/admin/security/deposit-shared";
import { useBookingRequestQuery, useResolveBookingRequestMutation } from "@/queries/booking-requests";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { BookingRequest, BookingRequestImpact, RefundMethod } from "@/types/domain/booking-request.types";
import {
  OutlinePill,
  STATUS_LABEL,
  TYPE_META,
  TypeTag,
  dayMonth,
  initialsOf,
  monthYear,
  sentAt,
  shortMonth,
  spanLabel,
} from "./request-kit";

const card = "rq-card glass-2 rounded-[22px] p-4 md:p-5";
/** Mobile sheet (Figma 10.04): no card chrome, tighter spacing. */
const compactCls = "gap-4! [&_.rq-card]:rounded-none! [&_.rq-card]:border-0! [&_.rq-card]:bg-transparent! [&_.rq-card]:p-0! [&_.rq-card]:shadow-none! [&_.rq-card]:backdrop-blur-none! [&_.rq-head]:hidden [&_.rq-tiles]:flex-row! [&_.rq-tiles>svg]:rotate-0! [&_.rq-impact]:gap-2! [&_.rq-impact>div]:bg-transparent! [&_.rq-impact>div]:p-0!";

const REPLY_CHIPS = [
  ["approved", "Approved"],
  ["room_not_free", "Room not free"],
  ["call_us", "Please call us"],
  ["pay_first", "Pay first"],
] as const;
type ReplyKey = (typeof REPLY_CHIPS)[number][0];

const REFUND_METHODS: readonly (readonly [RefundMethod, string, typeof Banknote])[] = [
  ["cash", "Cash", Banknote],
  ["jazzcash", "JazzCash", Smartphone],
  ["bank", "Bank", Building2],
] as const;
const METHOD_TEXT: Record<RefundMethod, string> = { cash: "in cash", jazzcash: "to your JazzCash", easypaisa: "to your Easypaisa", bank: "to your bank account" };

function where(r: BookingRequest) {
  const living = r.booking_status === "checked_in" ? "living here" : r.booking_status === "confirmed" || r.booking_status === "pending" ? "reserved" : r.booking_status === "checked_out" ? "moved out" : r.booking_status === "cancelled" ? "cancelled" : null;
  return [r.room_number != null ? `Room ${r.room_number}` : r.room_title, r.seat_label ?? (r.seats_booked === 1 ? "Single" : null), r.booking_code ?? (r.booking_ref ? `#${r.booking_ref}` : null), living]
    .filter(Boolean)
    .join(" · ");
}

function title(r: BookingRequest) {
  const p = r.payload ?? {};
  if (r.type === "extend_stay") {
    const n = p.stay_unit === "night" ? (p.target_nights ?? 0) - (p.current_nights ?? 0) : (p.target_months ?? 0) - (p.current_months ?? 0);
    return `Extend stay by ${n} ${p.stay_unit === "night" ? "night" : "month"}${n === 1 ? "" : "s"}`;
  }
  if (r.type === "cancel") return "Cancel booking";
  if (r.type === "room_change") return `Move to ${p.requested_room_title ?? "another room"}`;
  return `Add ${p.additional_seats ?? 1} bed${(p.additional_seats ?? 1) === 1 ? "" : "s"}`;
}

/** Default reply text for a quick-reply chip. */
function replyText(key: ReplyKey, r: BookingRequest, impact: BookingRequestImpact, money: (n: number) => string, refund: { amount: number; method: RefundMethod }) {
  const p = r.payload ?? {};
  if (key === "room_not_free") return "Sorry, the room is not free on those dates, so we can't approve this request. Reply here if other dates work for you.";
  if (key === "call_us") return "Please call us at the front desk so we can sort this out together.";
  if (key === "pay_first") return "Please clear your pending balance first, then we can approve this request.";
  if (r.type === "extend_stay") {
    const first = impact.extend?.added_months?.[0];
    const rent = impact.extend?.monthly_rent;
    return `Approved — your stay is extended to ${dayMonth(p.requested_check_out)}.${first && rent ? ` ${new Date(`${first}-01T12:00:00`).toLocaleDateString("en-GB", { month: "long" })} rent ${money(rent)} is due on 1 ${shortMonth(`${first}-01`)}.` : ""}`;
  }
  if (r.type === "cancel") {
    return refund.amount > 0
      ? `Your booking is cancelled and ${money(refund.amount)} will be refunded ${METHOD_TEXT[refund.method]} today.`
      : "Your booking is cancelled. Under our cancellation policy there is no refund for this booking.";
  }
  if (r.type === "room_change") return `Approved — you can move to ${p.requested_room_title ?? "your new room"}. Please see the front desk for your new key.`;
  return `Approved — your booking now has ${p.target_seats ?? "more"} beds. The extra rent is added to your next invoice.`;
}

export function RequestDetail({ request, onDone, compact }: { request: BookingRequest; onDone?: () => void; compact?: boolean }) {
  const detail = useBookingRequestQuery(request.id);
  const r = detail.data?.request ?? request;
  const impact = detail.data?.impact ?? {};
  const cur = r.currency ?? "pkr";
  const money = (n: number) => formatMoney(n, cur);
  const pending = r.status === "pending";

  return (
    <div className={cn("flex min-w-0 flex-col gap-4 md:gap-5", compact && compactCls)}>
      {compact ? null : <GuestHeader r={r} />}
      <RequestCard r={r} impact={impact} compact={compact} />
      {r.type === "cancel" ? null : <ImpactCard r={r} impact={impact} money={money} loading={detail.isLoading} compact={compact} />}
      {pending ? (
        <DecisionCard key={r.id} r={r} impact={impact} money={money} onDone={onDone} compact={compact} />
      ) : (
        <>
          {r.type === "cancel" ? <ResolvedRefund r={r} money={money} /> : null}
          <ResolvedCard r={r} />
        </>
      )}
    </div>
  );
}

function GuestHeader({ r }: { r: BookingRequest }) {
  const name = r.guest_name ?? "Guest";
  return (
    <div className={cn(card, "flex flex-wrap items-center gap-x-4 gap-y-3")}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full text-body font-semibold text-ink">{initialsOf(name)}</span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-[24px] leading-8 font-semibold tracking-[-0.24px] text-ink">{name}</h2>
          <OutlinePill>{STATUS_LABEL[r.status]}</OutlinePill>
        </div>
        <p className="truncate text-label text-ink-2">{where(r)}</p>
      </div>
      <div className="flex items-center gap-2">
        {r.guest_phone ? (
          <>
            <a href={`tel:${r.guest_phone}`} aria-label={`Call ${name}`} title={r.guest_phone} className="glass-2 flex size-10 items-center justify-center rounded-[12px] text-ink hover:bg-glass-inset [&_svg]:size-[18px]">
              <Phone aria-hidden />
            </a>
            <a href={waLink(r.guest_phone, `Hi ${name.split(" ")[0]}, about your ${TYPE_META[r.type].label.toLowerCase()} request`)} target="_blank" rel="noreferrer" aria-label={`Message ${name} on WhatsApp`} className="glass-2 flex size-10 items-center justify-center rounded-[12px] text-ink hover:bg-glass-inset [&_svg]:size-[18px]">
              <MessageCircle aria-hidden />
            </a>
          </>
        ) : null}
        <GlassButton asChild variant="glass" size="sm" className="h-10 rounded-[12px]">
          <Link to="/admin/bookings/$id" params={{ id: r.booking_id }}>
            <ChevronRight aria-hidden /> Open booking
          </Link>
        </GlassButton>
      </div>
    </div>
  );
}

function Tile({ eyebrow, title, sub, highlight }: { eyebrow: string; title: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-1 rounded-[16px] px-4 py-4", highlight ? "border border-brand-border bg-glass-3" : "bg-glass-inset")}>
      <p className="text-[11px] leading-4 font-semibold tracking-[0.06em] text-ink-2 uppercase">{eyebrow}</p>
      <p className="truncate text-[22px] leading-8 font-semibold tracking-[-0.24px] text-ink md:text-[24px]">{title}</p>
      {sub ? <p className="truncate text-label text-ink-2">{sub}</p> : null}
    </div>
  );
}

function RequestCard({ r, impact, compact }: { r: BookingRequest; impact: BookingRequestImpact; compact?: boolean }) {
  const p = r.payload ?? {};
  const stay = impact.stay;
  let tiles: React.ReactNode = null;
  if (r.type === "extend_stay") {
    const night = p.stay_unit === "night";
    const nowN = night ? p.current_nights : p.current_months;
    const afterN = night ? p.target_nights : p.target_months;
    const unit = night ? "night" : "month";
    tiles = (
      <>
        <Tile eyebrow="Now" title={`${compact ? "" : "Leaves "}${dayMonth(p.current_check_out)}`} sub={compact ? undefined : `${nowN ?? "?"} ${unit}${nowN === 1 ? "" : "s"}${stay?.move_in ? ` · ${spanLabel(stay.move_in, p.current_check_out)}` : ""}`} />
        <ChevronRight className="size-4 shrink-0 self-center text-ink-2 max-sm:rotate-90" aria-hidden />
        <Tile highlight eyebrow={compact ? "After" : "After approval"} title={`${compact ? "" : "Leaves "}${dayMonth(p.requested_check_out)}`} sub={compact ? undefined : `${afterN ?? "?"} ${unit}${afterN === 1 ? "" : "s"} · until ${monthYear(p.requested_check_out)}`} />
      </>
    );
  } else if (r.type === "room_change") {
    tiles = (
      <>
        <Tile eyebrow="Now" title={r.room_number != null ? `Room ${r.room_number}` : (r.room_title ?? "Current room")} sub={r.seat_label ?? undefined} />
        <ChevronRight className="size-4 shrink-0 self-center text-ink-2 max-sm:rotate-90" aria-hidden />
        <Tile highlight eyebrow="After approval" title={p.requested_room_title ?? "New room"} sub={impact.room_change ? `${impact.room_change.beds_available} bed${impact.room_change.beds_available === 1 ? "" : "s"} free now` : undefined} />
      </>
    );
  } else if (r.type === "additional_seat") {
    tiles = (
      <>
        <Tile eyebrow="Now" title={`${p.current_seats ?? r.seats_booked ?? 1} bed${(p.current_seats ?? 1) === 1 ? "" : "s"}`} sub={r.room_title ?? undefined} />
        <ChevronRight className="size-4 shrink-0 self-center text-ink-2 max-sm:rotate-90" aria-hidden />
        <Tile highlight eyebrow="After approval" title={`${p.target_seats ?? "?"} beds`} sub="Same room" />
      </>
    );
  }
  const sub = r.type === "cancel" && r.move_in ? `Sent ${sentAt(r.created_at)} · arrival ${r.booking_status === "checked_in" ? "was" : "is"} ${dayMonth(r.move_in)}` : `Sent ${sentAt(r.created_at)} from the guest app`;

  return (
    <div className={cn(card, "flex flex-col gap-4")}>
      <div className="rq-head flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-card-title text-ink">{title(r)}</p>
          <p className="truncate text-label text-ink-2">{compact ? `${r.guest_name ?? "Guest"} · ${where(r)}` : sub}</p>
        </div>
        <TypeTag type={r.type} />
      </div>
      {tiles ? <div className="rq-tiles flex flex-col items-stretch gap-3 sm:flex-row">{tiles}</div> : null}
      {r.reason ? (
        <div className="flex gap-2.5 rounded-[14px] bg-glass-inset px-4 py-3 text-body text-ink">
          <MessageSquareQuote className="mt-0.5 size-4 shrink-0 text-ink-2" aria-hidden />
          <p className="min-w-0">“{r.reason}”</p>
        </div>
      ) : null}
    </div>
  );
}

function ImpactTile({ icon, title, sub, warn }: { icon: React.ReactNode; title: string; sub: string; warn?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 gap-3 rounded-[16px] bg-glass-inset px-4 py-3.5">
      <span className={cn("mt-0.5 shrink-0 [&_svg]:size-[18px]", warn ? "text-danger" : "text-ink-2")}>{icon}</span>
      <div className="min-w-0">
        <p className={cn("text-body font-semibold", warn ? "text-danger" : "text-ink")}>{title}</p>
        <p className="text-label text-ink-2">{sub}</p>
      </div>
    </div>
  );
}

function ImpactCard({ r, impact, money, loading, compact }: { r: BookingRequest; impact: BookingRequestImpact; money: (n: number) => string; loading: boolean; compact?: boolean }) {
  let tiles: React.ReactNode = null;
  const e = impact.extend;
  if (r.type === "extend_stay" && e) {
    const months = e.added_months.map((m) => new Date(`${m}-01T12:00:00`).toLocaleDateString("en-GB", { month: "short" }));
    tiles = (
      <>
        <ImpactTile
          warn={!e.bed_free}
          icon={e.bed_free ? <Check /> : <CircleAlert />}
          title={e.bed_free ? "Bed is free" : "Bed is taken"}
          sub={!e.bed_checked ? "No bed number on this booking — check the room" : e.bed_free ? `No booking on this bed until ${monthYear(e.to)}` : `${e.bed_holder ?? "Another guest"} has this bed before ${dayMonth(e.to)}`}
        />
        <ImpactTile icon={<Banknote />} title={`+ ${money(e.extra_amount)} rent`} sub={`${e.added_units} more ${e.unit}${e.added_units === 1 ? "" : "s"} at ${money(e.monthly_rent)}`} />
        {e.unit === "month" ? (
          <ImpactTile icon={<CalendarPlus />} title="Months added" sub={months.length ? `${months.length > 1 ? `${months.slice(0, -1).join(", ")} and ${months[months.length - 1]}` : months[0]} join their rent timeline` : "Added to the rent timeline"} />
        ) : null}
      </>
    );
  } else if (r.type === "room_change" && impact.room_change) {
    const rc = impact.room_change;
    tiles = (
      <>
        <ImpactTile warn={!rc.enough_beds} icon={rc.enough_beds ? <Check /> : <CircleAlert />} title={rc.enough_beds ? "Beds are free" : "Not enough beds"} sub={`${rc.beds_available} free in ${rc.room_title}`} />
        <ImpactTile icon={<BedDouble />} title="Old bed frees up" sub={`${r.room_number != null ? `Room ${r.room_number}` : "Current room"} goes back on the website`} />
        <ImpactTile icon={<Banknote />} title="Rent recalculated" sub={`From ${money(rc.current_rent)} a month at the new room's price`} />
      </>
    );
  } else if (r.type === "additional_seat" && impact.additional_seat) {
    const a = impact.additional_seat;
    tiles = (
      <>
        <ImpactTile warn={!a.enough_beds} icon={a.enough_beds ? <Check /> : <CircleAlert />} title={a.enough_beds ? "Bed is free" : "No free bed"} sub={`${a.beds_available} free in this room`} />
        <ImpactTile icon={<Banknote />} title={`+ ${money(a.extra_rent)} a month`} sub={`${a.added_seats} more bed${a.added_seats === 1 ? "" : "s"} on this booking`} />
      </>
    );
  }
  if (!tiles && !loading) return null;
  return (
    <div className={cn(card, "flex flex-col gap-4")}>
      <p className="rq-head text-card-title text-ink">{r.status === "pending" ? "What changes if you approve" : "What this request changes"}</p>
      {tiles ? <div className={cn("rq-impact flex flex-col gap-3", !compact && "xl:flex-row")}>{tiles}</div> : <div className="h-[72px] animate-pulse rounded-[16px] bg-glass-inset" />}
    </div>
  );
}

function RefundPanel({ impact, money, amount, setAmount, method, setMethod, max }: { impact: BookingRequestImpact; money: (n: number) => string; amount: string; setAmount: (v: string) => void; method: RefundMethod; setMethod: (m: RefundMethod) => void; max: number }) {
  const c = impact.cancel;
  if (!c) return <div className={cn(card, "h-[220px] animate-pulse")} />;
  const row = (k: string, v: string) => (
    <div className="flex items-center justify-between gap-3 text-body">
      <span className="text-ink-2">{k}</span>
      <span className="font-semibold text-ink">{v}</span>
    </div>
  );
  return (
    <div className={cn(card, "flex flex-col gap-4")}>
      <div>
        <p className="text-card-title text-ink">Refund</p>
        <p className="text-label text-ink-2">Your policy: {c.policy_text}</p>
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 flex-col gap-2.5 rounded-[16px] bg-glass-inset p-4">
          {row("Advance paid", money(c.paid))}
          {row("Days before arrival", c.arrived ? "Already arrived" : c.days_before_arrival != null ? `${c.days_before_arrival} day${c.days_before_arrival === 1 ? "" : "s"}` : "—")}
          {row("Policy allows", c.allows_label)}
          <div className="mt-1 flex items-center justify-between gap-3 border-t border-glass-divider pt-3">
            <span className="text-body font-semibold text-ink">Refund</span>
            <span className="text-[24px] leading-8 font-semibold tracking-[-0.24px] text-ink">{money(Number(amount) || 0)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 md:w-[226px]">
          <label className="flex flex-col gap-1.5">
            <span className="text-label font-medium text-ink-2">Refund amount</span>
            <span className="flex h-10 items-center gap-2 rounded-[10px] border border-glass-stroke bg-glass-inset px-3 focus-within:border-brand-border">
              <Banknote className="size-4 text-ink-2" aria-hidden />
              <input
                inputMode="decimal"
                value={amount}
                onChange={(ev) => setAmount(ev.target.value.replace(/[^\d.]/g, ""))}
                aria-label="Refund amount"
                className="min-w-0 flex-1 bg-transparent text-body font-medium text-ink outline-none"
              />
            </span>
            {Number(amount) > max ? <span className="text-label text-danger">More than was paid ({money(max)})</span> : null}
          </label>
          <div role="radiogroup" aria-label="Refund method" className="grid grid-cols-3 gap-1.5">
            {REFUND_METHODS.map(([k, l, Icon]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={method === k}
                onClick={() => setMethod(k)}
                className={cn("flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[12px] border px-2 text-label transition-colors [&_svg]:size-4", method === k ? "border-ink-2 bg-glass-3 font-medium text-ink" : "border-transparent bg-glass-inset text-ink-2 hover:text-ink")}
              >
                <Icon aria-hidden /> {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      {c.frees_from && c.frees_to ? (
        <div className="flex items-center gap-2.5 rounded-[14px] bg-glass-inset px-4 py-3 text-body text-ink">
          <Check className="size-4 shrink-0 text-ink-2" aria-hidden />
          <span>
            {c.arrived ? "The bed becomes free today" : `The bed becomes free for ${dayMonth(c.frees_from)} – ${dayMonth(c.frees_to)}`} and goes back on the website.
          </span>
        </div>
      ) : null}
    </div>
  );
}

function DecisionCard({ r, impact, money, onDone, compact }: { r: BookingRequest; impact: BookingRequestImpact; money: (n: number) => string; onDone?: () => void; compact?: boolean }) {
  const resolve = useResolveBookingRequestMutation();
  const [chip, setChip] = useState<ReplyKey>("approved");
  const [method, setMethod] = useState<RefundMethod>("cash");
  const [amount, setAmount] = useState<string>("");
  const [text, setText] = useState("");
  const [edited, setEdited] = useState(false);
  const c = impact.cancel;

  // Suggested refund once the policy numbers arrive.
  useEffect(() => {
    if (c && amount === "") setAmount(String(c.amount));
  }, [c, amount]);

  const refund = { amount: Number(amount) || 0, method };
  const suggested = useMemo(() => replyText(chip, r, impact, money, refund), [chip, r, impact, refund.amount, refund.method]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!edited) setText(suggested);
  }, [suggested, edited]);

  const tooMuch = r.type === "cancel" && c != null && refund.amount > c.paid;
  const approveLabel =
    r.type === "extend_stay" ? "Approve extension" : r.type === "cancel" ? (refund.amount > 0 ? `Approve & refund ${money(refund.amount)}` : "Approve cancellation") : r.type === "room_change" ? "Approve room change" : "Approve extra bed";

  const decide = (status: "approved" | "rejected") =>
    resolve.mutate(
      {
        id: r.id,
        status,
        admin_note: text.trim() || undefined,
        reply_template: status === "rejected" && chip === "approved" ? undefined : chip,
        ...(r.type === "cancel" && status === "approved" ? { amount_refunded: refund.amount, refund_method: refund.amount > 0 ? method : undefined } : {}),
      },
      {
        onSuccess: () => {
          toast.success(status === "approved" ? "Request approved — guest notified" : "Request rejected — guest notified");
          onDone?.();
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not update the request"),
      },
    );

  return (
    <>
      {r.type === "cancel" ? <RefundPanel impact={impact} money={money} amount={amount} setAmount={setAmount} method={method} setMethod={setMethod} max={c?.paid ?? 0} /> : null}
      <div className={cn(card, "flex flex-col gap-4")}>
        <div className="rq-head">
          <p className="text-card-title text-ink">Reply to guest</p>
          <p className="text-label text-ink-2">Sent by email and in the guest app with your decision</p>
        </div>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setEdited(true);
          }}
          rows={compact ? 2 : 3}
          maxLength={500}
          aria-label="Reply to guest"
          className="min-h-[80px] w-full resize-y rounded-[14px] border border-glass-stroke bg-glass-inset px-4 py-3 text-body text-ink outline-none focus:border-brand-border"
        />
        <div className="rq-head flex flex-wrap gap-2">
          {REPLY_CHIPS.map(([k, l]) => (
            <button
              key={k}
              type="button"
              aria-pressed={chip === k}
              onClick={() => {
                setChip(k);
                setEdited(false);
              }}
              className={cn("h-7 cursor-pointer rounded-full px-2.5 text-label transition-colors", chip === k ? "bg-ink text-glass-3" : "bg-glass-inset text-ink-2 hover:text-ink")}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="rq-head flex-1 text-label text-ink-2">Guest is notified as soon as you decide</p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <GlassButton variant="glass" disabled={resolve.isPending} onClick={() => decide("rejected")}>
              <X aria-hidden /> Reject
            </GlassButton>
            <GlassButton disabled={resolve.isPending || tooMuch} onClick={() => decide("approved")}>
              <Check aria-hidden /> <span className="truncate">{compact ? (r.type === "cancel" && refund.amount > 0 ? `Refund ${money(refund.amount)}` : "Approve") : approveLabel}</span>
            </GlassButton>
          </div>
        </div>
      </div>
    </>
  );
}

function ResolvedRefund({ r, money }: { r: BookingRequest; money: (n: number) => string }) {
  if (r.status !== "approved") return null;
  return (
    <div className={cn(card, "flex items-center justify-between gap-3")}>
      <div>
        <p className="text-card-title text-ink">Refund</p>
        <p className="text-label text-ink-2">{r.refund_method ? `Paid back by ${r.refund_method === "bank" ? "bank transfer" : r.refund_method === "jazzcash" ? "JazzCash" : r.refund_method === "easypaisa" ? "Easypaisa" : "cash"}` : "No refund method recorded"}</p>
      </div>
      <p className="text-[24px] leading-8 font-semibold text-ink">{money(r.amount_refunded ?? 0)}</p>
    </div>
  );
}

function ResolvedCard({ r }: { r: BookingRequest }) {
  const when = r.resolved_at ? new Date(r.resolved_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : null;
  return (
    <div className={cn(card, "flex flex-col gap-3")}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-card-title text-ink">{r.status === "withdrawn" ? "Withdrawn by the guest" : `${STATUS_LABEL[r.status]}${r.resolved_by_name ? ` by ${r.resolved_by_name}` : ""}`}</p>
          <p className="text-label text-ink-2">
            {when ?? "—"}
            {r.reply_emailed_at ? " · reply emailed to the guest" : ""}
          </p>
        </div>
        <OutlinePill>{STATUS_LABEL[r.status]}</OutlinePill>
      </div>
      {r.admin_note ? <p className="rounded-[14px] bg-glass-inset px-4 py-3 text-body text-ink">{r.admin_note}</p> : null}
    </div>
  );
}
