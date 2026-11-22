import { StickyBar } from "@/components/admin/sticky-bar";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, Ellipsis, FileDown, FileSpreadsheet, Loader2, Paperclip, Pencil, Plus, Receipt, RefreshCw, Trash2, TrendingUp, Wallet, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { GlassButton, GlassSearch } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DepositModal } from "@/components/admin/security/deposit-shared";
import { BarRow, CardHead, FinDialogHeader, FinKpi, MonthSwitcher, Segmented, isMonthKey, monthName, shiftMonth, thisMonthKey } from "@/components/admin/finance/finance-kit";
import { EXPENSE_CATS, ExpenseDialog, catLabel, expenseIcon } from "@/components/admin/finance/expense-dialog";
import { downloadMonthProfitLossExcelApi, downloadMonthProfitLossPdfApi, getExpenseReceiptApi } from "@/api/expenses";
import { useDeleteExpenseMutation, useDeleteRecurringExpenseMutation, useExpensesListQuery, useFinanceOverviewQuery, useRecurringExpensesQuery } from "@/queries/expenses";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { Expense, ExpenseCategory, FinanceMonth, RecurringExpense } from "@/types/domain/expense.types";

/** Figma 15.02 · Monthly expenses (+ 15.03 Add expense). */
export const Route = createFileRoute("/admin/expenses")({
  validateSearch: (s: Record<string, unknown>): { month?: string } => (isMonthKey(s.month) ? { month: s.month } : {}),
  component: MonthlyExpensesPage,
});

const ordinal = (d: number) => `${d}${d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th"}`;

