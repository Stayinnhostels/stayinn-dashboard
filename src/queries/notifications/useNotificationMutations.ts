import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteNotificationApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from "@/api/notifications";
import { notificationKeys } from "@/queries/keys/notification.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

export function useMarkNotificationReadMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("You must be signed in");
      return markNotificationReadApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error("You must be signed in");
      return markAllNotificationsReadApi(token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotificationMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("You must be signed in");
      return deleteNotificationApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
