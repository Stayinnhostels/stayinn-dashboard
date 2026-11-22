import { createFileRoute } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Clock, Download, Inbox, Search, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { FinKpi, Segmented } from "@/components/admin/finance/finance-kit";
import { DepositModal } from "@/components/admin/security/deposit-shared";
import { RequestDetail } from "@/components/admin/requests/request-detail";
import { OutlinePill, STATUS_LABEL, TYPE_META, TypeIcon, ago, dayMonth, initialsOf, requestSummary } from "@/components/admin/requests/request-kit";
import { useBookingRequestsQuery, useResolveBookingRequestMutation } from "@/queries/booking-requests";
import { downloadBookingRequestsCsvApi } from "@/api/booking-requests/bookingRequests.api";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { BookingRequest, BookingRequestStatus, BookingRequestType } from "@/types/domain/booking-request.types";

/** Figma 10 · Guest requests (10.01 extend stay, 10.02 cancel & refund, 10.03/10.04 mobile). */
export const Route = createFileRoute("/admin/booking-requests")({ component: GuestRequestsPage });

type StatusTab = "pending" | "approved" | "rejected" | "all";
type TypeChip = "all" | BookingRequestType;

const TYPE_ORDER: BookingRequestType[] = ["extend_stay", "cancel", "room_change", "additional_seat"];