function MonthlyExpensesPage() {
  const navigate = useNavigate({ from: "/admin/expenses" });
  const search = Route.useSearch();
  const month = search.month ?? thisMonthKey();
  const setMonth = (k: string) => void navigate({ search: { month: k === thisMonthKey() ? undefined : k } });
  const name = monthName(month);
  const prevName = monthName(shiftMonth(month, -1));
  const isCurrent = month === thisMonthKey();

  const { hostelId, hostels } = useHostelScope();
  const token = useAuthStore((s) => s.token);
  // Live still has expenses saved with hostel=null. With a single property there is nothing to
  // scope — omit the filter so newly added expenses appear immediately (kept from the old page).
  const scopedHostel = hostelId && hostels.length > 1 ? hostelId : undefined;

  const [cat, setCat] = useState<ExpenseCategory | "all">("all");
  const [q, setQ] = useState("");
  const query = useDebouncedValue(q.trim(), 300);
  useEffect(() => setCat("all"), [month]);

  const list = useExpensesListQuery({ month, category: cat === "all" ? undefined : cat, search: query || undefined, hostel: scopedHostel, limit: 100 }, Boolean(hostelId));
  const fin = useFinanceOverviewQuery({ from: shiftMonth(month, -1), to: month, currency: "pkr", hostel: hostelId ?? undefined }, Boolean(hostelId));
  const recurring = useRecurringExpensesQuery(scopedHostel, Boolean(hostelId));
  const remove = useDeleteExpenseMutation();
  const stopRule = useDeleteRecurringExpenseMutation();

  const [dialog, setDialog] = useState<{ editing: Expense | null; recurring: boolean } | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [receipt, setReceipt] = useState<{ name: string; data: string } | null>(null);
  const [stopping, setStopping] = useState<RecurringExpense | null>(null);

  const cur = fin.data?.months.find((m) => m.key === month);
  const prev = fin.data?.months.find((m) => m.key === shiftMonth(month, -1));
  const rows = list.data?.expenses ?? [];
  const counts = list.data?.category_counts ?? {};
  const totals = useMemo(() => {
    const t = { pkr: 0, usd: 0 };
    for (const e of rows) t[e.currency] += e.amount;
    return t;
  }, [rows]);

  const defaultDate = isCurrent ? undefined : `${month}-${String(Math.min(28, new Date().getDate())).padStart(2, "0")}`;

  async function viewReceipt(e: Expense) {
    if (!token) return;
    try {
      const r = await getExpenseReceiptApi(token, e.id);
      setReceipt({ name: r.receipt_name || e.title, data: r.receipt });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open the bill photo");
    }
  }

  function exportMonth(kind: "pdf" | "excel") {
    if (!token) return toast.error("You must be signed in to download");
    const run = kind === "pdf" ? downloadMonthProfitLossPdfApi(token, month) : downloadMonthProfitLossExcelApi(token, month);
    toast.promise(run, { loading: `Preparing ${name} ${kind === "pdf" ? "PDF" : "Excel"}…`, success: "Downloaded", error: (e) => (e instanceof Error ? e.message : "Download failed") });
  }

  const tabs: [ExpenseCategory | "all", string, number | undefined][] = [
    ["all", "All", counts.all ?? 0],
    ...EXPENSE_CATS.filter(([k]) => (counts[k] ?? 0) > 0 || cat === k).map(([k, l]) => [k, l, counts[k] ?? 0] as [ExpenseCategory, string, number]),
  ];

  return (
    <>
      <PageHeader
        title="Monthly expenses"
        subtitle="Everything you spend to run the hostel · bills, salaries, repairs and food"
        actions={
          <>
            <MonthSwitcher month={month} onChange={setMonth} />
            <ExportMenu onPick={exportMonth} />
            <GlassButton onClick={() => setDialog({ editing: null, recurring: false })}>
              <Plus aria-hidden /> Add expense
            </GlassButton>
          </>
        }
      />

      <div className="flex flex-col gap-4 md:gap-5">
        <Kpis month={cur} prev={prev} name={name} prevName={prevName} isCurrent={isCurrent} count={counts.all} />

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-3">
            <StickyBar className="mx-0 px-0 md:mx-0 md:px-0"><div className="glass-2 flex flex-wrap items-center gap-2 rounded-[20px] p-3">
              <Segmented label="Category" value={cat} onChange={setCat} options={tabs} />
              <GlassSearch className="min-w-[180px] flex-1" placeholder="Title or vendor" shortcut="" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search expenses" />
            </div></StickyBar>
            <ExpenseTable
              rows={rows}
              loading={list.isLoading}
              total={totals}
              count={list.data?.pagination.total ?? 0}
              filtered={cat !== "all" || Boolean(query)}
              name={name}
              onEdit={(e) => setDialog({ editing: e, recurring: false })}
              onDelete={setDeleting}
              onReceipt={(e) => void viewReceipt(e)}
              onAdd={() => setDialog({ editing: null, recurring: false })}
            />
          </div>
          <div className="flex flex-col gap-4">
            <ByCategory month={cur} name={name} />
            <Recurring rows={recurring.data ?? []} loading={recurring.isLoading} onAdd={() => setDialog({ editing: null, recurring: true })} onStop={setStopping} />
          </div>
        </div>
      </div>

      <ExpenseDialog
        open={dialog != null}
        onOpenChange={(o) => !o && setDialog(null)}
        editing={dialog?.editing ?? null}
        recurring={dialog?.recurring}
        hostelId={hostelId}
        defaultDate={defaultDate}
        onViewReceipt={(e) => void viewReceipt(e)}
      />

      <Confirm
        open={deleting != null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete expense?"
        body={`Delete “${deleting?.title ?? ""}”? This action cannot be undone.`}
        action="Delete"
        busy={remove.isPending}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => { toast.success("Expense deleted"); setDeleting(null); },
            onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
          })
        }
      />
      <Confirm
        open={stopping != null}
        onOpenChange={(o) => !o && setStopping(null)}
        title="Stop repeating?"
        body={`“${stopping?.title ?? ""}” will no longer be added every month. Expenses it already added stay.`}
        action="Stop repeating"
        busy={stopRule.isPending}
        onConfirm={() =>
          stopping &&
          stopRule.mutate(stopping.id, {
            onSuccess: () => { toast.success("Stopped"); setStopping(null); },
            onError: (e) => toast.error(e instanceof Error ? e.message : "Could not stop it"),
          })
        }
      />
      <ReceiptViewer receipt={receipt} onClose={() => setReceipt(null)} />
    </>
  );
}

