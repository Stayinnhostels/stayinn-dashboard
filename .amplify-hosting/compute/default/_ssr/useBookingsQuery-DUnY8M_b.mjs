import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
import { b as bookingKeys } from "./booking.keys-CTE8dzAR.mjs";
async function getBookingsApi(token, params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  if (params.room_id) search.set("room_id", params.room_id);
  if (params.search?.trim()) search.set("search", params.search.trim());
  const q = search.toString();
  const data = await apiFetch(`/api/v1/bookings${q ? `?${q}` : ""}`, { token });
  if (!data.success || !Array.isArray(data.bookings)) {
    throw new Error("Invalid bookings list response");
  }
  return { bookings: data.bookings, pagination: data.pagination };
}
function useBookingsQuery(params) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view bookings");
      return getBookingsApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 0
  });
}
export {
  useBookingsQuery as u
};
