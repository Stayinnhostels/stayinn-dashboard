import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle, d as CardDescription } from "./card-DCDRzI6q.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { b as BookingDetailSkeleton, B as BookingRefundDialog, c as buildBookingRentTimeline, r as rentCollectedFromTimeline } from "./booking-refund-dialog-Bbxe9-Ie.mjs";
import { n as normalizeMoneyCurrency, f as formatMoney } from "./payments-CPHCHGiR.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { j as Route, u as useAuthStore } from "./router-CXpZMrmV.mjs";
import { u as useUpdateBookingStatusMutation, i as isMonthlyBooking$1, c as bookingSecurityAmount, d as useUpdateBookingPricingMutation, b as securityDepositForSeats, s as securityPerSeat } from "./security-deposit-CEf7jVFl.mjs";
import { u as useUpdateResidentMutation } from "./useUpdateResidentMutation-f_OBcXTE.mjs";
import { S as SECURITY_STATUS_LABELS, R as RENT_PAYMENT_STATUS_LABELS } from "./resident.types-DjDosJYK.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogDescription } from "./dialog-SXOy8WpB.mjs";
import { h as html2canvas } from "../_libs/html2canvas.mjs";
import { j as jspdf_node_minExports } from "../_libs/jspdf.mjs";
import { a as usePublicPropertySettingsQuery } from "./usePropertySettingsQuery-CjrVAvRT.mjs";
import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { b as bookingKeys } from "./booking.keys-CTE8dzAR.mjs";
import { A as ArrowLeft, J as FileText, x as CircleCheck, X, U as User, M as Mail, a7 as Phone, a5 as Banknote, j as Shield, L as LoaderCircle, C as CalendarCheck, a8 as Percent, b as Eye, a9 as Download, aa as MessageCircle } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "./skeleton-CoUJiN10.mjs";
import "./table-RrXKMtST.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
import "./resident.keys-DK2A-v-L.mjs";
import "./usePaymentsQuery-Blc2sag1.mjs";
import "./room.keys-BMDsz0NU.mjs";
import "./index-KZ9vj88m.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "path";
import "../_libs/fflate.mjs";
import "../_libs/fast-png.mjs";
import "../_libs/iobuffer.mjs";
import "../_libs/pako.mjs";
import "fs";
import "../_libs/dompurify.mjs";
import "../_libs/canvg.mjs";
import "../_libs/core-js.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/raf.mjs";
import "../_libs/performance-now.mjs";
import "../_libs/rgbcolor.mjs";
import "../_libs/svg-pathdata.mjs";
import "../_libs/stackblur-canvas.mjs";
async function getBookingApi(token, id) {
  const data = await apiFetch(`/api/v1/bookings/${encodeURIComponent(id)}`, { token });
  if (!data.success || !data.booking) {
    throw new Error("Invalid booking response");
  }
  return data.booking;
}
function useBookingQuery(id) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getBookingApi(token, id);
    },
    enabled: Boolean(token && id),
    staleTime: 0
  });
}
function normalizeLegacyNoteText(text, currency) {
  if (currency === "usd") {
    return text.replace(/₹\s*([\d,]+(?:\.\d+)?)/g, (_, raw) => {
      const n = Number(String(raw).replace(/,/g, ""));
      return Number.isFinite(n) ? formatMoney(n, "usd") : `$${raw}`;
    });
  }
  return text.replace(/₹\s*/g, "Rs ");
}
function parseBookingNotes(notes, currency) {
  if (!notes?.trim()) return { guestNote: null, events: [] };
  const cur = normalizeMoneyCurrency(currency);
  const lines = notes.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const guestParts = [];
  const events = [];
  for (const raw of lines) {
    const line = normalizeLegacyNoteText(raw, cur);
    const cancelled = line.match(/^\[Cancelled (\d{4}-\d{2}-\d{2})\]\s*(.+)$/i);
    const adjusted = line.match(/^\[Price adjusted (\d{4}-\d{2}-\d{2})\]\s*(.+)$/i);
    if (cancelled) {
      events.push({ kind: "cancelled", date: cancelled[1], text: cancelled[2] });
    } else if (adjusted) {
      events.push({ kind: "price_adjusted", date: adjusted[1], text: adjusted[2] });
    } else if (!/^\[/.test(line)) {
      guestParts.push(line);
    } else {
      events.push({ kind: "other", date: null, text: line });
    }
  }
  return {
    guestNote: guestParts.length > 0 ? guestParts.join("\n") : null,
    events
  };
}
function BookingNotesDisplay({ booking }) {
  const { guestNote, events } = parseBookingNotes(booking.notes, booking.currency);
  if (!guestNote && events.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-widest text-muted-foreground", children: "Notes" }),
    guestNote ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border/60 bg-muted/40 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Guest note" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 whitespace-pre-wrap text-sm", children: guestNote })
    ] }) : null,
    events.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Activity" }),
      events.map((ev, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: ev.kind === "cancelled" ? "font-semibold text-rose-600" : ev.kind === "price_adjusted" ? "font-semibold text-amber-700" : "font-semibold text-foreground",
            children: [
              ev.kind === "cancelled" ? "Cancelled" : ev.kind === "price_adjusted" ? "Price adjusted" : "Note",
              ev.date ? ` · ${ev.date}` : ""
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-muted-foreground", children: ev.text })
      ] }, i))
    ] }) : null
  ] });
}
const SECURITY_STATUS_OPTIONS = Object.keys(SECURITY_STATUS_LABELS);
const RENT_STATUS_OPTIONS = Object.keys(RENT_PAYMENT_STATUS_LABELS);
function isMonthlyBooking(booking) {
  return booking.stay_unit !== "night" && booking.months >= 1;
}
function BookingPricingCard({ booking }) {
  const updatePricing = useUpdateBookingPricingMutation();
  const updateSecurity = useUpdateResidentMutation();
  const cur = normalizeMoneyCurrency(booking.currency);
  const money = (n) => formatMoney(n, cur);
  const monthlyStay = isMonthlyBooking(booking);
  const quotedTotal = booking.total_amount;
  const seatMonths = booking.seats_booked * booking.months;
  const listSecurity = monthlyStay ? securityDepositForSeats(booking.seats_booked, cur) : 0;
  const storedSecurityAmount = booking.security_amount ?? listSecurity;
  const storedSecurityStatus = booking.security_status && booking.security_status !== "not_applicable" ? booking.security_status : "not_paid";
  const [totalInput, setTotalInput] = reactExports.useState(String(quotedTotal));
  const [pricePerSeatInput, setPricePerSeatInput] = reactExports.useState(String(booking.price_per_seat));
  const [customPercentInput, setCustomPercentInput] = reactExports.useState("");
  const [note, setNote] = reactExports.useState("");
  const [useCustomSecurity, setUseCustomSecurity] = reactExports.useState(false);
  const [securityInput, setSecurityInput] = reactExports.useState(String(storedSecurityAmount));
  const [securityStatus, setSecurityStatus] = reactExports.useState(storedSecurityStatus);
  const [collectMonths, setCollectMonths] = reactExports.useState("1");
  const rentTimeline = reactExports.useMemo(
    () => monthlyStay ? buildBookingRentTimeline(booking) : [],
    [monthlyStay, booking]
  );
  const rentCollected = booking.amount_paid_upfront ?? rentCollectedFromTimeline(rentTimeline);
  const rentDue = booking.amount_outstanding ?? Math.max(0, quotedTotal - rentCollected);
  reactExports.useEffect(() => {
    setTotalInput(String(booking.total_amount));
    setPricePerSeatInput(String(booking.price_per_seat));
    setCustomPercentInput("");
    setNote("");
  }, [booking.id, booking.total_amount, booking.price_per_seat]);
  reactExports.useEffect(() => {
    setSecurityInput(String(booking.security_amount ?? listSecurity));
    setSecurityStatus(
      booking.security_status && booking.security_status !== "not_applicable" ? booking.security_status : "not_paid"
    );
    setUseCustomSecurity(false);
  }, [booking.id, booking.security_amount, booking.security_status, listSecurity]);
  reactExports.useEffect(() => {
    const unpaid = rentTimeline.filter((m) => m.payment_status === "not_paid").length;
    const defaultMonths = unpaid > 0 ? unpaid : booking.months;
    setCollectMonths(String(Math.min(defaultMonths, rentTimeline.length || booking.months)));
  }, [booking.id, booking.months, rentTimeline]);
  const parsedTotal = Number(totalInput);
  const parsedPricePerSeat = Number(pricePerSeatInput);
  const parsedSecurity = Number(securityInput);
  const effectiveSecurity = useCustomSecurity && Number.isFinite(parsedSecurity) ? parsedSecurity : listSecurity;
  const discount = reactExports.useMemo(() => {
    if (!Number.isFinite(parsedTotal) || quotedTotal <= 0) return null;
    const saved = quotedTotal - parsedTotal;
    const pct = saved / quotedTotal * 100;
    return { saved, pct };
  }, [parsedTotal, quotedTotal]);
  const canSaveRent = booking.status !== "cancelled" && Number.isFinite(parsedTotal) && parsedTotal >= 0 && Number.isFinite(parsedPricePerSeat) && parsedPricePerSeat >= 0 && (parsedTotal !== quotedTotal || Math.round(parsedPricePerSeat * 100) !== Math.round(booking.price_per_seat * 100));
  const canSaveSecurity = monthlyStay && booking.status !== "cancelled" && effectiveSecurity >= 0 && (effectiveSecurity !== (booking.security_amount ?? listSecurity) || securityStatus !== storedSecurityStatus);
  function handleSaveRent(e) {
    e.preventDefault();
    if (!canSaveRent) return;
    updatePricing.mutate(
      {
        id: booking.id,
        input: {
          total_amount: parsedTotal,
          price_per_seat: parsedPricePerSeat,
          pricing_note: note.trim() || void 0
        }
      },
      {
        onSuccess: () => toast.success("Rent price updated"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed")
      }
    );
  }
  function handleMonthRentStatus(month, next) {
    updateSecurity.mutate(
      { bookingId: booking.id, input: { month, payment_status: next } },
      {
        onSuccess: () => toast.success(`Rent (${month}): ${RENT_PAYMENT_STATUS_LABELS[next]}`),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed")
      }
    );
  }
  function handleCollectRentMonths(e) {
    e.preventDefault();
    const count = Number(collectMonths);
    if (!Number.isFinite(count) || count < 1 || count > rentTimeline.length) {
      toast.error(`Choose between 1 and ${rentTimeline.length} months`);
      return;
    }
    updateSecurity.mutate(
      { bookingId: booking.id, input: { collect_rent_months: count } },
      {
        onSuccess: () => toast.success(
          count === 1 ? "Marked 1 month rent as collected" : `Marked ${count} months rent as collected`
        ),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed")
      }
    );
  }
  function handleSaveSecurity(e) {
    e.preventDefault();
    if (!canSaveSecurity) return;
    updateSecurity.mutate(
      {
        bookingId: booking.id,
        input: {
          security_amount: effectiveSecurity,
          security_status: securityStatus
        }
      },
      {
        onSuccess: () => toast.success("Security deposit updated"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed")
      }
    );
  }
  function applyDiscountPercent(percent) {
    const safe = Math.min(100, Math.max(0, percent));
    const next = Math.max(0, Math.round(quotedTotal * (1 - safe / 100)));
    setTotalInput(String(next));
    if (seatMonths > 0) {
      setPricePerSeatInput(String(Math.round(next / seatMonths * 100) / 100));
    }
  }
  function applyCustomPercent() {
    const pct = Number(customPercentInput);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      toast.error("Enter a discount between 0 and 100");
      return;
    }
    applyDiscountPercent(pct);
    toast.success(`Applied ${pct}% discount to quoted price`);
  }
  const customPercentNum = Number(customPercentInput);
  const customPercentValid = customPercentInput.trim() !== "" && Number.isFinite(customPercentNum) && customPercentNum >= 0 && customPercentNum <= 100;
  if (booking.status === "cancelled") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Pricing" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Cancelled bookings cannot be repriced." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-4 w-4" }),
        "Check-in collection"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Adjust rent if negotiated at the desk." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
      monthlyStay && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveSecurity, className: "space-y-4 rounded-lg border-2 border-primary/25 bg-primary/5 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-primary" }),
          "Security deposit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Standard ",
          money(securityPerSeat(cur)),
          " per seat — ",
          money(listSecurity),
          " for",
          " ",
          booking.seats_booked,
          " seat(s)."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Security status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: securityStatus,
                onValueChange: (v) => setSecurityStatus(v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SECURITY_STATUS_OPTIONS.filter((k) => k !== "not_applicable").map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: SECURITY_STATUS_LABELS[k] }, k)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Security amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 0,
                step: 1,
                value: useCustomSecurity ? securityInput : String(listSecurity),
                onChange: (e) => setSecurityInput(e.target.value),
                disabled: !useCustomSecurity
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              className: "h-4 w-4 rounded border-border",
              checked: useCustomSecurity,
              onChange: (e) => {
                setUseCustomSecurity(e.target.checked);
                if (e.target.checked) setSecurityInput(String(storedSecurityAmount));
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Negotiated security (lower or higher than standard)" })
        ] }),
        useCustomSecurity && Number.isFinite(parsedSecurity) && parsedSecurity !== listSecurity ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: parsedSecurity < listSecurity ? `Below standard by ${money(listSecurity - parsedSecurity)}` : `Above standard by ${money(parsedSecurity - listSecurity)}` }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "default", disabled: !canSaveSecurity || updateSecurity.isPending, children: updateSecurity.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          " Saving security…"
        ] }) : "Save security deposit" })
      ] }),
      monthlyStay && rentTimeline.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "h-4 w-4 text-emerald-700 dark:text-emerald-400" }),
          "Rent collection"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Mark each month here or collect several months at once." }),
        booking.months_paid_upfront != null && booking.months > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Online commitment: ",
          booking.months_paid_upfront,
          " of ",
          booking.months,
          " month(s) upfront."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border/60 bg-background/80 p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Collected: " }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-emerald-700 dark:text-emerald-400", children: money(rentCollected) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Still due: " }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: money(rentDue) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: rentTimeline.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: row.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: money(row.rent_amount) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: row.payment_status,
                  onValueChange: (v) => handleMonthRentStatus(row.month, v),
                  disabled: updateSecurity.isPending,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[130px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: RENT_STATUS_OPTIONS.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: RENT_PAYMENT_STATUS_LABELS[k] }, k)) })
                  ]
                }
              )
            ]
          },
          row.month
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleCollectRentMonths, className: "space-y-3 border-t border-border/60 pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "collect-rent-months", children: "Collect rent for" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: collectMonths, onValueChange: setCollectMonths, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "collect-rent-months", className: "w-[88px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: rentTimeline.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(i + 1), children: i + 1 }, i + 1)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "pb-2 text-sm text-muted-foreground", children: [
            "month",
            Number(collectMonths) === 1 ? "" : "s",
            " (from move-in)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "secondary", disabled: updateSecurity.isPending, children: updateSecurity.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
            " Saving…"
          ] }) : "Mark collected" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveRent, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Monthly rent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border/60 bg-muted/30 p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Quoted online: " }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: money(quotedTotal) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-muted-foreground", children: [
            booking.seats_booked,
            " seat(s) × ",
            booking.months,
            " month(s) @ ",
            money(booking.price_per_seat),
            "/seat/mo"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "booking-total", children: "Final rent total *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "booking-total",
                type: "number",
                min: 0,
                step: 1,
                value: totalInput,
                onChange: (e) => {
                  setTotalInput(e.target.value);
                  const t = Number(e.target.value);
                  if (Number.isFinite(t) && seatMonths > 0) {
                    setPricePerSeatInput(String(Math.round(t / seatMonths * 100) / 100));
                  }
                },
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "booking-pps", children: "Price per seat / month" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "booking-pps",
                type: "number",
                min: 0,
                step: 1,
                value: pricePerSeatInput,
                onChange: (e) => {
                  setPricePerSeatInput(e.target.value);
                  const p = Number(e.target.value);
                  if (Number.isFinite(p) && seatMonths > 0) {
                    setTotalInput(String(Math.round(p * seatMonths)));
                  }
                }
              }
            )
          ] })
        ] }),
        discount && parsedTotal !== quotedTotal ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-4 w-4" }),
          "Discount: ",
          money(Math.max(0, discount.saved)),
          " (",
          discount.pct.toFixed(1),
          "% off quoted price)"
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "Quick discount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => applyDiscountPercent(5), children: "−5%" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => applyDiscountPercent(10), children: "−10%" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => applyDiscountPercent(15), children: "−15%" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setTotalInput(String(quotedTotal)), children: "Reset to quoted" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "custom-discount-pct", children: "Custom discount (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "custom-discount-pct",
                type: "number",
                min: 0,
                max: 100,
                step: 0.5,
                placeholder: "e.g. 12",
                value: customPercentInput,
                onChange: (e) => setCustomPercentInput(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyCustomPercent();
                  }
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Percent off the quoted total (",
              money(quotedTotal),
              "). 100% = free."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "secondary",
              className: "sm:mb-6",
              disabled: !customPercentValid,
              onClick: applyCustomPercent,
              children: "Apply %"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pricing-note", children: "Reason (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: "pricing-note",
              rows: 2,
              value: note,
              onChange: (e) => setNote(e.target.value),
              placeholder: "Negotiated at front desk, long-stay discount…"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: !canSaveRent || updatePricing.isPending, children: updatePricing.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          " Saving…"
        ] }) : "Save adjusted rent" })
      ] })
    ] })
  ] });
}
const BookingInvoiceDocument = reactExports.forwardRef(function BookingInvoiceDocument2({ data, className = "" }, ref) {
  const { property, booking } = data;
  const money = (n) => formatMoney(n, normalizeMoneyCurrency(booking.currency));
  const { guestNote, events } = parseBookingNotes(data.notes, booking.currency);
  const addressLine = [property.address, property.city, property.country].filter(Boolean).join(", ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref,
      className,
      style: {
        backgroundColor: "#ffffff",
        color: "#000000",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "11pt",
        lineHeight: 1.45,
        width: "210mm",
        minHeight: "297mm",
        padding: "14mm 16mm",
        boxSizing: "border-box"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { style: { borderBottom: "2px solid #000000", paddingBottom: "12px", marginBottom: "20px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "h1",
                {
                  style: {
                    margin: 0,
                    fontSize: "22pt",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    color: "#000000"
                  },
                  children: property.hotelName
                }
              ),
              property.tagline ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "4px 0 0", fontSize: "10pt", color: "#000000" }, children: property.tagline }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right", fontSize: "10pt", color: "#000000" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontWeight: 700, fontSize: "20pt", letterSpacing: "0.12em" }, children: "INVOICE" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "8px 0 0" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "No." }),
                " ",
                data.invoiceNumber
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                marginTop: "14px",
                fontSize: "9.5pt",
                color: "#000000"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  addressLine ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 4px" }, children: addressLine }) : null,
                  property.phone ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "0 0 4px" }, children: [
                    "Tel: ",
                    property.phone
                  ] }) : null,
                  property.email ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: 0 }, children: [
                    "Email: ",
                    property.email
                  ] }) : null
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "0 0 4px" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Issue date:" }),
                    " ",
                    data.issueDate
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "0 0 4px" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Due date:" }),
                    " ",
                    data.dueDate
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Booking ref:" }),
                    " ",
                    data.bookingReference
                  ] })
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { style: { display: "flex", gap: "24px", marginBottom: "24px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                style: {
                  margin: "0 0 8px",
                  fontSize: "8pt",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#000000"
                },
                children: "Bill to"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 4px", fontWeight: 700, fontSize: "12pt", color: "#000000" }, children: booking.guest_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 4px", color: "#000000" }, children: booking.guest_email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, color: "#000000" }, children: booking.guest_phone })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                style: {
                  margin: "0 0 8px",
                  fontSize: "8pt",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#000000"
                },
                children: "Booking details"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("table", { style: { width: "100%", fontSize: "9.5pt", color: "#000000", borderCollapse: "collapse" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Room", value: booking.room_title ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Move-in", value: booking.move_in ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Check-out", value: booking.check_out ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Seats", value: String(booking.seats_booked) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Duration", value: `${booking.months} month(s)` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Status", value: booking.status.replace(/_/g, " ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Source", value: booking.source })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "table",
          {
            style: {
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "20px",
              fontSize: "9.5pt",
              color: "#000000"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: "2px solid #000000", borderBottom: "1px solid #000000" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Description" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...thStyle, width: "18%", textAlign: "center" }, children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...thStyle, width: "18%", textAlign: "right" }, children: "Rate" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { ...thStyle, width: "18%", textAlign: "right" }, children: "Amount" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: data.lineItems.map((line, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #000000" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: tdStyle, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: line.description }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "8.5pt" }, children: line.detail })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle, textAlign: "center" }, children: line.quantity }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle, textAlign: "right" }, children: line.unitPrice }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle, textAlign: "right", fontWeight: 700 }, children: money(line.amount) })
              ] }, i)) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: "24px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { style: { width: "42%", borderCollapse: "collapse", fontSize: "10pt", color: "#000000" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "6px 0", borderBottom: "1px solid #000000" }, children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "6px 0", borderBottom: "1px solid #000000", textAlign: "right" }, children: money(data.subtotal) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 0", fontWeight: 700, fontSize: "12pt" }, children: "Total due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 0", fontWeight: 700, fontSize: "12pt", textAlign: "right" }, children: money(data.total) })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "0 0 20px", fontSize: "9.5pt", fontStyle: "italic", color: "#000000" }, children: [
          "Amount in words: ",
          data.amountInWords
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "section",
          {
            style: {
              borderTop: "1px solid #000000",
              paddingTop: "14px",
              fontSize: "9pt",
              color: "#000000"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 8px", fontWeight: 700 }, children: "Payment & terms" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "0 0 6px" }, children: [
                "Payment is collected offline as per your booking agreement. This invoice is for your records and seat reservation at ",
                property.hotelName,
                ". Please quote booking reference ",
                data.bookingReference,
                " in all correspondence."
              ] }),
              guestNote || events.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { margin: "8px 0 0" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Notes:" }),
                guestNote ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "4px 0 0" }, children: guestNote }) : null,
                events.map((ev, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "4px 0 0", fontSize: "8.5pt" }, children: [
                  ev.kind === "cancelled" ? "Cancelled" : ev.kind === "price_adjusted" ? "Price adjusted" : "Note",
                  ev.date ? ` (${ev.date})` : "",
                  ": ",
                  ev.text
                ] }, i))
              ] }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "20px 0 0", fontSize: "8.5pt", color: "#000000" }, children: [
                "Booking ID: ",
                booking.id,
                " · Generated ",
                (/* @__PURE__ */ new Date()).toLocaleString("en-US")
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "footer",
          {
            style: {
              marginTop: "32px",
              paddingTop: "12px",
              borderTop: "2px solid #000000",
              textAlign: "center",
              fontSize: "9pt",
              color: "#000000"
            },
            children: "Thank you for your business."
          }
        )
      ]
    }
  );
});
const thStyle = {
  padding: "8px 6px",
  textAlign: "left",
  fontWeight: 700,
  fontSize: "8pt",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#000000"
};
const tdStyle = {
  padding: "10px 6px",
  verticalAlign: "top",
  color: "#000000"
};
function Row({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "2px 8px 2px 0", fontWeight: 600, width: "38%", color: "#000000" }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "2px 0", color: "#000000" }, children: value })
  ] });
}
function formatInvoiceAmount(amount, booking) {
  return formatMoney(amount, normalizeMoneyCurrency(booking.currency));
}
function formatDisplayDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}
function invoiceNumberFromBookingId(id) {
  return `INV-${id.replace(/[^a-zA-Z0-9]/g, "").slice(-10).toUpperCase()}`;
}
function bookingReferenceFromId(id) {
  return `BK-${id.slice(-8).toUpperCase()}`;
}
const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen"
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
function under1000(num) {
  if (num === 0) return "";
  if (num < 20) return ONES[num];
  if (num < 100) return `${TENS[Math.floor(num / 10)]}${num % 10 ? ` ${ONES[num % 10]}` : ""}`.trim();
  return `${ONES[Math.floor(num / 100)]} Hundred${num % 100 ? ` ${under1000(num % 100)}` : ""}`.trim();
}
function convertEnglish(num) {
  if (num < 1e3) return under1000(num);
  if (num < 1e6) {
    return `${under1000(Math.floor(num / 1e3))} Thousand${num % 1e3 ? ` ${under1000(num % 1e3)}` : ""}`.trim();
  }
  return `${under1000(Math.floor(num / 1e6))} Million${num % 1e6 ? ` ${convertEnglish(num % 1e6)}` : ""}`.trim();
}
function amountInWords(amount, currency) {
  if (!Number.isFinite(amount) || amount < 0) return "";
  const n = Math.round(amount);
  if (n === 0) return currency === "usd" ? "Zero US Dollars Only" : "Zero Rupees Only";
  const words = convertEnglish(n);
  return currency === "usd" ? `${words} US Dollars Only` : `${words} Rupees Only`;
}
function buildBookingInvoice(booking, property) {
  const cur = normalizeMoneyCurrency(booking.currency);
  const issueDate = booking.created_at ? formatDisplayDate(booking.created_at) : formatDisplayDate((/* @__PURE__ */ new Date()).toISOString());
  const roomLabel = booking.room_title ?? "Hostel accommodation";
  const lineDetail = `${booking.seats_booked} seat(s) × ${booking.months} month(s) · Move-in ${formatDisplayDate(booking.move_in)} · Check-out ${formatDisplayDate(booking.check_out)}`;
  const lineItems = [
    {
      description: `Seat booking — ${roomLabel}`,
      detail: lineDetail,
      quantity: `${booking.seats_booked * booking.months} seat-month(s)`,
      unitPrice: formatInvoiceAmount(booking.price_per_seat, booking),
      amount: booking.total_amount
    }
  ];
  return {
    booking,
    property,
    invoiceNumber: invoiceNumberFromBookingId(booking.id),
    bookingReference: bookingReferenceFromId(booking.id),
    issueDate,
    dueDate: formatDisplayDate(booking.move_in),
    lineItems,
    subtotal: booking.total_amount,
    total: booking.total_amount,
    amountInWords: amountInWords(booking.total_amount, cur),
    notes: booking.notes
  };
}
function buildInvoiceWhatsAppMessage(data) {
  const { booking, property, invoiceNumber, bookingReference, total } = data;
  return [
    `Hello ${booking.guest_name},`,
    ``,
    `Please find your invoice from ${property.hotelName}.`,
    `Invoice: ${invoiceNumber}`,
    `Booking ref: ${bookingReference}`,
    `Room: ${booking.room_title ?? "Hostel seat"}`,
    `Period: ${formatDisplayDate(booking.move_in)} to ${formatDisplayDate(booking.check_out)}`,
    `Amount due: ${formatInvoiceAmount(total, booking)}`,
    ``,
    `We will share the PDF invoice document in this chat. Thank you for choosing ${property.hotelName}.`
  ].join("\n");
}
function guestWhatsAppUrl(phone, message) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
const UNSUPPORTED_COLOR = /\boklch\s*\(|\blab\s*\(|\blch\s*\(/i;
function stripClassNames(root) {
  root.className = "";
  root.querySelectorAll("[class]").forEach((node) => {
    if (node instanceof HTMLElement) node.className = "";
  });
}
function sanitizeClonedStyles(clonedDoc, root) {
  clonedDoc.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => node.remove());
  const all = [root, ...Array.from(root.querySelectorAll("*"))];
  for (const node of all) {
    if (!(node instanceof HTMLElement)) continue;
    node.className = "";
    const color = node.style.color;
    const bg = node.style.backgroundColor;
    const border = node.style.borderColor;
    if (UNSUPPORTED_COLOR.test(color)) node.style.color = "#000000";
    if (UNSUPPORTED_COLOR.test(bg)) node.style.backgroundColor = "transparent";
    if (UNSUPPORTED_COLOR.test(border)) node.style.borderColor = "#000000";
  }
}
async function downloadInvoicePdf(element, filename) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;visibility:hidden";
  document.body.appendChild(iframe);
  const iframeDoc = iframe.contentDocument;
  const iframeWin = iframe.contentWindow;
  if (!iframeDoc || !iframeWin) {
    document.body.removeChild(iframe);
    throw new Error("Could not create PDF render frame");
  }
  iframeDoc.open();
  iframeDoc.write(
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#ffffff"></body></html>'
  );
  iframeDoc.close();
  const clone = element.cloneNode(true);
  stripClassNames(clone);
  iframeDoc.body.appendChild(clone);
  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
      onclone: (clonedDoc, clonedElement) => {
        sanitizeClonedStyles(clonedDoc, clonedElement);
      }
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jspdf_node_minExports.jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const imgHeight = canvas.height * contentWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = margin;
    pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
    }
    pdf.save(filename);
  } finally {
    document.body.removeChild(iframe);
  }
}
const PROPERTY_INVOICE_DEFAULTS = {
  hotelName: "Stay Inn Hostels",
  tagline: "Your home away from home",
  email: "info@stayinnhostels.com",
  phone: "+92 331 0008196",
  address: "Lahore",
  city: "Punjab",
  country: "Pakistan"
};
function toInvoicePropertySettings(settings) {
  if (!settings) return PROPERTY_INVOICE_DEFAULTS;
  return {
    hotelName: settings.hotelName ?? PROPERTY_INVOICE_DEFAULTS.hotelName,
    tagline: settings.tagline ?? PROPERTY_INVOICE_DEFAULTS.tagline,
    email: settings.email ?? PROPERTY_INVOICE_DEFAULTS.email,
    phone: settings.phone ?? PROPERTY_INVOICE_DEFAULTS.phone,
    address: settings.address ?? PROPERTY_INVOICE_DEFAULTS.address,
    city: settings.city ?? PROPERTY_INVOICE_DEFAULTS.city,
    country: settings.country ?? PROPERTY_INVOICE_DEFAULTS.country
  };
}
function BookingInvoicePanel({ booking }) {
  const invoiceRef = reactExports.useRef(null);
  const [previewOpen, setPreviewOpen] = reactExports.useState(false);
  const [downloading, setDownloading] = reactExports.useState(false);
  const { data: propertySettings } = usePublicPropertySettingsQuery();
  const invoiceData = reactExports.useMemo(() => {
    const property = toInvoicePropertySettings(propertySettings);
    return buildBookingInvoice(booking, property);
  }, [booking, propertySettings]);
  const whatsappMessage = reactExports.useMemo(() => buildInvoiceWhatsAppMessage(invoiceData), [invoiceData]);
  const guestWaUrl = reactExports.useMemo(
    () => guestWhatsAppUrl(booking.guest_phone, whatsappMessage),
    [booking.guest_phone, whatsappMessage]
  );
  async function handleDownload() {
    const el = invoiceRef.current;
    if (!el) {
      toast.error("Invoice preview is not ready");
      return;
    }
    setDownloading(true);
    try {
      await downloadInvoicePdf(el, `${invoiceData.invoiceNumber}.pdf`);
      toast.success("Invoice downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate PDF");
    } finally {
      setDownloading(false);
    }
  }
  function openWhatsApp() {
    if (!guestWaUrl) {
      toast.error("Guest phone number is missing or invalid");
      return;
    }
    window.open(guestWaUrl, "_blank", "noopener,noreferrer");
    toast.message("WhatsApp opened — attach the downloaded PDF and send");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-foreground/80 shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
          "Invoice / Bill"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Generate a black & white invoice for this booking." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border/60 bg-muted/30 p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: invoiceData.invoiceNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
            invoiceData.bookingReference,
            " · Total",
            " ",
            formatMoney(invoiceData.total, normalizeMoneyCurrency(booking.currency))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", onClick: () => setPreviewOpen(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
            "Preview invoice"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: () => void handleDownload(), disabled: downloading, children: [
            downloading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
            "Download PDF"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "secondary", onClick: openWhatsApp, disabled: !guestWaUrl, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
            "Open guest WhatsApp"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        id: "invoice-pdf-export-root",
        "aria-hidden": true,
        style: { position: "fixed", left: "-10000px", top: 0, opacity: 0, pointerEvents: "none" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookingInvoiceDocument, { ref: invoiceRef, data: invoiceData })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: previewOpen, onOpenChange: setPreviewOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] max-w-4xl overflow-y-auto bg-white p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "border-b border-black/10 px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-black", children: "Invoice preview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-black/70", children: [
          invoiceData.invoiceNumber,
          " — white background, black text only"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center bg-neutral-100 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookingInvoiceDocument, { data: invoiceData }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-end gap-2 border-t border-black/10 px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", onClick: () => void handleDownload(), disabled: downloading, children: [
          downloading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
          "Download PDF"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "secondary", onClick: openWhatsApp, disabled: !guestWaUrl, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
          "WhatsApp guest"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", onClick: () => setPreviewOpen(false), children: "Close" })
      ] })
    ] }) })
  ] });
}
const STATUSES = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];
function BookingDetailPage() {
  const {
    id
  } = Route.useParams();
  const navigate = useNavigate();
  const {
    data: booking,
    isLoading,
    isError,
    error
  } = useBookingQuery(id);
  const updateStatus = useUpdateBookingStatusMutation();
  const [cancelOpen, setCancelOpen] = reactExports.useState(false);
  const [checkoutOpen, setCheckoutOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (isLoading || !booking) return;
    if (typeof window !== "undefined" && window.location.hash === "#booking-invoice") {
      window.setTimeout(() => {
        document.getElementById("booking-invoice")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 300);
    }
  }, [booking?.id, isLoading]);
  function applyStatus(status, amountRefunded, checkoutExtras) {
    updateStatus.mutate({
      id,
      status,
      amount_refunded: amountRefunded,
      ...status === "checked_out" && checkoutExtras && booking?.security_status === "paid" ? {
        security_returned: checkoutExtras.securityReturned
      } : {}
    }, {
      onSuccess: () => {
        toast.success(status === "cancelled" ? "Booking cancelled" : status === "checked_out" ? "Guest checked out" : "Booking updated");
        setCancelOpen(false);
        setCheckoutOpen(false);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed")
    });
  }
  function onStatusChange(status) {
    if (!booking || status === booking.status) return;
    if (status === "cancelled") {
      setCancelOpen(true);
      return;
    }
    if (status === "checked_out") {
      setCheckoutOpen(true);
      return;
    }
    applyStatus(status);
  }
  function onCancelConfirm(amountRefunded) {
    applyStatus("cancelled", amountRefunded);
  }
  function onCheckoutConfirm(amountRefunded, checkoutExtras) {
    applyStatus("checked_out", amountRefunded, checkoutExtras);
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(BookingDetailSkeleton, {});
  }
  const cur = booking ? normalizeMoneyCurrency(booking.currency) : "pkr";
  const isMonthlyStay = booking ? isMonthlyBooking$1(booking) : false;
  const securityAmount = booking ? bookingSecurityAmount(booking, cur) : null;
  if (isError || !booking) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-sm text-muted-foreground", children: error instanceof Error ? error.message : "Booking not found." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => navigate({
        to: "/admin/bookings"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Back to bookings"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "default", onClick: () => document.getElementById("booking-invoice")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
          " Invoice / Bill"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => onStatusChange("confirmed"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
          " Confirm"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCheckoutOpen(true), children: "Mark completed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => onStatusChange("cancelled"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          " Cancel"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BookingRefundDialog, { open: cancelOpen, booking: booking ?? null, mode: "cancel", submitting: updateStatus.isPending, onClose: () => setCancelOpen(false), onConfirm: onCancelConfirm }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BookingRefundDialog, { open: checkoutOpen, booking: booking ?? null, mode: "checkout", submitting: updateStatus.isPending, onClose: () => setCheckoutOpen(false), onConfirm: onCheckoutConfirm }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
              "Booking #",
              booking.id.slice(-6)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              "Created ",
              booking.created_at ? new Date(booking.created_at).toLocaleString() : "—"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: booking.status.replace("_", " ") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Guest name", value: booking.guest_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Guest email", value: booking.guest_email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Phone", value: booking.guest_phone || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Move-in", value: booking.move_in ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Check-out", value: booking.check_out ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Seats booked", value: String(booking.seats_booked) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Months", value: String(booking.months) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Price per seat / month", value: formatMoney(booking.price_per_seat, normalizeMoneyCurrency(booking.currency)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Source", value: booking.source }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Rent total", value: formatMoney(booking.total_amount, normalizeMoneyCurrency(booking.currency)) }),
          isMonthlyStay && securityAmount != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Security deposit", value: formatMoney(securityAmount, normalizeMoneyCurrency(booking.currency)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Security status", value: SECURITY_STATUS_LABELS[booking.security_status ?? "not_paid"] })
          ] }),
          isMonthlyStay && booking.months_paid_upfront != null && booking.months > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Rent months committed upfront", value: `${booking.months_paid_upfront} of ${booking.months}` }),
          booking.amount_paid_upfront != null && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Rent collected so far", value: formatMoney(booking.amount_paid_upfront, normalizeMoneyCurrency(booking.currency)) }),
          booking.amount_outstanding != null && booking.amount_outstanding > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Rent still due", value: formatMoney(booking.amount_outstanding, normalizeMoneyCurrency(booking.currency)) }),
          isMonthlyStay && securityAmount != null && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Est. due at check-in", value: formatMoney((booking.months > 0 ? Math.round(booking.total_amount / booking.months * (booking.months_paid_upfront ?? 1) * 100) / 100 : 0) + (booking.security_status === "paid" ? 0 : securityAmount), normalizeMoneyCurrency(booking.currency)) }),
          (booking.status === "cancelled" || booking.status === "checked_out") && (booking.amount_refunded != null || booking.amount_retained != null) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Rent refunded to guest", value: formatMoney(booking.amount_refunded ?? 0, normalizeMoneyCurrency(booking.currency)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Rent kept (revenue)", value: formatMoney(booking.amount_retained ?? 0, normalizeMoneyCurrency(booking.currency)) })
          ] }),
          booking.status === "checked_out" && (booking.security_returned != null || booking.security_retained != null) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Security returned to guest", value: formatMoney(booking.security_returned ?? 0, normalizeMoneyCurrency(booking.currency)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Security kept (revenue)", value: formatMoney(booking.security_retained ?? 0, normalizeMoneyCurrency(booking.currency)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-widest text-muted-foreground", children: "Change status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: booking.status, onValueChange: (v) => onStatusChange(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s.replace("_", " ") }, s)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookingNotesDisplay, { booking })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1", children: [
        booking.room_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Room" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/rooms/$id", params: {
              id: booking.room_id
            }, className: "font-bold hover:underline", children: booking.room_title ?? "View room" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              booking.seats_booked,
              " seat(s) · ",
              booking.months,
              " month(s)"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookingPricingCard, { booking }),
        booking.user_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Customer" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/users/$id", params: {
                id: booking.user_id
              }, className: "font-semibold hover:underline", children: "View profile" })
            ] }),
            booking.guest_email && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              " ",
              booking.guest_email
            ] }),
            booking.guest_phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              " ",
              booking.guest_phone
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "booking-invoice", className: "scroll-mt-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookingInvoicePanel, { booking }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Activity timeline" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "relative space-y-4 border-l border-border pl-6 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TimelineItem, { label: "Booking created", at: booking.created_at }),
        booking.updated_at && booking.updated_at !== booking.created_at && /* @__PURE__ */ jsxRuntimeExports.jsx(TimelineItem, { label: `Status: ${booking.status.replace("_", " ")}`, at: booking.updated_at })
      ] }) })
    ] })
  ] });
}
function Field({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-medium", children: value })
  ] });
}
function TimelineItem({
  label,
  at
}) {
  if (!at) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: new Date(at).toLocaleString() })
  ] });
}
export {
  BookingDetailPage as component
};
