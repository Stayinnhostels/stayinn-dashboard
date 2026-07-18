import { useEffect, useRef, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { MissedBookingAlertsHost } from "@/components/admin/missed-booking-alerts-host";
import { appEnv } from "@/config/env";
import { playBookingRing, unlockNotificationAudio } from "@/lib/notification-sound";
import { notificationKeys } from "@/queries/keys/notification.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useLiveAlertsStore } from "@/stores/notifications/live-alerts.store";
import type { Notification } from "@/types/domain/notification.types";

type NotificationSocketProviderProps = {
  children: ReactNode;
};

const BURST_WINDOW_MS = 10_000;
const BURST_COUNT = 2;

export function NotificationSocketProvider({ children }: NotificationSocketProviderProps) {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const pushAlert = useLiveAlertsStore((s) => s.push);
  const setBulkMode = useLiveAlertsStore((s) => s.setBulkMode);
  const recentBookingAt = useRef<number[]>([]);

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

      if (normalized.type === "booking") {
        const now = Date.now();
        recentBookingAt.current = [
          ...recentBookingAt.current.filter((t) => now - t < BURST_WINDOW_MS),
          now,
        ];
        const bulk = recentBookingAt.current.length >= BURST_COUNT;
        if (bulk) setBulkMode(true);
        unlockNotificationAudio();
        playBookingRing(bulk ? "bulk" : "single");
      }
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
  }, [token, queryClient, pushAlert, setBulkMode]);

  return (
    <>
      <MissedBookingAlertsHost />
      {children}
    </>
  );
}
