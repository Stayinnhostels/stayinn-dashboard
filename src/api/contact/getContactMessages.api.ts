import { apiFetch } from "@/api/apiFetch";
import { authFetch } from "@/api/authFetch";
import { filenameFromContentDisposition, triggerBrowserDownload } from "@/lib/download-blob";
import type {
  ContactContext,
  ContactMessage,
  ContactMessageListParams,
  ContactMessageStats,
  ContactMessageStatus,
} from "@/types/domain/contact.types";

type ListContactMessagesResponse = {
  success: boolean;
  messages: ContactMessage[];
  stats: ContactMessageStats;
};

type PatchContactMessageResponse = {
  success: boolean;
  message: ContactMessage;
};

export async function getContactMessagesApi(token: string, params: ContactMessageListParams = {}) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.limit) search.set("limit", String(params.limit));
  if (params.search?.trim()) search.set("search", params.search.trim());

  const q = search.toString();
  const data = await apiFetch<ListContactMessagesResponse>(`/api/v1/contact${q ? `?${q}` : ""}`, {
    token,
  });
  if (!data.success || !Array.isArray(data.messages)) {
    throw new Error("Invalid contact messages response");
  }
  return { messages: data.messages, stats: data.stats };
}

export async function patchContactMessageApi(
  token: string,
  id: string,
  status: ContactMessageStatus,
) {
  const data = await apiFetch<PatchContactMessageResponse>(`/api/v1/contact/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!data.success || !data.message) {
    throw new Error("Invalid contact message update response");
  }
  return data.message;
}

export async function getContactContextApi(token: string, id: string) {
  const data = await apiFetch<{ success: boolean } & ContactContext>(`/api/v1/contact/${id}/context`, { token });
  return data as ContactContext;
}

export async function postContactReplyApi(token: string, id: string, body: { channel: "email" | "whatsapp"; body: string }) {
  const data = await apiFetch<PatchContactMessageResponse>(`/api/v1/contact/${id}/reply`, { token, method: "POST", body: JSON.stringify(body) });
  if (!data.success || !data.message) throw new Error("Could not send the reply");
  return data.message;
}

export async function downloadContactCsvApi(token: string, status?: ContactMessageStatus) {
  const res = await authFetch(`/api/v1/contact/export.csv${status ? `?status=${status}` : ""}`, {}, token);
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  triggerBrowserDownload(await res.blob(), filenameFromContentDisposition(res.headers.get("Content-Disposition"), "messages.csv"));
}
