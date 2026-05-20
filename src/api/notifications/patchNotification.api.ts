import { apiFetch } from "@/api/apiFetch";
import type { Notification } from "@/types/domain/notification.types";

export async function markNotificationReadApi(token: string, id: string) {
  const data = await apiFetch<{
    success: boolean;
    notification: Notification;
    unread_count: number;
  }>(`/api/v1/notifications/${id}/read`, { token, method: "PATCH" });
  return data;
}

export async function markAllNotificationsReadApi(token: string) {
  const data = await apiFetch<{ success: boolean; unread_count: number }>(
    "/api/v1/notifications/read-all",
    { token, method: "PATCH" },
  );
  return data;
}

export async function deleteNotificationApi(token: string, id: string) {
  const data = await apiFetch<{ success: boolean; unread_count: number }>(
    `/api/v1/notifications/${id}`,
    { token, method: "DELETE" },
  );
  return data;
}
