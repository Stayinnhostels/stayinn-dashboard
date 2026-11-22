import { apiFetch } from "@/api/apiFetch";
import { authFetch } from "@/api/authFetch";
import { filenameFromContentDisposition, triggerBrowserDownload } from "@/lib/download-blob";
import type {
  BookingRequest,
  BookingRequestCounts,
  BookingRequestImpact,
  BookingRequestKpis,
  BookingRequestListParams,
  RefundMethod,
  BookingRequestStats,
  BookingRequestStatus,
} from "@/types/domain/booking-request.types";

type ListResponse = {
  success: boolean;
  requests: BookingRequest[];
  stats: BookingRequestStats;
  counts?: BookingRequestCounts;
  kpis?: BookingRequestKpis;
  pagination: { page: number; limit: number; total: number; pages: number };
};

type ResolveResponse = {
  success: boolean;
  request: BookingRequest;
};

function listSearch(params: BookingRequestListParams) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.type) search.set("type", params.type);
  if (params.search?.trim()) search.set("search", params.search.trim());
  if (params.limit) search.set("limit", String(params.limit));
  if (params.page) search.set("page", String(params.page));
  if (params.hostel) search.set("hostel", params.hostel);
  return search.toString();
}

export async function getBookingRequestsApi(token: string, params: BookingRequestListParams = {}) {
  const q = listSearch(params);
  const data = await apiFetch<ListResponse>(`/api/v1/booking-requests${q ? `?${q}` : ""}`, {
    token,
  });
  if (!data.success || !Array.isArray(data.requests)) {
    throw new Error("Invalid booking requests response");
  }
  return {
    requests: data.requests,
    stats: data.stats,
    counts: data.counts ?? null,
    kpis: data.kpis ?? null,
    pagination: data.pagination,
  };
}

export async function getBookingRequestApi(token: string, id: string) {
  const data = await apiFetch<{ success: boolean; request: BookingRequest; impact: BookingRequestImpact }>(
    `/api/v1/booking-requests/${id}`,
    { token },
  );
  if (!data.success || !data.request) throw new Error("Invalid booking request response");
  return { request: data.request, impact: data.impact ?? {} };
}

export async function downloadBookingRequestsCsvApi(token: string, params: BookingRequestListParams = {}) {
  const { page: _p, limit: _l, ...rest } = params;
  const q = listSearch(rest);
  const res = await authFetch(`/api/v1/booking-requests/export.csv${q ? `?${q}` : ""}`, {}, token);
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? `Export failed (${res.status})`);
  }
  triggerBrowserDownload(
    await res.blob(),
    filenameFromContentDisposition(res.headers.get("Content-Disposition"), "guest-requests.csv"),
  );
}

export async function resolveBookingRequestApi(
  token: string,
  id: string,
  body: {
    status: Extract<BookingRequestStatus, "approved" | "rejected">;
    admin_note?: string;
    amount_refunded?: number;
    refund_method?: RefundMethod;
    reply_template?: string;
    notify_guest?: boolean;
  },
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
