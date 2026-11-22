import { StickyBar } from "@/components/admin/sticky-bar";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BedDouble, Check, ChevronDown, Clock, Download, Minus, Plus, Search, Users, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { FinKpi, Segmented } from "@/components/admin/finance/finance-kit";
import { TicketDialog, categoryIcon, type AssigneeOption } from "@/components/admin/maintenance/ticket-dialog";
import { useMaintenanceQuery, useUpdateMaintenanceStatusMutation } from "@/queries/maintenance";
import { downloadMaintenanceCsvApi } from "@/api/maintenance";
import { useRoomsQuery } from "@/queries/rooms";
import { useUsersQuery } from "@/queries/users";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { MaintenanceListParams, MaintenancePriority, MaintenanceStatus, MaintenanceTicket } from "@/types/domain/maintenance.types";

/** Figma 11 · Maintenance (11.01 board, 11.02 new ticket, 11.03 mobile). */
export const Route = createFileRoute("/admin/maintenance")({ component: MaintenancePage });

type View = "board" | "list";
type Chip = "all" | "urgent" | "high" | "mine";
type Column = Extract<MaintenanceStatus, "open" | "in_progress" | "resolved">;

const COLUMNS: [Column, string, string][] = [
  ["open", "Open", "bg-danger-solid"],
  ["in_progress", "In progress", "bg-brand"],
  ["resolved", "Resolved", "bg-ink-2"],
];
const RESOLVED_PREVIEW = 3;

const PRIORITY_LABEL: Record<MaintenancePriority, string> = { urgent: "Urgent", high: "High", medium: "Medium", low: "Low" };

