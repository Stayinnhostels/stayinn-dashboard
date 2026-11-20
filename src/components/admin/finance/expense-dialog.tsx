import { useEffect, useRef, useState } from "react";
import { Building2, CalendarDays, Check, Droplet, Ellipsis, Loader2, Package, Paperclip, Receipt, Sparkles, Trash2, Upload, Users, Wifi, Wrench, Zap, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { DepositModal, readAsDataUrl, todayKey } from "@/components/admin/security/deposit-shared";
import { FinDialogHeader, FinToggle, Segmented, finInput, finLabel, monthName } from "@/components/admin/finance/finance-kit";
import { useCreateExpenseMutation, useUpdateExpenseMutation } from "@/queries/expenses";
import { cn } from "@/lib/utils";
import type { Expense, ExpenseCategory, ExpenseCurrency, ExpenseDraft } from "@/types/domain/expense.types";

/** Figma 15.03 category chips (order + short names). */
export const EXPENSE_CATS: [ExpenseCategory, string, LucideIcon][] = [
  ["utilities", "Utilities", Zap],
  ["staff", "Staff", Users],
  ["food", "Food", Package],
  ["repairs", "Repairs", Wrench],
  ["cleaning", "Cleaning", Sparkles],
  ["supplies", "Supplies", Package],
  ["rent", "Rent", Building2],
  ["other", "Other", Ellipsis],
];
export const catLabel = (c: ExpenseCategory) => EXPENSE_CATS.find(([k]) => k === c)?.[1] ?? c;

/** Row icon: picked from the title for bills (electricity, internet, gas, water), else the category. */
export function expenseIcon(e: Pick<Expense, "title" | "category">): LucideIcon {
  const t = e.title.toLowerCase();
  if (e.category === "utilities" || e.category === "other") {
    if (/electric|lesco|k-?electric|power|bijli/.test(t)) return Zap;
    if (/internet|wifi|wi-fi|fibre|fiber|broadband/.test(t)) return Wifi;
    if (/\bgas\b|water|sngpl|ssgc/.test(t)) return Droplet;
  }
  return EXPENSE_CATS.find(([k]) => k === e.category)?.[2] ?? Receipt;
}

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Expense | null;
  hostelId: string | null;
  /** Opens with "Repeat every month" switched on (Add recurring expense). */
  recurring?: boolean;
  /** Default date for a new expense (the month being viewed). */
  defaultDate?: string;
  onViewReceipt?: (e: Expense) => void;
};

const blank = (date: string, recurring: boolean) => ({
  amount: "",
  currency: "pkr" as ExpenseCurrency,
  category: "utilities" as ExpenseCategory,
  title: "",
  vendor: "",
  date,
  notes: "",
  repeat: recurring,
});

