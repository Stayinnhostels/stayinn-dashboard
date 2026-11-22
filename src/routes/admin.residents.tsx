import { createFileRoute, Link, Outlet, useMatch, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Info,
  LayoutGrid,
  ListChecks,
  LogOut,
  MessageCircle,
  Plus,
  Rows3,
  Sparkles,
  TriangleAlert,
  UserPlus,
  Users,
  X,
  Banknote,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { GlassButton, GlassProgress, GlassSearch } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ResidentsRollTable, type RollActions } from "@/components/admin/residents/residents-roll-table";
import { EmailRemindersDialog } from "@/components/admin/residents/email-reminders-dialog";
import { HowRentWorks } from "@/components/admin/residents/how-rent-works";
import { MovedOutView, Pager } from "@/components/admin/residents/moved-out-view";
import { ByRoomView } from "@/components/admin/residents/by-room-view";
import { RentGrid } from "@/components/admin/residents/rent-grid";
import { RecordPaymentSheet } from "@/components/admin/booking-detail/record-payment-sheet";
import {
  downloadMonthRentRegisterExcelApi,
  downloadMonthRentRegisterPdfApi,
  downloadResidentMonthInvoiceApi,
} from "@/api/residents";
import { useEmailMonthReceiptMutation, useResidentsRollQuery, useUpdateResidentMutation } from "@/queries/residents";
import { useBookingQuery } from "@/queries/bookings/useBookingQuery";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { cn } from "@/lib/utils";
import type { RentPaymentStatus } from "@/types/domain/resident.types";
import type { RollRow, RollSort, RollStatusFilter, RollSummary } from "@/types/domain/resident-roll.types";

type Tab = "living" | "moved_out";
type View = "roll" | "by_room" | "rent";

export const Route = createFileRoute("/admin/residents")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab; month?: string; view?: View } => ({
    ...(s.tab === "moved_out" ? { tab: "moved_out" as const } : {}),
    ...(s.view === "by_room" || s.view === "rent" ? { view: s.view as View } : {}),
    ...(typeof s.month === "string" && /^\d{4}-\d{2}$/.test(s.month) ? { month: s.month } : {}),
  }),
  component: ResidentsPage,
});

