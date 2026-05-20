import { create } from "zustand";
import type { Notification } from "@/types/domain/notification.types";

const MAX_ALERTS = 4;
const AUTO_DISMISS_MS = 12_000;

type LiveAlert = Notification & { alertId: string };

type LiveAlertsState = {
  alerts: LiveAlert[];
  push: (notification: Notification) => void;
  dismiss: (alertId: string) => void;
  clear: () => void;
};

export const useLiveAlertsStore = create<LiveAlertsState>((set, get) => ({
  alerts: [],

  push: (notification) => {
    const alertId = `${notification.id}-${Date.now()}`;
    const alert: LiveAlert = { ...notification, alertId, read: false };

    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, MAX_ALERTS),
    }));

    window.setTimeout(() => {
      if (get().alerts.some((a) => a.alertId === alertId)) {
        get().dismiss(alertId);
      }
    }, AUTO_DISMISS_MS);
  },

  dismiss: (alertId) => {
    set((state) => ({
      alerts: state.alerts.filter((a) => a.alertId !== alertId),
    }));
  },

  clear: () => set({ alerts: [] }),
}));