function ExportMenu({ onPick }: { onPick: (k: "pdf" | "excel") => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <GlassButton variant="glass"><Download aria-hidden /> <span className="hidden sm:inline">Export</span></GlassButton>
      </PopoverTrigger>
      <PopoverContent align="end" className="glass-3 w-[200px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
        {(
          [
            ["pdf", "PDF report", FileDown],
            ["excel", "Excel sheet", FileSpreadsheet],
          ] as const
        ).map(([k, l, Icon]) => (
          <button key={k} type="button" onClick={() => { setOpen(false); onPick(k); }} className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-body hover:bg-glass-inset">
            <Icon className="size-4 text-ink-2" aria-hidden /> {l}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function Kpis({ month, prev, name, prevName, isCurrent, count }: { month?: FinanceMonth; prev?: FinanceMonth; name: string; prevName: string; isCurrent: boolean; count?: number }) {
  const money = (n: number) => formatMoney(n, "pkr");
  const diff = month && prev ? month.expenses - prev.expenses : null;
  const n = count ?? 0;
  // Biggest category change against the month before ("Electricity up Rs 9,000" in Figma).
  let change = "";
  if (month && prev) {
    if (prev.expenses === 0) change = `Nothing spent in ${prevName}`;
    else {
      const keys = new Set([...Object.keys(month.by_category), ...Object.keys(prev.by_category)]) as Set<ExpenseCategory>;
      let best: [ExpenseCategory, number] | null = null;
      for (const k of keys) {
        const d = (month.by_category[k] ?? 0) - (prev.by_category[k] ?? 0);
        if (!best || Math.abs(d) > Math.abs(best[1])) best = [k, d];
      }
      change = best && best[1] !== 0 ? `${catLabel(best[0])} ${best[1] > 0 ? "up" : "down"} ${money(Math.abs(best[1]))}` : `Same as ${prevName}`;
    }
  }
  const profitSub = !month ? "" : month.revenue === 0 && month.expenses === 0 ? "Nothing in or out yet" : month.profit < 0 ? "Spending is ahead of income" : month.margin != null ? `${month.margin}% of revenue kept` : "";
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
      <FinKpi icon={<Receipt />} label={`Spent in ${name}`} value={month ? money(month.expenses) : "—"} sub={`${n} expense${n === 1 ? "" : "s"}${isCurrent ? " so far" : ""}`} />
      <FinKpi icon={<TrendingUp />} label={`Revenue in ${name}`} value={month ? money(month.revenue) : "—"} sub="Rent & extras collected" />
      <FinKpi icon={<Wallet />} label={isCurrent ? "Profit so far" : `Profit in ${name}`} value={month ? money(month.profit) : "—"} danger={(month?.profit ?? 0) < 0} sub={profitSub} />
      <FinKpi icon={<BarChart3 />} label={`vs ${prevName}`} value={diff == null ? "—" : `${diff > 0 ? "+ " : diff < 0 ? "− " : ""}${money(Math.abs(diff))}`} sub={change} />
    </div>
  );
}

function RowMenu({ e, onEdit, onDelete, onReceipt }: { e: Expense; onEdit: () => void; onDelete: () => void; onReceipt: () => void }) {
  const [open, setOpen] = useState(false);
  const item = "flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-body hover:bg-glass-inset [&_svg]:size-4";
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={`Actions for ${e.title}`} onClick={(ev) => ev.stopPropagation()} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-inset hover:text-ink">
        <Ellipsis className="size-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" onClick={(ev) => ev.stopPropagation()} className="glass-3 w-[190px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
        <button type="button" className={item} onClick={() => { setOpen(false); onEdit(); }}><Pencil className="text-ink-2" aria-hidden /> Edit</button>
        {e.has_receipt ? <button type="button" className={item} onClick={() => { setOpen(false); onReceipt(); }}><Paperclip className="text-ink-2" aria-hidden /> View bill photo</button> : null}
        <button type="button" className={cn(item, "text-danger")} onClick={() => { setOpen(false); onDelete(); }}><Trash2 aria-hidden /> Delete</button>
      </PopoverContent>
    </Popover>
  );
}

const dateShort = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function ExpenseTable({ rows, loading, total, count, filtered, name, onEdit, onDelete, onReceipt, onAdd }: { rows: Expense[]; loading: boolean; total: { pkr: number; usd: number }; count: number; filtered: boolean; name: string; onEdit: (e: Expense) => void; onDelete: (e: Expense) => void; onReceipt: (e: Expense) => void; onAdd: () => void }) {
  const cols = "md:grid md:grid-cols-[minmax(0,2.4fr)_104px_minmax(0,1.3fr)_72px_104px_40px]";
  return (
    <section className="glass-2 overflow-hidden rounded-[20px]">
      <div className={cn(cols, "hidden h-11 items-center border-b border-glass-divider bg-glass-inset text-eyebrow text-ink-3 uppercase md:grid")}>
        <span className="px-3.5">Expense</span>
        <span className="px-3.5">Category</span>
        <span className="px-3.5">Vendor</span>
        <span className="px-3.5">Date</span>
        <span className="px-3.5 text-right">Amount</span>
        <span />
      </div>
      {loading ? (
        Array.from({ length: 5 }, (_, i) => <div key={i} className="h-[60px] animate-pulse border-b border-glass-divider bg-glass-inset/40" />)
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
          <p className="text-body text-ink-2">{filtered ? "No expenses match." : `No expenses recorded for ${name}.`}</p>
          {!filtered ? <GlassButton size="sm" variant="glass" onClick={onAdd}><Plus aria-hidden /> Add expense</GlassButton> : null}
        </div>
      ) : (
        rows.map((e) => {
          const Icon = expenseIcon(e);
          return (
            <div key={e.id} role="button" tabIndex={0} onClick={() => onEdit(e)} onKeyDown={(ev) => ev.key === "Enter" && onEdit(e)} className={cn(cols, "flex min-h-[60px] cursor-pointer items-center gap-2 border-b border-glass-divider px-3 py-2.5 hover:bg-glass-inset md:gap-0 md:px-0 md:py-0")}>
              <div className="flex min-w-0 flex-1 items-center gap-2.5 md:px-3.5">
                <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-glass-2 text-ink"><Icon className="size-4" aria-hidden /></span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-body font-medium text-ink">
                    <span className="truncate">{e.title}</span>
                    {e.recurring_id ? <RefreshCw className="size-3 shrink-0 text-ink-3" aria-label="Repeats every month" /> : null}
                    {e.has_receipt ? <Paperclip className="size-3 shrink-0 text-ink-3" aria-label="Bill photo attached" /> : null}
                  </span>
                  <span className="block truncate text-label text-ink-3 md:hidden">{catLabel(e.category)}{e.vendor ? ` · ${e.vendor}` : ""} · {dateShort(e.expense_date)}</span>
                </span>
              </div>
              <span className="hidden px-3.5 md:block"><span className="inline-flex rounded-full border border-ink-2 bg-glass-inset px-2 py-0.5 text-label font-medium text-ink-2">{catLabel(e.category)}</span></span>
              <span className="hidden truncate px-3.5 text-body font-medium text-ink-2 md:block">{e.vendor || "—"}</span>
              <span className="hidden px-3.5 text-body font-medium whitespace-nowrap text-ink-2 md:block">{dateShort(e.expense_date)}</span>
              <span className="shrink-0 px-1 text-right text-body font-medium text-ink tabular-nums md:px-3.5">{formatMoney(e.amount, e.currency)}</span>
              <span className="flex justify-center"><RowMenu e={e} onEdit={() => onEdit(e)} onDelete={() => onDelete(e)} onReceipt={() => onReceipt(e)} /></span>
            </div>
          );
        })
      )}
      <div className="flex items-center gap-3 bg-glass-inset px-4 py-3.5">
        <p className="text-label text-ink-3">{count} expense{count === 1 ? "" : "s"}</p>
        <span className="flex-1" />
        <p className="text-body text-ink-2">Total</p>
        <p className="text-body font-semibold text-ink">
          {formatMoney(total.pkr, "pkr")}
          {total.usd > 0 ? ` · ${formatMoney(total.usd, "usd")}` : ""}
        </p>
      </div>
    </section>
  );
}

function ByCategory({ month, name }: { month?: FinanceMonth; name: string }) {
  const entries = Object.entries(month?.by_category ?? {}).filter(([, v]) => (v ?? 0) > 0).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0)) as [ExpenseCategory, number][];
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <section className="glass-2 flex flex-col gap-3.5 rounded-[22px] p-5">
      <CardHead title="By category" sub={name} />
      {!month ? <div className="h-32 animate-pulse rounded-[12px] bg-glass-inset" /> : entries.length === 0 ? <p className="text-label text-ink-3">Nothing spent yet.</p> : null}
      {entries.map(([k, v]) => (
        <BarRow key={k} label={catLabel(k)} value={formatMoney(v, "pkr")} pct={(v / max) * 100} />
      ))}
    </section>
  );
}

