import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle } from "./card-DCDRzI6q.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-SXOy8WpB.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { S as StatCard } from "./stat-card-CNUUkvxI.mjs";
import { b as StatCardsRowSkeleton, C as ChartCardSkeleton, P as ProfitLossExpenseBlockSkeleton } from "./admin-page-skeletons-NTMVG02X.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { b as useQuery, u as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { e as expenseKeys } from "./resident.keys-DK2A-v-L.mjs";
import { u as useAuthStore, g as getApiBaseUrl } from "./router-CXpZMrmV.mjs";
import { u as useSyncedMonthFilter, c as currentMonthKey, M as MonthFilterSelect, f as filenameFromContentDisposition, t as triggerBrowserDownload } from "./month-filter-select-Dciee0fl.mjs";
import { f as formatMoney, c as chartTooltipMoney } from "./payments-CPHCHGiR.mjs";
import { y as CalendarDays, u as Plus, T as TrendingUp, R as Receipt, g as Calculator, z as TrendingDown, L as LoaderCircle, F as FileDown, G as FileSpreadsheet, w as Pencil, v as Trash2 } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, d as Bar } from "../_libs/recharts.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
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
import "./skeleton-CoUJiN10.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
import "./index-KZ9vj88m.mjs";
import "../_libs/lodash.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
async function getProfitLossApi(token, params = {}) {
  const search = new URLSearchParams();
  if (params.month) search.set("month", params.month);
  if (params.months != null) search.set("months", String(params.months));
  if (params.history_page != null) search.set("history_page", String(params.history_page));
  if (params.history_limit != null) search.set("history_limit", String(params.history_limit));
  const q = search.toString();
  const data = await apiFetch(
    `/api/v1/expenses/profit-loss${q ? `?${q}` : ""}`,
    { token }
  );
  if (!data.success || !data.current?.detail) {
    throw new Error("Invalid profit & loss response");
  }
  return {
    current: data.current,
    series: data.series ?? [],
    history: {
      months: data.history?.months ?? [],
      pagination: data.history?.pagination ?? { page: 1, limit: 4, total: 0, pages: 1 }
    }
  };
}
async function postExpenseApi(token, input) {
  const data = await apiFetch("/api/v1/expenses", {
    method: "POST",
    token,
    body: JSON.stringify(input)
  });
  if (!data.success || !data.expense) {
    throw new Error("Invalid create expense response");
  }
  return data.expense;
}
async function patchExpenseApi(token, id, input) {
  const data = await apiFetch(`/api/v1/expenses/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input)
  });
  if (!data.success || !data.expense) {
    throw new Error("Invalid update expense response");
  }
  return data.expense;
}
async function deleteExpenseApi(token, id) {
  await apiFetch(`/api/v1/expenses/${id}`, {
    method: "DELETE",
    token
  });
}
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
async function downloadMonthProfitLossPdfApi(token, month) {
  await downloadBinary(token, `/api/v1/expenses/export/pdf?month=${encodeURIComponent(month)}`, `profit-loss-${month}.pdf`);
}
async function downloadMonthProfitLossExcelApi(token, month) {
  await downloadBinary(
    token,
    `/api/v1/expenses/export/excel?month=${encodeURIComponent(month)}`,
    `profit-loss-${month}.xlsx`
  );
}
function useProfitLossQuery(params = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: expenseKeys.profitLoss(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view profit & loss");
      return getProfitLossApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 0
  });
}
function useCreateExpenseMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => {
      if (!token) throw new Error("You must be signed in");
      return postExpenseApi(token, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    }
  });
}
function useUpdateExpenseMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => {
      if (!token) throw new Error("You must be signed in");
      return patchExpenseApi(token, id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    }
  });
}
function useDeleteExpenseMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      if (!token) throw new Error("You must be signed in");
      return deleteExpenseApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    }
  });
}
const EXPENSE_CATEGORY_LABELS = {
  supplies: "Supplies",
  utilities: "Utilities",
  staff: "Staff & wages",
  repairs: "Repairs",
  food: "Food & kitchen",
  cleaning: "Cleaning",
  rent: "Rent & lease",
  other: "Other"
};
const CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS);
const HISTORY_LIMIT = 4;
const blank = {
  title: "",
  amount: 0,
  currency: "pkr",
  category: "other",
  expense_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  vendor: "",
  notes: ""
};
function MonthSummaryStrip({
  detail
}) {
  const profitPkrPositive = detail.profit_pkr >= 0;
  const profitUsdPositive = detail.profit_usd >= 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-muted/30 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", children: "Revenue PKR" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-lg font-bold tabular-nums", children: formatMoney(detail.revenue_pkr, "pkr") }),
      (detail.security_retained_pkr ?? 0) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "incl. ",
        formatMoney(detail.security_retained_pkr ?? 0, "pkr"),
        " security kept at checkout"
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-muted/30 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", children: "Expenses PKR" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-lg font-bold tabular-nums", children: formatMoney(detail.expense_pkr, "pkr") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        detail.expense_count_pkr,
        " items"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-muted/30 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", children: "Profit PKR" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-1 text-lg font-bold tabular-nums ${profitPkrPositive ? "text-emerald-600" : "text-rose-600"}`, children: formatMoney(detail.profit_pkr, "pkr") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-muted/30 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", children: "Revenue USD" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-lg font-bold tabular-nums", children: formatMoney(detail.revenue_usd, "usd") }),
      (detail.security_retained_usd ?? 0) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "incl. ",
        formatMoney(detail.security_retained_usd ?? 0, "usd"),
        " security kept at checkout"
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-muted/30 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", children: "Expenses USD" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-lg font-bold tabular-nums", children: formatMoney(detail.expense_usd, "usd") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        detail.expense_count_usd,
        " items"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-muted/30 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", children: "Profit USD" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-1 text-lg font-bold tabular-nums ${profitUsdPositive ? "text-sky-600" : "text-rose-600"}`, children: formatMoney(detail.profit_usd, "usd") })
    ] })
  ] });
}
function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  deleting
}) {
  if (expenses.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-10 text-center text-sm text-muted-foreground", children: "No expenses recorded for this month." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Title" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Category" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Vendor" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Amount" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-[88px]" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: expenses.map((exp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap text-muted-foreground", children: exp.expense_date }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: exp.title }),
        exp.notes ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-1 text-xs text-muted-foreground", children: exp.notes }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: EXPENSE_CATEGORY_LABELS[exp.category] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: exp.vendor || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-semibold", children: formatMoney(exp.amount, exp.currency) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => onEdit(exp), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", className: "text-destructive hover:text-destructive", onClick: () => onDelete(exp.id), disabled: deleting, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }) })
    ] }, exp.id)) })
  ] });
}
function MonthExpenseBlock({
  block,
  highlight,
  highlightLabel,
  onEdit,
  onDelete,
  onDownloadPdf,
  onDownloadExcel,
  downloadingPdf,
  downloadingExcel,
  deleting
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: highlight ? "border-primary/40 shadow-md" : "border-border/60", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "space-y-4 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: block.label }),
          highlight && highlightLabel ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: highlightLabel }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            block.expenses.length,
            " expenses"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", className: "gap-1.5", disabled: downloadingPdf || downloadingExcel, onClick: () => onDownloadPdf(block.month), children: [
            downloadingPdf ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-3.5 w-3.5" }),
            "PDF"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", className: "gap-1.5", disabled: downloadingPdf || downloadingExcel, onClick: () => onDownloadExcel(block.month), children: [
            downloadingExcel ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-3.5 w-3.5" }),
            "Excel"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MonthSummaryStrip, { detail: block.detail })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpenseTable, { expenses: block.expenses, onEdit, onDelete, deleting }) })
  ] });
}
function ProfitLossPage() {
  const token = useAuthStore((s) => s.token);
  const {
    month,
    setMonth,
    monthLabel
  } = useSyncedMonthFilter();
  const [historyPage, setHistoryPage] = reactExports.useState(1);
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [draft, setDraft] = reactExports.useState(blank);
  const [downloadingPdfMonth, setDownloadingPdfMonth] = reactExports.useState(null);
  const [downloadingExcelMonth, setDownloadingExcelMonth] = reactExports.useState(null);
  const {
    data,
    isLoading,
    isError,
    isFetching
  } = useProfitLossQuery({
    month,
    months: 12,
    history_page: historyPage,
    history_limit: HISTORY_LIMIT
  });
  const createExpense = useCreateExpenseMutation();
  const updateExpense = useUpdateExpenseMutation();
  const removeExpense = useDeleteExpenseMutation();
  const current = data?.current;
  const detail = current?.detail;
  const historyMonths = data?.history.months ?? [];
  const historyPagination = data?.history.pagination;
  const isCurrentCalendarMonth = month === currentMonthKey();
  const focusBadgeLabel = isCurrentCalendarMonth ? "This month" : "Selected month";
  const chartData = reactExports.useMemo(() => (data?.series ?? []).map((s) => ({
    label: s.label,
    revenue_pkr: s.revenue_pkr,
    expense_pkr: s.expense_pkr,
    profit_pkr: s.profit_pkr
  })), [data?.series]);
  function openCreate() {
    setEditing(null);
    setDraft({
      ...blank,
      expense_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
    });
    setOpen(true);
  }
  function openEdit(exp) {
    setEditing(exp);
    setDraft({
      title: exp.title,
      amount: exp.amount,
      currency: exp.currency,
      category: exp.category,
      expense_date: exp.expense_date,
      vendor: exp.vendor,
      notes: exp.notes
    });
    setOpen(true);
  }
  function handleSave() {
    if (!draft.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!Number.isFinite(draft.amount) || draft.amount < 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const payload = {
      ...draft,
      title: draft.title.trim(),
      amount: Math.round(Number(draft.amount) * 100) / 100,
      vendor: draft.vendor.trim(),
      notes: draft.notes.trim()
    };
    if (editing) {
      updateExpense.mutate({
        id: editing.id,
        input: payload
      }, {
        onSuccess: () => {
          toast.success("Expense updated");
          setOpen(false);
          setEditing(null);
          setDraft(blank);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed")
      });
      return;
    }
    createExpense.mutate(payload, {
      onSuccess: () => {
        toast.success("Expense added");
        setOpen(false);
        setDraft(blank);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add expense")
    });
  }
  function handleDelete(id) {
    if (!window.confirm("Delete this expense?")) return;
    removeExpense.mutate(id, {
      onSuccess: () => toast.success("Expense deleted"),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed")
    });
  }
  async function handleDownloadMonthPdf(monthKey) {
    if (!token) {
      toast.error("You must be signed in to download");
      return;
    }
    setDownloadingPdfMonth(monthKey);
    try {
      await downloadMonthProfitLossPdfApi(token, monthKey);
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setDownloadingPdfMonth(null);
    }
  }
  async function handleDownloadMonthExcel(monthKey) {
    if (!token) {
      toast.error("You must be signed in to download");
      return;
    }
    setDownloadingExcelMonth(monthKey);
    try {
      await downloadMonthProfitLossExcelApi(token, monthKey);
      toast.success("Excel file downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Excel download failed");
    } finally {
      setDownloadingExcelMonth(null);
    }
  }
  const saving = createExpense.isPending || updateExpense.isPending;
  const profitPkrPositive = (detail?.profit_pkr ?? 0) >= 0;
  const profitUsdPositive = (detail?.profit_usd ?? 0) >= 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MonthFilterSelect, { id: "reports-month", value: month, onChange: (v) => {
          setMonth(v);
          setHistoryPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1 self-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3.5 w-3.5" }),
          monthLabel
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openCreate, className: "gap-2 shrink-0 self-start lg:self-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add expense"
      ] })
    ] }),
    isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-destructive/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-sm text-destructive", children: "Could not load profit & loss data. Check your connection and try again." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(StatCardsRowSkeleton, { count: 6 }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Revenue (PKR)", value: formatMoney(detail?.revenue_pkr ?? 0, "pkr"), icon: TrendingUp, delta: current ? `${monthLabel} · bookings` : "Selected month" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Expenses (PKR)", value: formatMoney(detail?.expense_pkr ?? 0, "pkr"), icon: Receipt, accent: "warning", delta: `${detail?.expense_count_pkr ?? 0} items · ${monthLabel}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Net profit (PKR)", value: formatMoney(detail?.profit_pkr ?? 0, "pkr"), icon: Calculator, accent: profitPkrPositive ? "success" : "warning", delta: profitPkrPositive ? "Revenue − expenses" : "Loss this month" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Revenue (USD)", value: formatMoney(detail?.revenue_usd ?? 0, "usd"), icon: TrendingUp, accent: "info", delta: current ? `${monthLabel} · international` : "Selected month" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Expenses (USD)", value: formatMoney(detail?.expense_usd ?? 0, "usd"), icon: Receipt, accent: "info", delta: `${detail?.expense_count_usd ?? 0} items · ${monthLabel}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Net profit (USD)", value: formatMoney(detail?.profit_usd ?? 0, "usd"), icon: profitUsdPositive ? TrendingUp : TrendingDown, accent: profitUsdPositive ? "info" : "warning", delta: profitUsdPositive ? "Revenue − expenses" : "Loss this month" })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCardSkeleton, { titleWidth: "w-44", heightClass: "h-72" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Monthly trend (PKR)" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-72", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartData, margin: {
          top: 8,
          right: 8,
          left: 0,
          bottom: 0
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-border/60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: {
            fontSize: 12
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
            fontSize: 12
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: chartTooltipMoney }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "revenue_pkr", name: "PKR", fill: "hsl(var(--primary))", radius: [4, 4, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "expense_pkr", name: "Expenses", fill: "hsl(var(--destructive))", radius: [4, 4, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "profit_pkr", name: "Profit", fill: "hsl(var(--chart-3))", radius: [4, 4, 0, 0] })
        ] }) }) })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProfitLossExpenseBlockSkeleton, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProfitLossExpenseBlockSkeleton, {})
      ] }) : current ? /* @__PURE__ */ jsxRuntimeExports.jsx(MonthExpenseBlock, { block: current, highlight: true, highlightLabel: focusBadgeLabel, onEdit: openEdit, onDelete: handleDelete, onDownloadPdf: (m) => void handleDownloadMonthPdf(m), onDownloadExcel: (m) => void handleDownloadMonthExcel(m), downloadingPdf: downloadingPdfMonth === current.month, downloadingExcel: downloadingExcelMonth === current.month, deleting: removeExpense.isPending }) : null,
      historyMonths.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-widest text-muted-foreground", children: "Earlier months" }),
        historyMonths.map((block) => /* @__PURE__ */ jsxRuntimeExports.jsx(MonthExpenseBlock, { block, onEdit: openEdit, onDelete: handleDelete, onDownloadPdf: (m) => void handleDownloadMonthPdf(m), onDownloadExcel: (m) => void handleDownloadMonthExcel(m), downloadingPdf: downloadingPdfMonth === block.month, downloadingExcel: downloadingExcelMonth === block.month, deleting: removeExpense.isPending }, block.month))
      ] }) : !isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "No past expense records yet." }) : null,
      historyPagination && historyPagination.pages > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", disabled: historyPage <= 1 || isFetching, onClick: () => setHistoryPage((p) => p - 1), children: "Previous" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
          "Page ",
          historyPagination.page,
          " of ",
          historyPagination.pages,
          isFetching ? " · updating…" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", disabled: historyPage >= historyPagination.pages || isFetching, onClick: () => setHistoryPage((p) => p + 1), children: "Next" })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit expense" : "Add expense" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "exp-title", children: "What did you buy / pay for?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "exp-title", value: draft.title, onChange: (e) => setDraft((d) => ({
            ...d,
            title: e.target.value
          })), placeholder: "e.g. Monthly electricity bill" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "exp-amount", children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "exp-amount", type: "number", min: 0, step: "0.01", value: draft.amount || "", onChange: (e) => setDraft((d) => ({
              ...d,
              amount: Number(e.target.value)
            })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Currency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.currency, onValueChange: (v) => setDraft((d) => ({
              ...d,
              currency: v
            })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pkr", children: "PKR (Rs)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "usd", children: "USD ($)" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.category, onValueChange: (v) => setDraft((d) => ({
              ...d,
              category: v
            })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: EXPENSE_CATEGORY_LABELS[c] }, c)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "exp-date", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "exp-date", type: "date", value: draft.expense_date, onChange: (e) => setDraft((d) => ({
              ...d,
              expense_date: e.target.value
            })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "exp-vendor", children: "Vendor (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "exp-vendor", value: draft.vendor, onChange: (e) => setDraft((d) => ({
            ...d,
            vendor: e.target.value
          })), placeholder: "Shop or supplier name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "exp-notes", children: "Notes (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "exp-notes", rows: 3, value: draft.notes, onChange: (e) => setDraft((d) => ({
            ...d,
            notes: e.target.value
          })), placeholder: "Receipt details, quantity, etc." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: handleSave, disabled: saving, children: [
          saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
          editing ? "Save changes" : "Add expense"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  ProfitLossPage as component
};
