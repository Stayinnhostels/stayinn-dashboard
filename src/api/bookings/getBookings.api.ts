import { apiFetch } from "@/api/apiFetch";
import { authFetch } from "@/api/authFetch";
import { filenameFromContentDisposition, triggerBrowserDownload } from "@/lib/download-blob";
import type {
  Booking,
  BookingsListParams,
  BookingsPagination,
  BookingsSummary,
  BookingViewCounts,
} from "@/types/domain/booking.types";

type GetBookingsResponse = {
  success: boolean;
  bookings: Booking[];
  pagination: BookingsPagination;
  counts?: BookingViewCounts;
  totals?: { outstanding: number };
};

function listSearch(params: BookingsListParams) {

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
  if (params.hostel) search.set("hostel", params.hostel);
  if (params.view && params.view !== "all") search.set("view", params.view);
  if (params.balance) search.set("balance", params.balance);
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  return search.toString();
}

export async function getBookingsApi(token: string, params: BookingsListParams = {}) {
  const q = listSearch(params);
  const data = await apiFetch<GetBookingsResponse>(`/api/v1/bookings${q ? `?${q}` : ""}`, {
    token,
  });
  if (!data.success || !Array.isArray(data.bookings)) {
    throw new Error("Invalid bookings list response");
  }
  return {
    bookings: data.bookings,
    pagination: data.pagination,
    counts: data.counts ?? null,
    totals: data.totals ?? null,
  };
}

export async function getBookingsSummaryApi(token: string, hostel?: string) {
  const q = hostel ? `?hostel=${encodeURIComponent(hostel)}` : "";
  const data = await apiFetch<{ success: boolean } & BookingsSummary>(
    `/api/v1/bookings/summary${q}`,
    { token },
  );
  if (!data.success) throw new Error("Invalid bookings summary response");
  return data as BookingsSummary;
}

/** Downloads every booking matching the filters as CSV (paging ignored). */
export async function downloadBookingsCsvApi(token: string, params: BookingsListParams = {}) {
  const { page: _p, limit: _l, ...rest } = params;
  const q = listSearch(rest);
  const res = await authFetch(`/api/v1/bookings/export.csv${q ? `?${q}` : ""}`, {}, token);
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? `Export failed (${res.status})`);
  }
  const blob = await res.blob();
  triggerBrowserDownload(
    blob,
    filenameFromContentDisposition(res.headers.get("Content-Disposition"), "bookings.csv"),
  );
}

export type BookingRemindersResult = {
  requested: number;
  sent: number;
  skipped_no_balance: number;
  skipped_no_email: number;
  failed: number;
};

export async function postBookingRemindersApi(token: string, ids: string[]) {
  return apiFetch<{ success: boolean } & BookingRemindersResult>("/api/v1/bookings/reminders", {
    token,
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}
