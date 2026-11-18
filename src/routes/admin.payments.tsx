import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Download, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, GlassSearch } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RecordPaymentSheet } from "@/components/admin/booking-detail/record-payment-sheet";
import { EmailRemindersDialog } from "@/components/admin/residents/email-reminders-dialog";
import { Pager } from "@/components/admin/residents/moved-out-view";
import { MethodsCard, MoneyChart, OwingBanner, PaymentsKpis } from "@/components/admin/payments/payments-overview";
import { RentByResident, rowMoney } from "@/components/admin/payments/rent-by-resident";
import { TransactionsList, TxToolbar, type TxFilters } from "@/components/admin/payments/transactions-view";
import { PaymentDetailSheet } from "@/components/admin/payments/payment-detail-sheet";
import { DepositsView } from "@/components/admin/payments/deposits-view";
import { downloadResidentMonthInvoiceApi } from "@/api/residents";
import { getResidentsRollApi } from "@/api/residents/residentsRoll.api";
import { getTransactionsApi } from "@/api/payments/paymentsOverview.api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useBookingQuery } from "@/queries/bookings/useBookingQuery";
import { useResidentsRollQuery } from "@/queries/residents";
import { useDepositsOverviewQuery, usePaymentsOverviewQuery, useTransactionsQuery } from "@/queries/payments/usePaymentsOverview";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { RollRow, RollStatusFilter } from "@/types/domain/resident-roll.types";
import type { Transaction } from "@/types/domain/payments.types";

type Tab = "rent" | "transactions" | "deposits";
const TABS: Tab[] = ["rent", "transactions", "deposits"];

export const Route = createFileRoute("/admin/payments")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab; month?: string } => ({
    ...(TABS.includes(s.tab as Tab) && s.tab !== "rent" ? { tab: s.tab as Tab } : {}),
    ...(typeof s.month === "string" && /^\d{4}-\d{2}$/.test(s.month) ? { month: s.month } : {}),
  }),
  component: PaymentsPage,
});

