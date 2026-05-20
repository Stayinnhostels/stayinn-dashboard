import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { appEnv } from "@/config/env";
import { notificationKeys } from "@/queries/keys/notification.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useLiveAlertsStore } from "@/stores/notifications/live-alerts.store";
import type { Notification } from "@/types/domain/notification.types";

type NotificationSocketProviderProps = {
  children: ReactNode;
};

export function NotificationSocketProvider({ children }: NotificationSocketProviderProps) {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const pushAlert = useLiveAlertsStore((s) => s.push);

  useEffect(() => {
    if (!token) return;

    let socket: Socket | null = null;

    socket = io(appEnv.apiBaseUrl, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socket.on("connect", () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    });

    socket.on("notification", (notification: Notification) => {
      const normalized: Notification = {
        ...notification,
        meta: notification.meta ?? {},
        read: false,
      };
      pushAlert(normalized);
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    });

    socket.on("unread_count", (payload: { count: number }) => {
      if (typeof payload?.count === "number") {
        queryClient.setQueriesData(
          { queryKey: notificationKeys.all, exact: false },
          (old: { notifications?: Notification[]; unread_count?: number } | undefined) => {
            if (!old || typeof old !== "object") return old;
            return { ...old, unread_count: payload.count };
          },
        );
      }
    });

    socket.on("connect_error", (err) => {
      console.warn("[notifications] WebSocket:", err.message);
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [token, queryClient, pushAlert]);

  return children;
}
