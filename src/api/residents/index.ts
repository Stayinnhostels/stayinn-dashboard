import { apiFetch } from "@/api/apiFetch";
import type {
  ResidentDetail,
  ResidentDirectoryParams,
  ResidentDirectoryRow,
  ResidentMonthOption,
  ResidentRegisterParams,
  ResidentRegisterRow,
  UpdateResidentInput,
} from "@/types/domain/resident.types";

type ListResidentsResponse = {
  success: boolean;
  month: string;
  cohort?: string;
  residents: ResidentRegisterRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export async function getResidentsRegisterApi(token: string, params: ResidentRegisterParams = {}) {
  const search = new URLSearchParams();
  if (params.month) search.set("month", params.month);
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.search) search.set("search", params.search);
  if (params.cohort) search.set("cohort", params.cohort);
  if (params.status) search.set("status", params.status);

  const q = search.toString();
  const data = await apiFetch<ListResidentsResponse>(`/api/v1/residents${q ? `?${q}` : ""}`, { token });
  if (!data.success || !Array.isArray(data.residents)) {
    throw new Error("Invalid residents register response");
  }
  return {
    month: data.month,
    cohort: data.cohort,
    residents: data.residents,
    pagination: data.pagination,
  };
}

type DirectoryResponse = {
  success: boolean;
  scope: string;
  residents: ResidentDirectoryRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export async function getResidentsDirectoryApi(token: string, params: ResidentDirectoryParams = {}) {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.search) search.set("search", params.search);
  if (params.scope) search.set("scope", params.scope);

  const q = search.toString();
  const data = await apiFetch<DirectoryResponse>(`/api/v1/residents/directory${q ? `?${q}` : ""}`, {
    token,
  });
  if (!data.success || !Array.isArray(data.residents)) {
    throw new Error("Invalid residents directory response");
  }
  return {
    scope: data.scope,
    residents: data.residents,
    pagination: data.pagination,
  };
}

type MonthsResponse = { success: boolean; months: ResidentMonthOption[] };

export async function getResidentMonthsApi(token: string) {
  const data = await apiFetch<MonthsResponse>("/api/v1/residents/months", { token });
  if (!data.success || !Array.isArray(data.months)) {
    throw new Error("Invalid resident months response");
  }
  return data.months;
}

type ResidentDetailResponse = { success: boolean } & ResidentDetail;

export async function getResidentDetailApi(token: string, bookingId: string, month?: string) {
  const search = month ? `?month=${encodeURIComponent(month)}` : "";
  const data = await apiFetch<ResidentDetailResponse>(`/api/v1/residents/${bookingId}${search}`, { token });
  if (!data.success || !data.resident) {
    throw new Error("Invalid resident detail response");
  }
  return {
    resident: data.resident,
    booking: data.booking,
    stay: data.stay,
    rent_timeline: data.rent_timeline ?? [],
    rent_summary: data.rent_summary,
  };
}

type UpdateResidentResponse = { success: boolean; resident: ResidentRegisterRow };

export async function patchResidentApi(token: string, bookingId: string, input: UpdateResidentInput) {
  const data = await apiFetch<UpdateResidentResponse>(`/api/v1/residents/${bookingId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  });
  if (!data.success || !data.resident) {
    throw new Error("Invalid update resident response");
  }
  return data.resident;
}

export {
  downloadMonthRentRegisterPdfApi,
  downloadMonthRentRegisterExcelApi,
  downloadResidentDossierPdfApi,
  downloadResidentDossierExcelApi,
  downloadResidentMonthInvoiceApi,
} from "./downloadResidentExport.api";
