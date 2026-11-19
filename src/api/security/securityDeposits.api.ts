import { apiFetch } from "@/api/apiFetch";
import { authFetch } from "@/api/authFetch";
import { filenameFromContentDisposition, triggerBrowserDownload } from "@/lib/download-blob";
import type { CollectDepositInput, DepositDetail, DepositsParams, DepositsResponse, ReturnDepositInput } from "@/types/domain/security-deposits.types";

/** Figma 09 · Security deposits. */
const BASE = "/api/v1/security/deposits";
type Ok<T> = T & { success: boolean };

function qs(params: Record<string, unknown>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v != null && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
}
const post = <T,>(token: string, path: string, body: unknown, method = "POST") =>
  apiFetch<Ok<T>>(path, { token, method, body: JSON.stringify(body) });

export const getDepositsApi = (token: string, params: DepositsParams) => apiFetch<Ok<DepositsResponse>>(`${BASE}${qs(params)}`, { token });
export const getDepositApi = (token: string, id: string) => apiFetch<Ok<DepositDetail>>(`${BASE}/${id}`, { token });
export const collectDepositApi = (token: string, id: string, input: CollectDepositInput) => post<{ reference: string }>(token, `${BASE}/${id}/collect`, input);
export const returnDepositApi = (token: string, id: string, input: ReturnDepositInput) =>
  post<{ reference: string; emailed: boolean; still_held: number; detail: DepositDetail }>(token, `${BASE}/${id}/return`, input);
export const planDepositApi = (token: string, id: string, input: { amount: number | null; note?: string }) => post<DepositDetail>(token, `${BASE}/${id}/plan`, input, "PATCH");
export const keepDepositApi = (token: string, id: string, input: { amount: number; reason: "damage" | "other"; reason_label?: string; note?: string; photo?: string; photo_name?: string }) =>
  post<DepositDetail>(token, `${BASE}/${id}/keep`, input);
export const logDepositShareApi = (token: string, id: string, input: { what: "return_amount" | "receipt" | "reminder"; channel: "whatsapp" | "email" | "phone" }) =>
  post<{ ok: boolean }>(token, `${BASE}/${id}/log`, input);
export const depositRemindersApi = (token: string, bookingIds: string[]) =>
  post<{ sent: number; skipped: { booking_id: string; name: string; reason: string }[] }>(token, `${BASE}/reminders`, { booking_ids: bookingIds });
export const uploadDepositDocumentApi = (token: string, id: string, input: { name: string; data: string; kind?: "photos" | "damage" | "other" | "receipt"; count?: number; note?: string }) =>
  post<DepositDetail>(token, `${BASE}/${id}/documents`, input);
export const getDepositDocumentApi = (token: string, id: string, docId: string) =>
  apiFetch<Ok<{ document: { name: string; mime: string; data: string } }>>(`${BASE}/${id}/documents/${docId}`, { token });
export const deleteDepositDocumentApi = (token: string, id: string, docId: string) => apiFetch<Ok<DepositDetail>>(`${BASE}/${id}/documents/${docId}`, { token, method: "DELETE" });

export async function downloadDepositReceiptApi(token: string, id: string, entryId?: string) {
  const res = await authFetch(`${BASE}/${id}/receipt.pdf${qs({ entry: entryId })}`, {}, token);
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(typeof data.message === "string" ? data.message : `Download failed (${res.status})`);
  }
  triggerBrowserDownload(await res.blob(), filenameFromContentDisposition(res.headers.get("Content-Disposition"), "deposit-receipt.pdf"));
}
