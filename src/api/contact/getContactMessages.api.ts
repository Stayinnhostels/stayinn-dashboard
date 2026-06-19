import { apiFetch } from "@/api/apiFetch";
import type {
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

  const q = search.toString();
  const data = await apiFetch<ListContactMessagesResponse>(
    `/api/v1/contact${q ? `?${q}` : ""}`,
    { token },
  );
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
