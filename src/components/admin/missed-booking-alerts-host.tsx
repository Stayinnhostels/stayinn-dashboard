import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getNotificationsApi } from "@/api/notifications";
import { playBookingRing, unlockNotificationAudio } from "@/lib/notification-sound";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useLiveAlertsStore } from "@/stores/notifications/live-alerts.store";

const SESSION_KEY = "stayinn-missed-bookings-announced";
const BULK_THRESHOLD = 3;

/**
 * After login / admin mount: surface unread booking notifications that arrived
 * while the admin was away, with an appropriate ring.
 */
export function MissedBookingAlertsHost() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const pushMany = useLiveAlertsStore((s) => s.pushMany);
  const setBulkMode = useLiveAlertsStore((s) => s.setBulkMode);
  const ranForToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      ranForToken.current = null;
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch {
        /* ignore */
      }
      return;
    }

    if (ranForToken.current === token) return;

    let cancelled = false;

    async function announce() {
      try {
        const already =
          typeof sessionStorage !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";
        if (already) {
          ranForToken.current = token;
          return;
        }

        const data = await getNotificationsApi(token!, { unread_only: true, limit: 50 });
        if (cancelled) return;

        const bookings = data.notifications.filter((n) => n.type === "booking");
        ranForToken.current = token;

        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* ignore */
        }

        if (bookings.length === 0) return;

        const bulk = bookings.length >= BULK_THRESHOLD;
        pushMany(bookings, "missed");
        if (bulk) setBulkMode(true);

        unlockNotificationAudio();
        playBookingRing(bulk ? "bulk" : "single");

        toast.info(
          bulk
            ? `${bookings.length} new bookings while you were away`
            : bookings.length === 1
              ? "1 new booking while you were away"
              : `${bookings.length} new bookings while you were away`,
          {
            description: "Review them in Bookings or the notification list.",
            duration: 8000,
            action: {
              label: "View bookings",
              onClick: () => {
                void navigate({ to: "/admin/bookings" });
              },
            },
          },
        );
      } catch {
        /* silent — bell still shows unread */
      }
    }

    void announce();

    return () => {
      cancelled = true;
    };
  }, [token, navigate, pushMany, setBulkMode]);

  return null;
}
