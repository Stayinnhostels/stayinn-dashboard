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
  if (params.move_in_from) search.set("move_in_from", params.move_in_from);
  if (params.move_in_to) search.set("move_in_to", params.move_in_to);
  if (params.check_out_from) search.set("check_out_from", params.check_out_from);
  if (params.check_out_to) search.set("check_out_to", params.check_out_to);

  const q = search.toString();
  const data = await apiFetch<GetBookingsResponse>(`/api/v1/bookings${q ? `?${q}` : ""}`, { token });
  if (!data.success || !Array.isArray(data.bookings)) {
    throw new Error("Invalid bookings list response");
  }
  return { bookings: data.bookings, pagination: data.pagination };
}
