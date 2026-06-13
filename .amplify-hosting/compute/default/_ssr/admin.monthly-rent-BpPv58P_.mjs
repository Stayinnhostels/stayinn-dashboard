import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./card-DCDRzI6q.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-SXOy8WpB.mjs";
import { D as DropdownMenu, b as DropdownMenuTrigger, c as DropdownMenuContent, f as DropdownMenuItem, S as Sheet, a as SheetContent, g as SheetHeader, h as SheetTitle } from "./dropdown-menu-BrxGPZXz.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-fMRf3trd.mjs";
import { M as MonthlyRentTableSkeleton } from "./admin-page-skeletons-NTMVG02X.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useAuthStore, g as getApiBaseUrl } from "./router-CXpZMrmV.mjs";
import { u as useSyncedMonthFilter, M as MonthFilterSelect, f as filenameFromContentDisposition, t as triggerBrowserDownload } from "./month-filter-select-Dciee0fl.mjs";
import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { g as getResidentsRegisterApi, a as getResidentDetailApi } from "./index-KZ9vj88m.mjs";
import { r as residentKeys } from "./resident.keys-DK2A-v-L.mjs";
import { f as formatMoney } from "./payments-CPHCHGiR.mjs";
import { S as SECURITY_STATUS_LABELS, R as RENT_PAYMENT_STATUS_LABELS, G as GENDER_LABELS, a as RESIDENT_TYPE_LABELS } from "./resident.types-DjDosJYK.mjs";
import { u as useUpdateResidentMutation } from "./useUpdateResidentMutation-f_OBcXTE.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { o as Search, f as Users, L as LoaderCircle, J as FileText, G as FileSpreadsheet, d as LogOut, w as Pencil, N as ChevronDown } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
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
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "./skeleton-CoUJiN10.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
import "./apiFetch-Cc9rh5iq.mjs";
import "./booking.keys-CTE8dzAR.mjs";
import "./usePaymentsQuery-Blc2sag1.mjs";
import "../_libs/tailwind-merge.mjs";
async function downloadBinary(token, path, fallbackFilename) {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${token.trim()}`
    }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(typeof data.message === "string" ? data.message : `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const filename = filenameFromContentDisposition(res.headers.get("Content-Disposition"), fallbackFilename);
  triggerBrowserDownload(blob, filename);
}
function exportPath(format, month, cohort, search) {
  const params = new URLSearchParams({ month, cohort });
  if (search?.trim()) params.set("search", search.trim());
  return `/api/v1/residents/export/${format}?${params.toString()}`;
}
async function downloadMonthRentRegisterPdfApi(token, month, cohort, search) {
  const prefix = cohort === "checkouts" ? "monthly-rent-checkouts" : "monthly-rent-active";
  await downloadBinary(
    token,
    exportPath("pdf", month, cohort, search),
    `${prefix}-${month}.pdf`
  );
}
async function downloadMonthRentRegisterExcelApi(token, month, cohort, search) {
  const prefix = cohort === "checkouts" ? "monthly-rent-checkouts" : "monthly-rent-active";
  await downloadBinary(
    token,
    exportPath("excel", month, cohort, search),
    `${prefix}-${month}.xlsx`
  );
}
async function downloadResidentDossierPdfApi(token, bookingId, month) {
  const params = month ? `?month=${encodeURIComponent(month)}` : "";
  await downloadBinary(
    token,
    `/api/v1/residents/${bookingId}/export/pdf${params}`,
    `resident-record-${bookingId}.pdf`
  );
}
async function downloadResidentDossierExcelApi(token, bookingId, month) {
  const params = month ? `?month=${encodeURIComponent(month)}` : "";
  await downloadBinary(
    token,
    `/api/v1/residents/${bookingId}/export/excel${params}`,
    `resident-record-${bookingId}.xlsx`
  );
}
function useResidentsRegisterQuery(params = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: residentKeys.register(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view residents");
      return getResidentsRegisterApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 3e4
  });
}
function useResidentDetailQuery(bookingId, month) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: residentKeys.detail(bookingId ?? "", month),
    queryFn: () => {
      if (!token || !bookingId) throw new Error("Missing resident");
      return getResidentDetailApi(token, bookingId, month);
    },
    enabled: Boolean(token && bookingId),
    staleTime: 15e3
  });
}
function DetailField({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium break-words", children: value || "—" })
  ] });
}
function ResidentDetailSheet({
  bookingId,
  month,
  open,
  onOpenChange,
  onEdit
}) {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useResidentDetailQuery(open ? bookingId : null, month);
  const [downloadingPdf, setDownloadingPdf] = reactExports.useState(false);
  const [downloadingExcel, setDownloadingExcel] = reactExports.useState(false);
  const r = data?.resident;
  const stay = data?.stay;
  const summary = data?.rent_summary;
  const timeline = data?.rent_timeline ?? [];
  const totalCollected = summary?.total_rent_collected ?? summary?.total_rent_paid ?? 0;
  async function handleDownloadPdf() {
    if (!token || !bookingId) {
      toast.error("You must be signed in to download");
      return;
    }
    setDownloadingPdf(true);
    try {
      await downloadResidentDossierPdfApi(token, bookingId, month);
      toast.success("Resident record PDF downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setDownloadingPdf(false);
    }
  }
  async function handleDownloadExcel() {
    if (!token || !bookingId) {
      toast.error("You must be signed in to download");
      return;
    }
    setDownloadingExcel(true);
    try {
      await downloadResidentDossierExcelApi(token, bookingId, month);
      toast.success("Resident record Excel downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Excel download failed");
    } finally {
      setDownloadingExcel(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { className: "flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { className: "border-b border-border/60 px-6 py-4 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: r?.name ?? "Resident details" }),
      r ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        r.booking_ref,
        " · ",
        r.room_seat
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-0 flex-1 overflow-y-auto px-6 py-4 space-y-6", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-16 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-5 w-5 animate-spin" }),
      " Loading…"
    ] }) : isError || !r || !stay || !summary ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-12 text-center text-sm text-destructive", children: "Could not load resident details." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/20 bg-primary/5 px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-primary", children: "Official resident record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Download a complete dossier for government or verification — check-in/out dates, room, months lived, monthly rent, and total collected." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "default",
              size: "sm",
              disabled: downloadingPdf,
              onClick: () => void handleDownloadPdf(),
              children: [
                downloadingPdf ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mr-2 h-4 w-4" }),
                "Download PDF"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              disabled: downloadingExcel,
              onClick: () => void handleDownloadExcel(),
              children: [
                downloadingExcel ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "mr-2 h-4 w-4" }),
                "Download Excel"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-muted/30 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase text-muted-foreground", children: "Living" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold tabular-nums", children: stay.months_living }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "months so far" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-muted/30 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase text-muted-foreground", children: "Total stay" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold tabular-nums", children: stay.months_in_stay }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "booked months" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-muted/30 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase text-muted-foreground", children: "Remaining" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold tabular-nums", children: stay.months_remaining }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "months left" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-muted/30 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase text-muted-foreground", children: "Collected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold tabular-nums leading-tight", children: formatMoney(totalCollected, summary.currency) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "total earned" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-sm font-semibold", children: "Personal information" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Name", value: r.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Father name", value: r.father_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Gender", value: GENDER_LABELS[r.gender] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Type", value: RESIDENT_TYPE_LABELS[r.resident_type] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "CNIC", value: r.cnic }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Email", value: r.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Contact", value: r.contact_number }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Guardian contact", value: r.guardian_contact }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Permanent address", value: r.permanent_address }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Channel", value: r.channel })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-sm font-semibold", children: "Stay & booking" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Booking ID", value: r.booking_ref }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Booking date", value: r.booking_date }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Check-in", value: stay.move_in }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Check-out", value: stay.check_out }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Living since", value: stay.living_since }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Until", value: stay.living_until }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Room + seat", value: r.room_seat }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Seats booked", value: String(stay.seats_booked) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DetailField, { label: "Status", value: r.status.replace(/_/g, " ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DetailField,
            {
              label: "Security",
              value: `${SECURITY_STATUS_LABELS[r.security_status]}${r.security_amount != null ? ` · ${formatMoney(r.security_amount, r.currency)}` : ""}`
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-semibold", children: "Rent summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            "Total due: ",
            formatMoney(summary.total_rent_due, summary.currency)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            "Collected: ",
            formatMoney(totalCollected, summary.currency)
          ] }),
          (summary.amount_refunded ?? 0) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-rose-700 border-rose-500/30", children: [
            "Rent refunded: ",
            formatMoney(summary.amount_refunded ?? 0, summary.currency)
          ] }) : null,
          (summary.security_returned ?? 0) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-rose-700 border-rose-500/30", children: [
            "Security returned: ",
            formatMoney(summary.security_returned ?? 0, summary.currency)
          ] }) : null,
          (summary.security_retained ?? 0) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            "Security kept: ",
            formatMoney(summary.security_retained ?? 0, summary.currency)
          ] }) : null,
          (summary.net_collected ?? totalCollected) !== totalCollected || (summary.amount_retained ?? 0) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            "Net kept: ",
            formatMoney(summary.net_collected ?? totalCollected, summary.currency)
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            summary.paid_months,
            " paid month(s)"
          ] }),
          (summary.partial_months ?? 0) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            summary.partial_months,
            " partial"
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            summary.unpaid_months,
            " unpaid month(s)"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-sm font-semibold", children: "Monthly rent history" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-xl border border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Month" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Rent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Collected" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: timeline.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: m.month === month ? "bg-primary/5" : void 0, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: m.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: RENT_PAYMENT_STATUS_LABELS[m.payment_status] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: formatMoney(m.rent_amount, summary.currency) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: formatMoney(m.collected_amount ?? 0, summary.currency) })
          ] }, m.month)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Highlighted row is the month selected in the register filter." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: onEdit, children: "Edit record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/bookings/$id", params: { id: r.booking_id }, children: "Open booking" }) })
      ] })
    ] }) })
  ] }) });
}
const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];
function statusBadgeClass(status) {
  switch (status) {
    case "checked_in":
      return "bg-violet-500/15 text-violet-600 border-violet-500/30";
    case "confirmed":
      return "bg-sky-500/15 text-sky-600 border-sky-500/30";
    case "checked_out":
      return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
    case "pending":
      return "bg-amber-500/15 text-amber-600 border-amber-500/30";
    default:
      return "";
  }
}
function securityBadgeClass(status) {
  switch (status) {
    case "paid":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/25";
    case "not_paid":
      return "bg-rose-500/15 text-rose-700 border-rose-500/30 hover:bg-rose-500/25";
    case "returned":
      return "bg-sky-500/15 text-sky-700 border-sky-500/30 hover:bg-sky-500/25";
    case "held":
      return "bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/25";
    default:
      return "bg-muted text-muted-foreground border-border hover:bg-muted/80";
  }
}
function rentBadgeClass(status) {
  switch (status) {
    case "paid":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/25";
    case "not_paid":
      return "bg-rose-500/15 text-rose-700 border-rose-500/30 hover:bg-rose-500/25";
    case "partial":
      return "bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/25";
    case "returned":
      return "bg-sky-500/15 text-sky-700 border-sky-500/30 hover:bg-sky-500/25";
    default:
      return "bg-muted text-muted-foreground border-border hover:bg-muted/80";
  }
}
const SECURITY_STATUS_OPTIONS = Object.keys(SECURITY_STATUS_LABELS);
const RENT_STATUS_OPTIONS = Object.keys(RENT_PAYMENT_STATUS_LABELS);
function InlineSecurityStatus({
  row
}) {
  const update = useUpdateResidentMutation();
  const setStatus = (next) => {
    if (next === row.security_status) return;
    update.mutate({
      bookingId: row.booking_id,
      input: {
        security_status: next
      }
    }, {
      onSuccess: () => toast.success(`Security: ${SECURITY_STATUS_LABELS[next]}`),
      onError: () => toast.error("Could not update security status")
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", disabled: update.isPending, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cn("cursor-pointer gap-0.5 pr-1 text-xs whitespace-nowrap", securityBadgeClass(row.security_status)), children: update.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      SECURITY_STATUS_LABELS[row.security_status],
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3 w-3 opacity-60" })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "start", onClick: (e) => e.stopPropagation(), children: SECURITY_STATUS_OPTIONS.map((key) => /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { disabled: update.isPending || key === row.security_status, onSelect: () => setStatus(key), children: SECURITY_STATUS_LABELS[key] }, key)) })
  ] });
}
function InlineRentStatus({
  row,
  month
}) {
  const update = useUpdateResidentMutation();
  const setStatus = (next) => {
    if (next === row.payment_status) return;
    update.mutate({
      bookingId: row.booking_id,
      input: {
        month,
        payment_status: next
      }
    }, {
      onSuccess: () => toast.success(`Rent (${month}): ${RENT_PAYMENT_STATUS_LABELS[next]}`),
      onError: () => toast.error("Could not update rent status")
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", disabled: update.isPending, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cn("cursor-pointer gap-0.5 pr-1 text-xs whitespace-nowrap", rentBadgeClass(row.payment_status)), children: update.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      RENT_PAYMENT_STATUS_LABELS[row.payment_status],
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3 w-3 opacity-60" })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "start", onClick: (e) => e.stopPropagation(), children: RENT_STATUS_OPTIONS.map((key) => /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { disabled: update.isPending || key === row.payment_status, onSelect: () => setStatus(key), children: RENT_PAYMENT_STATUS_LABELS[key] }, key)) })
  ] });
}
function EditResidentDialog({
  row,
  month,
  open,
  onOpenChange
}) {
  const update = useUpdateResidentMutation();
  const [fatherName, setFatherName] = reactExports.useState("");
  const [gender, setGender] = reactExports.useState("");
  const [cnic, setCnic] = reactExports.useState("");
  const [guardian, setGuardian] = reactExports.useState("");
  const [address, setAddress] = reactExports.useState("");
  const [seatLabel, setSeatLabel] = reactExports.useState("");
  const [residentType, setResidentType] = reactExports.useState("");
  const [securityStatus, setSecurityStatus] = reactExports.useState("not_applicable");
  const [securityAmount, setSecurityAmount] = reactExports.useState("");
  const [monthlyRent, setMonthlyRent] = reactExports.useState("");
  const [paymentStatus, setPaymentStatus] = reactExports.useState("not_paid");
  reactExports.useEffect(() => {
    if (!row || !open) return;
    setFatherName(row.father_name);
    setGender(row.gender || "");
    setCnic(row.cnic);
    setGuardian(row.guardian_contact);
    setAddress(row.permanent_address);
    setSeatLabel(row.seat_label);
    setResidentType(row.resident_type || "");
    setSecurityStatus(row.security_status);
    setSecurityAmount(row.security_amount != null ? String(row.security_amount) : "");
    setMonthlyRent(String(row.monthly_rent));
    setPaymentStatus(row.payment_status);
  }, [row, open]);
  function handleSave() {
    if (!row) return;
    const input = {
      guest_father_name: fatherName.trim(),
      guest_gender: gender,
      guest_cnic: cnic.trim(),
      guest_guardian_contact: guardian.trim(),
      guest_permanent_address: address.trim(),
      seat_label: seatLabel.trim(),
      resident_type: residentType,
      security_status: securityStatus,
      security_amount: securityAmount.trim() ? Number(securityAmount) : null,
      month,
      monthly_rent: Number(monthlyRent),
      payment_status: paymentStatus
    };
    update.mutate({
      bookingId: row.booking_id,
      input
    }, {
      onSuccess: () => {
        toast.success("Resident record updated");
        onOpenChange(false);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed")
    });
  }
  if (!row) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] max-w-lg overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Edit resident — ",
      row.name
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Booking ",
        row.booking_ref,
        " · Rent for ",
        month
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Father name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fatherName, onChange: (e) => setFatherName(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gender" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: gender || "unset", onValueChange: (v) => setGender(v === "unset" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unset", children: "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "male", children: "Male" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "female", children: "Female" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: "Other" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CNIC" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: cnic, onChange: (e) => setCnic(e.target.value), placeholder: "35201-1234567-1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Guardian contact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: guardian, onChange: (e) => setGuardian(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Seat label" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: seatLabel, onChange: (e) => setSeatLabel(e.target.value), placeholder: "Seat 3" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: residentType || "unset", onValueChange: (v) => setResidentType(v === "unset" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unset", children: "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "student", children: "Student" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "employee", children: "Employee" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: "Other" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Permanent address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: address, onChange: (e) => setAddress(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Security deposit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: securityStatus, onValueChange: (v) => setSecurityStatus(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.keys(SECURITY_STATUS_LABELS).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: SECURITY_STATUS_LABELS[k] }, k)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Security amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: securityAmount, onChange: (e) => setSecurityAmount(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Monthly rent (",
            month,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: monthlyRent, onChange: (e) => setMonthlyRent(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rent payment status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: paymentStatus, onValueChange: (v) => setPaymentStatus(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.keys(RENT_PAYMENT_STATUS_LABELS).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: RENT_PAYMENT_STATUS_LABELS[k] }, k)) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: update.isPending, children: [
        update.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        "Save"
      ] })
    ] })
  ] }) });
}
function MonthlyRentPage() {
  const token = useAuthStore((s) => s.token);
  const {
    month,
    setMonth,
    monthLabel
  } = useSyncedMonthFilter();
  const [search, setSearch] = reactExports.useState("");
  const [searchInput, setSearchInput] = reactExports.useState("");
  const [cohort, setCohort] = reactExports.useState("active");
  const [page, setPage] = reactExports.useState(1);
  const [pageSize, setPageSize] = reactExports.useState(15);
  const [editRow, setEditRow] = reactExports.useState(null);
  const [detailId, setDetailId] = reactExports.useState(null);
  const [downloadingPdf, setDownloadingPdf] = reactExports.useState(false);
  const [downloadingExcel, setDownloadingExcel] = reactExports.useState(false);
  const params = reactExports.useMemo(() => ({
    month,
    cohort,
    page,
    limit: pageSize,
    ...search ? {
      search
    } : {}
  }), [month, cohort, page, pageSize, search]);
  const {
    data,
    isLoading,
    isError
  } = useResidentsRegisterQuery(params);
  const residents = data?.residents ?? [];
  const pagination = data?.pagination;
  const showingFrom = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const showingTo = pagination && pagination.total > 0 ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;
  const exportLabel = cohort === "checkouts" ? "checkouts" : "active residents";
  async function handleDownloadPdf() {
    if (!token) {
      toast.error("You must be signed in to download");
      return;
    }
    setDownloadingPdf(true);
    try {
      await downloadMonthRentRegisterPdfApi(token, month, cohort, search || void 0);
      toast.success(`${exportLabel} PDF downloaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setDownloadingPdf(false);
    }
  }
  async function handleDownloadExcel() {
    if (!token) {
      toast.error("You must be signed in to download");
      return;
    }
    setDownloadingExcel(true);
    try {
      await downloadMonthRentRegisterExcelApi(token, month, cohort, search || void 0);
      toast.success(`${exportLabel} Excel downloaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Excel download failed");
    } finally {
      setDownloadingExcel(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MonthFilterSelect, { id: "rent-month", value: month, onChange: (v) => {
          setMonth(v);
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "flex gap-2", onSubmit: (e) => {
          e.preventDefault();
          setSearch(searchInput.trim());
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "w-64 pl-9", placeholder: "Search name, CNIC, phone…", value: searchInput, onChange: (e) => setSearchInput(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "secondary", children: "Search" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1 self-start lg:self-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
        pagination?.total ?? 0,
        " ",
        cohort === "checkouts" ? "checkouts" : "active"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 self-start lg:self-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: downloadingPdf, onClick: () => void handleDownloadPdf(), children: [
          downloadingPdf ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mr-2 h-4 w-4" }),
          "PDF"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: downloadingExcel, onClick: () => void handleDownloadExcel(), children: [
          downloadingExcel ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "mr-2 h-4 w-4" }),
          "Excel"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 self-start lg:self-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rent-page-size", className: "text-xs text-muted-foreground whitespace-nowrap", children: "Rows per page" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(pageSize), onValueChange: (v) => {
          setPageSize(Number(v));
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "rent-page-size", className: "h-9 w-[5.5rem]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PAGE_SIZE_OPTIONS.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(n), children: n }, n)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base", children: [
            "Resident list — ",
            monthLabel
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: cohort, onValueChange: (v) => {
            setCohort(v);
            setPage(1);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "active", className: "gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
              "Active residents"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "checkouts", className: "gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }),
              "Checkouts this month"
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground space-y-1", children: pagination && pagination.total > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Showing ",
          showingFrom,
          "–",
          showingTo,
          " of ",
          pagination.total,
          " ",
          cohort === "checkouts" ? "checkouts" : "active residents"
        ] }) : null })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-sm text-destructive", children: "Could not load resident register." }) : isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(MonthlyRentTableSkeleton, {}) : residents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center text-sm text-muted-foreground", children: cohort === "checkouts" ? `No checkouts in ${monthLabel}. Residents who leave during this month appear here.` : `No active residents for ${monthLabel}. Anyone who checked out this month is under Checkouts.` }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "sticky left-0 z-10 bg-card w-10", children: "#" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "min-w-[6rem]", children: "Booking" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "min-w-[8rem]", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "min-w-[7rem]", children: "Contact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "min-w-[7rem] max-w-[9rem]", children: "Room" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-14", children: "Seat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "min-w-[5.5rem]", children: "Check-in" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "min-w-[5.5rem]", children: "Check-out" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "min-w-[5rem]", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "min-w-[5.5rem]", children: "Security" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "min-w-[5.5rem]", children: "Rent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "min-w-[5.5rem] text-right", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-10 sticky right-0 z-10 bg-card" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: residents.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "cursor-pointer hover:bg-muted/50", onClick: () => setDetailId(r.booking_id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "sticky left-0 z-10 bg-card font-medium tabular-nums", children: r.serial_no }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/bookings/$id", params: {
            id: r.booking_id
          }, className: "font-mono text-xs text-primary hover:underline", onClick: (e) => e.stopPropagation(), children: r.booking_ref }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[9rem] font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block truncate", title: r.name, children: r.name }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap text-xs tabular-nums", children: r.contact_number }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[9rem]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block truncate text-xs", title: r.room_title || r.room_seat, children: r.room_title || "Room" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs whitespace-nowrap", children: r.seat_label ? `${r.seat_label}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap text-xs tabular-nums", children: r.check_in ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap text-xs tabular-nums", children: r.check_out ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cn("text-xs", statusBadgeClass(r.status)), children: r.status.replace(/_/g, " ") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InlineSecurityStatus, { row: r }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InlineRentStatus, { row: r, month }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-semibold tabular-nums whitespace-nowrap text-sm", children: formatMoney(r.monthly_rent, r.currency) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "sticky right-0 z-10 bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: (e) => {
            e.stopPropagation();
            setEditRow(r);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }) })
        ] }, r.booking_id)) })
      ] }) }) }),
      pagination && pagination.total > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-between gap-3 border-t border-border/60 px-4 py-3 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Page ",
          pagination.page,
          " of ",
          pagination.pages,
          " · ",
          pagination.total,
          " total"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", disabled: page <= 1 || isLoading, onClick: () => setPage((p) => Math.max(1, p - 1)), children: "Previous" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-[6rem] text-center text-sm tabular-nums text-muted-foreground", children: [
            pagination.page,
            " / ",
            pagination.pages
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", disabled: page >= pagination.pages || isLoading, onClick: () => setPage((p) => p + 1), children: "Next" })
        ] })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EditResidentDialog, { row: editRow, month, open: Boolean(editRow), onOpenChange: (v) => !v && setEditRow(null) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ResidentDetailSheet, { bookingId: detailId, month, open: Boolean(detailId), onOpenChange: (v) => !v && setDetailId(null), onEdit: () => {
      const row = residents.find((r) => r.booking_id === detailId);
      if (row) {
        setDetailId(null);
        setEditRow(row);
      }
    } })
  ] });
}
export {
  MonthlyRentPage as component
};
