import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BedDouble, CalendarDays, Check, ChevronDown, DoorOpen, LogOut, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlassButton, KpiCard } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { glassMenuClass } from "@/components/admin/shell/admin-account";
import {
  ChartCard,
  GlassAreaChart,
  GlassBarChart,
  GlassDonut,
  LegendItem,
  type BarPoint,
  type DonutSlice,
  type LinePoint,
} from "@/components/admin/dashboard/glass-charts";
import { useBookingOverviewStatsQuery } from "@/queries/bookings/useBookingOverviewStatsQuery";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({ component: DashboardPage });

/**
 * Figma 01.01 / 02.01 · Dashboard — Expanded (Dark / Light Glass).
 * All numbers come from GET /bookings/stats/overview (incl. `insights`).
 */

const PERIODS = [7, 30, 90] as const;
const WEEKS = 8;
const MONTHS = 6;

const SOURCE_COLORS = [
  "var(--gl-brand-primary)",
  "color-mix(in srgb, var(--gl-brand-primary) 45%, transparent)",
  "var(--gl-warning)",
  "var(--gl-success)",
  "var(--gl-info)",
  "var(--gl-text-tertiary)",
];

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const longDay = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const monthLong = new Intl.DateTimeFormat("en-GB", { month: "long" });
const monthShort = new Intl.DateTimeFormat("en-GB", { month: "short" });

