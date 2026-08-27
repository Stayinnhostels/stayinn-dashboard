import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartTooltipMoney, formatMoney } from "@/lib/payments";
import type { BookingOverviewStats } from "@/api/bookings/getBookingOverviewStats.api";

const chartCard = "border-border/60 bg-card/60 backdrop-blur";

function ChartState({
  loading,
  error,
  errorMessage,
  empty,
  emptyMessage,
  children,
}: {
  loading: boolean;
  error: boolean;
  errorMessage: string;
  empty: boolean;
  emptyMessage: string;
  children: ReactNode;
}) {
  if (loading) return <Skeleton className="h-full w-full rounded-lg" />;
  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
        {errorMessage}
      </div>
    );
  }
  if (empty) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return <>{children}</>;
}

export function ExtrasCollectedCharts({
  extras,
  loading,
  error,
  errorMessage,
}: {
  extras: BookingOverviewStats["extras"];
  loading: boolean;
  error: boolean;
  errorMessage: string;
}) {
  const monthly = extras?.monthly.series ?? [];
  const weekly = extras?.weekly.series ?? [];
  const monthlyPkr = monthly.reduce((sum, row) => sum + (row.collected_pkr ?? 0), 0);
  const monthlyUsd = monthly.reduce((sum, row) => sum + (row.collected_usd ?? 0), 0);
  const weeklyPkr = weekly.reduce((sum, row) => sum + (row.collected_pkr ?? 0), 0);
  const weeklyUsd = weekly.reduce((sum, row) => sum + (row.collected_usd ?? 0), 0);

  return (
    <div>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
        Extra facilities
      </h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={chartCard}>
          <CardHeader>
            <CardTitle className="text-base">Monthly extras collected</CardTitle>
            {!loading && !error ? (
              <p className="text-xs text-muted-foreground">
                {formatMoney(monthlyPkr, "pkr")} · {formatMoney(monthlyUsd, "usd")}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="h-[260px]">
            <ChartState
              loading={loading}
              error={error}
              errorMessage={errorMessage}
              empty={!loading && !error && monthly.every((m) => !m.collected_pkr && !m.collected_usd)}
              emptyMessage="No extra facilities collected in this period"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip formatter={(v, name) => chartTooltipMoney(v, name)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="collected_pkr" name="PKR" fill="oklch(0.55 0.13 200)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="collected_usd" name="USD" fill="oklch(0.62 0.18 250)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartState>
          </CardContent>
        </Card>

        <Card className={chartCard}>
          <CardHeader>
            <CardTitle className="text-base">Weekly extras collected</CardTitle>
            {!loading && !error ? (
              <p className="text-xs text-muted-foreground">
                {formatMoney(weeklyPkr, "pkr")} · {formatMoney(weeklyUsd, "usd")} · last{" "}
                {extras?.weekly.weeks ?? weekly.length} weeks
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="h-[260px]">
            <ChartState
              loading={loading}
              error={error}
              errorMessage={errorMessage}
              empty={!loading && !error && weekly.every((w) => !w.collected_pkr && !w.collected_usd)}
              emptyMessage="No extra facilities collected in this period"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip
                    formatter={(v, name) => chartTooltipMoney(v, name)}
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload as { week_start?: string; week_end?: string } | undefined;
                      if (row?.week_start && row?.week_end) return `${row.week_start} – ${row.week_end}`;
                      return "";
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="collected_pkr" name="PKR" fill="oklch(0.55 0.13 200)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="collected_usd" name="USD" fill="oklch(0.62 0.18 250)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartState>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
