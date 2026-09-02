import { apiFetch } from "@/api/apiFetch";
import type {
  MonthPaymentStats,
  Payment,
  PaymentsListParams,
  PaymentsPagination,
  RevenueSummary,
} from "@/types/domain/payment.types";

type GetPaymentsResponse = {
  success: boolean;
  payments: Payment[];
  revenue?: RevenueSummary;
  month_stats?: MonthPaymentStats | null;
  month?: string | null;
  pagination: PaymentsPagination;
};

export async function getPaymentsApi(token: string, params: PaymentsListParams = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  if (params.search?.trim()) search.set("search", params.search.trim());
  if (params.month) search.set("month", params.month);
  if (params.hostel) search.set("hostel", params.hostel);

  const q = search.toString();
  const data = await apiFetch<GetPaymentsResponse>(
    `/api/v1/bookings/payments${q ? `?${q}` : ""}`,
    { token },
  );
  if (!data.success || !Array.isArray(data.payments)) {
    throw new Error("Invalid payments list response");
  }
  return {
    payments: data.payments,
    revenue: data.revenue,
    month_stats: data.month_stats ?? null,
    month: data.month ?? null,
    pagination: data.pagination,
  };
}
