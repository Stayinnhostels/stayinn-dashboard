import { authFetch } from "@/api/authFetch";
import { filenameFromContentDisposition, triggerBrowserDownload } from "@/lib/download-blob";
import type { ResidentRegisterCohort } from "@/types/domain/resident.types";

async function downloadBinary(
  token: string,
  path: string,
  fallbackFilename: string,
): Promise<void> {
  const res = await authFetch(path, {}, token);

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(typeof data.message === "string" ? data.message : `Download failed (${res.status})`);
  }

  const blob = await res.blob();
  const filename = filenameFromContentDisposition(res.headers.get("Content-Disposition"), fallbackFilename);
  triggerBrowserDownload(blob, filename);
}

function exportPath(
  format: "pdf" | "excel",
  month: string,
  cohort: ResidentRegisterCohort,
  search?: string,
) {
  const params = new URLSearchParams({ month, cohort });
  if (search?.trim()) params.set("search", search.trim());
  return `/api/v1/residents/export/${format}?${params.toString()}`;
}

export async function downloadMonthRentRegisterPdfApi(
  token: string,
  month: string,
  cohort: ResidentRegisterCohort,
  search?: string,
) {
  const prefix = cohort === "checkouts" ? "monthly-rent-checkouts" : "monthly-rent-active";
  await downloadBinary(
    token,
    exportPath("pdf", month, cohort, search),
    `${prefix}-${month}.pdf`,
  );
}

export async function downloadMonthRentRegisterExcelApi(
  token: string,
  month: string,
  cohort: ResidentRegisterCohort,
  search?: string,
) {
  const prefix = cohort === "checkouts" ? "monthly-rent-checkouts" : "monthly-rent-active";
  await downloadBinary(
    token,
    exportPath("excel", month, cohort, search),
    `${prefix}-${month}.xlsx`,
  );
}

export async function downloadResidentDossierPdfApi(
  token: string,
  bookingId: string,
  month?: string,
) {
  const params = month ? `?month=${encodeURIComponent(month)}` : "";
  await downloadBinary(
    token,
    `/api/v1/residents/${bookingId}/export/pdf${params}`,
    `resident-record-${bookingId}.pdf`,
  );
}

export async function downloadResidentDossierExcelApi(
  token: string,
  bookingId: string,
  month?: string,
) {
  const params = month ? `?month=${encodeURIComponent(month)}` : "";
  await downloadBinary(
    token,
    `/api/v1/residents/${bookingId}/export/excel${params}`,
    `resident-record-${bookingId}.xlsx`,
  );
}

export async function downloadResidentMonthInvoiceApi(
  token: string,
  bookingId: string,
  months: string | string[],
) {
  const list = (Array.isArray(months) ? months : [months])
    .map((m) => m.trim())
    .filter(Boolean);
  const params = new URLSearchParams();
  if (list.length <= 1) {
    params.set("month", list[0] ?? "");
  } else {
    params.set("months", list.join(","));
  }
  const range = list.length <= 1 ? list[0] : `${list[0]}-to-${list[list.length - 1]}`;
  await downloadBinary(
    token,
    `/api/v1/residents/${bookingId}/export/month-invoice?${params.toString()}`,
    `rent-invoice-${range}.pdf`,
  );
}