function parseDay(key: string) {
  const [y, m, d] = key.slice(0, 10).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function parseMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, 1);
}

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function DashboardPage() {
  const { hostelId, activeHostel } = useHostelScope();
  const [days, setDays] = useState<(typeof PERIODS)[number]>(30);
  const { data, isLoading, isError, error } = useBookingOverviewStatsQuery(
    days,
    WEEKS,
    MONTHS,
    hostelId,
  );
  const insights = data?.insights;

  const subtitle = `${longDay.format(new Date())}${activeHostel?.name ? ` · ${activeHostel.name}` : ""}`;

  const weekly: BarPoint[] = useMemo(
    () =>
      (data?.weekly.series ?? []).map((w, i) => ({
        key: w.key,
        label: `W${i + 1}`,
        value: w.bookings,
        eyebrow: `Week ${i + 1}`,
        unit: w.bookings === 1 ? "booking" : "bookings",
      })),
    [data?.weekly.series],
  );
  const weeklyTotal = weekly.reduce((s, w) => s + w.value, 0);
  const weeklyRange = (() => {
    const series = data?.weekly.series ?? [];
    if (!series.length) return "";
    return `${dayMonth.format(parseDay(series[0].week_start))} – ${dayMonth.format(parseDay(series[series.length - 1].week_end))}`;
  })();

  const checkins: BarPoint[] = useMemo(
    () =>
      (insights?.checkins.series ?? []).map((w) => ({
        key: w.key,
        label: w.label,
        value: w.checkins,
        eyebrow: dayMonth.format(parseDay(w.week_start)),
        unit: w.checkins === 1 ? "check-in" : "check-ins",
      })),
    [insights?.checkins.series],
  );

  const monthly: LinePoint[] = useMemo(() => {
    const series = data?.monthly.series ?? [];
    const thisMonth = new Date();
    return series.map((m, i) => {
      const d = parseMonth(m.key);
      return {
        key: m.key,
        label: monthShort.format(d),
        value: m.bookings,
        eyebrow: monthLong.format(d),
        partial:
          i === series.length - 1 &&
          d.getFullYear() === thisMonth.getFullYear() &&
          d.getMonth() === thisMonth.getMonth(),
      };
    });
  }, [data?.monthly.series]);

  const daily: LinePoint[] = useMemo(
    () =>
      (data?.daily.series ?? []).map((p) => ({
        key: p.date,
        label: p.label,
        value: p.bookings,
        eyebrow: dayMonth.format(parseDay(p.date)),
      })),
    [data?.daily.series],
  );
  const dailyTotal = daily.reduce((s, d) => s + d.value, 0);

  const onTime = insights?.checkins.on_time ?? 0;
  const late = insights?.checkins.late ?? 0;
  const measured = onTime + late;
  const onTimeSlices: DonutSlice[] = [
    { key: "on", label: "On time", value: onTime, color: "var(--gl-brand-primary)" },
    { key: "late", label: "Late", value: late, color: "var(--gl-warning)" },
  ];

  const sources = insights?.sources.breakdown ?? [];
  const sourcesTotal = insights?.sources.total ?? 0;
  const sourceSlices: DonutSlice[] = sources.map((s, i) => ({
    key: s.source,
    label: s.label,
    value: s.value,
    color: SOURCE_COLORS[i % SOURCE_COLORS.length],
  }));

  const occ = insights?.occupancy;
  const checkoutsToday = insights?.checkouts_today ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        className="mb-0 md:mb-0"
        title="Dashboard"
        subtitle={subtitle}
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <GlassButton variant="glass" aria-label={`Period: last ${days} days`}>
                  <CalendarDays /> Last {days} days <ChevronDown className="-mr-1 text-ink-2" />
                </GlassButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className={cn("w-48", glassMenuClass)}
              >
                {PERIODS.map((p) => (
                  <DropdownMenuItem key={p} className="cursor-pointer" onSelect={() => setDays(p)}>
                    <Check className={cn(p === days ? "opacity-100" : "opacity-0")} />
                    Last {p} days
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <GlassButton asChild>
              <Link to="/admin/rooms">
                <Plus /> New booking
              </Link>
            </GlassButton>
          </>
        }
      />

      {isError ? (
        <div
          role="alert"
          className="rounded-[14px] bg-danger-tint px-4 py-3 text-body font-medium text-ink"
        >
          {error instanceof Error ? error.message : "Could not load the dashboard numbers."}
        </div>
      ) : null}

      {/* KPI row */}
      <div data-tour="dashboard-kpis" className="grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-4">
        <KpiCard
          icon={<CalendarDays />}
          label="Current bookings"
          value={isLoading ? "—" : (data?.status.active ?? 0)}
          context={insights ? `Arriving tonight: ${insights.arrivals_today}` : undefined}
        />
        <KpiCard
          icon={<LogOut />}
          label="Check-outs today"
          value={isLoading ? "—" : checkoutsToday}
          context={
            insights
              ? checkoutsToday > 0
                ? `Leaves at ${insights.check_out_time}`
                : "None today"
              : undefined
          }
        />
        <KpiCard
          icon={<DoorOpen />}
          label="Total rooms"
          value={isLoading ? "—" : (occ?.rooms_total ?? 0)}
          context={occ ? `${occ.rooms_available} available` : undefined}
        />
        <KpiCard
          icon={<BedDouble />}
          label="Occupancy"
          value={isLoading ? "—" : `${occ?.rate ?? 0}%`}
          context={occ ? `${occ.beds_occupied} / ${occ.beds_total} bookable beds` : undefined}
        />
      </div>

      {/* Hero row */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ChartCard
          title="Weekly bookings"
          subtitle={`Last ${WEEKS} weeks${weeklyRange ? ` · ${weeklyRange}` : ""}`}
          legend={<LegendItem label="Bookings" value={`${weeklyTotal} total`} />}
        >
          <GlassBarChart
            data={weekly}
            height={300}
            barSize={46}
            deltaLabel={(prev) => `vs ${prev.label}`}
            empty={isLoading ? "Loading…" : "No bookings in these weeks"}
          />
        </ChartCard>

        <ChartCard title="On-time check-ins" subtitle={`Last ${WEEKS} weeks`}>
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <GlassDonut
              size={200}
              thickness={18}
              slices={onTimeSlices}
              ariaLabel={`${pct(onTime, measured)}% of ${measured} check-ins were on time`}
              center={
                measured > 0 ? (
                  <>
                    <span className="text-kpi text-ink">{pct(onTime, measured)}%</span>
                    <span className="text-label font-medium text-ink-2">
                      {onTime} of {measured} check-ins
                    </span>
                  </>
                ) : (
                  <span className="max-w-[130px] text-label font-medium text-ink-3">
                    {isLoading ? "Loading…" : "Check-ins appear here once guests are checked in"}
                  </span>
                )
              }
            />
            <div className="flex items-center gap-3.5">
              <LegendItem label="On time" value={onTime} />
              <LegendItem color="var(--gl-warning)" label="Late" value={late} />
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Trends row */}
      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title="Weekly check-ins" subtitle={`Last ${WEEKS} weeks`}>
          <GlassBarChart
            data={checkins}
            height={210}
            barSize={20}
            steps={2}
            showEveryLabel={2}
            empty={isLoading ? "Loading…" : "No check-ins yet"}
          />
        </ChartCard>

        <ChartCard title="Monthly bookings" subtitle={`Last ${MONTHS} months`}>
          <GlassAreaChart
            data={monthly}
            height={210}
            unit="bookings"
            steps={3}
            dots
            partialLabel="Partial month"
            deltaLabel={(prev) => `vs ${prev.label}`}
            empty={isLoading ? "Loading…" : "No bookings in these months"}
          />
        </ChartCard>

        <ChartCard title="Booking sources" subtitle={`Last ${days} days`}>
          <div className="flex flex-1 items-center gap-5">
            <GlassDonut
              size={150}
              thickness={16}
              slices={sourceSlices}
              ariaLabel={`${sourcesTotal} bookings by source`}
              center={
                <>
                  <span className="text-kpi text-ink">{isLoading ? "—" : sourcesTotal}</span>
                  <span className="text-label font-medium text-ink-2">
                    {sourcesTotal === 1 ? "booking" : "bookings"}
                  </span>
                </>
              }
            />
            <ul className="flex min-w-0 flex-1 flex-col gap-3">
              {sourceSlices.length === 0 ? (
                <li className="text-label text-ink-3">
                  {isLoading ? "Loading…" : "No bookings in this period"}
                </li>
              ) : (
                sourceSlices.slice(0, 4).map((s) => (
                  <li key={s.key} className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-label font-medium text-ink-2">
                        {s.label}
                      </span>
                      <span className="text-body font-semibold text-ink">
                        {pct(s.value, sourcesTotal)}%
                      </span>
                    </span>
                    <span className="text-label text-ink-3">
                      {s.value} {s.value === 1 ? "booking" : "bookings"}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </ChartCard>
      </div>

      {/* Daily bookings */}
      <ChartCard
        title={`Daily bookings — last ${days} days`}
        subtitle={`${dailyTotal} ${dailyTotal === 1 ? "booking" : "bookings"} in this period`}
        legend={
          <>
            <LegendItem label="Bookings" />
            <LegendItem label="Peak day" />
          </>
        }
      >
        <GlassAreaChart
          data={daily}
          height={220}
          unit="bookings"
          smooth
          markPeak
          showEveryLabel={Math.max(1, Math.round(daily.length / 15))}
          empty={isLoading ? "Loading…" : "No bookings in this period"}
        />
      </ChartCard>
    </div>
  );
}