function Recurring({ rows, loading, onAdd, onStop }: { rows: RecurringExpense[]; loading: boolean; onAdd: () => void; onStop: (r: RecurringExpense) => void }) {
  return (
    <section className="glass-2 flex flex-col gap-3.5 rounded-[22px] p-5">
      <CardHead title="Repeats every month" sub="Added automatically on the date" />
      {loading ? <div className="h-16 animate-pulse rounded-[12px] bg-glass-inset" /> : null}
      {!loading && rows.length === 0 ? <p className="text-label text-ink-3">Salaries, internet or rent you pay every month can be added for you.</p> : null}
      {rows.map((r) => (
        <div key={r.id} className="group relative flex items-center gap-2 rounded-[12px] bg-glass-inset px-3 py-2.5">
          <RefreshCw className="size-3.5 shrink-0 text-ink-2" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-medium text-ink">{r.title}</p>
            <p className="truncate text-label text-ink-3">Every month on the {ordinal(r.day_of_month)}</p>
          </div>
          <p className="shrink-0 text-body font-semibold text-ink">{formatMoney(r.amount, r.currency)}</p>
          <button type="button" aria-label={`Stop repeating ${r.title}`} onClick={() => onStop(r)} className="glass-3 absolute -top-2 -right-2 flex size-6 cursor-pointer items-center justify-center rounded-full text-ink-2 opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger focus-visible:opacity-100 max-md:opacity-100">
            <X className="size-3" aria-hidden />
          </button>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="flex h-8 cursor-pointer items-center justify-center gap-2 rounded-[10px] text-label font-medium text-ink-2 hover:bg-glass-inset hover:text-ink">
        <Plus className="size-4" aria-hidden /> Add recurring expense
      </button>
    </section>
  );
}

function Confirm({ open, onOpenChange, title, body, action, busy, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; body: string; action: string; busy: boolean; onConfirm: () => void }) {
  return (
    <DepositModal open={open} onOpenChange={onOpenChange} width={440}>
      <div className="flex flex-col gap-2 p-5 md:p-6">
        <Dialog.Title className="text-[20px] leading-7 font-semibold text-ink">{title}</Dialog.Title>
        <p className="text-body text-ink-2">{body}</p>
      </div>
      <div className="flex justify-end gap-2.5 border-t border-glass-divider px-5 py-4 md:px-6">
        <GlassButton variant="glass" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</GlassButton>
        <GlassButton variant="danger" onClick={onConfirm} disabled={busy}>{busy ? <Loader2 className="animate-spin" aria-hidden /> : null}{action}</GlassButton>
      </div>
    </DepositModal>
  );
}

function ReceiptViewer({ receipt, onClose }: { receipt: { name: string; data: string } | null; onClose: () => void }) {
  const isPdf = receipt?.data.startsWith("data:application/pdf");
  return (
    <DepositModal open={receipt != null} onOpenChange={(o) => !o && onClose()} width={720}>
      <FinDialogHeader icon={<Paperclip />} title="Bill photo" sub={receipt?.name} />
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-glass-inset p-4">
        {receipt ? isPdf ? <object data={receipt.data} type="application/pdf" className="h-[70svh] w-full rounded-[12px]" aria-label={receipt.name} /> : <img src={receipt.data} alt={receipt.name} className="max-h-[70svh] max-w-full rounded-[12px] object-contain" /> : null}
      </div>
      <div className="flex justify-end border-t border-glass-divider px-5 py-4 md:px-6">
        {receipt ? (
          <GlassButton variant="glass" asChild>
            <a href={receipt.data} download={receipt.name}><Download aria-hidden /> Download</a>
          </GlassButton>
        ) : null}
      </div>
    </DepositModal>
  );
}
