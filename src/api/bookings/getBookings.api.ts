import { apiFetch } from "@/api/apiFetch";
import type { Booking, BookingsListParams, BookingsPagination } from "@/types/domain/booking.types";

type GetBookingsResponse = {
  success: boolean;
  bookings: Booking[];
  pagination: BookingsPagination;
};

export async function getBookingsApi(token: string, params: BookingsListParams = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  if (params.room_id) search.set("room_id", params.room_id);
  if (params.search?.trim()) search.set("search", params.search.trim());

  const q = search.toString();
  const data = await apiFetch<GetBookingsResponse>(`/api/v1/bookings${q ? `?${q}` : ""}`, { token });
  if (!data.success || !Array.isArray(data.bookings)) {
    throw new Error("Invalid bookings list response");
  }
  return { bookings: data.bookings, pagination: data.pagination };
}
