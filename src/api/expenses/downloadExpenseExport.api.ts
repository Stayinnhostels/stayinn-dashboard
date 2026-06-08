import { getApiBaseUrl } from "@/api/client";
import { filenameFromContentDisposition, triggerBrowserDownload } from "@/lib/download-blob";

async function downloadBinary(
  token: string,
  path: string,
  fallbackFilename: string,
): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${token.trim()}`,
    },
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(typeof data.message === "string" ? data.message : `Download failed (${res.status})`);
  }

  const blob = await res.blob();
  const filename = filenameFromContentDisposition(res.headers.get("Content-Disposition"), fallbackFilename);
  triggerBrowserDownload(blob, filename);
}

export async function downloadMonthProfitLossPdfApi(token: string, month: string) {
  await downloadBinary(token, `/api/v1/expenses/export/pdf?month=${encodeURIComponent(month)}`, `profit-loss-${month}.pdf`);
}

export async function downloadMonthProfitLossExcelApi(token: string, month: string) {
  await downloadBinary(
    token,
    `/api/v1/expenses/export/excel?month=${encodeURIComponent(month)}`,
    `profit-loss-${month}.xlsx`,
  );
}
