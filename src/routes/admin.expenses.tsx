import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/admin/stat-card";
import {
  ChartCardSkeleton,
  ProfitLossExpenseBlockSkeleton,
  StatCardsRowSkeleton,
} from "@/components/admin/admin-page-skeletons";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  TrendingDown,
  TrendingUp,
  Receipt,
  Calculator,
  CalendarDays,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  useProfitLossQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "@/queries/expenses";
import {
  MonthFilterSelect,
  currentMonthKey,
  useSyncedMonthFilter,
} from "@/components/admin/month-filter-select";
import { chartTooltipMoney, formatMoney } from "@/lib/payments";
import { downloadMonthProfitLossExcelApi, downloadMonthProfitLossPdfApi } from "@/api/expenses";
import { useAuthStore } from "@/stores/auth/auth.store";
import type {
  Expense,
  ExpenseCategory,
  ExpenseCurrency,
  ExpenseDraft,
  ProfitLossMonthBlock,
  ProfitLossMonthDetail,
} from "@/types/domain/expense.types";
import { EXPENSE_CATEGORY_LABELS } from "@/types/domain/expense.types";

export const Route = createFileRoute("/admin/expenses")({ component: MonthlyExpensesPage });

const CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];
const HISTORY_LIMIT = 4;

const blank: ExpenseDraft = {
  title: "",
  amount: 0,
  currency: "pkr",
  category: "other",
  expense_date: new Date().toISOString().slice(0, 10),
  vendor: "",
  notes: "",
};

function MonthSummaryStrip({ detail }: { detail: ProfitLossMonthDetail }) {
  const profitPkrPositive = detail.profit_pkr >= 0;
  const profitUsdPositive = detail.profit_usd >= 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Revenue PKR
        </p>
        <p className="mt-1 text-lg font-bold tabular-nums">
          {formatMoney(detail.revenue_pkr, "pkr")}
        </p>
        {(detail.security_retained_pkr ?? 0) > 0 ? (
          <p className="text-xs text-muted-foreground">
            incl. {formatMoney(detail.security_retained_pkr ?? 0, "pkr")} security kept at checkout
          </p>
        ) : null}
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Expenses PKR
        </p>
        <p className="mt-1 text-lg font-bold tabular-nums">
          {formatMoney(detail.expense_pkr, "pkr")}
        </p>
        <p className="text-xs text-muted-foreground">{detail.expense_count_pkr} items</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Profit PKR
        </p>
        <p
          className={`mt-1 text-lg font-bold tabular-nums ${profitPkrPositive ? "text-emerald-600" : "text-rose-600"}`}
        >
          {formatMoney(detail.profit_pkr, "pkr")}
        </p>
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Revenue USD
        </p>
        <p className="mt-1 text-lg font-bold tabular-nums">
          {formatMoney(detail.revenue_usd, "usd")}
        </p>
        {(detail.security_retained_usd ?? 0) > 0 ? (
          <p className="text-xs text-muted-foreground">
            incl. {formatMoney(detail.security_retained_usd ?? 0, "usd")} security kept at checkout
          </p>
        ) : null}
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Expenses USD
        </p>
        <p className="mt-1 text-lg font-bold tabular-nums">
          {formatMoney(detail.expense_usd, "usd")}
        </p>
        <p className="text-xs text-muted-foreground">{detail.expense_count_usd} items</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Profit USD
        </p>
        <p
          className={`mt-1 text-lg font-bold tabular-nums ${profitUsdPositive ? "text-sky-600" : "text-rose-600"}`}
        >
          {formatMoney(detail.profit_usd, "usd")}
        </p>
      </div>
    </div>
  );
}

