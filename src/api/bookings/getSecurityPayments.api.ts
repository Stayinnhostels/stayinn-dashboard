import { apiFetch } from "@/api/apiFetch";
import type {
  SecurityPaymentRow,
  SecurityPaymentsListParams,
  SecurityPaymentsPagination,
  SecurityPaymentsSummary,
} from "@/types/domain/security-payment.types";

type GetSecurityPaymentsResponse = {
  success: boolean;
  security_payments: SecurityPaymentRow[];
  summary: SecurityPaymentsSummary;
  pagination: SecurityPaymentsPagination;
};

export async function getSecurityPaymentsApi(token: string, params: SecurityPaymentsListParams = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  if (params.search?.trim()) search.set("search", params.search.trim());
  if (params.hostel) search.set("hostel", params.hostel);

  const q = search.toString();
  const data = await apiFetch<GetSecurityPaymentsResponse>(
    `/api/v1/bookings/security-payments${q ? `?${q}` : ""}`,
    { token },
  );
  if (!data.success || !Array.isArray(data.security_payments)) {
    throw new Error("Invalid security payments response");
  }
  return {
    security_payments: data.security_payments,
    summary: data.summary,
    pagination: data.pagination,
  };
}
