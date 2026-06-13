import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { C as Card, c as CardContent } from "./card-DCDRzI6q.mjs";
import { S as Skeleton } from "./skeleton-CoUJiN10.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogDescription, d as DialogFooter } from "./dialog-SXOy8WpB.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { n as normalizeMoneyCurrency, f as formatMoney } from "./payments-CPHCHGiR.mjs";
import { c as bookingSecurityAmount, i as isMonthlyBooking } from "./security-deposit-CEf7jVFl.mjs";
import { S as SECURITY_STATUS_LABELS } from "./resident.types-DjDosJYK.mjs";
const LIST_SKELETON_COUNT = 8;
function BookingsGridSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: Array.from({ length: LIST_SKELETON_COUNT }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden border-border/60", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-[4/3] w-full rounded-none" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-2/3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-10" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-1/2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-4/5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-24" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 flex-1 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-32 rounded-md" })
      ] })
    ] })
  ] }, i)) });
}
function BookingsTableSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Booking" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Guest" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Room" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Dates" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Seats" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Total" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-44", children: "Quick action" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: Array.from({ length: LIST_SKELETON_COUNT }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-14" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mb-1 h-4 w-28" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-36" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-24" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-20" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-24 rounded-full" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full rounded-md" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-8 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-8 rounded-md" })
      ] }) })
    ] }, i)) })
  ] }) }) });
}
function BookingsCalendarSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-32 rounded-md" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-8 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-8 rounded-md" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-2", children: Array.from({ length: 35 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 rounded-lg" }, i)) })
  ] }) });
}
function BookingsListSkeleton({ view }) {
  if (view === "calendar") return /* @__PURE__ */ jsxRuntimeExports.jsx(BookingsCalendarSkeleton, {});
  if (view === "table") return /* @__PURE__ */ jsxRuntimeExports.jsx(BookingsTableSkeleton, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BookingsGridSkeleton, {});
}
function BookingDetailSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-36 rounded-md" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-28 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-24 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-32 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-24 rounded-md" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60 lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-48" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-24 rounded-full" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-24" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-full" })
        ] }, i)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-32" }),
        Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-28" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full rounded-md" })
        ] }, i))
      ] }) })
    ] })
  ] });
}
function enumerateStayMonths(moveIn, checkOut) {
  if (!moveIn || !checkOut) return [];
  const start = new Date(moveIn.includes("T") ? moveIn : `${moveIn}T12:00:00`);
  const end = new Date(checkOut.includes("T") ? checkOut : `${checkOut}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  const keys = [];
  let y = start.getFullYear();
  let m = start.getMonth();
  const endY = end.getFullYear();
  const endM = end.getMonth();
  while (y < endY || y === endY && m <= endM) {
    keys.push(`${y}-${String(m + 1).padStart(2, "0")}`);
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return keys;
}
function monthLabel(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });
}
function defaultMonthlyRentAmount(booking) {
  return Math.round(booking.price_per_seat * booking.seats_booked * 100) / 100;
}
function buildBookingRentTimeline(booking) {
  const stayMonths = enumerateStayMonths(booking.move_in, booking.check_out);
  const ledger = booking.rent_ledger ?? [];
  const fallbackRent = defaultMonthlyRentAmount(booking);
  return stayMonths.map((monthKey) => {
    const entry = ledger.find((e) => e.month === monthKey);
    return {
      month: monthKey,
      label: monthLabel(monthKey),
      rent_amount: entry?.rent_amount ?? fallbackRent,
      payment_status: entry?.payment_status ?? "not_paid"
    };
  });
}
function rentCollectedFromTimeline(months) {
  return months.reduce((sum, m) => {
    if (m.payment_status === "paid") return sum + m.rent_amount;
    if (m.payment_status === "partial") return sum + m.rent_amount * 0.5;
    return sum;
  }, 0);
}
const PAID_STATUSES = /* @__PURE__ */ new Set(["confirmed", "checked_in", "checked_out"]);
function BookingRefundDialog({
  open,
  booking,
  mode,
  submitting,
  onClose,
  onConfirm
}) {
  const cur = normalizeMoneyCurrency(booking?.currency);
  const contractTotal = booking?.total_amount ?? 0;
  const rentCollected = reactExports.useMemo(() => {
    if (!booking) return 0;
    if (booking.amount_paid_upfront != null) return booking.amount_paid_upfront;
    return rentCollectedFromTimeline(buildBookingRentTimeline(booking));
  }, [booking]);
  const rentBasis = mode === "checkout" ? rentCollected > 0 ? rentCollected : contractTotal : contractTotal;
  const requiresRefund = booking ? PAID_STATUSES.has(booking.status) : false;
  const [refundText, setRefundText] = reactExports.useState("0");
  const [securityReturnText, setSecurityReturnText] = reactExports.useState("0");
  const securityAmount = booking ? bookingSecurityAmount(booking, cur) : null;
  const securityPaid = booking?.security_status === "paid";
  const showSecurityCheckout = mode === "checkout" && booking != null && isMonthlyBooking(booking) && securityAmount != null;
  reactExports.useEffect(() => {
    if (!open || !booking) return;
    if (!requiresRefund) {
      setRefundText("0");
    } else {
      setRefundText(mode === "cancel" ? String(rentBasis) : "0");
    }
    if (showSecurityCheckout && securityPaid) {
      setSecurityReturnText(String(securityAmount));
    } else {
      setSecurityReturnText("0");
    }
  }, [open, booking?.id, rentBasis, requiresRefund, mode, showSecurityCheckout, securityPaid, securityAmount]);
  const refundNum = Number(refundText);
  const securityReturnNum = Number(securityReturnText);
  const retained = reactExports.useMemo(() => {
    if (!Number.isFinite(refundNum)) return 0;
    return Math.max(0, Math.round((rentBasis - refundNum) * 100) / 100);
  }, [refundNum, rentBasis]);
  const securityKept = reactExports.useMemo(() => {
    if (!showSecurityCheckout || !securityPaid || securityAmount == null) return 0;
    if (!Number.isFinite(securityReturnNum)) return securityAmount;
    return Math.max(0, Math.round((securityAmount - securityReturnNum) * 100) / 100);
  }, [showSecurityCheckout, securityPaid, securityAmount, securityReturnNum]);
  const rentValid = Number.isFinite(refundNum) && refundNum >= 0 && refundNum <= rentBasis && (!requiresRefund || refundText.trim() !== "");
  const securityValid = !showSecurityCheckout || !securityPaid || securityAmount == null || Number.isFinite(securityReturnNum) && securityReturnNum >= 0 && securityReturnNum <= securityAmount && securityReturnText.trim() !== "";
  const valid = rentValid && securityValid;
  const title = mode === "cancel" ? "Cancel booking" : "Check out guest";
  const description = mode === "cancel" ? requiresRefund ? "Enter how much money you returned to the guest. The rest stays in your revenue." : "This booking was not paid yet. No refund is recorded." : requiresRefund ? rentCollected > 0 && rentCollected < contractTotal ? "Guest is leaving early. Refund is based on rent collected so far — not the full booking total. Enter how much rent you returned; the rest stays as your revenue." : "Guest is leaving early. Enter how much rent you returned. The rest counts as your revenue in Monthly Reports and Payments." : "Mark this stay as completed. No payment was collected.";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: description })
    ] }),
    booking && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-3 text-sm space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: booking.guest_name }),
        mode === "checkout" && rentCollected > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Rent collected: " }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground", children: formatMoney(rentCollected, cur) })
          ] }),
          contractTotal > rentCollected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Booking total ",
            formatMoney(contractTotal, cur),
            " (",
            booking.months,
            " month",
            booking.months === 1 ? "" : "s",
            ") — unpaid months are not part of checkout refund."
          ] }) : null
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          "Booking total:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground", children: formatMoney(contractTotal, cur) })
        ] })
      ] }),
      requiresRefund ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "amount-refunded", children: mode === "checkout" && rentCollected > 0 ? "Rent returned to guest" : "Amount returned to guest" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "amount-refunded",
              type: "text",
              inputMode: "decimal",
              value: refundText,
              onChange: (e) => setRefundText(e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: mode === "checkout" && rentCollected > 0 ? `Enter 0 to keep all ${formatMoney(rentCollected, cur)} collected rent. Max refund ${formatMoney(rentBasis, cur)}.` : "Enter 0 if you are keeping the full amount (no refund)." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Rent refunded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-rose-600", children: formatMoney(Math.max(0, refundNum), cur) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Rent kept (revenue)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-emerald-700", children: formatMoney(retained, cur) })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: mode === "cancel" ? "Cancelling will free the seat(s). No payment was collected." : "The seat(s) will be freed. No refund is recorded." }),
      showSecurityCheckout && securityAmount != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Security deposit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "On file for this guest" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: formatMoney(securityAmount, cur) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Status:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: SECURITY_STATUS_LABELS[booking.security_status ?? "not_paid"] ?? booking.security_status })
        ] }),
        securityPaid ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "security-returned", children: "Security returned to guest" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "security-returned",
                type: "text",
                inputMode: "decimal",
                value: securityReturnText,
                onChange: (e) => setSecurityReturnText(e.target.value)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Enter 0 if you are keeping the full security deposit." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Security returned" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-rose-600", children: formatMoney(Math.max(0, securityReturnNum), cur) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Security kept (revenue)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-emerald-700", children: formatMoney(securityKept, cur) })
            ] }),
            securityKept > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "col-span-2 text-xs text-muted-foreground", children: "Kept security counts as revenue in Monthly Reports for the checkout month." }) : null
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No security was marked as collected. Update the booking's security status on the detail page if you took a deposit at check-in." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, disabled: submitting, children: mode === "cancel" ? "Keep booking" : "Go back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: mode === "cancel" ? "destructive" : "default",
          disabled: !valid || submitting,
          onClick: () => {
            const rentRefunded = requiresRefund ? refundNum : 0;
            if (mode === "checkout" && showSecurityCheckout && securityPaid && securityAmount != null) {
              onConfirm(rentRefunded, { securityReturned: securityReturnNum });
            } else {
              onConfirm(rentRefunded);
            }
          },
          children: submitting ? mode === "cancel" ? "Cancelling…" : "Saving…" : mode === "cancel" ? "Cancel booking" : "Confirm checkout"
        }
      )
    ] })
  ] }) });
}
export {
  BookingRefundDialog as B,
  BookingsListSkeleton as a,
  BookingDetailSkeleton as b,
  buildBookingRentTimeline as c,
  rentCollectedFromTimeline as r
};
