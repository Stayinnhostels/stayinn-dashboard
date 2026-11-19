import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Download, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, GlassSearch } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DepositKpis, DepositToDo, LeavingBanner } from "@/components/admin/security/deposits-overview";
import { DepositsTable, type DepositActions } from "@/components/admin/security/deposits-table";
import { AdjustDialog, DepositHistorySheet, KeepDialog } from "@/components/admin/security/deposit-history-sheet";
import { ReturnDepositDialog } from "@/components/admin/security/return-deposit-dialog";
import { CollectDepositDialog } from "@/components/admin/security/collect-deposit-dialog";
import { downloadDepositReceiptApi, getDepositsApi } from "@/api/security/securityDeposits.api";
import { useDepositQuery, useDepositRemindersMutation, useDepositsQuery } from "@/queries/security/useSecurityDeposits";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { DepositRow, DepositScope, DepositTab } from "@/types/domain/security-deposits.types";

const TABS: DepositTab[] = ["all", "held", "not_paid", "leaving", "returned", "kept"];
const SCOPES: [DepositScope, string, string][] = [
  ["living", "Living here", "Everyone living here, plus deposits settled in the last 90 days"],
  ["moved_out", "Moved out", "Residents who have left"],
  ["all", "Everyone", "All deposits on record"],
];

/** Figma 09 · Security deposits (09.01–09.05). */
export const Route = createFileRoute("/admin/security-payments")({
  validateSearch: (s: Record<string, unknown>): { tab?: DepositTab; scope?: DepositScope } => ({
    ...(TABS.includes(s.tab as DepositTab) && s.tab !== "all" ? { tab: s.tab as DepositTab } : {}),
    ...(s.scope === "moved_out" || s.scope === "all" ? { scope: s.scope } : {}),
  }),
  component: SecurityDepositsPage,
});

