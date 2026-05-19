import { apiFetch } from "@/api/apiFetch";

export type DailyBookingStatPoint = {
  date: string;
  label: string;
  bookings: number;
};

type GetBookingDailyStatsResponse = {
  success: boolean;
  days: number;
  series: DailyBookingStatPoint[];
};

export async function getBookingDailyStatsApi(token: string, days = 30) {
  const data = await apiFetch<GetBookingDailyStatsResponse>(
    `/api/v1/bookings/stats/daily?days=${days}`,
    { token },
  );
  if (!data.success || !Array.isArray(data.series)) {
    throw new Error("Invalid daily booking stats response");
  }
  return { days: data.days, series: data.series };
}
