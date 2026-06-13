import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle } from "./card-DCDRzI6q.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { C as Checkbox } from "./checkbox-Bd1q64ph.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-DUxjSukK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogDescription, d as DialogFooter } from "./dialog-SXOy8WpB.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { i as Route$1 } from "./router-CXpZMrmV.mjs";
import { a as useCreateManualBookingMutation, s as securityPerSeat, b as securityDepositForSeats } from "./security-deposit-CEf7jVFl.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { n as normalizeMoneyCurrency, f as formatMoney } from "./payments-CPHCHGiR.mjs";
import { a as useUpdateRoomMutation, b as useDeleteRoomMutation, f as ROOM_AMENITY_OPTIONS, g as RoomDetailSkeleton, e as RoomFormDialog, h as formatRoomStatus, i as ROOM_STATUS_OPTIONS, r as roomStatusStyles } from "./room-form-dialog-BrVFANVZ.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { u as useBookingsQuery } from "./useBookingsQuery-DUnY8M_b.mjs";
import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { r as roomKeys } from "./room.keys-BMDsz0NU.mjs";
import { A as ArrowLeft, w as Pencil, v as Trash2, B as BedDouble, L as LoaderCircle, a3 as Save, f as Users, W as Wallet, a4 as UserPlus, J as FileText, a5 as Banknote } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
import "./booking.keys-CTE8dzAR.mjs";
import "./resident.keys-DK2A-v-L.mjs";
import "./usePaymentsQuery-Blc2sag1.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "./skeleton-CoUJiN10.mjs";
import "../_libs/tailwind-merge.mjs";
async function getRoomApi(id) {
  const data = await apiFetch(`/api/v1/rooms/${encodeURIComponent(id)}`);
  if (!data.success || !data.room) {
    throw new Error("Invalid room response");
  }
  return data.room;
}
function useRoomQuery(id) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => getRoomApi(id),
    enabled: Boolean(id),
    staleTime: 0
  });
}
function todayIsoDate() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function ManualMemberDialog({ room, open, onOpenChange }) {
  const createManual = useCreateManualBookingMutation();
  const [guestName, setGuestName] = reactExports.useState("");
  const [guestPhone, setGuestPhone] = reactExports.useState("");
  const [guestEmail, setGuestEmail] = reactExports.useState("");
  const [stayUnit, setStayUnit] = reactExports.useState("month");
  const [seats, setSeats] = reactExports.useState("1");
  const [months, setMonths] = reactExports.useState("1");
  const [monthsToPay, setMonthsToPay] = reactExports.useState("1");
  const [nights, setNights] = reactExports.useState("4");
  const [nightlyRate, setNightlyRate] = reactExports.useState("1500");
  const [moveIn, setMoveIn] = reactExports.useState(() => todayIsoDate());
  const [notes, setNotes] = reactExports.useState("");
  const [useCustomPrice, setUseCustomPrice] = reactExports.useState(false);
  const [useCustomSecurity, setUseCustomSecurity] = reactExports.useState(false);
  const [totalInput, setTotalInput] = reactExports.useState("");
  const [securityInput, setSecurityInput] = reactExports.useState("");
  const [currency, setCurrency] = reactExports.useState("pkr");
  const seatsNum = Number.parseInt(seats, 10);
  const monthsNum = Number.parseInt(months, 10);
  const nightsNum = Number.parseInt(nights, 10);
  const nightlyRateNum = Number.parseFloat(nightlyRate);
  const monthlyUnitPrice = currency === "usd" ? room.price_per_night_usd ?? room.price_per_night : room.price_per_night_pkr ?? room.price_per_night;
  const isNightStay = stayUnit === "night";
  const listTotal = isNightStay ? Number.isFinite(seatsNum) && Number.isFinite(nightsNum) && Number.isFinite(nightlyRateNum) ? nightlyRateNum * seatsNum * nightsNum : 0 : Number.isFinite(seatsNum) && Number.isFinite(monthsNum) ? monthlyUnitPrice * seatsNum * monthsNum : 0;
  reactExports.useEffect(() => {
    if (!open) return;
    const today = todayIsoDate();
    if (moveIn < today) setMoveIn(today);
  }, [open, moveIn]);
  reactExports.useEffect(() => {
    if (!useCustomPrice) {
      setTotalInput(listTotal > 0 ? String(listTotal) : "");
    }
  }, [listTotal, useCustomPrice]);
  const parsedTotal = Number(totalInput);
  const parsedSecurity = Number(securityInput);
  const monthsToPayNum = Number.parseInt(monthsToPay, 10);
  const listSecurity = !isNightStay && Number.isFinite(seatsNum) ? securityDepositForSeats(seatsNum, currency) : 0;
  const chargeTotal = useCustomPrice && Number.isFinite(parsedTotal) ? parsedTotal : listTotal;
  const securityCharge = useCustomSecurity && Number.isFinite(parsedSecurity) ? parsedSecurity : listSecurity;
  const rentPayNow = isNightStay ? chargeTotal : monthsNum > 0 && Number.isFinite(monthsToPayNum) ? Math.round(chargeTotal / monthsNum * monthsToPayNum * 100) / 100 : 0;
  const payNowAmount = rentPayNow + (isNightStay ? 0 : securityCharge);
  reactExports.useEffect(() => {
    if (!useCustomSecurity && listSecurity > 0) {
      setSecurityInput(String(listSecurity));
    }
  }, [listSecurity, useCustomSecurity]);
  reactExports.useEffect(() => {
    if (!isNightStay) {
      setMonthsToPay((prev) => {
        const n = Number.parseInt(prev, 10);
        if (!Number.isFinite(monthsNum) || monthsNum < 1) return "1";
        return String(Math.min(Number.isFinite(n) ? n : 1, monthsNum));
      });
    }
  }, [monthsNum, isNightStay]);
  const canSubmit = guestName.trim().length > 0 && guestPhone.trim().length >= 5 && Number.isFinite(seatsNum) && seatsNum >= 1 && seatsNum <= room.beds_available && (isNightStay ? Number.isFinite(nightsNum) && nightsNum >= 1 && Number.isFinite(nightlyRateNum) && nightlyRateNum >= 0 : Number.isFinite(monthsNum) && monthsNum >= 1 && Number.isFinite(monthsToPayNum) && monthsToPayNum >= 1 && monthsToPayNum <= monthsNum) && moveIn.trim().length > 0 && moveIn >= todayIsoDate() && (!useCustomPrice || Number.isFinite(parsedTotal) && parsedTotal >= 0) && (isNightStay || !useCustomSecurity || Number.isFinite(parsedSecurity) && parsedSecurity >= 0);
  const resetForm = () => {
    setGuestName("");
    setGuestPhone("");
    setGuestEmail("");
    setStayUnit("month");
    setSeats("1");
    setMonths("1");
    setMonthsToPay("1");
    setNights("4");
    setNightlyRate("1500");
    setMoveIn(todayIsoDate());
    setNotes("");
    setUseCustomPrice(false);
    setUseCustomSecurity(false);
    setTotalInput("");
    setSecurityInput("");
    setCurrency("pkr");
  };
  const seatsHint = reactExports.useMemo(() => {
    if (room.beds_available <= 0) return "No seats free in this room.";
    return `${room.beds_available} seat(s) available`;
  }, [room.beds_available]);
  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    createManual.mutate(
      {
        room_id: room.id,
        guest_name: guestName.trim(),
        guest_phone: guestPhone.trim(),
        guest_email: guestEmail.trim() || void 0,
        seats_booked: seatsNum,
        stay_unit: stayUnit,
        ...isNightStay ? { nights: nightsNum, nightly_rate: nightlyRateNum } : { months: monthsNum, months_to_pay: monthsToPayNum },
        move_in: moveIn,
        notes: notes.trim() || void 0,
        currency,
        ...useCustomPrice && Number.isFinite(parsedTotal) ? { total_amount: parsedTotal } : {},
        ...!isNightStay && Number.isFinite(securityCharge) ? { security_amount: securityCharge } : {}
      },
      {
        onSuccess: () => {
          toast.success("Member added — room seats updated");
          resetForm();
          onOpenChange(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add member")
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onOpenChange: (next) => {
        if (!next) resetForm();
        onOpenChange(next);
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-5 w-5" }),
            "Add walk-in member"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
            "Register someone who took a seat manually in ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: room.title }),
            ". This creates a booking and reduces available seats."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "grid gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "manual-name", children: "Full name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "manual-name",
                value: guestName,
                onChange: (e) => setGuestName(e.target.value),
                placeholder: "Guest name",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "manual-phone", children: "Phone *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "manual-phone",
                  value: guestPhone,
                  onChange: (e) => setGuestPhone(e.target.value),
                  placeholder: "+92 300 1234567",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "manual-email", children: "Email (optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "manual-email",
                  type: "email",
                  value: guestEmail,
                  onChange: (e) => setGuestEmail(e.target.value),
                  placeholder: "guest@email.com"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stay type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stayUnit, onValueChange: (v) => setStayUnit(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "month", children: "Monthly member" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "night", children: "Short visitor (nightly)" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: isNightStay ? "Books the seat only for the number of nights — e.g. 4 nights at Rs 1,500/night." : "Monthly residents billed per seat per month." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "manual-seats", children: "Seats *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "manual-seats",
                  type: "number",
                  min: 1,
                  max: room.beds_available,
                  value: seats,
                  onChange: (e) => setSeats(e.target.value),
                  required: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: seatsHint })
            ] }),
            isNightStay ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "manual-nights", children: "Nights *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "manual-nights",
                    type: "number",
                    min: 1,
                    max: 60,
                    value: nights,
                    onChange: (e) => setNights(e.target.value),
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "manual-nightly-rate", children: "Rate / night *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "manual-nightly-rate",
                    type: "number",
                    min: 0,
                    step: 1,
                    value: nightlyRate,
                    onChange: (e) => setNightlyRate(e.target.value),
                    required: true
                  }
                )
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "manual-months", children: "Stay (months) *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "manual-months",
                    type: "number",
                    min: 1,
                    max: 24,
                    value: months,
                    onChange: (e) => setMonths(e.target.value),
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "manual-months-pay", children: "Paying now (months) *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "manual-months-pay",
                    type: "number",
                    min: 1,
                    max: monthsNum || 24,
                    value: monthsToPay,
                    onChange: (e) => setMonthsToPay(e.target.value),
                    required: true
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "manual-move-in", children: isNightStay ? "Check-in *" : "Move-in *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "manual-move-in",
                  type: "date",
                  min: todayIsoDate(),
                  value: moveIn,
                  onChange: (e) => setMoveIn(e.target.value),
                  required: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Today or a future date only." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "manual-notes", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                id: "manual-notes",
                rows: 2,
                value: notes,
                onChange: (e) => setNotes(e.target.value),
                placeholder: "Walk-in, paid cash, ID verified…"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border/60 bg-muted/40 px-3 py-3 space-y-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Charge currency" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: currency, onValueChange: (v) => setCurrency(v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pkr", children: "PKR (Rs)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "usd", children: "USD ($)" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Full stay: " }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: formatMoney(chargeTotal, currency) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                " ",
                isNightStay ? `(${formatMoney(nightlyRateNum, currency)} × seats × nights)` : `(${formatMoney(monthlyUnitPrice, currency)} × seats × months)`
              ] })
            ] }),
            !isNightStay && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Security deposit: " }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: formatMoney(securityCharge, currency) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                " ",
                "(",
                formatMoney(securityPerSeat(currency), currency),
                " × ",
                seatsNum,
                " seat · refundable)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Collect now: " }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-emerald-700", children: formatMoney(payNowAmount, currency) }),
              !isNightStay && monthsToPayNum < monthsNum && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                " ",
                "· ",
                formatMoney(chargeTotal - rentPayNow, currency),
                " rent due later"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  className: "h-4 w-4 rounded border-border",
                  checked: useCustomPrice,
                  onChange: (e) => {
                    setUseCustomPrice(e.target.checked);
                    if (e.target.checked && listTotal > 0) {
                      setTotalInput(String(listTotal));
                    }
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Use negotiated / manual price" })
            ] }),
            useCustomPrice ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "manual-total", className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-3.5 w-3.5" }),
                "Amount to charge *"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "manual-total",
                  type: "number",
                  min: 0,
                  step: 1,
                  value: totalInput,
                  onChange: (e) => setTotalInput(e.target.value),
                  required: true
                }
              ),
              Number.isFinite(parsedTotal) && listTotal > 0 && parsedTotal !== listTotal ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: parsedTotal < listTotal ? `Discount: ${formatMoney(listTotal - parsedTotal, currency)} (${((listTotal - parsedTotal) / listTotal * 100).toFixed(0)}% off list)` : `Above list by ${formatMoney(parsedTotal - listTotal, currency)}` }) : null
            ] }) : null,
            !isNightStay && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    className: "h-4 w-4 rounded border-border",
                    checked: useCustomSecurity,
                    onChange: (e) => {
                      setUseCustomSecurity(e.target.checked);
                      if (e.target.checked && listSecurity > 0) {
                        setSecurityInput(String(listSecurity));
                      }
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Use negotiated security deposit" })
              ] }),
              useCustomSecurity ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "manual-security", className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-3.5 w-3.5" }),
                  "Security to collect *"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "manual-security",
                    type: "number",
                    min: 0,
                    step: 1,
                    value: securityInput,
                    onChange: (e) => setSecurityInput(e.target.value),
                    required: true
                  }
                ),
                Number.isFinite(parsedSecurity) && listSecurity > 0 && parsedSecurity !== listSecurity ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: parsedSecurity < listSecurity ? `Below standard by ${formatMoney(listSecurity - parsedSecurity, currency)}` : `Above standard by ${formatMoney(parsedSecurity - listSecurity, currency)}` }) : null
              ] }) : null
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: !canSubmit || createManual.isPending || room.beds_available <= 0, children: createManual.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
              " Adding…"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
              " Add member"
            ] }) })
          ] })
        ] })
      ] })
    }
  );
}
function RoomStatusPicker({ status, onChange, disabled, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Select,
    {
      value: status,
      onValueChange: (value) => onChange(value),
      disabled,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SelectTrigger,
          {
            className: cn(
              "h-9 w-fit min-w-[9rem] gap-2 rounded-full border px-3 py-1 text-sm font-semibold capitalize shadow-none focus:ring-2",
              roomStatusStyles[status],
              className
            ),
            "aria-label": "Change room status",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { children: formatRoomStatus(status) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "z-[200]", children: ROOM_STATUS_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: option, className: "capitalize", children: formatRoomStatus(option) }, option)) })
      ]
    }
  );
}
function parsePositiveInt(value, fallback = 0) {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}
function RoomDetailPage() {
  const {
    id
  } = Route$1.useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = reactExports.useState(false);
  const [confirmDelete, setConfirmDelete] = reactExports.useState(false);
  const [addMemberOpen, setAddMemberOpen] = reactExports.useState(false);
  const [activeImage, setActiveImage] = reactExports.useState(0);
  const [priceUsd, setPriceUsd] = reactExports.useState("");
  const [pricePkr, setPricePkr] = reactExports.useState("");
  const [capacity, setCapacity] = reactExports.useState("");
  const [bedsTotal, setBedsTotal] = reactExports.useState("");
  const [bedsAvailable, setBedsAvailable] = reactExports.useState("");
  const [selectedAmenities, setSelectedAmenities] = reactExports.useState([]);
  const {
    data: room,
    isLoading,
    isError,
    error
  } = useRoomQuery(id);
  const updateRoom = useUpdateRoomMutation();
  const deleteRoom = useDeleteRoomMutation();
  reactExports.useEffect(() => {
    if (!room) return;
    setPriceUsd(String(room.price_per_night_usd ?? room.price_per_night));
    setPricePkr(String(room.price_per_night_pkr ?? room.price_per_night));
    setCapacity(String(room.capacity));
    setBedsTotal(String(room.beds_total));
    setBedsAvailable(String(room.beds_available));
    setSelectedAmenities(room.amenities ?? []);
  }, [room]);
  const amenityOptions = reactExports.useMemo(() => {
    const base = [...ROOM_AMENITY_OPTIONS];
    for (const a of selectedAmenities) {
      if (!base.includes(a)) base.push(a);
    }
    return base.sort((a, b) => a.localeCompare(b));
  }, [selectedAmenities]);
  const {
    data: bookingsData
  } = useBookingsQuery({
    room_id: id,
    limit: 100
  });
  const bookings = bookingsData?.bookings ?? [];
  const revenuePkr = bookings.filter((b) => b.status !== "cancelled" && normalizeMoneyCurrency(b.currency) === "pkr").reduce((s, b) => s + b.total_amount, 0);
  const revenueUsd = bookings.filter((b) => b.status !== "cancelled" && normalizeMoneyCurrency(b.currency) === "usd").reduce((s, b) => s + b.total_amount, 0);
  const parsed = reactExports.useMemo(() => {
    const priceUsdNum = Number(priceUsd);
    const pricePkrNum = Number(pricePkr);
    const capacityNum = parsePositiveInt(capacity, 0);
    const bedsTotalNum = parsePositiveInt(bedsTotal, 0);
    const bedsAvailableNum = parsePositiveInt(bedsAvailable, 0);
    return {
      priceUsdNum,
      pricePkrNum,
      capacityNum,
      bedsTotalNum,
      bedsAvailableNum
    };
  }, [priceUsd, pricePkr, capacity, bedsTotal, bedsAvailable]);
  const canSaveDetails = priceUsd.trim() !== "" && pricePkr.trim() !== "" && Number.isFinite(parsed.priceUsdNum) && parsed.priceUsdNum >= 0 && Number.isFinite(parsed.pricePkrNum) && parsed.pricePkrNum >= 0 && parsed.capacityNum >= 1 && parsed.bedsTotalNum >= 1 && parsed.bedsAvailableNum >= 0 && parsed.bedsAvailableNum <= parsed.bedsTotalNum;
  const detailsDirty = room && (String(room.price_per_night_usd ?? room.price_per_night) !== priceUsd || String(room.price_per_night_pkr ?? room.price_per_night) !== pricePkr || String(room.capacity) !== capacity || String(room.beds_total) !== bedsTotal || String(room.beds_available) !== bedsAvailable || JSON.stringify([...room.amenities ?? []].sort()) !== JSON.stringify([...selectedAmenities].sort()));
  function toggleAmenity(name, checked) {
    setSelectedAmenities((prev) => checked ? prev.includes(name) ? prev : [...prev, name] : prev.filter((a) => a !== name));
  }
  function handleStatusChange(status) {
    if (!room || status === room.status) return;
    updateRoom.mutate({
      id,
      draft: {
        status
      }
    }, {
      onSuccess: () => toast.success("Status updated"),
      onError: (e) => toast.error(e instanceof Error ? e.message : "Status update failed")
    });
  }
  function handleSaveDetails() {
    if (!room || !canSaveDetails) return;
    const patch = {
      price_per_night_usd: parsed.priceUsdNum,
      price_per_night_pkr: parsed.pricePkrNum,
      price_per_night: parsed.priceUsdNum,
      capacity: parsed.capacityNum,
      beds_total: parsed.bedsTotalNum,
      beds_available: parsed.bedsAvailableNum,
      amenities: selectedAmenities
    };
    updateRoom.mutate({
      id,
      draft: patch
    }, {
      onSuccess: (updated) => {
        setPriceUsd(String(updated.price_per_night_usd ?? updated.price_per_night));
        setPricePkr(String(updated.price_per_night_pkr ?? updated.price_per_night));
        setCapacity(String(updated.capacity));
        setBedsTotal(String(updated.beds_total));
        setBedsAvailable(String(updated.beds_available));
        setSelectedAmenities(updated.amenities ?? []);
        toast.success("Room details saved");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed")
    });
  }
  function handleUpdate(values) {
    updateRoom.mutate({
      id,
      draft: values
    }, {
      onSuccess: () => {
        toast.success("Room updated");
        setEditing(false);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed")
    });
  }
  function handleDelete() {
    deleteRoom.mutate(id, {
      onSuccess: () => {
        toast.success("Room deleted");
        navigate({
          to: "/admin/rooms"
        });
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed")
    });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RoomDetailSkeleton, {});
  }
  if (isError || !room) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-sm text-destructive", children: error instanceof Error ? error.message : "Room not found." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/rooms", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Back to rooms"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setEditing(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
          " Edit title & photos"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => setConfirmDelete(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
          " Delete"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden border-border/60 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video bg-muted", children: room.images?.[activeImage] ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: room.images[activeImage], alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BedDouble, { className: "h-16 w-16 text-muted-foreground/40" }) }) }),
        room.images?.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto p-3", children: room.images.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setActiveImage(i), className: `h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 ${i === activeImage ? "border-primary" : "border-transparent"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: "", className: "h-full w-full object-cover" }) }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-extrabold tracking-tight", children: room.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: room.category })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RoomStatusPicker, { status: room.status, onChange: handleStatusChange, disabled: updateRoom.isPending })
          ] }),
          room.badge && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "w-fit", children: room.badge }),
          room.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed text-muted-foreground", children: room.description })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Room details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Edit pricing, capacity, beds and amenities." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 border-b border-border/60 pb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Click the status to choose another." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RoomStatusPicker, { status: room.status, onChange: handleStatusChange, disabled: updateRoom.isPending })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "room-price-usd", children: "Price / seat / month (USD)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "room-price-usd", type: "text", inputMode: "decimal", value: priceUsd, onChange: (e) => setPriceUsd(e.target.value), placeholder: "e.g. 120" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "room-price-pkr", children: "Price / seat / month (PKR)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "room-price-pkr", type: "text", inputMode: "decimal", value: pricePkr, onChange: (e) => setPricePkr(e.target.value), placeholder: "e.g. 35000" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "room-capacity", children: "Capacity (guests)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "room-capacity", type: "text", inputMode: "numeric", value: capacity, onChange: (e) => setCapacity(e.target.value), placeholder: "e.g. 2" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "room-beds-total", children: "Total beds" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "room-beds-total", type: "text", inputMode: "numeric", value: bedsTotal, onChange: (e) => setBedsTotal(e.target.value), placeholder: "e.g. 2" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "room-beds-available", children: "Beds available" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "room-beds-available", type: "text", inputMode: "numeric", value: bedsAvailable, onChange: (e) => setBedsAvailable(e.target.value), placeholder: "e.g. 1" })
          ] }),
          !canSaveDetails && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Check values: price ≥ 0, capacity ≥ 1, total beds ≥ 1, and available beds ≤ total beds." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Amenities" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Select amenities to include on this room." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-52 space-y-2 overflow-y-auto rounded-lg border border-border/60 p-3", children: amenityOptions.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: selectedAmenities.includes(a), onCheckedChange: (c) => toggleAmenity(a, !!c) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: a })
            ] }, a)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full rounded-full font-semibold", onClick: handleSaveDetails, disabled: !canSaveDetails || !detailsDirty || updateRoom.isPending, children: updateRoom.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
            " Saving…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
            " Save details"
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center justify-between p-5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "inline h-3.5 w-3.5" }),
          " Total bookings"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: bookings.length })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center justify-between p-5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "inline h-3.5 w-3.5" }),
          " Revenue"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
          formatMoney(revenuePkr, "pkr"),
          " · ",
          formatMoney(revenueUsd, "usd")
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row flex-wrap items-start justify-between gap-3 space-y-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Booking history" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Walk-in guests and online bookings. Add members manually when someone takes a seat at the desk." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: () => setAddMemberOpen(true), disabled: room.beds_available <= 0, title: room.beds_available <= 0 ? "No seats available" : void 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
          "Add walk-in member"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Guest" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Dates" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Seats" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28 text-right", children: "Invoice" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: bookings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-10 text-center text-sm text-muted-foreground", children: "No bookings yet." }) }) : bookings.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/bookings/$id", params: {
              id: b.id
            }, className: "font-semibold hover:underline", children: b.guest_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: b.guest_email })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-sm", children: [
            b.move_in,
            " → ",
            b.check_out
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: b.seats_booked }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatMoney(b.total_amount, normalizeMoneyCurrency(b.currency)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "capitalize", children: b.status.replace("_", " ") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/bookings/$id", params: {
            id: b.id
          }, hash: "booking-invoice", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
            "Invoice"
          ] }) }) })
        ] }, b.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ManualMemberDialog, { room, open: addMemberOpen, onOpenChange: setAddMemberOpen }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RoomFormDialog, { open: editing, initial: room, onClose: () => setEditing(false), onSubmit: handleUpdate, submitting: updateRoom.isPending }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: confirmDelete, onOpenChange: setConfirmDelete, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
          "Delete ",
          room.title,
          "?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This action cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDelete, children: "Delete" })
      ] })
    ] }) })
  ] });
}
export {
  RoomDetailPage as component
};