function SecurityDepositsPage() {
  const navigate = useNavigate({ from: "/admin/security-payments" });
  const search = Route.useSearch();
  const tab = search.tab ?? "all";
  const scope = search.scope ?? "living";
  const { hostelId } = useHostelScope();
  const hostel = hostelId ?? undefined;
  const token = useAuthStore((s) => s.token);
  const [currency, setCurrency] = useState<"pkr" | "usd">("pkr");
  const [q, setQ] = useState("");
  const query = useDebouncedValue(q.trim(), 300);
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [tab, scope, query, currency]);

  const params = { hostel, currency, tab, scope, search: query || undefined, page, limit: 10 };
  const list = useDepositsQuery(params, Boolean(hostelId));
  const data = list.data;
  const remind = useDepositRemindersMutation();

  const [historyId, setHistoryId] = useState<string | null>(null);
  const [returnId, setReturnId] = useState<string | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [collect, setCollect] = useState<{ row: DepositRow | null } | null>(null);
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [keepId, setKeepId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const setTab = (t: DepositTab) => void navigate({ search: { ...search, tab: t === "all" ? undefined : t } });
  const setScope = (s: DepositScope) => void navigate({ search: { ...search, scope: s === "living" ? undefined : s } });

  const actions: DepositActions = {
    onHistory: (r) => setHistoryId(r.booking_id),
    onReturn: (r) => setReturnId(r.booking_id),
    onCollect: (r) => setCollect({ row: r }),
    onAdjust: (r) => setAdjustId(r.booking_id),
    onKeep: (r) => setKeepId(r.booking_id),
    onReceipt: (r) => {
      if (!token) return;
      toast.promise(downloadDepositReceiptApi(token, r.booking_id), { loading: "Preparing receipt…", success: "Downloaded", error: (e) => (e instanceof Error ? e.message : "Download failed") });
    },
  };

  function settle(rows: DepositRow[]) {
    if (!rows.length) return;
    setQueue(rows.slice(1).map((r) => r.booking_id));
    setReturnId(rows[0].booking_id);
  }
  function nextInQueue() {
    if (!queue.length) return;
    const [next, ...rest] = queue;
    setQueue(rest);
    setTimeout(() => setReturnId(next), 250);
  }

  function sendReminders(rows: DepositRow[]) {
    remind.mutate(
      rows.map((r) => r.booking_id),
      {
        onSuccess: (r) => {
          if (r.sent) toast.success(`Reminder emailed to ${r.sent} resident${r.sent === 1 ? "" : "s"}`);
          if (r.skipped.length) toast.warning(`${r.skipped.map((s) => s.name).join(", ")}: ${r.skipped.every((s) => s.reason === "no_email") ? "no email on file" : "email could not be sent"}`);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send reminders"),
      },
    );
  }

  async function exportCsv() {
    if (!token) return;
    setExporting(true);
    try {
      const r = await getDepositsApi(token, { ...params, page: 1, limit: 500 });
      const lines: (string | number)[][] = [
        ["Resident", "Booking", "Paid by", "Payer phone", "Room", "Stay", "Agreed", "Deposited", "To return", "Returned", "Kept", "Still held", "Status"],
        ...r.deposits.map((x) => [x.name, x.booking_code ?? "", x.payer.self ? "Self" : x.payer.name, x.payer.phone, x.room_label, x.stay_label, x.required, x.deposited, x.to_return, x.returned, x.kept, x.held, x.status]),
      ];
      const csv = lines.map((l) => l.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      Object.assign(document.createElement("a"), { href: url, download: `security-deposits-${tab}-${new Date().toISOString().slice(0, 10)}.csv` }).click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  const counts = data?.counts;
  const tabs: [DepositTab, string][] = [["all", "All"], ["held", "Held"], ["not_paid", "Not paid"], ["leaving", "Leaving soon"], ["returned", "Returned"], ["kept", "Kept"]];
  const cur = data?.currency ?? currency;
  const rows = data?.deposits ?? [];
  const pg = data?.pagination;

  return (
    <>
      <PageHeader
        className="hidden md:flex"
        title="Security deposits"
        subtitle="One-time deposits held for residents · kept separate from rent"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <div role="radiogroup" aria-label="Currency" className="flex gap-0.5 rounded-[14px] border border-glass-divider bg-glass-inset p-1">
              {(["pkr", "usd"] as const).map((c) => (
                <button key={c} type="button" role="radio" aria-checked={currency === c} onClick={() => setCurrency(c)} className={cn("h-8 cursor-pointer rounded-[10px] px-3 text-body font-medium uppercase", currency === c ? "glass-3 text-ink" : "text-ink-2")}>{c}</button>
              ))}
            </div>
            <GlassButton variant="glass" onClick={() => void exportCsv()} disabled={exporting}>{exporting ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />} Export</GlassButton>
            <GlassButton onClick={() => setCollect({ row: null })}><Plus aria-hidden /> Collect deposit</GlassButton>
          </div>
        }
      />
      {/* Figma 09.04 mobile header */}
      <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
        <div className="min-w-0">
          <h1 className="text-page-title text-ink">Security</h1>
          <p className="truncate text-label text-ink-2">Deposits · kept separate from rent</p>
        </div>
        <button type="button" aria-label="Collect deposit" onClick={() => setCollect({ row: null })} className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[14px] bg-brand text-on-brand shadow-brand-glow"><Plus className="size-5" aria-hidden /></button>
      </div>

      <div className="flex flex-col gap-4 md:gap-5">
        <DepositKpis data={data} />
        <DepositToDo data={data} onReturn={(r) => setReturnId(r.booking_id)} onSettleAll={settle} onCollect={(r) => setCollect({ row: r })} onRemind={sendReminders} reminding={remind.isPending} />
        <LeavingBanner data={data} onSettle={settle} />

        {/* Desktop toolbar */}
        <div className="glass-2 hidden flex-wrap items-center gap-2 rounded-[20px] p-3 md:flex">
          <div className="no-scrollbar flex max-w-full gap-0.5 overflow-x-auto rounded-[14px] border border-glass-divider bg-glass-inset p-1">
            {tabs.map(([k, l]) => (
              <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)} className={cn("flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] border px-3 text-body font-medium", tab === k ? "glass-3 border-glass-stroke text-ink" : "border-transparent text-ink-2 hover:text-ink")}>
                {l}
                {counts ? <span className="text-label text-ink-3">{counts[k]}</span> : null}
              </button>
            ))}
          </div>
          <GlassSearch className="min-w-[180px] flex-1" placeholder="Guest, phone or payer" shortcut="" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search deposits" />
          <ScopePick value={scope} onChange={setScope} />
        </div>
        {/* Mobile filter chips */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:hidden">
          {tabs.map(([k, l]) => (
            <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)} className={cn("flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-body font-medium", tab === k ? "border-ink-2 bg-glass-3 text-ink" : "border-glass-divider bg-glass-inset text-ink-2")}>
              {k === "leaving" ? "Leaving" : l}
              {counts ? <span className="text-label text-ink-3">{counts[k]}</span> : null}
            </button>
          ))}
        </div>

        {list.isLoading ? (
          <div className="glass-2 h-[480px] animate-pulse rounded-[22px]" />
        ) : rows.length === 0 ? (
          <div className="glass-2 rounded-[22px] px-4 py-14 text-center text-body text-ink-2">{query ? "No deposits match your search." : tab === "all" ? "No security deposits yet." : "Nothing here right now."}</div>
        ) : (
          <DepositsTable
            rows={rows}
            actions={actions}
            footer={
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-glass-divider bg-glass-inset px-4 py-3 max-md:rounded-[18px] max-md:border-0 max-md:bg-transparent max-md:px-1">
                <p className="text-label text-ink-3">Showing {rows.length} of {pg?.total ?? 0}{tab === "all" ? " · leaving soon first" : ""}</p>
                <div className="flex flex-wrap items-center gap-4 text-label">
                  <span className="hidden text-ink-3 md:inline">Deposited <span className="text-body font-semibold text-ink">{formatMoney(data?.totals.deposited ?? 0, cur)}</span></span>
                  <span className="hidden text-ink-3 md:inline">Returned <span className="text-body font-semibold text-ink">{formatMoney(data?.totals.returned ?? 0, cur)}</span></span>
                  <span className="hidden text-ink-3 md:inline">Held <span className="text-body font-semibold text-ink">{formatMoney(data?.totals.held ?? 0, cur)}</span></span>
                  {(pg?.pages ?? 1) > 1 ? (
                    <div className="glass-3 flex items-center gap-1 rounded-[12px] p-1">
                      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(page - 1)} className="flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-ink hover:bg-glass-inset disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="size-4" aria-hidden /></button>
                      <span className="px-1.5 text-label font-medium text-ink">{pg?.page ?? 1} of {pg?.pages ?? 1}</span>
                      <button type="button" aria-label="Next page" disabled={page >= (pg?.pages ?? 1)} onClick={() => setPage(page + 1)} className="flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-ink hover:bg-glass-inset disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="size-4" aria-hidden /></button>
                    </div>
                  ) : null}
                </div>
              </div>
            }
          />
        )}
      </div>

      <DepositHistorySheet
        bookingId={historyId}
        onClose={() => setHistoryId(null)}
        onReturn={(id) => { setHistoryId(null); setTimeout(() => setReturnId(id), 200); }}
        onCollect={(id) => {
          const r = rows.find((x) => x.booking_id === id) ?? data?.not_collected.rows.find((x) => x.booking_id === id) ?? null;
          setHistoryId(null);
          if (r) setTimeout(() => setCollect({ row: r }), 200);
        }}
      />
      <ReturnDepositDialog bookingId={returnId} onClose={() => setReturnId(null)} onDone={nextInQueue} />
      <CollectDepositDialog open={Boolean(collect)} row={collect?.row ?? null} onClose={() => setCollect(null)} hostel={hostel} currency={currency} />
      <DetailDialog id={adjustId} onClose={() => setAdjustId(null)} kind="adjust" />
      <DetailDialog id={keepId} onClose={() => setKeepId(null)} kind="keep" />
    </>
  );
}

