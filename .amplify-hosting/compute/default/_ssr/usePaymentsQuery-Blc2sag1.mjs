import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
async function getPaymentsApi(token, params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  if (params.search?.trim()) search.set("search", params.search.trim());
  const q = search.toString();
  const data = await apiFetch(
    `/api/v1/bookings/payments${q ? `?${q}` : ""}`,
    { token }
  );
  if (!data.success || !Array.isArray(data.payments)) {
    throw new Error("Invalid payments list response");
  }
  return {
    payments: data.payments,
    revenue: data.revenue,
    pagination: data.pagination
  };
}
const paymentKeys = {
  all: ["payments"],
  list: (params) => [...paymentKeys.all, "list", params]
};
function usePaymentsQuery(params) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view payments");
      return getPaymentsApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 0
  });
}
export {
  paymentKeys as p,
  usePaymentsQuery as u
};
