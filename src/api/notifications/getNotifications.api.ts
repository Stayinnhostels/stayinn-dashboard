import { apiFetch } from "@/api/apiFetch";
import type { Notification, NotificationListParams } from "@/types/domain/notification.types";

type ListNotificationsResponse = {
  success: boolean;
  notifications: Notification[];
  unread_count: number;
};

export async function getNotificationsApi(token: string, params: NotificationListParams = {}) {
  const search = new URLSearchParams();
  if (params.limit) search.set("limit", String(params.limit));
  if (params.unread_only) search.set("unread_only", "true");

  const q = search.toString();
  const data = await apiFetch<ListNotificationsResponse>(
    `/api/v1/notifications${q ? `?${q}` : ""}`,
    { token },
  );
  if (!data.success || !Array.isArray(data.notifications)) {
    throw new Error("Invalid notifications response");
  }
  return { notifications: data.notifications, unread_count: data.unread_count };
}