function DetailDialog({ id, onClose, kind }: { id: string | null; onClose: () => void; kind: "adjust" | "keep" }) {
  const { data } = useDepositQuery(id);
  if (!id || !data || data.deposit.booking_id !== id) return null;
  const Comp = kind === "adjust" ? AdjustDialog : KeepDialog;
  return <Comp open onOpenChange={(o) => !o && onClose()} data={data} />;
}

function ScopePick({ value, onChange }: { value: DepositScope; onChange: (v: DepositScope) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="glass-3 flex h-10 cursor-pointer items-center gap-2 rounded-[12px] px-3.5 text-body font-semibold whitespace-nowrap text-ink">
        <ChevronDown className="size-4" aria-hidden /> {SCOPES.find(([k]) => k === value)?.[1]}
      </PopoverTrigger>
      <PopoverContent align="end" className="glass-3 w-[280px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
        {SCOPES.map(([k, l, hint]) => (
          <button key={k} type="button" onClick={() => { onChange(k); setOpen(false); }} className={cn("flex w-full cursor-pointer items-start justify-between gap-2 rounded-[10px] px-3 py-2 text-left hover:bg-glass-inset", value === k && "bg-brand-tint")}>
            <span><span className="block text-body font-medium">{l}</span><span className="block text-label text-ink-3">{hint}</span></span>
            {value === k ? <Check className="mt-0.5 size-4 shrink-0 text-brand-text" aria-hidden /> : null}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
