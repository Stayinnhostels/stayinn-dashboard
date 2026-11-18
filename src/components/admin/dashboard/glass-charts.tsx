import { useId, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

/**
 * Charts for the Glass dashboard (Figma 01/02 · Dashboard).
 * Grid: 1px chart/grid lines, 12/16 tertiary axis labels, brand bars with 10/4 corner radius,
 * glass-3 tooltip with an eyebrow label, value and optional delta.
 */

const AXIS_TICK = {
  fill: "var(--gl-text-tertiary)",
  fontSize: 12,
  fontFamily: "Geist, ui-sans-serif",
};
const BRAND = "var(--gl-brand-primary)";

/* ───────────────────────── Card shell ───────────────────────── */

export function ChartCard({
  title,
  subtitle,
  legend,
  className,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  legend?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("glass-1 flex min-w-0 flex-col gap-4 rounded-[20px] p-5", className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="truncate text-card-title text-ink">{title}</h2>
          {subtitle ? (
            <p className="truncate text-label font-medium text-ink-2">{subtitle}</p>
          ) : null}
        </div>
        {legend ? <div className="flex shrink-0 items-center gap-3.5">{legend}</div> : null}
      </header>
      {children}
    </section>
  );
}

export function LegendItem({
  color = BRAND,
  label,
  value,
}: {
  color?: string;
  label: ReactNode;
  value?: ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-label font-medium whitespace-nowrap">
      <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: color }} />
      <span className="text-ink-2">{label}</span>
      {value != null ? <span className="text-ink">{value}</span> : null}
    </span>
  );
}

/** Centered note over an empty chart. */
export function ChartEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="glass-inset rounded-full px-3 py-1.5 text-label font-medium text-ink-3">
        {children}
      </span>
    </div>
  );
}

/* ───────────────────────── Tooltip ───────────────────────── */

export function GlassTooltipBox({
  eyebrow,
  value,
  delta,
}: {
  eyebrow: ReactNode;
  value: ReactNode;
  delta?: { value: number; label: string } | null;
}) {
  return (
    <div className="glass-3 flex flex-col rounded-[12px] px-3 py-2 font-geist">
      <span className="text-eyebrow text-ink-3">{eyebrow}</span>
      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-body font-semibold text-ink">{value}</span>
        {delta && delta.value !== 0 ? (
          <span
            className={cn(
              "text-label font-medium",
              delta.value > 0 ? "text-success" : "text-danger",
            )}
          >
            {delta.value > 0 ? "+" : "−"}
            {Math.abs(delta.value)} {delta.label}
          </span>
        ) : null}
      </span>
    </div>
  );
}

/** Whole-number axis steps like the Figma (0 · 4 · 8 · 12 · 16). */
function ticksFor(max: number, steps: number) {
  const raw = Math.max(max, 1) / steps;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = Math.max(
    1,
    [1, 2, 2.5, 4, 5, 10].map((m) => m * pow).find((x) => x >= raw && Number.isInteger(x)) ??
      Math.ceil(raw),
  );
  return Array.from({ length: steps + 1 }, (_, i) => step * i);
}

/* ───────────────────────── Bar chart ───────────────────────── */

export type BarPoint = {
  key: string | number;
  label: string;
  value: number;
  eyebrow: string;
  unit: string;
};

