import { apiFetch } from "@/api/apiFetch";
import type {
  ResidentDetail,
  ResidentDirectoryParams,
  ResidentDirectoryRow,
  ResidentMonthOption,
  ResidentRegisterParams,
  ResidentRegisterRow,
  ResidentsByRoomGroup,
  ResidentsByRoomParams,
  ResidentsByRoomSummary,
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
  if (params.hostel) search.set("hostel", params.hostel);

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
  if (params.hostel) search.set("hostel", params.hostel);

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

type ByRoomResponse = {
  success: boolean;
  rooms: ResidentsByRoomGroup[];
  summary: ResidentsByRoomSummary;
};

export async function getResidentsByRoomApi(token: string, params: ResidentsByRoomParams = {}) {
  const search = new URLSearchParams();
  if (params.search) search.set("search", params.search);
  if (params.include_empty === false) search.set("include_empty", "false");
  if (params.hostel) search.set("hostel", params.hostel);

  const q = search.toString();
  const data = await apiFetch<ByRoomResponse>(`/api/v1/residents/by-room${q ? `?${q}` : ""}`, {
    token,
  });
  if (!data.success || !Array.isArray(data.rooms)) {
    throw new Error("Invalid residents-by-room response");
  }
  return {
    rooms: data.rooms,
    summary: data.summary,
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
    extras: data.extras ?? [],
    extras_summary: data.extras_summary,
  };
}

export type CnicOcrFields = {
  cnic: string;
  name: string;
  father_name: string;
  gender: "" | "male" | "female";
  address: string;
  filled?: string[];
};

type OcrCnicResponse = { success: boolean; message?: string } & CnicOcrFields;

export async function ocrCnicApi(
  token: string,
  input: { front?: string; back?: string; front_text?: string; back_text?: string },
): Promise<CnicOcrFields> {
  const data = await apiFetch<OcrCnicResponse>("/api/v1/residents/ocr-cnic", {
    method: "POST",
    token,
    body: JSON.stringify({
      front: input.front,
      back: input.back,
      front_text: input.front_text || undefined,
      back_text: input.back_text || undefined,
    }),
  });
  return {
    cnic: data.cnic ?? "",
    name: data.name ?? "",
    father_name: data.father_name ?? "",
    gender: data.gender === "female" ? "female" : data.gender === "male" ? "male" : "",
    address: data.address ?? "",
    filled: data.filled ?? [],
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
