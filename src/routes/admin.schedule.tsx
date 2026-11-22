import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { Segmented } from "@/components/admin/finance/finance-kit";
import { CountUp } from "@/components/admin/dashboard/dashboard-motion";
import { getScheduleApi, getScheduleMonthApi, type ScheduleBar, type SchedulePerson, type ScheduleWeek } from "@/api/bookings/schedule.api";
import { useUpdateBookingStatusMutation } from "@/queries/bookings";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

/** Figma 19 · Schedule (19.01 week, 19.02 today, 19.03 month). */
export const Route = createFileRoute("/admin/schedule")({ component: SchedulePage });

type View = "week" | "today" | "month";
type StatusFilter = "all" | "checked_in" | "reserved" | "leaving_today";

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (k: string, n: number) => {
  const d = parse(k);
  d.setDate(d.getDate() + n);
  return keyOf(d);
};
const mondayOf = (k: string) => addDays(k, -((parse(k).getDay() + 6) % 7));
const shiftMonth = (m: string, n: number) => {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(y, mo - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const fmt = (k: string, o: Intl.DateTimeFormatOptions) => parse(k).toLocaleDateString("en-GB", o);
const to12 = (t: string) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return t;
  const h = Number(m[1]);
  return `${((h + 11) % 12) + 1}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
};

const BAR: Record<ScheduleBar["state"], string> = {
  checked_in: "border-transparent bg-brand text-on-brand",
  reserved: "border-warning bg-warning-tint text-warning",
  leaving_today: "border-success bg-success-tint text-success",
  checked_out: "border-glass-stroke bg-glass-inset text-ink-3",
};
const TAG: Record<SchedulePerson["tag"], [string, string]> = {
  reserved: ["Reserved", "border-warning bg-warning-tint text-warning"],
  id_pending: ["ID pending", "border-danger bg-danger-tint text-danger"],
  paid: ["Paid", "border-success bg-success-tint text-success"],
  balance_due: ["Balance due", "border-danger bg-danger-tint text-danger"],
};

function SchedulePage() {
  const token = useAuthStore((s) => s.token);
  const { hostelId } = useHostelScope();
  const navigate = useNavigate();
  const todayKey = keyOf(new Date());
  const [view, setView] = useState<View>("week");
  const [weekFrom, setWeekFrom] = useState(() => mondayOf(todayKey));
  const [month, setMonth] = useState(() => todayKey.slice(0, 7));
  const [room, setRoom] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const week = useQuery({
    queryKey: ["bookings", "schedule", hostelId, weekFrom],
    queryFn: () => getScheduleApi(token as string, { from: weekFrom, days: 7, ...(hostelId ? { hostel: hostelId } : {}) }),
    enabled: Boolean(token && hostelId),
    placeholderData: keepPreviousData,
  });
  const monthQ = useQuery({
    queryKey: ["bookings", "schedule-month", hostelId, month],
    queryFn: () => getScheduleMonthApi(token as string, { month, ...(hostelId ? { hostel: hostelId } : {}) }),
    enabled: Boolean(token && hostelId) && view === "month",
    placeholderData: keepPreviousData,
  });

  const d = week.data;
  const k = d?.kpis;
  const mobile = useIsMobile();
  // Phones (Figma 19.01 mobile): a day strip + who arrives / leaves on the picked day.
  const [day, setDay] = useState(todayKey);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekFrom, i)), [weekFrom]);
  const pickedDay = weekDays.includes(day) ? day : weekDays.includes(todayKey) ? todayKey : weekFrom;
  const dayLists = useMemo(() => {
    if (!d) return { arrivals: [] as SchedulePerson[], departures: [] as SchedulePerson[] };
    if (pickedDay === d.today) return { arrivals: d.arrivals, departures: d.departures };
    const roomLabel = new Map(d.rooms.map((r) => [r.id, r.label]));
    const person = (b: ScheduleBar): SchedulePerson => ({ id: b.id, guest_name: b.guest_name, booking_code: null, room_label: roomLabel.get(b.room_id) ?? "", seat_label: b.seat_label ? `Bed ${b.seat_label}` : null, time: "", tag: b.state === "reserved" ? "reserved" : "paid", balance: 0, currency: "pkr" });
    return {
      arrivals: d.bookings.filter((b) => b.start === pickedDay && b.state !== "checked_out").map(person),
      departures: d.bookings.filter((b) => b.end === pickedDay).map(person),
    };
  }, [d, pickedDay]);
  const prev = () => (view === "month" ? setMonth((m) => shiftMonth(m, -1)) : setWeekFrom((w) => addDays(w, -7)));
  const next = () => (view === "month" ? setMonth((m) => shiftMonth(m, 1)) : setWeekFrom((w) => addDays(w, 7)));
  const goToday = () => {
    setWeekFrom(mondayOf(todayKey));
    setMonth(todayKey.slice(0, 7));
  };

  const subtitle =
    view === "week" && mobile
      ? `Week of ${fmt(weekFrom, { day: "numeric" })} – ${fmt(addDays(weekFrom, 6), { day: "numeric", month: "short", year: "numeric" })}`
      : view === "week"
      ? `${fmt(weekFrom, { weekday: "short" })} ${fmt(weekFrom, { day: "numeric", month: "short" })} – ${fmt(addDays(weekFrom, 6), { weekday: "short" })} ${fmt(addDays(weekFrom, 6), { day: "numeric", month: "short", year: "numeric" })} · see who arrives, stays and leaves`
      : view === "today"
        ? `Today, ${fmt(todayKey, { weekday: "short" })} ${fmt(todayKey, { day: "numeric", month: "short" })} · ${k?.arrivals_today ?? 0} arrival${k?.arrivals_today === 1 ? "" : "s"} · ${k?.departures_today ?? 0} departure${k?.departures_today === 1 ? "" : "s"}`
        : `${fmt(`${month}-01`, { month: "long", year: "numeric" })} · see how busy each day is`;

  return (
    <>
      <PageHeader
        title="Schedule"
        subtitle={subtitle}
        actions={
          mobile ? null : (
          <>
            <GlassButton variant="glass" onClick={goToday}>
              Today
            </GlassButton>
            {view !== "today" ? (
              <>
                <button type="button" aria-label="Previous" onClick={prev} className="glass-2 flex size-10 cursor-pointer items-center justify-center rounded-[12px] text-ink hover:bg-glass-inset">
                  <ChevronLeft className="size-4" />
                </button>
                <button type="button" aria-label="Next" onClick={next} className="glass-2 flex size-10 cursor-pointer items-center justify-center rounded-[12px] text-ink hover:bg-glass-inset">
                  <ChevronRight className="size-4" />
                </button>
              </>
            ) : null}
            <GlassButton onClick={() => void navigate({ to: "/admin/bookings", search: { walkin: true } })}>Add booking</GlassButton>
          </>
          )
        }
      />

      <div className="flex flex-col gap-4 md:gap-5">
        {view !== "month" && !mobile ? (
          <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            <Kpi label="Arrivals today" value={k ? String(k.arrivals_today) : "—"} />
            <Kpi label="Departures today" value={k ? String(k.departures_today) : "—"} />
            <Kpi label="Beds in use" value={k ? `${k.beds_in_use} / ${k.beds_total}` : "—"} />
            <Kpi label="Free beds tonight" value={k ? String(k.free_tonight) : "—"} brand />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2.5">
          <Segmented label="View" value={view} onChange={setView} stretch={mobile} className={mobile ? "w-full" : undefined} options={[["week", "Week"], ["today", "Today"], ["month", "Month"]] as const} />
          <span className="flex-1" />
          {view === "week" && !mobile ? (
            <>
              <Filter label="Room" value={room} onChange={setRoom}>
                <option value="all">All rooms</option>
                {(d?.rooms ?? []).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </Filter>
              <Filter label="Status" value={status} onChange={(v) => setStatus(v as StatusFilter)}>
                <option value="all">All statuses</option>
                <option value="checked_in">Checked in</option>
                <option value="reserved">Reserved, not arrived</option>
                <option value="leaving_today">Leaving today</option>
              </Filter>
            </>
          ) : null}
        </div>

        {week.isError ? (
          <div className="glass-2 rounded-[22px] px-4 py-14 text-center text-body text-danger">Could not load the schedule. Is the API running?</div>
        ) : view === "week" && mobile ? (
          <>
            <DayStrip days={weekDays} picked={pickedDay} today={todayKey} onPick={setDay} onPrev={prev} onNext={next} />
            <TodayLists arrivals={dayLists.arrivals} departures={dayLists.departures} loading={week.isLoading} when={pickedDay === todayKey ? "today" : fmt(pickedDay, { weekday: "short", day: "numeric", month: "short" })} />
          </>
        ) : view === "week" ? (
          <WeekGrid data={d} from={weekFrom} today={todayKey} room={room} status={status} loading={week.isLoading} />
        ) : view === "today" ? (
          <TodayLists arrivals={d?.arrivals ?? []} departures={d?.departures ?? []} loading={week.isLoading} />
        ) : (
          <MonthGrid data={monthQ.data} loading={monthQ.isLoading} onPick={(day) => { setWeekFrom(mondayOf(day)); setView("week"); }} />
        )}
      </div>
    </>
  );
}

function Kpi({ label, value, brand }: { label: string; value: string; brand?: boolean }) {
  return (
    <div className="glass-2 flex flex-col gap-1 rounded-[18px] px-4 py-3.5">
      <p className="text-label text-ink-2">{label}</p>
      <p className={cn("text-[16px] leading-6 font-semibold", brand ? "text-brand-text" : "text-ink")}>
        <CountUp value={value} />
      </p>
    </div>
  );
}

function Filter({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <span className="glass-2 relative flex h-10 items-center rounded-[12px]">
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 max-w-[200px] cursor-pointer appearance-none bg-transparent pr-9 pl-4 text-body font-semibold text-ink outline-none">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-ink-2" aria-hidden />
    </span>
  );
}

function WeekGrid({ data, from, today, room, status, loading }: { data: ScheduleWeek | undefined; from: string; today: string; room: string; status: StatusFilter; loading: boolean }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i));
  const to = days[6];
  const bookings = (data?.bookings ?? []).filter((b) => b.state !== "checked_out" && (status === "all" || b.state === status));
  const rooms = (data?.rooms ?? []).filter((r) => (room === "all" ? r.busy || bookings.some((b) => b.room_id === r.id) : r.id === room));

  // Lanes: overlapping bookings in one room stack (dorms).
  const lanesFor = (roomId: string) => {
    const list = bookings.filter((b) => b.room_id === roomId && b.start <= to && b.end >= from).sort((a, b) => a.start.localeCompare(b.start));
    const lanes: ScheduleBar[][] = [];
    for (const b of list) {
      const lane = lanes.find((l) => l[l.length - 1].end <= b.start);
      if (lane) lane.push(b);
      else lanes.push([b]);
    }
    return lanes.length ? lanes : [[]];
  };

  if (loading) return <div className="h-[460px] animate-pulse rounded-[22px] bg-glass-inset" />;
  return (
    <div className="flex flex-col gap-3">
      <div className="glass-2 overflow-x-auto rounded-[22px]">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[130px_repeat(7,minmax(0,1fr))] border-b border-glass-divider">
            <div />
            {days.map((k) => (
              <div key={k} className={cn("border-l border-glass-divider px-3 py-4 text-label", k === today ? "bg-glass-inset/70 font-medium text-brand-text" : "text-ink-2")}>
                {fmt(k, { weekday: "short", day: "numeric" })}
              </div>
            ))}
          </div>
          {rooms.length === 0 ? (
            <p className="px-4 py-12 text-center text-body text-ink-2">Nobody is staying or arriving this week.</p>
          ) : (
            rooms.map((r) =>
              lanesFor(r.id).map((lane, li) => (
                <div key={`${r.id}-${li}`} className="relative grid h-14 grid-cols-[130px_repeat(7,minmax(0,1fr))] border-b border-glass-divider last:border-b-0">
                  <div className="flex items-center px-5 text-label font-medium text-ink">{li === 0 ? r.label : ""}</div>
                  {days.map((k) => (
                    <div key={k} className={cn("border-l border-glass-divider", k === today && "bg-glass-inset/70")} />
                  ))}
                  {lane.map((b) => {
                    const s = Math.max(0, days.indexOf(b.start < from ? from : b.start));
                    // A stay covers nights: it ends on the morning of `end` (same-day checkout keeps one day).
                    // Checkout day is not a night, except a guest leaving today shows on today (Figma 19.01 green bar).
                    const endIdx = b.end > to ? 6 : Math.max(s, days.indexOf(b.end) - (b.end > b.start && b.state !== "leaving_today" ? 1 : 0));
                    const left = `calc(130px + (100% - 130px) * ${s / 7} + 4px)`;
                    const width = `calc((100% - 130px) * ${(endIdx - s + 1) / 7} - 8px)`;
                    return (
                      <Link key={b.id} to="/admin/bookings/$id" params={{ id: b.id }} title={`${b.guest_name}${b.seat_label ? ` · ${b.seat_label}` : ""} · ${fmt(b.start, { day: "numeric", month: "short" })} – ${fmt(b.end, { day: "numeric", month: "short" })}`} style={{ left, width }} className={cn("absolute top-1.5 bottom-1.5 flex items-center truncate rounded-[10px] border px-2.5 text-label font-medium transition-[filter] hover:brightness-95", BAR[b.state])}>
                        <span className="truncate">{b.guest_name}</span>
                      </Link>
                    );
                  })}
                </div>
              )),
            )
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-5 px-1 text-label text-ink-2">
        <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-brand" /> Checked in</span>
        <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-warning" /> Reserved, not arrived</span>
        <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-success" /> Leaving today</span>
      </div>
    </div>
  );
}

/** Figma 19.01 mobile: this week's days, the picked one filled in brand blue. */
function DayStrip({ days, picked, today, onPick, onPrev, onNext }: { days: string[]; picked: string; today: string; onPick: (d: string) => void; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" aria-label="Previous week" onClick={onPrev} className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-inset hover:text-ink">
        <ChevronLeft className="size-4" />
      </button>
      <div className="grid min-w-0 flex-1 grid-cols-7 gap-1.5" role="radiogroup" aria-label="Day">
        {days.map((k) => {
          const on = k === picked;
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onPick(k)}
              className={cn(
                "flex h-14 cursor-pointer flex-col items-center justify-center rounded-[12px] border text-[12px] leading-4 transition-colors",
                on ? "border-transparent bg-brand text-on-brand" : "glass-2 text-ink-2",
                !on && k === today && "text-brand-text",
              )}
            >
              <span>{fmt(k, { weekday: "short" })}</span>
              <span className={cn("text-[16px] leading-6 font-semibold", on ? "text-on-brand" : "text-ink")}>{Number(k.slice(8))}</span>
            </button>
          );
        })}
      </div>
      <button type="button" aria-label="Next week" onClick={onNext} className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-inset hover:text-ink">
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

function TodayLists({ arrivals, departures, loading, when = "today" }: { arrivals: SchedulePerson[]; departures: SchedulePerson[]; loading: boolean; when?: string }) {
  const navigate = useNavigate();
  const status = useUpdateBookingStatusMutation();
  if (loading) return <div className="h-[320px] animate-pulse rounded-[22px] bg-glass-inset" />;
  const row = (p: SchedulePerson, kind: "in" | "out") => (
    <li key={p.id} className="flex items-center gap-3 border-t border-glass-divider px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-label font-medium text-brand-text">{p.guest_name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span>
      <Link to="/admin/bookings/$id" params={{ id: p.id }} className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-ink">{p.guest_name}</p>
        <p className="truncate text-label text-ink-2">{[p.room_label, p.seat_label, to12(p.time)].filter(Boolean).join(" · ")}</p>
      </Link>
      <span className={cn("inline-flex h-[22px] shrink-0 items-center rounded-full border px-2 text-[12px] font-medium", TAG[p.tag][1])}>{TAG[p.tag][0]}</span>
      {kind === "in" ? (
        <GlassButton
          size="sm"
          className="h-8"
          disabled={status.isPending}
          onClick={() => status.mutate({ id: p.id, status: "checked_in" }, { onSuccess: () => toast.success(`${p.guest_name} checked in`), onError: (e) => toast.error(e instanceof Error ? e.message : "Could not check in") })}
        >
          <LogIn aria-hidden /> Check in
        </GlassButton>
      ) : (
        <GlassButton variant="glass" size="sm" className="h-8" onClick={() => void navigate({ to: "/admin/bookings/$id", params: { id: p.id }, search: { checkout: true } })}>
          <LogOut aria-hidden /> Check out
        </GlassButton>
      )}
    </li>
  );
  return (
    <div className="grid items-start gap-4 md:gap-5 lg:grid-cols-2">
      <section className="glass-2 overflow-hidden rounded-[22px]">
        <header className="flex items-center gap-2 px-4 py-4">
          <p className="flex-1 text-body font-semibold text-ink">Arriving {when}</p>
          <span className="text-label text-ink-2">{arrivals.length} check-in{arrivals.length === 1 ? "" : "s"}</span>
        </header>
        {arrivals.length ? <ul>{arrivals.map((p) => row(p, "in"))}</ul> : <p className="border-t border-glass-divider px-4 py-8 text-center text-body text-ink-2">No arrivals {when}.</p>}
      </section>
      <section className="glass-2 overflow-hidden rounded-[22px]">
        <header className="flex items-center gap-2 px-4 py-4">
          <p className="flex-1 text-body font-semibold text-ink">Leaving {when}</p>
          <span className="text-label text-ink-2">{departures.length} check-out{departures.length === 1 ? "" : "s"}</span>
        </header>
        {departures.length ? <ul>{departures.map((p) => row(p, "out"))}</ul> : <p className="border-t border-glass-divider px-4 py-8 text-center text-body text-ink-2">Nobody leaves {when}.</p>}
      </section>
    </div>
  );
}

function MonthGrid({ data, loading, onPick }: { data: { month: string; grid_from: string; today: string; days: Record<string, { in: number; out: number }> } | undefined; loading: boolean; onPick: (day: string) => void }) {
  const cells = useMemo(() => (data ? Array.from({ length: 42 }, (_, i) => addDays(data.grid_from, i)) : []), [data]);
  if (loading || !data) return <div className="h-[560px] animate-pulse rounded-[22px] bg-glass-inset" />;
  // Drop a trailing week that is entirely next month.
  const weeks = Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7)).filter((wk, i) => i < 5 || wk.some((k) => k.startsWith(data.month)));
  return (
    <div className="flex flex-col gap-3">
      <div className="glass-2 overflow-x-auto rounded-[22px]">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 border-b border-glass-divider">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-3 py-3 text-label text-ink-2">
                {d}
              </div>
            ))}
          </div>
          {weeks.map((wk, i) => (
            <div key={i} className="grid grid-cols-7 border-b border-glass-divider last:border-b-0">
              {wk.map((k) => {
                const inMonth = k.startsWith(data.month);
                const c = data.days[k];
                const isToday = k === data.today;
                return (
                  <button key={k} type="button" onClick={() => onPick(k)} className={cn("flex min-h-[96px] cursor-pointer flex-col items-start gap-1.5 border-l border-glass-divider p-2.5 text-left first:border-l-0 hover:bg-glass-inset/40", isToday && "bg-brand-tint ring-2 ring-brand-border ring-inset")}>
                    <span className={cn("text-label", isToday ? "font-medium text-brand-text" : inMonth ? "text-ink" : "text-ink-3")}>{Number(k.slice(8))}</span>
                    {c?.in ? <span className="rounded-[7px] border border-brand-border bg-brand-tint px-1.5 py-0.5 text-[11px] leading-4 text-brand-text">{c.in} in</span> : null}
                    {c?.out ? <span className="rounded-[7px] bg-success-tint px-1.5 py-0.5 text-[11px] leading-4 text-success">{c.out} out</span> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-5 px-1 text-label text-ink-2">
        <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-brand" /> Check-ins</span>
        <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-success" /> Check-outs</span>
      </div>
    </div>
  );
}