function useIsDesktop() {
  const q = "(min-width: 1024px)";
  const [v, setV] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setV(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return v;
}

function hoursLabel(h: number | null | undefined) {
  if (h == null) return "—";
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`;
  if (h < 48) return `${Math.round(h)} h`;
  return `${Math.round(h / 24)} days`;
}

function GuestRequestsPage() {
  const { hostelId } = useHostelScope();
  const token = useAuthStore((s) => s.token);
  const desktop = useIsDesktop();
  const [tab, setTab] = useState<StatusTab>("pending");
  const [type, setType] = useState<TypeChip>("all");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setQ(search), 250);
    return () => window.clearTimeout(t);
  }, [search]);

  const scope = hostelId ? { hostel: hostelId } : {};
  const params = { ...scope, limit: 100, ...(tab === "all" ? {} : { status: tab as BookingRequestStatus }), ...(type === "all" ? {} : { type }), ...(q.trim() ? { search: q.trim() } : {}) };
  const list = useBookingRequestsQuery(params, { enabled: Boolean(hostelId) });
  // "Recently handled" under the waiting list (Figma 10.01).
  const recent = useBookingRequestsQuery({ ...scope, limit: 12, ...(type === "all" ? {} : { type }), ...(q.trim() ? { search: q.trim() } : {}) }, { enabled: Boolean(hostelId) && tab === "pending" });

  const requests = list.data?.requests ?? [];
  const handled = useMemo(() => (recent.data?.requests ?? []).filter((r) => r.status !== "pending").slice(0, 3), [recent.data]);
  const counts = list.data?.counts;
  const k = list.data?.kpis;
  const cur = k?.currency ?? "pkr";

  const all = useMemo(() => [...requests, ...(tab === "pending" ? handled : [])], [requests, handled, tab]);
  const selected = all.find((r) => r.id === selectedId) ?? (desktop ? requests[0] : undefined) ?? null;

  // Keep a selection on desktop when the list changes.
  useEffect(() => {
    if (!desktop) return;
    if (!selectedId || !all.some((r) => r.id === selectedId)) setSelectedId(requests[0]?.id ?? null);
  }, [desktop, all, requests, selectedId]);

  const open = (r: BookingRequest) => {
    setSelectedId(r.id);
    if (!desktop) setSheetOpen(true);
  };

  const exportCsv = async () => {
    if (!token) return;
    setExporting(true);
    try {
      const { limit: _l, ...rest } = params;
      await downloadBookingRequestsCsvApi(token, rest);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const typeChips: [TypeChip, string, number | undefined][] = [
    ["all", "All", counts?.type.all],
    ...TYPE_ORDER.filter((t) => t !== "additional_seat" || (counts?.type.additional_seat ?? 0) > 0 || type === t).map((t) => [t, TYPE_META[t].short, counts?.type[t]] as [TypeChip, string, number | undefined]),
  ];

  const waiting = counts?.status.pending ?? 0;

  return (
    <>
      <PageHeader
        title="Guest requests"
        subtitle={desktop ? "Changes guests ask for after booking · cancel, room change, extra bed or longer stay" : `${waiting} waiting for your decision`}
        actions={
          <>
            <Segmented
              label="Status"
              value={tab}
              onChange={(v) => {
                setTab(v);
                setSelectedId(null);
              }}
              options={[
                ["pending", "Waiting", counts?.status.pending],
                ["approved", "Approved", counts?.status.approved],
                ["rejected", "Rejected", counts?.status.rejected],
                ["all", "All", counts?.status.all],
              ] as const}
            />
            <GlassButton variant="glass" onClick={exportCsv} disabled={exporting} className="max-sm:hidden">
              <Download aria-hidden /> {exporting ? "Exporting…" : "Export"}
            </GlassButton>
          </>
        }
      />

      <div className="flex flex-col gap-4 md:gap-5">
        {/* Figma 10.03 (mobile) has no KPI row — just the request cards. */}
        {desktop ? (
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          <FinKpi icon={<Inbox />} label="Waiting for you" value={String(waiting)} sub={k?.oldest_pending_at ? `Oldest sent ${ago(k.oldest_pending_at)}` : "Nothing waiting"} />
          <FinKpi icon={<Check />} label="Approved this month" value={String(k?.approved_this_month ?? 0)} sub={k && k.extension_rent_this_month > 0 ? `${formatMoney(k.extension_rent_this_month, cur)} extra rent from extensions` : "No extensions approved yet"} />
          <FinKpi icon={<X />} label="Rejected" value={String(k?.rejected_this_month ?? 0)} sub={k?.top_reject_reason ?? "This month"} />
          <FinKpi icon={<Clock />} label="Average reply time" value={hoursLabel(k?.avg_reply_hours)} sub="Aim: same day" />
        </div>
        ) : null}

        <div className="grid items-start gap-4 md:gap-5 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
          <div className={cn("flex min-w-0 flex-col", desktop && "glass-2 overflow-hidden rounded-[22px]")}>
            {desktop ? (
            <div className="flex flex-col gap-3 p-4">
              <label className="flex h-10 items-center gap-2.5 rounded-[12px] bg-glass-inset px-3 focus-within:ring-2 focus-within:ring-brand-tint">
                <Search className="size-4 shrink-0 text-ink-2" aria-hidden />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Guest or booking" aria-label="Search guest or booking" className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-2" />
                {search ? (
                  <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="cursor-pointer text-ink-2 hover:text-ink">
                    <X className="size-4" />
                  </button>
                ) : null}
              </label>
              <div className="no-scrollbar flex gap-2 overflow-x-auto" role="radiogroup" aria-label="Request type">
                {typeChips.map(([key, label, n]) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={type === key}
                    onClick={() => {
                      setType(key);
                      setSelectedId(null);
                    }}
                    className={cn("inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-body transition-colors", type === key ? "border-ink bg-glass-3 font-medium text-ink" : "border-transparent bg-glass-inset text-ink-2 hover:text-ink")}
                  >
                    {label}
                    {n != null ? <span className="text-label text-ink-2">{n}</span> : null}
                  </button>
                ))}
              </div>
            </div>
            ) : null}

            {list.isError ? (
              <p className="px-4 py-12 text-center text-body text-danger">Could not load requests. Is the API running?</p>
            ) : list.isLoading ? (
              <div className="flex flex-col gap-2 px-4 pb-4">
                {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-[78px] animate-pulse rounded-[14px] bg-glass-inset" />)}
              </div>
            ) : (
              <>
                {desktop ? <GroupLabel>{tab === "all" ? "All requests" : `${STATUS_LABEL[tab as BookingRequestStatus]} · ${requests.length}`}</GroupLabel> : null}
                {requests.length === 0 ? (
                  <p className="px-4 py-10 text-center text-body text-ink-2">{q ? "No requests match your search." : tab === "pending" ? "Nothing waiting. Guests' requests show up here." : "No requests here."}</p>
                ) : (
                  <ul className={cn("flex flex-col", !desktop && "gap-3")}>
                    {requests.map((r) => (
                      <li key={r.id} className={desktop ? "border-b border-glass-divider last:border-b-0" : "glass-2 overflow-hidden rounded-[20px]"}>
                        <RequestRow r={r} active={desktop && selected?.id === r.id} onOpen={() => open(r)} mobileActions={!desktop} />
                      </li>
                    ))}
                  </ul>
                )}
                {desktop && tab === "pending" && handled.length ? (
                  <>
                    <GroupLabel>Recently handled</GroupLabel>
                    <ul className="flex flex-col">
                      {handled.map((r) => (
                        <li key={r.id} className="border-b border-glass-divider last:border-b-0">
                          <HandledRow r={r} active={desktop && selected?.id === r.id} onOpen={() => open(r)} />
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </>
            )}
          </div>

          {desktop ? (
            selected ? (
              <RequestDetail key={selected.id} request={selected} />
            ) : (
              <div className="glass-2 flex min-h-[320px] flex-col items-center justify-center gap-2 rounded-[22px] px-6 text-center">
                <Inbox className="size-8 text-ink-3" aria-hidden />
                <p className="text-card-title text-ink">No request selected</p>
                <p className="text-body text-ink-2">Pick a request on the left to review it.</p>
              </div>
            )
          ) : null}
        </div>
      </div>

      {!desktop ? (
        <DepositModal open={sheetOpen && selected != null} onOpenChange={setSheetOpen} width={640}>
          {selected ? (
            <div className="flex min-h-0 flex-col overflow-y-auto px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
              <div className="mb-3 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <Dialog.Title className="truncate text-[24px] leading-8 font-semibold tracking-[-0.24px] text-ink">{TYPE_META[selected.type].label}</Dialog.Title>
                  <p className="truncate text-label text-ink-2">
                    {selected.guest_name} · {selected.room_number != null ? `Room ${selected.room_number}` : selected.room_title}
                    {selected.seat_label ? ` · ${selected.seat_label}` : ""}
                  </p>
                </div>
                <OutlinePill>{STATUS_LABEL[selected.status]}</OutlinePill>
              </div>
              <RequestDetail key={selected.id} request={selected} compact onDone={() => setSheetOpen(false)} />
            </div>
          ) : null}
        </DepositModal>
      ) : null}
    </>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="border-y border-glass-divider bg-glass-inset/60 px-4 py-2 text-[11px] leading-4 font-semibold tracking-[0.06em] text-ink-2 uppercase">{children}</p>;
}

function RequestRow({ r, active, onOpen, mobileActions }: { r: BookingRequest; active: boolean; onOpen: () => void; mobileActions: boolean }) {
  const money = (n: number) => formatMoney(n, r.currency ?? "pkr");
  const resolve = useResolveBookingRequestMutation();
  const pending = r.status === "pending";

  const quick = (status: "approved" | "rejected") => {
    // Cancellations need a refund amount → open the sheet instead.
    if (status === "approved" && r.type === "cancel") return onOpen();
    resolve.mutate(
      { id: r.id, status, reply_template: status === "approved" ? "approved" : undefined },
      {
        onSuccess: () => toast.success(status === "approved" ? "Approved — guest notified" : "Rejected — guest notified"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update the request"),
      },
    );
  };

  return (
    <div className={cn("flex flex-col gap-3 px-4 py-4 transition-colors", active ? "bg-glass-inset/50" : "hover:bg-glass-inset/40")}>
      <button type="button" onClick={onOpen} aria-current={active ? "true" : undefined} className="flex w-full cursor-pointer items-start gap-3 text-left">
        <TypeIcon type={r.type} active={active} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="min-w-0 flex-1 truncate text-body font-semibold text-ink">{r.guest_name ?? "Guest"}</p>
            {mobileActions ? null : <span className="shrink-0 text-label text-ink-2">{ago(r.created_at)}</span>}
          </div>
          <p className="truncate text-label text-ink-2">
            {TYPE_META[r.type].label}
            {mobileActions ? ` · ${ago(r.created_at)}` : ""}
            {!pending ? ` · ${STATUS_LABEL[r.status]}` : ""}
          </p>
          <p className="mt-0.5 truncate text-label text-ink-2">{requestSummary(r, money)}</p>
        </div>
        {mobileActions ? <ChevronRight className="mt-2 size-4 shrink-0 text-ink-2" aria-hidden /> : null}
      </button>
      {mobileActions && pending ? (
        <div className="grid grid-cols-2 gap-2">
          <GlassButton variant="glass" size="sm" className="h-9" disabled={resolve.isPending} onClick={() => quick("rejected")}>
            <X aria-hidden /> Reject
          </GlassButton>
          <GlassButton size="sm" className="h-9" disabled={resolve.isPending} onClick={() => quick("approved")}>
            <Check aria-hidden /> Approve
          </GlassButton>
        </div>
      ) : null}
    </div>
  );
}

function HandledRow({ r, active, onOpen }: { r: BookingRequest; active: boolean; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} aria-current={active ? "true" : undefined} className={cn("flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors", active ? "bg-glass-inset/50" : "hover:bg-glass-inset/40")}>
      <span className="flex size-9 shrink-0 items-center justify-center text-label font-semibold text-ink">{initialsOf(r.guest_name ?? "Guest")}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body text-ink">{r.guest_name ?? "Guest"}</p>
        <p className="truncate text-label text-ink-2">
          {TYPE_META[r.type].label} · {dayMonth(r.resolved_at ?? r.created_at)}
        </p>
      </div>
      <OutlinePill>{STATUS_LABEL[r.status]}</OutlinePill>
    </button>
  );
}
