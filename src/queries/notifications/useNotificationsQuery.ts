import { useQuery } from "@tanstack/react-query";
import { getNotificationsApi } from "@/api/notifications";
import { notificationKeys } from "@/queries/keys/notification.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { NotificationListParams } from "@/types/domain/notification.types";

export function useNotificationsQuery(params: NotificationListParams = {}) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getNotificationsApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 10_000,
  });
}