const PAGE = 16;
const INTRO_KEY = "stayinn.residents.intro.dismissed";
const pad = (n: number) => String(n).padStart(2, "0");
const thisMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const shiftMonth = (k: string, by: number) => {
  const [y, m] = k.split("-").map(Number);
  const d = new Date(y, m - 1 + by, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const monthTitle = (k: string) => {
  const [y, m] = k.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};
const monthName = (k: string) => monthTitle(k).split(" ")[0];
const SORTS: { key: RollSort; label: string }[] = [
  { key: "not_paid_first", label: "Not paid first" },
  { key: "balance", label: "Highest balance" },
  { key: "room", label: "Room" },
  { key: "name", label: "Name" },
];

function ResidentsPage() {
  const detail = useMatch({ from: "/admin/residents/$id", shouldThrow: false });
  if (detail) return <Outlet />;
  return <ResidentsList />;
}

function ResidentsList() {
  const navigate = useNavigate({ from: "/admin/residents" });
  const search = Route.useSearch();
  const tab: Tab = search.tab ?? "living";
  const month = search.month ?? thisMonthKey();
  const view: View = search.view ?? "roll";
  const setView = (v: View) => void navigate({ search: { ...search, view: v === "roll" ? undefined : v } });
  const { hostelId } = useHostelScope();
  const token = useAuthStore((s) => s.token);

  const [q, setQ] = useState("");
  const query = useDebouncedValue(q.trim(), 300);
  const [status, setStatus] = useState<RollStatusFilter>("all");
  const [room, setRoom] = useState<string>("");
  const [sort, setSort] = useState<RollSort>("not_paid_first");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [remind, setRemind] = useState<{ open: boolean; ids?: string[] }>({ open: false });
  const [payId, setPayId] = useState<string | null>(null);
  const [introHidden, setIntroHidden] = useState(() => {
    try {
      return localStorage.getItem(INTRO_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [query, status, room, sort, month, tab]);

  const setMonth = (k: string) => void navigate({ search: { ...search, month: k === thisMonthKey() ? undefined : k } });
  const setTab = (t: Tab) => void navigate({ search: { ...search, tab: t === "living" ? undefined : t } });

  const roll = useResidentsRollQuery(
    { month, hostel: hostelId ?? undefined, search: query || undefined, status, room: room || undefined, sort, page, limit: PAGE, ...(view === "rent" ? { grid: "1" as const } : {}) },
    { enabled: Boolean(hostelId) },
  );
  const data = roll.data;
  const s = data?.summary;
  const rows = data?.residents ?? [];
  const cur = s?.currency ?? "pkr";
  const mName = monthName(month);

  const update = useUpdateResidentMutation();
  const emailReceipt = useEmailMonthReceiptMutation();

  async function setRowStatus(row: RollRow, next: RentPaymentStatus, collected?: number) {
    setBusyId(row.booking_id);
    try {
      await update.mutateAsync({ bookingId: row.booking_id, input: { month, payment_status: next, ...(next === "partial" && collected != null ? { collected_amount: collected } : {}) } });
      if (next === "paid") paidToast(row);
      else toast.success(`${row.name} · ${mName} marked ${next === "not_paid" ? "not paid" : next}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update rent");
      throw e;
    } finally {
      setBusyId(null);
    }
  }

  async function saveCell(row: RollRow, mk: string, next: RentPaymentStatus, collected?: number) {
    try {
      await update.mutateAsync({ bookingId: row.booking_id, input: { month: mk, payment_status: next, ...(next === "partial" && collected != null ? { collected_amount: collected } : {}) } });
      toast.success(`${row.name} · ${monthName(mk)} saved as ${next === "not_paid" ? "not paid" : next}${next === "paid" && row.has_email ? " · receipt emailed" : ""}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update rent");
      throw e;
    }
  }

  function paidToast(row: RollRow) {
    toast.custom((id) => (
      <div role="status" className="glass-3 flex w-[420px] max-w-[calc(100vw-32px)] items-center gap-3 rounded-[16px] px-3.5 py-3 font-geist text-ink">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-success-tint text-success [&_svg]:size-4"><Check aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-semibold">{row.name} · {mName} marked paid</p>
          <p className="truncate text-label text-ink-2">{row.has_email ? `Receipt emailed to ${row.email}` : "No email on file — download the invoice"}</p>
        </div>
        <button type="button" onClick={() => { toast.dismiss(id); downloadInvoice(row); }} className="glass-2 shrink-0 cursor-pointer rounded-[10px] px-2.5 py-1.5 text-label font-semibold text-ink hover:bg-glass-inset">Download invoice</button>
        <button type="button" aria-label="Dismiss" onClick={() => toast.dismiss(id)} className="cursor-pointer text-ink-3 hover:text-ink"><X className="size-4" aria-hidden /></button>
      </div>
    ), { duration: 7000 });
  }

  function downloadInvoice(row: RollRow) {
    if (!token) return;
    toast.promise(downloadResidentMonthInvoiceApi(token, row.booking_id, month), {
      loading: `Preparing ${mName} invoice…`,
      success: "Invoice downloaded",
      error: (e) => (e instanceof Error ? e.message : "Download failed"),
    });
  }

  const actions: RollActions = {
    monthName: mName,
    busyId,
    setStatus: setRowStatus,
    markPaid: (row) => void setRowStatus(row, "paid").catch(() => {}),
    downloadInvoice,
    emailReceipt: (row) =>
      emailReceipt.mutate(
        { bookingId: row.booking_id, month },
        { onSuccess: () => toast.success(`Receipt emailed to ${row.email}`), onError: (e) => toast.error(e instanceof Error ? e.message : "Could not email the receipt") },
      ),
    remind: (row) => setRemind({ open: true, ids: [row.booking_id] }),
  };

  async function exportFile(kind: "pdf" | "excel") {
    if (!token) return;
    const cohort = tab === "moved_out" ? "checkouts" : "active";
    const run = kind === "pdf" ? downloadMonthRentRegisterPdfApi(token, month, cohort, query || undefined) : downloadMonthRentRegisterExcelApi(token, month, cohort, query || undefined);
    toast.promise(run, { loading: "Preparing export…", success: "Export downloaded", error: (e) => (e instanceof Error ? e.message : "Export failed") });
  }

  function exportSelected() {
    const picked = rows.filter((r) => selected.has(r.booking_id));
    const head = ["Name", "Room", `${mName} status`, "Collected", "Left", "Balance", "Phone", "Email"];
    const csv = [head, ...picked.map((r) => [r.name, r.room_label, r.this_month.status, r.this_month.collected, r.this_month.left, r.balance, r.phone, r.email])]
      .map((line) => line.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `residents-${month}-selected.csv` });
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = Boolean(query || status !== "all" || room);
  const noResidents = data && data.counts.living === 0;
  const allPaid = view === "roll" && data && !filtered && data.counts.living > 0 && s && s.not_paid.count === 0 && s.partial.count === 0;
  const firstUnpaid = rows.find((r) => r.this_month.status === "not_paid" || r.this_month.status === "partial");

  const subtitle =
    tab === "moved_out"
      ? `${data?.counts.moved_out ?? "—"} moved out · records kept forever`
      : data
        ? data.counts.living
          ? <>{data.counts.living} living here<span className="hidden 2xl:inline"> · {monthTitle(month)}</span></>
          : <>No one living here yet<span className="hidden 2xl:inline"> · {monthTitle(month)}</span></>
        : " ";

  return (
    <>
      <PageHeader
        title="Residents"
        subtitle={
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            {subtitle}
            <span aria-hidden className="text-ink-3">·</span>
            <HowRentWorks />
          </span>
        }
        actions={
          <div className="hidden flex-wrap items-center gap-2.5 md:flex">
            {tab === "living" ? (
              <>
                <div className="flex items-center gap-1 rounded-[14px] border border-glass-divider bg-glass-inset p-1">
                  <button type="button" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-2 hover:text-ink"><ChevronLeft className="size-4" aria-hidden /></button>
                  <span className="glass-3 flex h-8 items-center gap-2 rounded-[10px] px-3 text-body font-semibold text-ink"><CalendarDays className="size-4 text-brand-text" aria-hidden />{monthTitle(month)}</span>
                  <button type="button" aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-2 hover:text-ink"><ChevronRight className="size-4" aria-hidden /></button>
                </div>
                <GlassButton variant="ghost" disabled={month === thisMonthKey()} onClick={() => setMonth(thisMonthKey())}>This month</GlassButton>
              </>
            ) : null}
            <Popover>
              <PopoverTrigger asChild>
                <GlassButton variant="glass"><ChevronDown aria-hidden /> Export PDF / Excel</GlassButton>
              </PopoverTrigger>
              <PopoverContent align="end" className="glass-3 w-[220px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
                <button type="button" onClick={() => void exportFile("pdf")} className="flex w-full cursor-pointer items-center gap-2 rounded-[10px] px-3 py-2 text-body hover:bg-glass-inset"><FileText className="size-4" aria-hidden /> Download PDF</button>
                <button type="button" onClick={() => void exportFile("excel")} className="flex w-full cursor-pointer items-center gap-2 rounded-[10px] px-3 py-2 text-body hover:bg-glass-inset"><FileSpreadsheet className="size-4" aria-hidden /> Download Excel</button>
              </PopoverContent>
            </Popover>
            {tab === "living" ? <RecordPaymentPicker rows={rows} onPick={setPayId} /> : null}
          </div>
        }
      />

      <div role="tablist" aria-label="Residents" className="-mt-2 mb-4 grid w-full grid-cols-2 gap-0.5 rounded-[14px] border border-glass-divider bg-glass-inset p-1 md:inline-grid md:w-auto">
        {(
          [
            ["living", "Living here", data?.counts.living],
            ["moved_out", "Moved out", data?.counts.moved_out],
          ] as const
        ).map(([key, label, n]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={cn("flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border px-3 text-body font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand-border", tab === key ? "glass-3 border-glass-stroke text-ink" : "border-transparent text-ink-2 hover:text-ink")}>
            {label}
            {n != null ? <span className="text-label text-ink-3">{n}</span> : null}
          </button>
        ))}
      </div>

      {/* Mobile: month + export (Figma 07.21) */}
      <div className="mb-4 flex items-center gap-2 md:hidden">
        {tab === "living" ? (
          <div className="flex min-w-0 flex-1 items-center gap-1 rounded-[14px] border border-glass-divider bg-glass-inset p-1">
            <button type="button" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))} className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-ink-2"><ChevronLeft className="size-4" aria-hidden /></button>
            <span className="glass-3 flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 truncate rounded-[10px] px-2 text-body font-semibold text-ink"><CalendarDays className="size-4 shrink-0 text-brand-text" aria-hidden />{monthTitle(month)}</span>
            <button type="button" aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))} className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-ink-2"><ChevronRight className="size-4" aria-hidden /></button>
          </div>
        ) : <span className="flex-1" />}
        <Popover>
          <PopoverTrigger asChild>
            <GlassButton variant="glass" size="sm" className="h-10"><ChevronDown aria-hidden /> Export</GlassButton>
          </PopoverTrigger>
          <PopoverContent align="end" className="glass-3 w-[200px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
            <button type="button" onClick={() => void exportFile("pdf")} className="flex w-full cursor-pointer items-center gap-2 rounded-[10px] px-3 py-2 text-body hover:bg-glass-inset"><FileText className="size-4" aria-hidden /> Download PDF</button>
            <button type="button" onClick={() => void exportFile("excel")} className="flex w-full cursor-pointer items-center gap-2 rounded-[10px] px-3 py-2 text-body hover:bg-glass-inset"><FileSpreadsheet className="size-4" aria-hidden /> Download Excel</button>
          </PopoverContent>
        </Popover>
      </div>

      {tab === "moved_out" ? (
        <MovedOutView hostelId={hostelId ?? undefined} />
      ) : view === "by_room" ? (
        <ByRoomView month={month} hostelId={hostelId ?? undefined} switcher={<ViewSwitch view="by_room" onChange={setView} />} />
      ) : (
        <div className="flex flex-col gap-4">
          {!introHidden ? (
            <section className="glass-2 hidden flex-col gap-3 rounded-[20px] p-4 md:flex">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint text-brand-text [&_svg]:size-4"><Sparkles aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-semibold text-ink">Everything about your residents is now on one page</p>
                  <p className="text-label text-ink-2">Three simple views of the same people. Pick the one that fits what you are doing:</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIntroHidden(true);
                    try {
                      localStorage.setItem(INTRO_KEY, "1");
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="glass-3 flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-label font-semibold text-ink"
                >
                  <Check className="size-3.5" aria-hidden /> Got it
                </button>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                <IntroTile icon={<Rows3 />} title="Residents" body="This month's rent for everyone. Mark paid in one click." />
                <IntroTile icon={<LayoutGrid />} title="Monthly rent" body="All months side by side. Fix or check past months." onClick={() => setView("rent")} />
                <IntroTile icon={<BedDouble />} title="By room" body="Who sleeps where. Click a free bed to add someone." onClick={() => setView("by_room")} />
                <IntroTile icon={<LogOut />} title="Moved out" body="Switch at the top to see people who left and their deposits." onClick={() => setTab("moved_out")} />
              </div>
            </section>
          ) : null}

          {/* Collection summary */}
          <section className={cn("glass-2 flex-col gap-4 rounded-[20px] p-5", view === "rent" ? "hidden md:flex" : "flex")}>
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-eyebrow text-ink-2 uppercase">{mName} collection</p>
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <span className={cn("text-hero-kpi text-[34px] leading-[42px] font-semibold tracking-tight", s && s.collected === 0 ? "text-ink-3" : "text-ink")}>{s ? formatMoney(s.collected, cur) : "—"}</span>
                  <span className="text-label text-ink-2">{s && s.due > 0 ? `of ${formatMoney(s.due, cur)} collected` : "collected"}</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-glass-divider bg-glass-inset px-2 py-0.5 text-label text-ink-2 [&_svg]:size-3"><Check aria-hidden />{s?.percent != null ? `${s.percent}% collected` : "—"}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-eyebrow text-ink-2 uppercase">{mName} outstanding</p>
                <p className={cn("text-[24px] leading-8 font-semibold", s && s.outstanding > 0 ? "text-danger" : "text-ink-3")}>{s ? formatMoney(s.outstanding, cur) : "—"}</p>
              </div>
              {s && s.reminder_count > 0 ? (
                <GlassButton variant="glass" className="w-full md:w-auto" onClick={() => setRemind({ open: true })}><MessageCircle aria-hidden /> Email reminders ({s.reminder_count})</GlassButton>
              ) : null}
            </div>
            <GlassProgress value={s?.percent ?? 0} />
            {s?.earlier_unpaid && s.earlier_unpaid.amount > 0 ? <EarlierUnpaid e={s.earlier_unpaid} cur={cur} onOpenGrid={() => setView("rent")} /> : null}
            <div className="hidden gap-2.5 md:grid md:grid-cols-3">
              <StatusTile icon={<Check />} label="Paid" count={s?.paid.count} sub={s ? (s.paid.count ? `${formatMoney(s.paid.amount, cur)} collected` : "—") : ""} active={status === "paid"} onClick={() => setStatus(status === "paid" ? "all" : "paid")} />
              <StatusTile icon={<Banknote />} label="Partial" count={s?.partial.count} sub={s ? (s.partial.count ? `${formatMoney(s.partial.left, cur)} left` : "Nothing left") : ""} active={status === "partial"} onClick={() => setStatus(status === "partial" ? "all" : "partial")} />
              <StatusTile icon={<TriangleAlert />} label="Not paid" count={s?.not_paid.count} sub={s ? (s.not_paid.count ? `${formatMoney(s.not_paid.amount, cur)} not paid` : "Nothing left") : ""} danger={(s?.not_paid.count ?? 0) > 0} active={status === "not_paid"} onClick={() => setStatus(status === "not_paid" ? "all" : "not_paid")} />
            </div>
          </section>

          {/* Mobile status chips (Figma 07.21 / 07.24) */}
          <div className={cn("no-scrollbar -mx-4 gap-2 overflow-x-auto px-4 md:hidden", view === "rent" ? "hidden" : "flex")}>
            {(
              [
                ["all", "All", data?.counts.living],
                ["not_paid", "Not paid", s?.not_paid.count],
                ["partial", "Part paid", s?.partial.count],
                ["paid", "Paid", s?.paid.count],
              ] as const
            ).map(([key, label, n]) => (
              <button key={key} type="button" aria-pressed={status === key} onClick={() => setStatus(key)} className={cn("flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-label font-semibold", status === key ? "glass-3 border-ink/60 text-ink" : "border-glass-divider bg-glass-inset text-ink-2")}>
                {label}
                {n != null ? <span className={cn(key === "not_paid" && (n ?? 0) > 0 ? "text-danger" : "text-ink-3")}>{n}</span> : null}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="glass-2 flex flex-wrap items-center gap-2 rounded-[18px] p-2.5">
            <ViewSwitch view={view === "rent" ? "rent" : "roll"} onChange={setView} />
            <GlassSearch className="min-w-[180px] flex-1 md:max-w-[260px]" placeholder="Name, room or phone" shortcut="" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search residents" />
            <Popover>
              <PopoverTrigger className={cn("glass-3 hidden h-10 cursor-pointer items-center gap-2 rounded-[12px] px-3.5 text-body font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-border md:flex", room && "ring-1 ring-brand-border")}>
                <ChevronDown className="size-4" aria-hidden /> {room ? data?.rooms.find((r) => r.id === room)?.label ?? "Room" : "Room"}
              </PopoverTrigger>
              <PopoverContent align="start" className="glass-3 max-h-[320px] w-[200px] overflow-y-auto rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
                {[{ id: "", label: "All rooms" }, ...(data?.rooms ?? [])].map((r) => (
                  <button key={r.id || "all"} type="button" onClick={() => setRoom(r.id)} className={cn("flex w-full cursor-pointer items-center justify-between rounded-[10px] px-3 py-2 text-left text-body hover:bg-glass-inset", room === r.id && "bg-brand-tint")}>
                    {r.label}
                    {room === r.id ? <Check className="size-4 text-brand-text" aria-hidden /> : null}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            {status !== "all" ? (
              <button type="button" onClick={() => setStatus("all")} className="hidden h-8 md:flex cursor-pointer items-center gap-1.5 rounded-full border border-brand-border bg-brand-tint px-3 text-label font-semibold text-ink">
                {status === "not_paid" ? "Not paid" : status === "partial" ? "Partial" : status === "paid" ? "Paid" : "Returned"} <X className="size-3.5" aria-hidden />
              </button>
            ) : null}
            <span className="hidden flex-1 md:block" />
            <Popover>
              <PopoverTrigger className="hidden h-10 cursor-pointer items-center gap-2 rounded-[12px] px-3 md:flex text-body font-semibold text-ink outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border">
                <ArrowUpDown className="size-4" aria-hidden /> {SORTS.find((x) => x.key === sort)?.label}
              </PopoverTrigger>
              <PopoverContent align="end" className="glass-3 w-[200px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
                {SORTS.map((o) => (
                  <button key={o.key} type="button" onClick={() => setSort(o.key)} className={cn("flex w-full cursor-pointer items-center justify-between rounded-[10px] px-3 py-2 text-left text-body hover:bg-glass-inset", sort === o.key && "bg-brand-tint")}>
                    {o.label}
                    {sort === o.key ? <Check className="size-4 text-brand-text" aria-hidden /> : null}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          <p className={cn("-mt-1 hidden items-center gap-1.5 text-label text-ink-3", view === "rent" ? "" : "md:flex")}><Info className="size-3.5" aria-hidden /> {view === "rent" ? "Monthly rent · one column per month. Click any month to fix or change it." : "Residents · one row per person. Press “Mark paid” when someone pays, or click a name to open their profile."}</p>

          {roll.isLoading || !data ? (
            <LoadingRows />
          ) : noResidents ? (
            <EmptyState
              icon={<Users />}
              title="No residents yet"
              body="When you check someone in as a monthly member from Bookings, they appear here with their rent for every month."
              actions={
                <>
                  <GlassButton variant="glass" onClick={() => void navigate({ to: "/admin/bookings" })}><CalendarDays aria-hidden /> Go to Bookings</GlassButton>
                  <GlassButton onClick={() => void navigate({ to: "/admin/bookings", search: { walkin: true } })}><UserPlus aria-hidden /> Add walk-in member</GlassButton>
                </>
              }
            />
          ) : allPaid ? (
            <EmptyState
              icon={<Check />}
              title={`Everyone has paid for ${mName}`}
              body={
                s!.earlier_unpaid && s!.earlier_unpaid.amount > 0
                  ? `${formatMoney(s!.collected, cur)} collected from ${data.counts.living} resident${data.counts.living === 1 ? "" : "s"}. ${formatMoney(s!.earlier_unpaid.amount, cur)} from earlier months is still unpaid — see the list above.`
                  : `${formatMoney(s!.collected, cur)} collected from ${data.counts.living} resident${data.counts.living === 1 ? "" : "s"}. ${monthName(shiftMonth(month, 1))} rent starts on 1 ${monthName(shiftMonth(month, 1)).slice(0, 3)} — you can close ${mName} now.`
              }
              actions={
                <>
                  <GlassButton variant="glass" onClick={() => void exportFile("excel")}><Download aria-hidden /> Download report</GlassButton>
                  <GlassButton onClick={() => void exportFile("pdf")}><FileText aria-hidden /> Download PDF</GlassButton>
                </>
              }
            />
          ) : rows.length === 0 ? (
            <EmptyState icon={<ListChecks />} title="No one matches" body="Try another name, room or status filter." actions={<GlassButton variant="glass" onClick={() => { setQ(""); setStatus("all"); setRoom(""); }}>Clear filters</GlassButton>} />
          ) : view === "rent" ? (
            <RentGrid
              rows={rows}
              months={data.months ?? []}
              onSave={saveCell}
              footer={<Pager text={`Showing ${rows.length} of ${data.pagination.total} residents`} page={page} pages={data.pagination.pages} onPage={setPage} />}
            />
          ) : (
            <ResidentsRollTable
              rows={rows}
              selected={selected}
              onToggle={(id) => setSelected((cur) => { const n = new Set(cur); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
              onToggleAll={(on) => setSelected(on ? new Set(rows.map((r) => r.booking_id)) : new Set())}
              actions={actions}
              footer={<Pager text={`Showing ${rows.length} of ${data.pagination.total} residents · ${SORTS.find((x) => x.key === sort)?.label.toLowerCase()}`} page={page} pages={data.pagination.pages} onPage={setPage} />}
            />
          )}
        </div>
      )}

      {/* Bulk bar (07.04) */}
      {selected.size > 0 && tab === "living" ? (
        <div className="glass-3 fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-[16px] px-2.5 py-2 font-geist text-ink">
          <span className="flex size-6 items-center justify-center rounded-full bg-brand text-label font-semibold text-on-brand">{selected.size}</span>
          <span className="pr-1 text-body font-medium">selected</span>
          <button type="button" onClick={() => setRemind({ open: true, ids: [...selected] })} className="glass-2 flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-label font-semibold hover:bg-glass-inset [&_svg]:size-3.5"><MessageCircle aria-hidden /> Send reminder</button>
          <button type="button" onClick={exportSelected} className="glass-2 flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-label font-semibold hover:bg-glass-inset [&_svg]:size-3.5"><Download aria-hidden /> Export</button>
          <button type="button" onClick={() => setSelected(new Set())} className="flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-label font-medium text-ink-2 hover:text-ink [&_svg]:size-3.5"><X aria-hidden /> Clear</button>
        </div>
      ) : null}

      <EmailRemindersDialog
        open={remind.open}
        onOpenChange={(o) => setRemind((r) => ({ ...r, open: o }))}
        month={month}
        monthName={mName}
        hostelId={hostelId ?? undefined}
        summary={s}
        sample={remind.ids?.length ? rows.find((r) => r.booking_id === remind.ids![0]) : firstUnpaid}
        bookingIds={remind.ids}
      />
      {tab === "living" && view === "roll" && selected.size === 0 ? (
        <div className="fixed right-4 bottom-[104px] z-30 md:hidden">
          <RecordPaymentPicker rows={rows} onPick={setPayId} />
        </div>
      ) : null}
      {payId ? <PaySheet bookingId={payId} onClose={() => setPayId(null)} /> : null}
    </>
  );
}

function PaySheet({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const { data: booking, isLoading } = useBookingQuery(bookingId);
  if (isLoading || !booking)
    return (
      <div className="glass-3 fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-[14px] px-4 py-3 font-geist text-body text-ink">
        <Loader2 className="size-4 animate-spin" aria-hidden /> Opening payment…
      </div>
    );
  return <RecordPaymentSheet booking={booking} open onOpenChange={(o) => !o && onClose()} />;
}

/** "Record payment": pick who paid, then the Glass record-payment sheet opens. */
function RecordPaymentPicker({ rows, onPick }: { rows: RollRow[]; onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows
      .filter((r) => !s || r.name.toLowerCase().includes(s) || r.room_label.toLowerCase().includes(s))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 8);
  }, [rows, q]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <GlassButton><Plus aria-hidden /> Record payment</GlassButton>
      </PopoverTrigger>
      <PopoverContent align="end" className="glass-3 w-[320px] rounded-[16px] border-0 p-2 font-geist text-ink shadow-none">
        <p className="px-1.5 pt-1 pb-2 text-eyebrow text-ink-3 uppercase">Who paid?</p>
        <GlassSearch autoFocus placeholder="Name or room" shortcut="" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find resident" />
        <div className="mt-1.5 flex max-h-[300px] flex-col overflow-y-auto">
          {list.length === 0 ? <p className="px-2 py-4 text-center text-label text-ink-3">No resident on this page matches.</p> : null}
          {list.map((r) => (
            <button key={r.booking_id} type="button" onClick={() => { setOpen(false); onPick(r.booking_id); }} className="flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2 py-2 text-left hover:bg-glass-inset">
              <span className="w-7 text-center text-label font-semibold text-ink-2">{r.initials}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-medium text-ink">{r.name}</span>
                <span className="block truncate text-label text-ink-3">{r.room_label}</span>
              </span>
              <span className={cn("text-label font-semibold", r.balance > 0 ? "text-danger" : "text-ink-3")}>{formatMoney(r.balance, r.currency)}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function IntroTile({ icon, title, body, onClick }: { icon: React.ReactNode; title: string; body: string; onClick?: () => void }) {
  const inner = (
    <>
      <span className="mt-0.5 text-ink-2 [&_svg]:size-4">{icon}</span>
      <span className="min-w-0">
        <span className="block text-body font-semibold text-ink">{title}</span>
        <span className="block text-label text-ink-2">{body}</span>
      </span>
    </>
  );
  const cls = "flex gap-2.5 rounded-[14px] bg-glass-inset p-3 text-left outline-none transition-colors hover:bg-glass-3 focus-visible:ring-2 focus-visible:ring-brand-border";
  return <button type="button" onClick={onClick} disabled={!onClick} className={cn(cls, onClick ? "cursor-pointer" : "cursor-default")}>{inner}</button>;
}

function StatusTile({ icon, label, count, sub, danger, active, onClick }: { icon: React.ReactNode; label: string; count: number | undefined; sub: string; danger?: boolean; active?: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={cn("flex cursor-pointer items-center gap-3 rounded-[14px] border bg-glass-inset px-4 py-3 text-left outline-none transition-colors hover:bg-glass-3 focus-visible:ring-2 focus-visible:ring-brand-border", active ? "border-brand-border ring-1 ring-brand-border" : "border-glass-divider")}>
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-[10px] [&_svg]:size-4", danger ? "bg-danger-tint text-danger" : "bg-glass-2 text-ink-2")}>{icon}</span>
      <span className="min-w-0">
        <span className="flex items-baseline gap-2"><span className="text-body text-ink-2">{label}</span><span className="text-[20px] leading-6 font-semibold text-ink">{count ?? "—"}</span></span>
        <span className={cn("block truncate text-label", danger ? "text-danger" : "text-ink-3")}>{sub}</span>
      </span>
    </button>
  );
}

function EmptyState({ icon, title, body, actions }: { icon: React.ReactNode; title: string; body: string; actions: React.ReactNode }) {
  return (
    <section className="glass-2 flex flex-col items-center gap-4 rounded-[20px] px-4 py-14">
      <div className="flex max-w-[420px] flex-col items-center gap-2 rounded-[18px] border border-dashed border-glass-stroke bg-glass-inset px-6 py-6 text-center">
        <span className="flex size-10 items-center justify-center rounded-[12px] bg-brand-tint text-brand-text [&_svg]:size-5">{icon}</span>
        <p className="text-body font-semibold text-ink">{title}</p>
        <p className="text-label text-ink-2">{body}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">{actions}</div>
    </section>
  );
}

function LoadingRows() {
  return (
    <div className="glass-2 flex flex-col gap-0 overflow-hidden rounded-[20px]" aria-busy="true" aria-label="Loading residents">
      <div className="h-11 border-b border-glass-divider bg-glass-inset" />
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-glass-divider px-4 py-4 last:border-b-0">
          <div className="size-4 rounded bg-glass-inset" />
          <div className="h-4 w-40 animate-pulse rounded-full bg-glass-inset" />
          <div className="h-4 w-24 animate-pulse rounded-full bg-glass-inset" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-glass-inset" />
          <div className="h-4 flex-1 animate-pulse rounded-full bg-glass-inset" />
          <div className="h-8 w-24 animate-pulse rounded-[10px] bg-glass-inset" />
        </div>
      ))}
    </div>
  );
}

/** Residents · Monthly rent · By room switch (Figma 07.01 / 07.02 / 07.12). */
function ViewSwitch({ view, onChange }: { view: "roll" | "by_room" | "rent"; onChange: (v: View) => void }) {
  const item = (on: boolean) =>
    cn(
      "flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border px-3 text-body font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-4",
      on ? "glass-3 border-glass-stroke text-ink" : "border-transparent text-ink-2 hover:text-ink",
    );
  return (
    <div className="grid w-full grid-cols-3 gap-0.5 rounded-[14px] border border-glass-divider bg-glass-inset p-1 md:flex md:w-auto">
      <button type="button" onClick={() => onChange("roll")} className={item(view === "roll")}><Rows3 aria-hidden />Residents</button>
      <button type="button" onClick={() => onChange("rent")} className={item(view === "rent")}><LayoutGrid aria-hidden /><span className="md:hidden">Rent</span><span className="hidden md:inline">Monthly rent</span></button>
      <button type="button" onClick={() => onChange("by_room")} className={item(view === "by_room")}><BedDouble aria-hidden />By room</button>
    </div>
  );
}

/**
 * "This month is paid, but older months are not": money still owed from earlier months, for people
 * living here and people who moved out. Adds up to the same figure as Bookings → Outstanding.
 */
function EarlierUnpaid({ e, cur, onOpenGrid }: { e: NonNullable<RollSummary["earlier_unpaid"]>; cur: "pkr" | "usd"; onOpenGrid: () => void }) {
  const [open, setOpen] = useState(false);
  const parts = [
    e.living.count ? `${e.living.count} living here (${formatMoney(e.living.amount, cur)})` : null,
    e.moved_out.count ? `${e.moved_out.count} moved out (${formatMoney(e.moved_out.amount, cur)})` : null,
  ].filter(Boolean);
  return (
    <div className="flex flex-col gap-2 rounded-[14px] border border-danger/25 bg-danger-tint px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <TriangleAlert className="size-4 shrink-0 text-danger" aria-hidden />
        <p className="min-w-0 flex-1 text-body text-ink">
          <span className="font-semibold text-danger">{formatMoney(e.amount, cur)}</span> still unpaid from earlier months
          <span className="text-ink-2"> · {parts.join(" · ")}</span>
        </p>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="cursor-pointer text-label font-semibold text-brand-text hover:underline">
          {open ? "Hide people" : `Show ${e.people.length} ${e.people.length === 1 ? "person" : "people"}`}
        </button>
        <button type="button" onClick={onOpenGrid} className="cursor-pointer text-label font-semibold text-brand-text hover:underline">
          Open monthly rent
        </button>
      </div>
      {open ? (
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {e.people.map((p) => (
            <li key={p.booking_id}>
              <Link to="/admin/residents/$id" params={{ id: p.booking_id }} className="flex items-center gap-2 rounded-[10px] bg-glass-2 px-3 py-2 hover:bg-glass-inset">
                <span className="min-w-0 flex-1 truncate text-body text-ink">{p.name}</span>
                {p.moved_out ? <span className="shrink-0 text-label text-ink-3">moved out</span> : null}
                <span className="shrink-0 text-body font-semibold text-danger tabular-nums">{formatMoney(p.amount, cur)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
