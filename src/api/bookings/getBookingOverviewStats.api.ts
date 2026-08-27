import { apiFetch } from "@/api/apiFetch";
import type { DailyBookingStatPoint } from "@/api/bookings/getBookingDailyStats.api";
import type { RevenueSummary } from "@/types/domain/payment.types";

export type WeeklyBookingStatPoint = {
  key: number;
  label: string;
  week_start: string;
  week_end: string;
  bookings: number;
};

export type BookingStatusStatPoint = {
  status: string;
  name: string;
  value: number;
};

export type MonthlyBookingStatPoint = {
  key: string;
  label: string;
  bookings: number;
  revenue: number;
  revenue_pkr: number;
  revenue_usd: number;
};

export type ExtrasCollectedPoint = {
  key: string | number;
  label: string;
  week_start?: string;
  week_end?: string;
  collected_pkr: number;
  collected_usd: number;
  due_pkr: number;
  due_usd: number;
};

export type BookingOverviewStats = {
  daily: { days: number; series: DailyBookingStatPoint[] };
  weekly: { weeks: number; series: WeeklyBookingStatPoint[] };
  status: { total: number; breakdown: BookingStatusStatPoint[] };
  monthly: { months: number; series: MonthlyBookingStatPoint[] };
  revenue: RevenueSummary;
  extras?: {
    monthly: { months: number; series: ExtrasCollectedPoint[] };
    weekly: { weeks: number; series: ExtrasCollectedPoint[] };
  };
};

type GetBookingOverviewStatsResponse = {
  success: boolean;
} & BookingOverviewStats;

export async function getBookingOverviewStatsApi(
  token: string,
  params: { days?: number; weeks?: number; months?: number } = {},
) {
  const days = params.days ?? 30;
  const weeks = params.weeks ?? 8;
  const months = params.months ?? 6;
  const data = await apiFetch<GetBookingOverviewStatsResponse>(
    `/api/v1/bookings/stats/overview?days=${days}&weeks=${weeks}&months=${months}`,
    { token },
  );
  if (
    !data.success ||
    !data.daily?.series ||
    !data.weekly?.series ||
    !data.status?.breakdown ||
    !data.monthly?.series ||
    !data.revenue
  ) {
    throw new Error("Invalid booking overview stats response");
  }
  return {
    daily: data.daily,
    weekly: data.weekly,
    status: data.status,
    monthly: data.monthly,
    revenue: data.revenue,
    extras: data.extras ?? {
      monthly: { months: 0, series: [] },
      weekly: { weeks: 0, series: [] },
    },
  };
}
