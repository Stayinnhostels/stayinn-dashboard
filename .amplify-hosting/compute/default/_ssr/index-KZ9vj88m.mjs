import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
async function getResidentsRegisterApi(token, params = {}) {
  const search = new URLSearchParams();
  if (params.month) search.set("month", params.month);
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.search) search.set("search", params.search);
  if (params.cohort) search.set("cohort", params.cohort);
  if (params.status) search.set("status", params.status);
  const q = search.toString();
  const data = await apiFetch(`/api/v1/residents${q ? `?${q}` : ""}`, { token });
  if (!data.success || !Array.isArray(data.residents)) {
    throw new Error("Invalid residents register response");
  }
  return {
    month: data.month,
    cohort: data.cohort,
    residents: data.residents,
    pagination: data.pagination
  };
}
async function getResidentMonthsApi(token) {
  const data = await apiFetch("/api/v1/residents/months", { token });
  if (!data.success || !Array.isArray(data.months)) {
    throw new Error("Invalid resident months response");
  }
  return data.months;
}
async function getResidentDetailApi(token, bookingId, month) {
  const search = month ? `?month=${encodeURIComponent(month)}` : "";
  const data = await apiFetch(`/api/v1/residents/${bookingId}${search}`, { token });
  if (!data.success || !data.resident) {
    throw new Error("Invalid resident detail response");
  }
  return {
    resident: data.resident,
    booking: data.booking,
    stay: data.stay,
    rent_timeline: data.rent_timeline ?? [],
    rent_summary: data.rent_summary
  };
}
async function patchResidentApi(token, bookingId, input) {
  const data = await apiFetch(`/api/v1/residents/${bookingId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input)
  });
  if (!data.success || !data.resident) {
    throw new Error("Invalid update resident response");
  }
  return data.resident;
}
export {
  getResidentDetailApi as a,
  getResidentMonthsApi as b,
  getResidentsRegisterApi as g,
  patchResidentApi as p
};