const pad = (n: number) => String(n).padStart(2, "0");
const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const shift = (k: string, by: number) => {
  const [y, m] = k.split("-").map(Number);
  const d = new Date(y, m - 1 + by, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const title = (k: string) => {
  const [y, m] = k.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};

function PaymentsPage() {
  const navigate = useNavigate({ from: "/admin/payments" });
  const search = Route.useSearch();
  const tab: Tab = search.tab ?? "rent";
  const month = search.month ?? thisMonth();
  const monthName = title(month).split(" ")[0];
  const { hostelId } = useHostelScope();
  const token = useAuthStore((s) => s.token);
  const [currency, setCurrency] = useState<"pkr" | "usd">("pkr");
  const hostel = hostelId ?? undefined;
  const enabled = Boolean(hostelId);

  const setTab = (t: Tab) => void navigate({ search: { ...search, tab: t === "rent" ? undefined : t } });
  const setMonth = (k: string) => void navigate({ search: { ...search, month: k === thisMonth() ? undefined : k } });

  const overview = usePaymentsOverviewQuery({ month, hostel, currency }, enabled);

  // Rent by resident
  const [status, setStatus] = useState<RollStatusFilter>("all");
  const [q, setQ] = useState("");
  const query = useDebouncedValue(q.trim(), 300);
  const [room, setRoom] = useState("");
  const [method, setMethod] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [status, query, room, method, month, currency]);
  const roll = useResidentsRollQuery({ month, hostel, currency, status, search: query || undefined, room: room || undefined, method: method || undefined, sort: "not_paid_first", page, limit: 10 }, { enabled: enabled && tab === "rent" });
  const rollAll = useResidentsRollQuery({ month, hostel, currency, limit: 1 }, { enabled: enabled && tab === "rent" });

  // Transactions
  const [tf, setTf] = useState<TxFilters>({ type: "all", method: "", kinds: ["rent", "extras", "deposit", "refund"], by: "", q: "" });
  const tq = useDebouncedValue(tf.q.trim(), 300);
  const [tpage, setTpage] = useState(1);
  useEffect(() => setTpage(1), [tf.type, tf.method, tf.kinds, tf.by, tq, month, currency]);
  const txParams = { month, hostel, currency, type: tf.type, method: tf.method || undefined, for: tf.kinds.length === 4 ? undefined : tf.kinds.join(",") || "none", by: tf.by || undefined, search: tq || undefined, page: tpage, limit: 15 };
  const tx = useTransactionsQuery(txParams, enabled && tab === "transactions");
  const txCounts = useTransactionsQuery({ month, hostel, currency, limit: 1 }, enabled);
  const deposits = useDepositsOverviewQuery({ month, hostel, currency }, enabled);

  const [openTx, setOpenTx] = useState<Transaction | null>(null);
  const [payId, setPayId] = useState<string | null>(null);
  const [remindOpen, setRemindOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const rows = roll.data?.residents ?? [];
  const totals = useMemo(() => {
    const all = rows.map(rowMoney);
    return { due: all.reduce((s, m) => s + m.due, 0), collected: all.reduce((s, m) => s + m.collected, 0), left: all.reduce((s, m) => s + m.left, 0) };
  }, [rows]);
  const s = roll.data?.summary;
  const counts = rollAll.data?.counts;
  const cur = overview.data?.currency ?? currency;

  function receipt(r: RollRow) {
    if (!token) return;
    toast.promise(downloadResidentMonthInvoiceApi(token, r.booking_id, month), { loading: `Preparing ${monthName} invoice…`, success: "Downloaded", error: (e) => (e instanceof Error ? e.message : "Download failed") });
  }

  async function exportCsv() {
    if (!token) return;
    setExporting(true);
    try {
      let lines: (string | number)[][] = [];
      if (tab === "transactions") {
        const r = await getTransactionsApi(token, { ...txParams, page: 1, limit: 200 });
        lines = [["Date", "Time", "Resident", "Room", "For", "Kind", "Method", "Reference", "By", "Amount"], ...r.transactions.map((t) => [t.at.slice(0, 10), new Date(t.at).toLocaleTimeString("en-GB"), t.name, t.room_label, t.for, t.kind, t.method_label, t.reference, t.by, t.direction === "out" ? -t.amount : t.amount])];
      } else {
        const r = await getResidentsRollApi(token, { month, hostel, currency, limit: 100, sort: "not_paid_first" });
        lines = [["Resident", "Booking", "Room", "Due", "Collected", "Left", "Status", "Last payment"], ...r.residents.map((x) => { const m = rowMoney(x); return [x.name, x.booking_code ?? "", x.room_label, m.due, m.collected, m.left, m.status, x.last_payment ? `${x.last_payment.at?.slice(0, 10)} ${x.last_payment.method_label}` : ""]; })];
      }
      const csv = lines.map((l) => l.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      Object.assign(document.createElement("a"), { href: url, download: `payments-${tab}-${month}.csv` }).click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  const tabs: [Tab, string, number | undefined][] = [
    ["rent", "Rent by resident", counts?.living],
    ["transactions", "Transactions", txCounts.data?.counts.all],
    ["deposits", "Refunds & deposits", (deposits.data?.refunds.length ?? 0) + (deposits.data?.waiting.length ?? 0)],
  ];
  const hint = tab === "rent" ? "Click a row to open the resident" : tab === "transactions" ? "Every rupee in and out, newest first" : "Deposits are kept separate from rent";

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="All money in and out · rent, extras, deposits and refunds"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 rounded-[14px] border border-glass-divider bg-glass-inset p-1">
              <button type="button" aria-label="Previous month" onClick={() => setMonth(shift(month, -1))} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:text-ink"><ChevronLeft className="size-4" aria-hidden /></button>
              <span className="glass-3 flex h-8 items-center gap-2 rounded-[10px] px-3 text-body font-semibold text-ink"><CalendarDays className="size-4 text-brand-text" aria-hidden />{title(month)}</span>
              <button type="button" aria-label="Next month" onClick={() => setMonth(shift(month, 1))} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:text-ink"><ChevronRight className="size-4" aria-hidden /></button>
            </div>
            <div role="radiogroup" aria-label="Currency" className="flex gap-0.5 rounded-[14px] border border-glass-divider bg-glass-inset p-1">
              {(["pkr", "usd"] as const).map((c) => (
                <button key={c} type="button" role="radio" aria-checked={currency === c} onClick={() => setCurrency(c)} className={cn("h-8 cursor-pointer rounded-[10px] px-3 text-body font-medium uppercase", currency === c ? "glass-3 text-ink" : "text-ink-2")}>{c}</button>
              ))}
            </div>
            <GlassButton variant="glass" className="hidden md:inline-flex" onClick={() => void exportCsv()} disabled={exporting}>{exporting ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />} Export</GlassButton>
            <PayPicker rows={rows} onPick={setPayId} />
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        <PaymentsKpis data={overview.data} />

        {tab === "rent" ? (
          <>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
              <MoneyChart data={overview.data} monthName={monthName} />
              <MethodsCard data={overview.data} />
            </div>
            <OwingBanner data={overview.data} monthName={monthName} onShow={() => setStatus("not_paid")} onRemind={() => setRemindOpen(true)} />
          </>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div role="tablist" aria-label="Payments" className="no-scrollbar grid w-full grid-cols-3 gap-0.5 overflow-x-auto rounded-[14px] border border-glass-divider bg-glass-inset p-1 md:flex md:w-auto">
            {tabs.map(([k, l, n]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border px-3 text-body font-medium whitespace-nowrap", tab === k ? "glass-3 border-glass-stroke text-ink" : "border-transparent text-ink-2 hover:text-ink")}>
                <span className="md:hidden">{k === "rent" ? "Residents" : k === "transactions" ? "Transactions" : "Refunds"}</span>
                <span className="hidden md:inline">{l}</span>
                {n != null ? <span className="hidden text-label text-ink-3 md:inline">{n}</span> : null}
              </button>
            ))}
          </div>
          <p className="hidden text-label text-ink-3 md:block">{hint}</p>
        </div>

        {tab === "rent" ? (
          <>
            <div className="glass-2 flex flex-wrap items-center gap-2 rounded-[18px] p-2.5">
              <div className="no-scrollbar flex max-w-full gap-0.5 overflow-x-auto rounded-[14px] border border-glass-divider bg-glass-inset p-1">
                {(
                  [
                    ["all", "All", counts?.living],
                    ["not_paid", "Not paid", s?.not_paid.count],
                    ["partial", "Partial", s?.partial.count],
                    ["paid", "Paid", s?.paid.count],
                    ["returned", "Returned", undefined],
                  ] as const
                ).map(([k, l, n]) => (
                  <button key={k} type="button" aria-pressed={status === k} onClick={() => setStatus(k)} className={cn("flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] border px-3 text-body font-medium", status === k ? "glass-3 border-glass-stroke text-ink" : "border-transparent text-ink-2 hover:text-ink")}>
                    {l}
                    {n != null ? <span className="text-label text-ink-3">{n}</span> : null}
                  </button>
                ))}
              </div>
              <GlassSearch className="min-w-[180px] flex-1 md:max-w-[240px]" placeholder="Name, room, booking" shortcut="" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search residents" />
              <span className="hidden flex-1 md:block" />
              <div className="hidden gap-2 md:flex">
                <SimplePick label="Room" value={room} options={(roll.data?.rooms ?? []).map((r) => [r.id, r.label])} onChange={setRoom} />
                <SimplePick label="Method" value={method} options={(overview.data?.methods ?? []).filter((m) => m.method !== "none").map((m) => [m.method, m.label])} onChange={setMethod} />
              </div>
            </div>
            {roll.isLoading ? (
              <div className="glass-2 h-[420px] animate-pulse rounded-[20px]" />
            ) : rows.length === 0 ? (
              <div className="glass-2 rounded-[20px] px-4 py-14 text-center text-body text-ink-2">No residents match.</div>
            ) : (
              <RentByResident
                rows={rows}
                onCollect={(r) => setPayId(r.booking_id)}
                onReceipt={receipt}
                footer={
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-glass-divider px-4 py-3">
                    <p className="text-label text-ink-3">Showing {rows.length} of {roll.data?.pagination.total ?? 0} · not paid first</p>
                    <div className="flex flex-wrap items-center gap-4 text-label">
                      <span className="text-ink-3">Due <span className="text-body font-semibold text-ink">{formatMoney(totals.due, cur)}</span></span>
                      <span className="text-ink-3">Collected <span className="text-body font-semibold text-ink">{formatMoney(totals.collected, cur)}</span></span>
                      <span className="text-ink-3">Left <span className="text-body font-semibold text-danger">{formatMoney(totals.left, cur)}</span></span>
                      <Pager text="" page={page} pages={roll.data?.pagination.pages ?? 1} onPage={setPage} />
                    </div>
                  </div>
                }
              />
            )}
          </>
        ) : tab === "transactions" ? (
          <>
            <TxToolbar data={tx.data} f={tf} set={(p) => setTf((x) => ({ ...x, ...p }))} />
            {tx.isLoading ? (
              <div className="glass-2 h-[420px] animate-pulse rounded-[20px]" />
            ) : (
              <TransactionsList
                rows={tx.data?.transactions ?? []}
                onOpen={setOpenTx}
                footer={
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-glass-divider px-4 py-3">
                    <p className="text-label text-ink-3">Showing {tx.data?.transactions.length ?? 0} of {tx.data?.pagination.total ?? 0} transactions</p>
                    <div className="flex flex-wrap items-center gap-4 text-label">
                      <span className="text-ink-3">Money in <span className="text-body font-semibold text-ink">{formatMoney(tx.data?.totals.money_in ?? 0, cur)}</span></span>
                      <span className="text-ink-3">Refunds <span className="text-body font-semibold text-ink">− {formatMoney(tx.data?.totals.refunds ?? 0, cur)}</span></span>
                      <span className="text-ink-3">Net <span className="text-body font-semibold text-ink">{formatMoney(tx.data?.totals.net ?? 0, cur)}</span></span>
                      <Pager text="" page={tpage} pages={tx.data?.pagination.pages ?? 1} onPage={setTpage} />
                    </div>
                  </div>
                }
              />
            )}
          </>
        ) : (
          <DepositsView data={deposits.data} />
        )}
      </div>

      <PaymentDetailSheet tx={openTx} onClose={() => setOpenTx(null)} />
      {payId ? <PaySheet bookingId={payId} onClose={() => setPayId(null)} /> : null}
      <EmailRemindersDialog open={remindOpen} onOpenChange={setRemindOpen} month={month} monthName={monthName} hostelId={hostel} summary={s} sample={rows.find((r) => r.this_month.status !== "paid")} />
    </>
  );
}

function SimplePick({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger className={cn("glass-3 flex h-10 cursor-pointer items-center gap-2 rounded-[12px] px-3.5 text-body font-semibold text-ink", value && "ring-1 ring-brand-border")}>
        <ChevronDown className="size-4" aria-hidden /> {value ? options.find(([k]) => k === value)?.[1] ?? label : label}
      </PopoverTrigger>
      <PopoverContent align="end" className="glass-3 max-h-[300px] w-[200px] overflow-y-auto rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
        {[["", `Any ${label.toLowerCase()}`] as [string, string], ...options].map(([k, l]) => (
          <button key={k || "any"} type="button" onClick={() => onChange(k)} className={cn("flex w-full cursor-pointer items-center justify-between rounded-[10px] px-3 py-2 text-left text-body hover:bg-glass-inset", value === k && "bg-brand-tint")}>
            {l}
            {value === k ? <Check className="size-4 text-brand-text" aria-hidden /> : null}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function PaySheet({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const { data: booking } = useBookingQuery(bookingId);
  if (!booking) return null;
  return <RecordPaymentSheet booking={booking} open onOpenChange={(o) => !o && onClose()} />;
}

function PayPicker({ rows, onPick }: { rows: RollRow[]; onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const list = rows.filter((r) => !q.trim() || r.name.toLowerCase().includes(q.trim().toLowerCase()) || r.room_label.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <GlassButton><Plus aria-hidden /> <span className="hidden sm:inline">Record payment</span></GlassButton>
      </PopoverTrigger>
      <PopoverContent align="end" className="glass-3 w-[320px] rounded-[16px] border-0 p-2 font-geist text-ink shadow-none">
        <p className="px-1.5 pt-1 pb-2 text-eyebrow text-ink-3 uppercase">Who paid?</p>
        <GlassSearch autoFocus placeholder="Name or room" shortcut="" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find resident" />
        <div className="mt-1.5 flex max-h-[300px] flex-col overflow-y-auto">
          {list.length === 0 ? <p className="px-2 py-4 text-center text-label text-ink-3">Open “Rent by resident” to pick from everyone.</p> : null}
          {list.map((r) => {
            const m = rowMoney(r);
            return (
              <button key={r.booking_id} type="button" onClick={() => { setOpen(false); onPick(r.booking_id); }} className="flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2 py-2 text-left hover:bg-glass-inset">
                <span className="w-7 text-center text-label font-semibold text-ink-2">{r.initials}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-body font-medium text-ink">{r.name}</span><span className="block truncate text-label text-ink-3">{r.room_label}</span></span>
                <span className={cn("text-label font-semibold", m.left > 0 ? "text-danger" : "text-ink-3")}>{formatMoney(m.left, r.currency)}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