function shortAge(iso?: string | null) {
  if (!iso) return "";
  const h = Math.max(0, (Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`;
  if (h < 24) return `${Math.round(h)} h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} day${d === 1 ? "" : "s"}`;
  const w = Math.round(d / 7);
  return `${w} week${w === 1 ? "" : "s"}`;
}
const dayMonth = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "");
const initials = (n: string) => {
  const p = n.replace(/\(.*\)/, "").trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "?";
};

function where(t: MaintenanceTicket) {
  const room = t.room_number != null ? `Room ${t.room_number}` : t.room_title;
  const kind = t.room_label && t.room_number != null ? t.room_label.replace(/^\d+\s*·\s*/, "") : null;
  if (!room) return t.location_detail || "Common area";
  return [room, t.location_detail || kind].filter(Boolean).join(" · ");
}

function note(t: MaintenanceTicket) {
  const cur = t.currency ?? "pkr";
  if (t.status === "resolved") return `Fixed ${dayMonth(t.resolved_at ?? t.updated_at)}${t.actual_cost ? ` · ${formatMoney(t.actual_cost, cur)}` : ""}`;
  if (t.status_note) return t.status_note;
  if (t.room_offline && t.room_offline_since) return `Room offline since ${dayMonth(t.room_offline_since)}`;
  if (t.source === "room_status") return "Room set to Maintenance in Rooms";
  if ((t.reports_count ?? 1) > 1) return `${t.reports_count} residents complained`;
  if (t.reported_by) return `Reported by ${t.reported_by}`;
  return t.description?.split("\n")[0] ?? "";
}

function useIsDesktop() {
  const q = "(min-width: 768px)";
  const [v, setV] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setV(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return v;
}

function MaintenancePage() {
  const { hostelId } = useHostelScope();
  const token = useAuthStore((s) => s.token);
  const desktop = useIsDesktop();
  const [view, setView] = useState<View>("board");
  const [chip, setChip] = useState<Chip>("all");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [roomId, setRoomId] = useState("all");
  const [assignee, setAssignee] = useState("");
  const [mobileCol, setMobileCol] = useState<Column>("open");
  const [showAllResolved, setShowAllResolved] = useState(false);
  const [dialog, setDialog] = useState<{ editing: MaintenanceTicket | null; focus?: "assignee" | "resolve"; status?: MaintenanceStatus } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropCol, setDropCol] = useState<Column | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setQ(search), 250);
    return () => window.clearTimeout(t);
  }, [search]);

  const params: MaintenanceListParams = {
    ...(hostelId ? { hostel: hostelId } : {}),
    ...(chip === "urgent" || chip === "high" ? { priority: chip } : {}),
    ...(chip === "mine" ? { mine: true } : {}),
    ...(q.trim() ? { search: q.trim() } : {}),
    ...(roomId !== "all" ? { room_id: roomId } : {}),
    ...(assignee ? { assignee } : {}),
  };
  const { data, isLoading, isError } = useMaintenanceQuery(params, { enabled: Boolean(hostelId) });
  const rooms = useRoomsQuery({ limit: 100, ...(hostelId ? { hostel: hostelId } : {}) });
  const staff = useUsersQuery({ role: "super_admin", limit: 100, page: 1 });
  const move = useUpdateMaintenanceStatusMutation();

  const tickets = data?.maintenance ?? [];
  const s = data?.stats;
  const roomList = rooms.data?.rooms ?? [];
  const byCol = useMemo(() => {
    const m: Record<Column, MaintenanceTicket[]> = { open: [], in_progress: [], resolved: [] };
    tickets.forEach((t) => {
      if (t.status === "cancelled") return;
      m[t.status as Column]?.push(t);
    });
    m.resolved.sort((a, b) => new Date(b.resolved_at ?? b.updated_at ?? 0).getTime() - new Date(a.resolved_at ?? a.updated_at ?? 0).getTime());
    return m;
  }, [tickets]);

  const assigneeOptions: AssigneeOption[] = useMemo(() => {
    const map = new Map<string, AssigneeOption>();
    (staff.data?.users ?? []).forEach((u) => map.set(u.full_name.toLowerCase(), { name: u.full_name, phone: u.phone ?? undefined, role: "Staff" }));
    tickets.forEach((t) => {
      if (t.assignee && t.assignee !== "Unassigned" && !map.has(t.assignee.toLowerCase())) map.set(t.assignee.toLowerCase(), { name: t.assignee, phone: t.assignee_phone || undefined });
    });
    (s?.assignees ?? []).forEach((a) => !map.has(a.toLowerCase()) && map.set(a.toLowerCase(), { name: a }));
    return [...map.values()];
  }, [staff.data, tickets, s?.assignees]);

  const moveTo = (t: MaintenanceTicket, status: Column) => {
    if (t.status === status) return;
    if (t.source === "room_status") return toast.error("This room was set to Maintenance in Rooms — change it there, or open a ticket for it.");
    // Resolving asks what it cost (Fixed · Rs 1,200 on the card).
    if (status === "resolved") return setDialog({ editing: t, focus: "resolve", status: "resolved" });
    move.mutate({ id: t.id, status }, { onError: (e) => toast.error(e instanceof Error ? e.message : "Could not move the ticket") });
  };

  const exportCsv = async () => {
    if (!token) return;
    setExporting(true);
    try {
      await downloadMaintenanceCsvApi(token, params);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const lostPkr = s?.offline_rent_lost?.pkr ?? 0;
  const lostUsd = s?.offline_rent_lost?.usd ?? 0;
  const firstOffline = s?.offline_rooms?.[0];
  const spent = s?.spent_this_month;
  const pc = s?.priority_counts;
  const subtitleMobile = s ? [`${s.open} open`, s.urgent ? `${s.urgent} urgent` : null, s.rooms_in_maintenance ? `${s.rooms_in_maintenance} room${s.rooms_in_maintenance === 1 ? "" : "s"} offline` : null].filter(Boolean).join(" · ") : "";

  return (
    <>
      <PageHeader
        title="Maintenance"
        subtitle={desktop ? "Repairs and problems in rooms and common areas · move a card as work progresses" : subtitleMobile}
        actions={
          desktop ? (
            <>
              <Segmented label="View" value={view} onChange={setView} options={[["board", "Board"], ["list", "List"]] as const} />
              <GlassButton variant="glass" onClick={exportCsv} disabled={exporting}>
                <Download aria-hidden /> {exporting ? "Exporting…" : "Export"}
              </GlassButton>
              <GlassButton onClick={() => setDialog({ editing: null })}>
                <Plus aria-hidden /> New ticket
              </GlassButton>
            </>
          ) : (
            <GlassButton aria-label="New ticket" onClick={() => setDialog({ editing: null })} className="absolute top-2 right-0 size-12 rounded-[16px] px-0">
              <Plus aria-hidden />
            </GlassButton>
          )
        }
        className="relative"
      />

      <div className="flex flex-col gap-4 md:gap-5">
        {desktop ? (
          <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            <FinKpi icon={<AlertTriangle />} label="Open" value={String(s?.open ?? 0)} sub={s ? `${s.urgent} urgent · ${s.unassigned ?? 0} not assigned` : ""} />
            <FinKpi icon={<Clock />} label="In progress" value={String(s?.in_progress ?? 0)} sub={s?.oldest_started_at ? `Oldest started ${shortAge(s.oldest_started_at)} ago` : "Nothing in progress"} />
            <FinKpi
              icon={<BedDouble />}
              label="Rooms offline"
              value={String(s?.rooms_in_maintenance ?? 0)}
              danger={(s?.rooms_in_maintenance ?? 0) > 0}
              sub={s?.rooms_in_maintenance ? `${s.rooms_in_maintenance === 1 && firstOffline ? `${firstOffline.label} · ` : ""}${lostPkr ? formatMoney(lostPkr, "pkr") : formatMoney(lostUsd, "usd")} / month lost` : "Every room can be booked"}
            />
            <FinKpi icon={<Check />} label="Fixed this month" value={String(s?.fixed_this_month ?? 0)} sub={s ? `${formatMoney(spent?.pkr || spent?.usd || 0, spent?.pkr || !spent?.usd ? "pkr" : "usd")} spent${s.avg_fix_days != null ? ` · avg ${s.avg_fix_days < 1 ? "<1" : Math.round(s.avg_fix_days)} day${Math.round(s.avg_fix_days) === 1 ? "" : "s"}` : ""}` : ""} />
          </div>
        ) : null}

        {desktop ? (
          <StickyBar><div className="glass-2 flex flex-wrap items-center gap-2.5 rounded-[22px] p-3">
            <Segmented
              label="Priority"
              value={chip}
              onChange={setChip}
              options={[
                ["all", "All", pc?.all],
                ["urgent", "Urgent", pc?.urgent],
                ["high", "High", pc?.high],
                ["mine", "Mine", pc?.mine],
              ] as const}
            />
            <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2.5 rounded-[12px] bg-glass-inset px-3 focus-within:ring-2 focus-within:ring-brand-tint">
              <Search className="size-4 shrink-0 text-ink-2" aria-hidden />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Problem or room" aria-label="Search problem or room" className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-2" />
              {search ? (
                <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="cursor-pointer text-ink-2 hover:text-ink">
                  <X className="size-4" />
                </button>
              ) : null}
            </label>
            <FilterSelect label="Room" value={roomId} onChange={setRoomId}>
              <option value="all">All rooms</option>
              <option value="common">Common areas</option>
              {roomList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.room_number != null ? `Room ${r.room_number}` : r.title}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect label="Assigned to" value={assignee} onChange={setAssignee}>
              <option value="">Anyone</option>
              <option value="Unassigned">Not assigned</option>
              {assigneeOptions.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
            </FilterSelect>
          </div></StickyBar>
        ) : (
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="radiogroup" aria-label="Status">
            {COLUMNS.map(([k, l]) => (
              <button key={k} type="button" role="radio" aria-checked={mobileCol === k} onClick={() => setMobileCol(k)} className={cn("inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-body transition-colors", mobileCol === k ? "border-ink bg-glass-3 font-medium text-ink" : "border-transparent bg-glass-inset text-ink-2")}>
                {l} <span className="text-label text-ink-2">{k === "resolved" ? (s?.resolved ?? byCol[k].length) : byCol[k].length}</span>
              </button>
            ))}
          </div>
        )}

        {isError ? (
          <div className="glass-2 rounded-[22px] px-4 py-14 text-center text-body text-danger">Could not load tickets. Is the API running?</div>
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[420px] animate-pulse rounded-[22px] bg-glass-inset" />
            ))}
          </div>
        ) : !desktop ? (
          <div className="flex flex-col gap-3">
            {byCol[mobileCol].length === 0 ? <p className="glass-2 rounded-[22px] px-4 py-10 text-center text-body text-ink-2">Nothing here.</p> : null}
            {byCol[mobileCol].map((t) => (
              <TicketCard key={t.id} t={t} onOpen={(focus) => setDialog({ editing: t, focus })} />
            ))}
          </div>
        ) : view === "board" ? (
          <div className="grid items-start gap-4 md:grid-cols-3">
            {COLUMNS.map(([col, label, dot]) => {
              const all = byCol[col];
              const list = col === "resolved" && !showAllResolved ? all.slice(0, RESOLVED_PREVIEW) : all;
              const hidden = all.length - list.length;
              return (
                <section
                  key={col}
                  aria-label={label}
                  onDragOver={(e) => {
                    if (!dragId) return;
                    e.preventDefault();
                    setDropCol(col);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropCol((c) => (c === col ? null : c));
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const t = tickets.find((x) => x.id === dragId);
                    setDragId(null);
                    setDropCol(null);
                    if (t) moveTo(t, col);
                  }}
                  className={cn("flex min-w-0 flex-col gap-3 rounded-[22px] bg-glass-inset p-3 transition-shadow", dropCol === col && "ring-2 ring-brand-border")}
                >
                  <header className="flex items-center gap-2 px-1 pt-1">
                    <span className={cn("size-2 rounded-full", dot)} aria-hidden />
                    <h2 className="text-body font-semibold text-ink">{label}</h2>
                    <span className="text-label text-ink-2">{col === "resolved" ? (s?.resolved ?? all.length) : all.length}</span>
                    <span className="flex-1" />
                    <button type="button" aria-label={`New ${label.toLowerCase()} ticket`} onClick={() => setDialog({ editing: null, status: col })} className="flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-ink-2 hover:bg-glass-2 hover:text-ink">
                      <Plus className="size-4" />
                    </button>
                  </header>
                  {list.length === 0 ? <p className="px-2 py-6 text-center text-label text-ink-2">{dragId ? "Drop here" : "Nothing here"}</p> : null}
                  {list.map((t) => (
                    <TicketCard
                      key={t.id}
                      t={t}
                      draggable={t.source !== "room_status"}
                      dragging={dragId === t.id}
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setDropCol(null);
                      }}
                      onOpen={(focus) => setDialog({ editing: t, focus })}
                    />
                  ))}
                  {col === "resolved" && (hidden > 0 || showAllResolved) && all.length > RESOLVED_PREVIEW ? (
                    <button type="button" onClick={() => setShowAllResolved((v) => !v)} className="cursor-pointer py-1.5 text-label font-medium text-brand-text hover:underline">
                      {showAllResolved ? "Show fewer" : `Show ${hidden} more fixed`}
                    </button>
                  ) : null}
                </section>
              );
            })}
          </div>
        ) : (
          <TicketTable tickets={[...byCol.open, ...byCol.in_progress, ...byCol.resolved]} onOpen={(t) => setDialog({ editing: t })} onMove={moveTo} />
        )}
      </div>

      <TicketDialog open={dialog != null} onOpenChange={(o) => !o && setDialog(null)} editing={dialog?.editing ?? null} rooms={roomList} assignees={assigneeOptions} focus={dialog?.focus} initialStatus={dialog?.status} />
    </>
  );
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <span className="glass-2 relative flex h-10 items-center rounded-[12px]">
      <ChevronDown className="pointer-events-none absolute left-3 size-4 text-ink" aria-hidden />
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 max-w-[180px] cursor-pointer appearance-none bg-transparent pr-4 pl-9 text-body font-semibold text-ink outline-none">
        {children}
      </select>
    </span>
  );
}

export function PriorityPill({ p }: { p: MaintenancePriority }) {
  return (
    <span className={cn("inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full px-2 text-[12px] leading-4 font-medium whitespace-nowrap", p === "urgent" ? "bg-danger-tint text-danger" : "bg-glass-inset text-ink-2", p === "high" && "text-ink")}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {PRIORITY_LABEL[p]}
    </span>
  );
}

function TicketCard({
  t,
  onOpen,
  draggable,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  t: MaintenanceTicket;
  onOpen: (focus?: "assignee") => void;
  draggable?: boolean;
  dragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const Icon = categoryIcon(t.category);
  const assigned = t.assignee && t.assignee !== "Unassigned";
  const resolved = t.status === "resolved";
  return (
    <article
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.();
      }}
      onDragEnd={onDragEnd}
      className={cn("glass-2 flex flex-col gap-3 rounded-[18px] p-3.5 transition-opacity", draggable && "cursor-grab active:cursor-grabbing", dragging && "opacity-40")}
    >
      <button type="button" onClick={() => onOpen()} className="flex cursor-pointer flex-col gap-3 text-left">
        <div className="flex items-center gap-2">
          <PriorityPill p={t.priority} />
          <span className="flex-1" />
          {resolved ? <Minus className="size-3.5 text-ink-2" aria-hidden /> : <span className="text-label text-ink-2">{shortAge(t.created_at)}</span>}
        </div>
        <div className="flex items-start gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-glass-inset text-ink-2 [&_svg]:size-4">
            <Icon aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-body font-semibold text-ink">{t.title}</p>
            <p className="truncate text-label text-ink-2">{where(t)}</p>
          </div>
        </div>
        {note(t) ? <p className="line-clamp-2 text-label text-ink-2">{note(t)}</p> : null}
      </button>
      <div className="flex items-center gap-2 border-t border-glass-divider pt-3">
        {assigned ? (
          <>
            <span className="flex size-6 shrink-0 items-center justify-center text-[11px] font-semibold text-ink">{initials(t.assignee)}</span>
            <span className="min-w-0 flex-1 truncate text-label text-ink">{t.assignee}</span>
          </>
        ) : (
          <button type="button" onClick={() => onOpen("assignee")} className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-label font-medium text-brand-text hover:underline">
            <Users className="size-3.5" aria-hidden /> Assign someone
          </button>
        )}
        {t.room_offline || t.source === "room_status" ? (
          <span className="inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full border border-ink-2/70 px-2 text-[12px] font-medium text-ink-2">
            <span className="size-1.5 rounded-full bg-current" aria-hidden />
            Room offline
          </span>
        ) : t.photos_count ? (
          <span className="text-label text-ink-2">
            {t.photos_count} photo{t.photos_count === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
    </article>
  );
}

function TicketTable({ tickets, onOpen, onMove }: { tickets: MaintenanceTicket[]; onOpen: (t: MaintenanceTicket) => void; onMove: (t: MaintenanceTicket, s: Column) => void }) {
  if (!tickets.length) return <div className="glass-2 rounded-[22px] px-4 py-14 text-center text-body text-ink-2">No tickets match.</div>;
  return (
    <div className="glass-2 overflow-x-auto rounded-[22px]">
      <table className="w-full min-w-[860px] text-left">
        <thead>
          <tr className="border-b border-glass-divider text-[11px] font-semibold tracking-[0.06em] text-ink-2 uppercase">
            <th className="px-4 py-3">Problem</th>
            <th className="px-4 py-3">Where</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Assigned to</th>
            <th className="px-4 py-3">Age</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => {
            const Icon = categoryIcon(t.category);
            return (
              <tr key={t.id} className="border-b border-glass-divider last:border-b-0 hover:bg-glass-inset/40">
                <td className="px-4 py-3">
                  <button type="button" onClick={() => onOpen(t)} className="flex cursor-pointer items-center gap-2.5 text-left">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-glass-inset text-ink-2 [&_svg]:size-4">
                      <Icon aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-body font-medium text-ink">{t.title}</span>
                      <span className="block truncate text-label text-ink-2">{note(t)}</span>
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 text-body text-ink-2">{where(t)}</td>
                <td className="px-4 py-3">
                  <PriorityPill p={t.priority} />
                </td>
                <td className="px-4 py-3 text-body text-ink">{t.assignee && t.assignee !== "Unassigned" ? t.assignee : <span className="text-ink-3">—</span>}</td>
                <td className="px-4 py-3 text-label text-ink-2">{shortAge(t.created_at)}</td>
                <td className="px-4 py-3">
                  <select aria-label={`Status of ${t.title}`} value={t.status} disabled={t.source === "room_status"} onChange={(e) => onMove(t, e.target.value as Column)} className="h-8 cursor-pointer rounded-[10px] border border-glass-stroke bg-glass-inset px-2 text-label text-ink outline-none">
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