export function ExpenseDialog({ open, onOpenChange, editing, hostelId, recurring = false, defaultDate, onViewReceipt }: Props) {
  const [f, setF] = useState(() => blank(defaultDate ?? todayKey(), recurring));
  const [file, setFile] = useState<{ data: string; name: string } | null>(null);
  const [removeReceipt, setRemoveReceipt] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const create = useCreateExpenseMutation();
  const update = useUpdateExpenseMutation();
  const saving = create.isPending || update.isPending;

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setRemoveReceipt(false);
    if (editing) {
      setF({ amount: String(editing.amount), currency: editing.currency, category: editing.category, title: editing.title, vendor: editing.vendor, date: editing.expense_date, notes: editing.notes, repeat: false });
    } else {
      setF(blank(defaultDate ?? todayKey(), recurring));
    }
  }, [open, editing, recurring, defaultDate]);

  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));
  const amountNum = Number(String(f.amount).replace(/,/g, ""));

  async function pick(fl: File | undefined) {
    if (!fl) return;
    try {
      setFile({ data: await readAsDataUrl(fl), name: fl.name });
      setRemoveReceipt(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read the file");
    }
  }

  function save() {
    if (!f.title.trim()) return toast.error("Say what the expense was for");
    if (!Number.isFinite(amountNum) || amountNum < 0 || f.amount === "") return toast.error("Enter a valid amount");
    if (!hostelId) return toast.error("Select a property before adding an expense");
    const payload: ExpenseDraft = {
      title: f.title.trim(),
      amount: Math.round(amountNum * 100) / 100,
      currency: f.currency,
      category: f.category,
      expense_date: f.date,
      vendor: f.vendor.trim(),
      notes: f.notes.trim(),
      hostel: hostelId,
      ...(file ? { receipt: file.data, receipt_name: file.name } : {}),
      ...(removeReceipt && !file ? { remove_receipt: true } : {}),
    };
    if (editing) {
      update.mutate(
        { id: editing.id, input: payload },
        { onSuccess: () => { toast.success("Expense updated"); onOpenChange(false); }, onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed") },
      );
      return;
    }
    create.mutate(
      { ...payload, ...(f.repeat ? { repeat_monthly: true } : {}) },
      { onSuccess: () => { toast.success(f.repeat ? "Expense added · repeats every month" : "Expense added"); onOpenChange(false); }, onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add expense") },
    );
  }

  const hasStored = Boolean(editing?.has_receipt) && !removeReceipt && !file;
  const forMonth = f.date ? monthName(f.date.slice(0, 7)) : "this month";
  const day = Number(f.date?.slice(8, 10)) || 1;
  const nth = day === 1 || day === 21 || day === 31 ? "st" : day === 2 || day === 22 ? "nd" : day === 3 || day === 23 ? "rd" : "th";

  return (
    <DepositModal open={open} onOpenChange={onOpenChange} width={640}>
      <FinDialogHeader icon={<Receipt />} title={editing ? "Edit expense" : recurring ? "Add recurring expense" : "Add expense"} sub={`Counts towards ${forMonth} profit`} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 md:p-6">
        <label className="flex h-[60px] items-center gap-2 rounded-[14px] border border-brand-border bg-glass-inset px-4">
          <span className="text-body font-medium text-ink-3">{f.currency === "usd" ? "$" : "Rs"}</span>
          <input
            autoFocus
            inputMode="decimal"
            aria-label="Amount"
            placeholder="0"
            value={f.amount}
            onChange={(e) => set({ amount: e.target.value.replace(/[^\d.,]/g, "") })}
            onBlur={() => Number.isFinite(amountNum) && f.amount !== "" && set({ amount: amountNum.toLocaleString("en-US", { maximumFractionDigits: 2 }) })}
            onFocus={() => set({ amount: String(f.amount).replace(/,/g, "") })}
            className="min-w-0 flex-1 bg-transparent text-[24px] leading-[30px] font-semibold tracking-[-0.24px] text-ink outline-none placeholder:text-ink-3"
          />
          <Segmented label="Currency" value={f.currency} onChange={(c) => set({ currency: c })} options={[["pkr", "PKR"], ["usd", "USD"]] as const} />
        </label>

        <div className="flex flex-col gap-2">
          <p className={finLabel}>Category</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Category">
            {EXPENSE_CATS.map(([k, l, Icon]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={f.category === k}
                onClick={() => set({ category: k })}
                className={cn(
                  "flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-label font-medium",
                  f.category === k ? "border-[1.5px] border-ink-2 bg-glass-2 text-ink" : "border border-glass-divider bg-glass-inset text-ink-2 hover:text-ink",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {l}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={finLabel}>What was it for?</span>
          <input className={finInput} value={f.title} maxLength={200} placeholder="e.g. Electricity bill · October" onChange={(e) => set({ title: e.target.value })} />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>Vendor</span>
            <input className={finInput} value={f.vendor} maxLength={120} placeholder="Shop, company or person" onChange={(e) => set({ vendor: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>Date</span>
            <span className={cn(finInput, "flex items-center gap-2 focus-within:border-brand-border")}>
              <CalendarDays className="size-4 shrink-0 text-ink-2" aria-hidden />
              <input type="date" required value={f.date} onChange={(e) => e.target.value && set({ date: e.target.value })} className="min-w-0 flex-1 bg-transparent font-medium text-ink outline-none [&::-webkit-calendar-picker-indicator]:opacity-0" />
            </span>
          </label>
        </div>

        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
        {file || hasStored ? (
          <div className="flex items-center gap-2.5 rounded-[12px] border border-glass-stroke px-3.5 py-3">
            <Paperclip className="size-4 shrink-0 text-ink-2" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-ink">{file ? file.name : editing?.receipt_name || "Bill photo"}</p>
              <p className="text-label text-ink-3">{file ? "Will be saved with the expense" : "Attached"}</p>
            </div>
            {hasStored && editing && onViewReceipt ? <GlassButton size="sm" variant="ghost" onClick={() => onViewReceipt(editing)}>View</GlassButton> : null}
            <GlassButton size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>Replace</GlassButton>
            <button type="button" aria-label="Remove bill photo" onClick={() => { setFile(null); if (editing?.has_receipt) setRemoveReceipt(true); }} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-inset hover:text-danger">
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="flex cursor-pointer items-center gap-2.5 rounded-[12px] border border-dashed border-glass-stroke px-3.5 py-3 text-left hover:bg-glass-inset">
            <Upload className="size-4 shrink-0 text-ink-2" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-body font-medium text-ink">Attach bill photo</span>
              <span className="block text-label text-ink-3">Optional · keeps your records complete</span>
            </span>
          </button>
        )}

        {editing ? (
          editing.recurring_id ? <p className="rounded-[12px] bg-glass-inset px-3.5 py-3 text-label text-ink-2">Added by a monthly rule. Changes here only affect this month — stop the rule under “Repeats every month”.</p> : null
        ) : (
          <div className="flex items-center gap-3 rounded-[12px] bg-glass-inset px-3.5 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-body font-medium text-ink">Repeat every month</p>
              <p className="text-label text-ink-3">{f.repeat ? `Adds this expense automatically on the ${day}${nth} of every month` : "Adds this expense automatically on the same date"}</p>
            </div>
            <FinToggle label="Repeat every month" checked={f.repeat} onChange={(v) => set({ repeat: v })} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2.5 border-t border-glass-divider px-5 py-4 md:px-6">
        <span className="flex-1" />
        <GlassButton variant="glass" onClick={() => onOpenChange(false)}>Cancel</GlassButton>
        <GlassButton onClick={save} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
          {editing ? "Save changes" : "Save expense"}
        </GlassButton>
      </div>
    </DepositModal>
  );
}
