import { create } from "zustand";
import type { Notification } from "@/types/domain/notification.types";

const MAX_ALERTS = 8;
const AUTO_DISMISS_MS = 12_000;
const MISSED_DISMISS_MS = 45_000;

export type LiveAlertSource = "live" | "missed";

export type LiveAlert = Notification & {
  alertId: string;
  source: LiveAlertSource;
};

type LiveAlertsState = {
  alerts: LiveAlert[];
  /** True when the current stack is a burst / many missed bookings. */
  bulkMode: boolean;
  /** True when alerts were loaded because admin was away. */
  missedMode: boolean;
  push: (notification: Notification, source?: LiveAlertSource) => void;
  pushMany: (notifications: Notification[], source?: LiveAlertSource) => void;
  setBulkMode: (bulk: boolean) => void;
  dismiss: (alertId: string) => void;
  clear: () => void;
};

function toAlert(notification: Notification, source: LiveAlertSource): LiveAlert {
  return {
    ...notification,
    alertId: `${notification.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    read: false,
    source,
  };
}

export const useLiveAlertsStore = create<LiveAlertsState>((set, get) => ({
  alerts: [],
  bulkMode: false,
  missedMode: false,

  push: (notification, source = "live") => {
    const alert = toAlert(notification, source);
    set((state) => ({
      alerts: [alert, ...state.alerts.filter((a) => a.id !== notification.id)].slice(0, MAX_ALERTS),
      missedMode: source === "missed" ? true : state.missedMode,
    }));

    const dismissAfter = source === "missed" ? MISSED_DISMISS_MS : AUTO_DISMISS_MS;
    window.setTimeout(() => {
      if (get().alerts.some((a) => a.alertId === alert.alertId)) {
        get().dismiss(alert.alertId);
      }
    }, dismissAfter);
  },

  pushMany: (notifications, source = "missed") => {
    if (notifications.length === 0) return;
    const unique = new Map<string, Notification>();
    for (const n of notifications) unique.set(n.id, n);
    const list = [...unique.values()];
    const alerts = list.map((n) => toAlert(n, source));

    set((state) => {
      const existingIds = new Set(state.alerts.map((a) => a.id));
      const fresh = alerts.filter((a) => !existingIds.has(a.id));
      return {
        alerts: [...fresh, ...state.alerts].slice(0, MAX_ALERTS),
        bulkMode: list.length >= 3 || state.bulkMode,
        missedMode: source === "missed" || state.missedMode,
      };
    });

    const dismissAfter = source === "missed" ? MISSED_DISMISS_MS : AUTO_DISMISS_MS;
    for (const alert of alerts) {
      window.setTimeout(() => {
        if (get().alerts.some((a) => a.alertId === alert.alertId)) {
          get().dismiss(alert.alertId);
        }
      }, dismissAfter);
    }
  },

  setBulkMode: (bulk) => set({ bulkMode: bulk }),

  dismiss: (alertId) => {
    set((state) => {
      const alerts = state.alerts.filter((a) => a.alertId !== alertId);
      return {
        alerts,
        bulkMode: alerts.length >= 3 ? state.bulkMode : false,
        missedMode: alerts.some((a) => a.source === "missed") ? state.missedMode : false,
      };
    });
  },

  clear: () => set({ alerts: [], bulkMode: false, missedMode: false }),
}));
