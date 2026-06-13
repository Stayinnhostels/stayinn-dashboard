import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { b as bookingKeys } from "./booking.keys-CTE8dzAR.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
async function getBookingOverviewStatsApi(token, params = {}) {
  const days = params.days ?? 30;
  const weeks = params.weeks ?? 8;
  const months = params.months ?? 6;
  const data = await apiFetch(
    `/api/v1/bookings/stats/overview?days=${days}&weeks=${weeks}&months=${months}`,
    { token }
  );
  if (!data.success || !data.daily?.series || !data.weekly?.series || !data.status?.breakdown || !data.monthly?.series || !data.revenue) {
    throw new Error("Invalid booking overview stats response");
  }
  return {
    daily: data.daily,
    weekly: data.weekly,
    status: data.status,
    monthly: data.monthly,
    revenue: data.revenue
  };
}
function useBookingOverviewStatsQuery(days = 30, weeks = 8, months = 6) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: bookingKeys.overview(days, weeks, months),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view booking stats");
      return getBookingOverviewStatsApi(token, { days, weeks, months });
    },
    enabled: Boolean(token),
    staleTime: 6e4
  });
}
export {
  useBookingOverviewStatsQuery as u
};
