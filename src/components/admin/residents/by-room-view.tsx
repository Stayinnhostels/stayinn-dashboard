import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, BedDouble, Building2, ChevronDown, ChevronRight, Check, Info, MessageCircle, Plus, UserPlus, Users, Wrench, X } from "lucide-react";
import { GlassSearch } from "@/components/glass";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WalkInModal } from "@/components/admin/walk-in/walk-in-modal";
import { useRoomQuery } from "@/queries/rooms/useRoomQuery";
import { useRoomsBoardQuery } from "@/queries/residents";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { BoardResident, BoardRoom } from "@/types/domain/resident-roll.types";
import { RentStatusPill } from "./rent-status";

type Filter = "all" | "free" | "full" | "empty" | "maintenance";
const monShort = (k: string | null) => {
  if (!k) return "";
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d || 1).toLocaleDateString("en-GB", { month: "short" });
};
const dayMon = (k: string | null) => {
  if (!k) return "";
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
const floorName = (f: number | null) => (f == null ? "No floor set" : f === 0 ? "Ground floor" : `Floor ${f}`);

/** Figma 07.02 / 07.22 · Residents · By room. */
export function ByRoomView({ month, hostelId, switcher }: { month: string; hostelId?: string; switcher?: React.ReactNode }) {
  const { data, isLoading } = useRoomsBoardQuery({ month, hostel: hostelId }, { enabled: Boolean(hostelId) });
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [floor, setFloor] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [walkIn, setWalkIn] = useState<{ roomId: string; bed: number } | null>(null);

  const rooms = data?.rooms ?? [];
  const k = data?.kpis;
  const counts = useMemo(
    () => ({
      all: rooms.length,
      free: rooms.filter((r) => r.state === "free" || r.state === "empty").reduce((s, r) => s + (r.bookable - r.taken), 0),
      full: rooms.filter((r) => r.state === "full").length,
      empty: rooms.filter((r) => r.state === "empty").length,
      maintenance: rooms.filter((r) => r.state === "maintenance").length,
    }),
    [rooms],
  );
  const floors = useMemo(() => [...new Set(rooms.map((r) => r.floor))].sort((a, b) => (a ?? 999) - (b ?? 999)), [rooms]);
  const visible = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rooms.filter((r) => {
      if (filter === "free" && !(r.state === "free" || r.state === "empty")) return false;
      if (filter !== "all" && filter !== "free" && r.state !== filter) return false;
      if (floor !== "all" && String(r.floor) !== floor) return false;
      if (!s) return true;
      return [r.name, r.title, r.kind, ...r.residents.flatMap((p) => [p.name, p.phone])].some((v) => String(v ?? "").toLowerCase().includes(s));
    });
  }, [rooms, filter, floor, q]);
  const groups = useMemo(() => {
    const m = new Map<number | null, BoardRoom[]>();
    for (const r of visible) {
      if (!m.has(r.floor)) m.set(r.floor, []);
      m.get(r.floor)!.push(r);
    }
    return [...m.entries()].sort((a, b) => (a[0] ?? 999) - (b[0] ?? 999));
  }, [visible]);
  const open = rooms.find((r) => r.id === openId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <Kpi icon={<BedDouble />} label="Beds filled" value={k ? `${k.beds.taken} of ${k.beds.total}` : "—"} sub={k ? `${k.beds.percent}% full · ${k.beds.free} free bed${k.beds.free === 1 ? "" : "s"}` : ""} />
        <Kpi icon={<Building2 />} label="Rooms full" value={k ? `${k.rooms.full} of ${k.rooms.total}` : "—"} sub={k ? `${k.rooms.with_free} with free beds · ${k.rooms.empty} empty` : ""} />
        <Kpi icon={<Users />} label="Active residents" value={k ? String(k.residents.count) : "—"} sub={k ? `${k.residents.leaving} leaving this month` : ""} />
        <Kpi icon={<Wrench />} label="Out of service" value={k ? `${k.out_of_service.count} room${k.out_of_service.count === 1 ? "" : "s"}` : "—"} sub={k?.out_of_service.first ?? "Everything working"} />
      </div>

      <div className="glass-2 flex flex-wrap items-center gap-2 rounded-[18px] p-2.5">
        {switcher}
        <div className="no-scrollbar flex max-w-full gap-0.5 overflow-x-auto rounded-[14px] border border-glass-divider bg-glass-inset p-1">
          {(
            [
              ["all", "All rooms"],
              ["free", "Free beds"],
              ["full", "Full"],
              ["empty", "Empty"],
              ["maintenance", "Maintenance"],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={cn("flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] border px-3 text-body font-medium whitespace-nowrap", filter === key ? "glass-3 border-glass-stroke text-ink" : "border-transparent text-ink-2 hover:text-ink")}>
              {label}
              <span className="text-label text-ink-3">{counts[key]}</span>
            </button>
          ))}
        </div>
        <GlassSearch className="min-w-[180px] flex-1" placeholder="Room, name or phone" shortcut="" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search rooms" />
        <Popover>
          <PopoverTrigger className="glass-3 flex h-10 cursor-pointer items-center gap-2 rounded-[12px] px-3.5 text-body font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-border">
            <ChevronDown className="size-4" aria-hidden /> {floor === "all" ? "All floors" : floorName(floor === "null" ? null : Number(floor))}
          </PopoverTrigger>
          <PopoverContent align="end" className="glass-3 w-[200px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
            {[["all", "All floors"] as const, ...floors.map((f) => [String(f), floorName(f)] as const)].map(([key, label]) => (
              <button key={key} type="button" onClick={() => setFloor(key)} className={cn("flex w-full cursor-pointer items-center justify-between rounded-[10px] px-3 py-2 text-left text-body hover:bg-glass-inset", floor === key && "bg-brand-tint")}>
                {label}
                {floor === key ? <Check className="size-4 text-brand-text" aria-hidden /> : null}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      <div className="hidden flex-col gap-2 md:flex">
        <p className="flex items-center gap-1.5 text-label text-ink-3"><Info className="size-3.5" aria-hidden /> By room · each card is a room and each tile is a bed. Click a “Free” bed to add a resident. A red dot means rent is not paid.</p>
        <div className="flex flex-wrap items-center gap-4 pl-5 text-label text-ink-2">
          <span className="flex items-center gap-1.5"><span className="h-3 w-4 rounded-[4px] bg-glass-inset" />Bed taken</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-4 rounded-[4px] border border-dashed border-glass-stroke" />Free bed — click to add</span>
          <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-danger" />Rent not paid this month</span>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="glass-2 h-[150px] animate-pulse rounded-[20px]" />)}</div>
          ) : groups.length === 0 ? (
            <p className="glass-2 rounded-[20px] px-4 py-14 text-center text-body text-ink-2">No rooms match.</p>
          ) : (
            groups.map(([f, list]) => (
              <section key={String(f)} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <p className="text-eyebrow text-ink-3 uppercase">{floorName(f)} · {list.length} room{list.length === 1 ? "" : "s"}</p>
                  <span className="h-px flex-1 bg-glass-divider" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {list.map((r) => (
                    <RoomTile key={r.id} room={r} active={openId === r.id} onOpen={() => setOpenId(r.id)} onAdd={(bed) => setWalkIn({ roomId: r.id, bed })} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {/* Room panel: right-side sheet on desktop, bottom sheet on mobile */}
      <Dialog.Root open={Boolean(open)} onOpenChange={(o) => !o && setOpenId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90svh] overflow-y-auto outline-none duration-300 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom md:inset-x-auto md:inset-y-3 md:right-3 md:max-h-none md:w-[min(400px,calc(100vw-24px))] md:data-[state=open]:slide-in-from-right"
          >
            {open ? (
              <RoomPanel
                room={open}
                onClose={() => setOpenId(null)}
                onAdd={(bed) => {
                  setOpenId(null);
                  setWalkIn({ roomId: open.id, bed });
                }}
              />
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {walkIn ? <WalkInForRoom roomId={walkIn.roomId} bed={walkIn.bed} onClose={() => setWalkIn(null)} /> : null}
    </div>
  );
}

function WalkInForRoom({ roomId, bed, onClose }: { roomId: string; bed: number; onClose: () => void }) {
  const { data: room } = useRoomQuery(roomId);
  if (!room) return null;
  return <WalkInModal open onOpenChange={(o) => !o && onClose()} room={room} presetBeds={[bed]} />;
}

function Kpi({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="glass-2 flex flex-col gap-2 rounded-[20px] px-4 py-4 md:px-5">
      <span className="flex items-center gap-2 text-label font-medium text-ink-2 [&_svg]:size-4">{icon}{label}</span>
      <span className="text-[22px] leading-7 font-semibold tracking-tight text-ink md:text-[28px] md:leading-9">{value}</span>
      <span className="truncate text-label text-ink-3">{sub}</span>
    </div>
  );
}

function RoomTile({ room, active, onOpen, onAdd }: { room: BoardRoom; active: boolean; onOpen: () => void; onAdd: (bed: number) => void }) {
  const people = new Map(room.residents.map((p) => [p.booking_id, p]));
  const meta = [room.kind, room.floor != null ? floorName(room.floor) : null].filter(Boolean).join(" · ");
  return (
    <div className={cn("glass-2 flex flex-col gap-3 rounded-[20px] p-4 transition-shadow", active && "ring-2 ring-brand-border")}>
      <button type="button" onClick={onOpen} className="flex cursor-pointer items-start gap-3 text-left outline-none">
        <span className="mt-0.5 text-ink-3 [&_svg]:size-4">{room.state === "maintenance" ? <Wrench aria-hidden /> : <BedDouble aria-hidden />}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-semibold text-ink">{room.name}</span>
          <span className="block truncate text-label text-ink-3">{meta}</span>
        </span>
        {room.state === "maintenance" ? (
          <span className="flex items-center gap-1 rounded-full border border-glass-stroke px-2 py-0.5 text-label text-ink-2"><span className="size-1.5 rounded-full bg-ink-2" />Repair</span>
        ) : room.state === "empty" ? (
          <span className="text-label font-medium text-ink-2">Empty</span>
        ) : (
          <span className="text-label font-medium whitespace-nowrap text-ink-2">{room.taken} / {room.bookable} beds</span>
        )}
      </button>
      {room.state === "maintenance" ? (
        <div className="flex items-center gap-2 rounded-[12px] bg-glass-inset px-3 py-2.5 text-label text-ink-2"><Wrench className="size-3.5" aria-hidden />{room.maintenance?.note}</div>
      ) : room.state === "empty" && room.beds_total === 1 ? (
        <button type="button" onClick={() => onAdd(1)} className="flex cursor-pointer items-center gap-2 rounded-[12px] border border-dashed border-glass-stroke px-3 py-2.5 text-label font-medium text-brand-text hover:bg-brand-tint"><Plus className="size-3.5" aria-hidden />Room is free · Add resident</button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {room.beds.map((b) => {
            const p = b.booking_id ? people.get(b.booking_id) : null;
            if (b.state === "free")
              return (
                <button key={b.number} type="button" onClick={() => onAdd(b.number)} className="flex cursor-pointer items-center gap-2.5 rounded-[12px] border border-dashed border-glass-stroke px-2.5 py-2 text-left hover:bg-brand-tint">
                  <span className="flex size-6 items-center justify-center rounded-full bg-glass-inset text-brand-text [&_svg]:size-3.5"><Plus aria-hidden /></span>
                  <span><span className="block text-label font-semibold text-brand-text">Free</span><span className="block text-[11px] text-ink-3">{b.label}</span></span>
                </button>
              );
            if (b.state === "out_of_service")
              return (
                <div key={b.number} className="flex items-center gap-2.5 rounded-[12px] bg-glass-inset px-2.5 py-2 opacity-70">
                  <Wrench className="size-3.5 text-ink-3" aria-hidden />
                  <span><span className="block text-label font-medium text-ink-2">Out of use</span><span className="block text-[11px] text-ink-3">{b.label}</span></span>
                </div>
              );
            const unpaid = p && (p.rent_status === "not_paid" || p.rent_status === "partial");
            return (
              <button key={b.number} type="button" onClick={onOpen} className="flex cursor-pointer items-center gap-2.5 rounded-[12px] bg-glass-inset px-2.5 py-2 text-left hover:bg-glass-3">
                <span className="w-6 text-center text-[11px] font-semibold text-ink-2">{p?.initials}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-label font-semibold text-ink">{p?.first_name}</span><span className="block text-[11px] text-ink-3">{b.label}</span></span>
                {unpaid ? <span className="size-1.5 shrink-0 rounded-full bg-danger" aria-label="Rent not paid" /> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RoomPanel({ room, onClose, onAdd }: { room: BoardRoom; onClose: () => void; onAdd: (bed: number) => void }) {
  const free = room.beds.filter((b) => b.state === "free");
  const firstFree = free[0];
  const emails = room.residents.map((p) => p.email).filter(Boolean);
  const meta = [room.kind, room.floor != null ? floorName(room.floor) : null, room.price_per_bed ? `${formatMoney(room.price_per_bed, room.currency)} / bed` : null].filter(Boolean).join(" · ");
  return (
    <div className="glass-3 flex min-h-full flex-col gap-4 rounded-t-[28px] p-5 pb-8 font-geist text-ink md:rounded-[24px]">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Dialog.Title className="text-hero text-ink">{room.name}</Dialog.Title>
          <p className="text-label text-ink-2">{meta}</p>
        </div>
        <button type="button" aria-label="Close" onClick={onClose} className="glass-2 flex size-9 cursor-pointer items-center justify-center rounded-[12px] text-ink"><X className="size-4" aria-hidden /></button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Mini label="Beds" value={`${room.taken} / ${room.bookable}`} />
        <Mini label="Rent due" value={formatMoney(room.rent_due, room.currency)} danger={room.rent_due > 0} />
        <Mini label="Leaving" value={String(room.leaving)} />
      </div>
      {room.maintenance ? <div className="flex items-center gap-2 rounded-[12px] bg-glass-inset px-3 py-2.5 text-label text-ink-2"><Wrench className="size-3.5" aria-hidden />{room.maintenance.note}</div> : null}
      <div className="flex flex-col gap-2">
        <p className="text-eyebrow text-ink-3 uppercase">Who lives here</p>
        {room.residents.length === 0 ? <p className="text-label text-ink-3">No one this month.</p> : null}
        {room.residents.map((p) => <PersonRow key={p.booking_id} p={p} />)}
        {free.map((b) => (
          <button key={b.number} type="button" onClick={() => onAdd(b.number)} className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-dashed border-brand-border px-3 py-2.5 text-left hover:bg-brand-tint">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand-tint text-brand-text [&_svg]:size-4"><Plus aria-hidden /></span>
            <span className="min-w-0">
              <span className="block text-body font-semibold text-ink">{b.label} is free</span>
              <span className="block truncate text-label text-ink-3">{[room.free_since ? `Free since ${dayMon(room.free_since)}` : null, room.price_per_bed ? `${formatMoney(room.price_per_bed, room.currency)} / month` : null].filter(Boolean).join(" · ")}</span>
            </span>
          </button>
        ))}
      </div>
      {firstFree && room.state !== "maintenance" ? (
        <button type="button" onClick={() => onAdd(firstFree.number)} className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-brand text-body font-semibold text-on-brand shadow-[0_8px_20px_-8px_var(--color-brand)] [&_svg]:size-4">
          <UserPlus aria-hidden /> Add resident to {firstFree.label}
        </button>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <Link to="/admin/rooms/$id" params={{ id: room.id }} className="glass-2 flex h-9 items-center justify-center gap-1.5 rounded-[12px] text-label font-semibold text-ink [&_svg]:size-3.5"><ArrowLeftRight aria-hidden /> Move someone</Link>
        <a href={emails.length ? `mailto:?bcc=${encodeURIComponent(emails.join(","))}&subject=${encodeURIComponent(`${room.name}`)}` : undefined} aria-disabled={!emails.length} className={cn("glass-2 flex h-9 items-center justify-center gap-1.5 rounded-[12px] text-label font-semibold text-ink [&_svg]:size-3.5", !emails.length && "pointer-events-none opacity-50")}><MessageCircle aria-hidden /> Message room</a>
      </div>
      <Link to="/admin/rooms/$id" params={{ id: room.id }} className="flex items-center justify-center gap-1 text-label font-medium text-ink-2 hover:text-ink"><ChevronRight className="size-3.5" aria-hidden /> Open room page</Link>
    </div>
  );
}

function PersonRow({ p }: { p: BoardResident }) {
  const line = [
    p.beds.map((n) => `Bed ${n}`).join(", "),
    p.since ? `Since ${monShort(p.since)}` : null,
    p.rent_status === "not_paid" ? `${formatMoney(p.left, p.currency)} due` : p.rent_status === "partial" ? `${formatMoney(p.left, p.currency)} left` : p.leaving_this_month && p.leaves_on ? `leaves ${dayMon(p.leaves_on)}` : null,
  ].filter(Boolean).join(" · ");
  return (
    <Link to="/admin/residents/$id" params={{ id: p.booking_id }} className="flex items-center gap-3 rounded-[14px] bg-glass-inset px-3 py-2.5 hover:bg-glass-2">
      <span className="w-6 text-center text-label font-semibold text-ink-2">{p.initials}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body font-semibold text-ink">{p.name}</span>
        <span className="block truncate text-[11px] text-ink-3">{line}</span>
      </span>
      <RentStatusPill status={p.rent_status} className="h-5 px-2 text-[11px]" />
    </Link>
  );
}

function Mini({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-[12px] bg-glass-inset px-2.5 py-2">
      <p className="text-[11px] text-ink-3">{label}</p>
      <p className={cn("truncate text-label font-semibold", danger ? "text-danger" : "text-ink")}>{value}</p>
    </div>
  );
}
