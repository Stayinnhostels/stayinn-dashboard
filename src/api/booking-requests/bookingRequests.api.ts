import { apiFetch } from "@/api/apiFetch";
import type {
  BookingRequest,
  BookingRequestListParams,
  BookingRequestStats,
  BookingRequestStatus,
} from "@/types/domain/booking-request.types";

type ListResponse = {
  success: boolean;
  requests: BookingRequest[];
  stats: BookingRequestStats;
  pagination: { page: number; limit: number; total: number; pages: number };
};

type ResolveResponse = {
  success: boolean;
  request: BookingRequest;
};

export async function getBookingRequestsApi(token: string, params: BookingRequestListParams = {}) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.limit) search.set("limit", String(params.limit));
  if (params.page) search.set("page", String(params.page));
  const q = search.toString();
  const data = await apiFetch<ListResponse>(`/api/v1/booking-requests${q ? `?${q}` : ""}`, { token });
  if (!data.success || !Array.isArray(data.requests)) {
    throw new Error("Invalid booking requests response");
  }
  return {
    requests: data.requests,
    stats: data.stats,
    pagination: data.pagination,
  };
}

export async function resolveBookingRequestApi(
  token: string,
  id: string,
  body: { status: Extract<BookingRequestStatus, "approved" | "rejected">; admin_note?: string; amount_refunded?: number },
) {
  const data = await apiFetch<ResolveResponse>(`/api/v1/booking-requests/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!data.success || !data.request) {
    throw new Error("Invalid booking request update response");
  }
  return data.request;
}