export function GlassBarChart({
  data,
  height,
  barSize,
  steps = 4,
  deltaLabel,
  showEveryLabel = 1,
  empty,
}: {
  data: BarPoint[];
  height: number;
  barSize: number;
  steps?: number;
  /** e.g. (prev) => `vs ${prev.label}` — shown in the tooltip next to the change. */
  deltaLabel?: (prev: BarPoint) => string;
  /** Show only every Nth x label (the last bar is always labelled). */
  showEveryLabel?: number;
  empty?: ReactNode;
}) {
  const max = Math.max(0, ...data.map((d) => d.value));
  const ticks = ticksFor(max, steps);
  const lastIndex = data.length - 1;
  const allZero = data.every((d) => d.value === 0);

  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 0, bottom: 0, left: -12 }}
          barCategoryGap="22%"
        >
          <CartesianGrid vertical={false} stroke="var(--gl-chart-grid)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={0}
            tickMargin={6}
            tick={(props: { x: number; y: number; payload: { value: string; index: number } }) => {
              const i = props.payload.index;
              if (i % showEveryLabel !== 0) return <g />;
              const isLast = i === lastIndex && showEveryLabel === 1;
              return (
                <text
                  x={props.x}
                  y={props.y + 10}
                  textAnchor="middle"
                  fontSize={12}
                  fontFamily="Geist, ui-sans-serif"
                  fontWeight={isLast ? 500 : 400}
                  fill={isLast ? "var(--gl-text-primary)" : "var(--gl-text-tertiary)"}
                >
                  {props.payload.value}
                </text>
              );
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            ticks={ticks}
            domain={[0, ticks[ticks.length - 1]]}
            allowDecimals={false}
            width={40}
            tick={AXIS_TICK}
          />
          <Tooltip
            cursor={false}
            wrapperStyle={{ outline: "none" }}
            content={(props: TooltipProps<number, string>) => {
              const row = props.payload?.[0]?.payload as BarPoint | undefined;
              if (!props.active || !row) return null;
              const idx = data.findIndex((d) => d.key === row.key);
              const prev = idx > 0 ? data[idx - 1] : null;
              return (
                <GlassTooltipBox
                  eyebrow={row.eyebrow}
                  value={`${row.value} ${row.unit}`}
                  delta={
                    prev && deltaLabel
                      ? { value: row.value - prev.value, label: deltaLabel(prev) }
                      : null
                  }
                />
              );
            }}
          />
          <Bar dataKey="value" barSize={barSize} radius={[10, 10, 4, 4]} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell
                key={String(d.key)}
                fill={BRAND}
                style={
                  i === lastIndex && d.value > 0
                    ? { filter: "drop-shadow(0 0 10px rgba(33,212,237,0.45))" }
                    : undefined
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {allZero && empty ? <ChartEmpty>{empty}</ChartEmpty> : null}
    </div>
  );
}

/* ───────────────────────── Area / line chart ───────────────────────── */

export type LinePoint = {
  key: string;
  label: string;
  value: number;
  eyebrow: string;
  /** Last point of an unfinished period — drawn dashed (Figma "Partial month"). */
  partial?: boolean;
};

export function GlassAreaChart({
  data,
  height,
  unit,
  steps = 4,
  smooth = false,
  dots = false,
  markPeak = false,
  deltaLabel,
  showEveryLabel = 1,
  partialLabel,
  empty,
}: {
  data: LinePoint[];
  height: number;
  unit: string;
  steps?: number;
  smooth?: boolean;
  dots?: boolean;
  markPeak?: boolean;
  deltaLabel?: (prev: LinePoint) => string;
  showEveryLabel?: number;
  partialLabel?: string;
  empty?: ReactNode;
}) {
  const gradientId = useId().replace(/:/g, "");
  const max = Math.max(0, ...data.map((d) => d.value));
  const ticks = ticksFor(max, steps);
  const allZero = data.every((d) => d.value === 0);
  const peakIndex = markPeak && !allZero ? data.findIndex((d) => d.value === max) : -1;
  const hasPartial = data.length > 1 && data[data.length - 1]?.partial;

  // Solid series stops at the last complete point; a dashed series bridges to the partial one.
  const rows = data.map((d, i) => ({
    ...d,
    solid: hasPartial && i === data.length - 1 ? null : d.value,
    dashed: hasPartial && i >= data.length - 2 ? d.value : null,
  }));
  const type = smooth ? "monotone" : "linear";

  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 12, right: 18, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.16} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--gl-chart-grid)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={0}
            tickMargin={6}
            tick={(props: { x: number; y: number; payload: { value: string; index: number } }) => {
              const i = props.payload.index;
              if (i % showEveryLabel !== 0) return <g />;
              return (
                <text
                  x={props.x}
                  y={props.y + 10}
                  textAnchor="middle"
                  fontSize={12}
                  fontFamily="Geist, ui-sans-serif"
                  fill="var(--gl-text-tertiary)"
                >
                  {props.payload.value}
                </text>
              );
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            ticks={ticks}
            domain={[0, ticks[ticks.length - 1]]}
            allowDecimals={false}
            width={40}
            tick={AXIS_TICK}
          />
          <Tooltip
            cursor={{ stroke: "var(--gl-chart-grid)", strokeWidth: 1 }}
            wrapperStyle={{ outline: "none" }}
            content={(props: TooltipProps<number, string>) => {
              const row = props.payload?.[0]?.payload as
                | (LinePoint & { solid: number | null })
                | undefined;
              if (!props.active || !row) return null;
              const idx = data.findIndex((d) => d.key === row.key);
              const prev = idx > 0 ? data[idx - 1] : null;
              const eyebrow = idx === peakIndex ? `${row.eyebrow} · Peak day` : row.eyebrow;
              return (
                <GlassTooltipBox
                  eyebrow={eyebrow}
                  value={`${row.value} ${unit}`}
                  delta={
                    prev && deltaLabel
                      ? { value: row.value - prev.value, label: deltaLabel(prev) }
                      : null
                  }
                />
              );
            }}
          />
          <Area
            type={type}
            dataKey="solid"
            stroke={BRAND}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            connectNulls={false}
            dot={
              dots
                ? (p: { cx?: number; cy?: number; index?: number }) =>
                    p.cx == null || p.cy == null ? (
                      <g key={p.index} />
                    ) : (
                      <circle key={p.index} cx={p.cx} cy={p.cy} r={4} fill={BRAND} />
                    )
                : peakIndex >= 0
                  ? (p: { cx?: number; cy?: number; index?: number }) =>
                      p.index === peakIndex && p.cx != null && p.cy != null ? (
                        <circle
                          key={p.index}
                          cx={p.cx}
                          cy={p.cy}
                          r={5}
                          fill="var(--gl-glass-3)"
                          stroke={BRAND}
                          strokeWidth={2.5}
                        />
                      ) : (
                        <g key={p.index} />
                      )
                  : false
            }
            activeDot={{ r: 5, fill: "var(--gl-glass-3)", stroke: BRAND, strokeWidth: 2.5 }}
          />
          {hasPartial ? (
            <Area
              type="linear"
              dataKey="dashed"
              stroke={BRAND}
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="none"
              isAnimationActive={false}
              dot={(p: { cx?: number; cy?: number; index?: number }) =>
                p.index === data.length - 1 && p.cx != null && p.cy != null ? (
                  <circle key={p.index} cx={p.cx} cy={p.cy} r={4} fill={BRAND} />
                ) : (
                  <g key={p.index} />
                )
              }
              activeDot={false}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
      {hasPartial && partialLabel ? (
        <span className="pointer-events-none absolute right-2 bottom-7 text-label text-ink-3">
          {partialLabel}
        </span>
      ) : null}
      {allZero && empty ? <ChartEmpty>{empty}</ChartEmpty> : null}
    </div>
  );
}

/* ───────────────────────── Donut ───────────────────────── */

export type DonutSlice = { key: string; label: string; value: number; color: string };

/** Ring chart drawn as SVG arcs (Figma "Chart / On-time", "Chart / Sources"). */
export function GlassDonut({
  slices,
  size,
  thickness,
  center,
  ariaLabel,
}: {
  slices: DonutSlice[];
  size: number;
  thickness: number;
  center: ReactNode;
  ariaLabel: string;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = slices.reduce((s, x) => s + x.value, 0);
  const visible = slices.filter((s) => s.value > 0);
  const gap = visible.length > 1 ? Math.min(6, c * 0.012) : 0;
  let offset = 0;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--gl-glass-inset)"
          strokeWidth={thickness}
        />
        {total > 0
          ? visible.map((s) => {
              const len = (s.value / total) * c;
              const dash = Math.max(0, len - gap);
              const el = (
                <circle
                  key={s.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return el;
            })
          : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {center}
      </div>
    </div>
  );
}