function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  deleting,
}: {
  expenses: Expense[];
  onEdit: (exp: Expense) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  if (expenses.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No expenses recorded for this month.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-[88px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((exp) => (
          <TableRow key={exp.id}>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {exp.expense_date}
            </TableCell>
            <TableCell>
              <div className="font-medium">{exp.title}</div>
              {exp.notes ? (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{exp.notes}</p>
              ) : null}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{EXPENSE_CATEGORY_LABELS[exp.category]}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{exp.vendor || "—"}</TableCell>
            <TableCell className="text-right font-semibold">
              {formatMoney(exp.amount, exp.currency)}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(exp)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(exp.id)}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
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
  deleting,
}: {
  block: ProfitLossMonthBlock;
  highlight?: boolean;
  highlightLabel?: string;
  onEdit: (exp: Expense) => void;
  onDelete: (id: string) => void;
  onDownloadPdf: (month: string) => void;
  onDownloadExcel: (month: string) => void;
  downloadingPdf: boolean;
  downloadingExcel: boolean;
  deleting: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/40 shadow-md" : "border-border/60"}>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">{block.label}</CardTitle>
            {highlight && highlightLabel ? <Badge>{highlightLabel}</Badge> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{block.expenses.length} expenses</Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={downloadingPdf || downloadingExcel}
              onClick={() => onDownloadPdf(block.month)}
            >
              {downloadingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileDown className="h-3.5 w-3.5" />
              )}
              PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={downloadingPdf || downloadingExcel}
              onClick={() => onDownloadExcel(block.month)}
            >
              {downloadingExcel ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-3.5 w-3.5" />
              )}
              Excel
            </Button>
          </div>
        </div>
        <MonthSummaryStrip detail={block.detail} />
      </CardHeader>
      <CardContent className="p-0">
        <ExpenseTable
          expenses={block.expenses}
          onEdit={onEdit}
          onDelete={onDelete}
          deleting={deleting}
        />
      </CardContent>
    </Card>
  );
}

function MonthlyExpensesPage() {
  const token = useAuthStore((s) => s.token);
  const { month, setMonth, monthLabel } = useSyncedMonthFilter();
  const [historyPage, setHistoryPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [draft, setDraft] = useState<ExpenseDraft>(blank);
  const [downloadingPdfMonth, setDownloadingPdfMonth] = useState<string | null>(null);
  const [downloadingExcelMonth, setDownloadingExcelMonth] = useState<string | null>(null);

  const { data, isLoading, isError, isFetching } = useProfitLossQuery({
    month,
    months: 12,
    history_page: historyPage,
    history_limit: HISTORY_LIMIT,
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

  const chartData = useMemo(
    () =>
      (data?.series ?? []).map((s) => ({
        label: s.label,
        revenue_pkr: s.revenue_pkr,
        expense_pkr: s.expense_pkr,
        profit_pkr: s.profit_pkr,
      })),
    [data?.series],
  );

  function openCreate() {
    setEditing(null);
    setDraft({ ...blank, expense_date: new Date().toISOString().slice(0, 10) });
    setOpen(true);
  }

  function openEdit(exp: Expense) {
    setEditing(exp);
    setDraft({
      title: exp.title,
      amount: exp.amount,
      currency: exp.currency,
      category: exp.category,
      expense_date: exp.expense_date,
      vendor: exp.vendor,
      notes: exp.notes,
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

    const payload: ExpenseDraft = {
      ...draft,
      title: draft.title.trim(),
      amount: Math.round(Number(draft.amount) * 100) / 100,
      vendor: draft.vendor.trim(),
      notes: draft.notes.trim(),
    };

    if (editing) {
      updateExpense.mutate(
        { id: editing.id, input: payload },
        {
          onSuccess: () => {
            toast.success("Expense updated");
            setOpen(false);
            setEditing(null);
            setDraft(blank);
          },
          onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
        },
      );
      return;
    }

    createExpense.mutate(payload, {
      onSuccess: () => {
        toast.success("Expense added");
        setOpen(false);
        setDraft(blank);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add expense"),
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this expense?")) return;
    removeExpense.mutate(id, {
      onSuccess: () => toast.success("Expense deleted"),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
    });
  }

  async function handleDownloadMonthPdf(monthKey: string) {
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

  async function handleDownloadMonthExcel(monthKey: string) {
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

  return (
    <div className="space-y-6">
     

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <MonthFilterSelect
            id="expenses-month"
            value={month}
            onChange={(v) => {
              setMonth(v);
              setHistoryPage(1);
            }}
          />
          <Badge variant="secondary" className="gap-1 self-end">
            <CalendarDays className="h-3.5 w-3.5" />
            {monthLabel}
          </Badge>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0 self-start lg:self-auto">
          <Plus className="h-4 w-4" /> Add expense
        </Button>
      </div>

      {isError ? (
        <Card className="border-destructive/40">
          <CardContent className="py-8 text-center text-sm text-destructive">
            Could not load monthly expenses. Check your connection and try again.
          </CardContent>
        </Card>
      ) : (
        <>
          {isLoading ? (
            <StatCardsRowSkeleton count={6} />
          ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Revenue (PKR)"
              value={formatMoney(detail?.revenue_pkr ?? 0, "pkr")}
              icon={TrendingUp}
              delta={current ? `${monthLabel} · bookings` : "Selected month"}
            />
            <StatCard
              label="Expenses (PKR)"
              value={formatMoney(detail?.expense_pkr ?? 0, "pkr")}
              icon={Receipt}
              accent="warning"
              delta={`${detail?.expense_count_pkr ?? 0} items · ${monthLabel}`}
            />
            <StatCard
              label="Net profit (PKR)"
              value={formatMoney(detail?.profit_pkr ?? 0, "pkr")}
              icon={Calculator}
              accent={profitPkrPositive ? "success" : "warning"}
              delta={profitPkrPositive ? "Revenue − expenses" : "Loss this month"}
            />
            <StatCard
              label="Revenue (USD)"
              value={formatMoney(detail?.revenue_usd ?? 0, "usd")}
              icon={TrendingUp}
              accent="info"
              delta={current ? `${monthLabel} · international` : "Selected month"}
            />
            <StatCard
              label="Expenses (USD)"
              value={formatMoney(detail?.expense_usd ?? 0, "usd")}
              icon={Receipt}
              accent="info"
              delta={`${detail?.expense_count_usd ?? 0} items · ${monthLabel}`}
            />
            <StatCard
              label="Net profit (USD)"
              value={formatMoney(detail?.profit_usd ?? 0, "usd")}
              icon={profitUsdPositive ? TrendingUp : TrendingDown}
              accent={profitUsdPositive ? "info" : "warning"}
              delta={profitUsdPositive ? "Revenue − expenses" : "Loss this month"}
            />
          </div>
          )}

          {isLoading ? (
            <ChartCardSkeleton titleWidth="w-44" heightClass="h-72" />
          ) : (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Monthly trend (PKR)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={chartTooltipMoney} />
                    <Legend />
                    <Bar
                      dataKey="revenue_pkr"
                      name="PKR"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense_pkr"
                      name="Expenses"
                      fill="hsl(var(--destructive))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="profit_pkr"
                      name="Profit"
                      fill="hsl(var(--chart-3))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
          )}

          {isLoading ? (
            <div className="space-y-4">
              <ProfitLossExpenseBlockSkeleton />
              <ProfitLossExpenseBlockSkeleton />
            </div>
          ) : current ? (
            <MonthExpenseBlock
              block={current}
              highlight
              highlightLabel={focusBadgeLabel}
              onEdit={openEdit}
              onDelete={handleDelete}
              onDownloadPdf={(m) => void handleDownloadMonthPdf(m)}
              onDownloadExcel={(m) => void handleDownloadMonthExcel(m)}
              downloadingPdf={downloadingPdfMonth === current.month}
              downloadingExcel={downloadingExcelMonth === current.month}
              deleting={removeExpense.isPending}
            />
          ) : null}

          {historyMonths.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Earlier months
              </h2>
              {historyMonths.map((block) => (
                <MonthExpenseBlock
                  key={block.month}
                  block={block}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onDownloadPdf={(m) => void handleDownloadMonthPdf(m)}
                  onDownloadExcel={(m) => void handleDownloadMonthExcel(m)}
                  downloadingPdf={downloadingPdfMonth === block.month}
                  downloadingExcel={downloadingExcelMonth === block.month}
                  deleting={removeExpense.isPending}
                />
              ))}
            </div>
          ) : !isLoading ? (
            <p className="text-center text-sm text-muted-foreground">
              No past expense records yet.
            </p>
          ) : null}

          {historyPagination && historyPagination.pages > 1 ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={historyPage <= 1 || isFetching}
                onClick={() => setHistoryPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {historyPagination.page} of {historyPagination.pages}
                {isFetching ? " · updating…" : ""}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={historyPage >= historyPagination.pages || isFetching}
                onClick={() => setHistoryPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit expense" : "Add expense"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="exp-title">What did you buy / pay for?</Label>
              <Input
                id="exp-title"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="e.g. Monthly electricity bill"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="exp-amount">Amount</Label>
                <Input
                  id="exp-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.amount || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, amount: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={draft.currency}
                  onValueChange={(v) => setDraft((d) => ({ ...d, currency: v as ExpenseCurrency }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pkr">PKR (Rs)</SelectItem>
                    <SelectItem value="usd">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={draft.category}
                  onValueChange={(v) => setDraft((d) => ({ ...d, category: v as ExpenseCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {EXPENSE_CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-date">Date</Label>
                <Input
                  id="exp-date"
                  type="date"
                  value={draft.expense_date}
                  onChange={(e) => setDraft((d) => ({ ...d, expense_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-vendor">Vendor (optional)</Label>
              <Input
                id="exp-vendor"
                value={draft.vendor}
                onChange={(e) => setDraft((d) => ({ ...d, vendor: e.target.value }))}
                placeholder="Shop or supplier name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-notes">Notes (optional)</Label>
              <Textarea
                id="exp-notes"
                rows={3}
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                placeholder="Receipt details, quantity, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Add expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
