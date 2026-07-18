import { useLayoutEffect, useState, type RefObject } from "react";
import { Link } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/admin/notification-card";
import { useMarkNotificationReadMutation } from "@/queries/notifications";
import { useLiveAlertsStore } from "@/stores/notifications/live-alerts.store";
import { cn } from "@/lib/utils";

const PANEL_WIDTH = 288;
const GAP_LEFT_OF_BELL = 10;

type LiveNotificationAlertsProps = {
  anchorRef: RefObject<HTMLElement | null>;
};

export function LiveNotificationAlerts({ anchorRef }: LiveNotificationAlertsProps) {
  const alerts = useLiveAlertsStore((s) => s.alerts);
  const bulkMode = useLiveAlertsStore((s) => s.bulkMode);
  const missedMode = useLiveAlertsStore((s) => s.missedMode);
  const dismiss = useLiveAlertsStore((s) => s.dismiss);
  const clear = useLiveAlertsStore((s) => s.clear);
  const markRead = useMarkNotificationReadMutation();
  const [anchorLeft, setAnchorLeft] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = anchorRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setAnchorLeft(rect.left);
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      observer.disconnect();
    };
  }, [anchorRef, alerts.length]);

  if (alerts.length === 0 || anchorLeft == null) return null;

  const panelRight = typeof window !== "undefined" ? window.innerWidth - anchorLeft + GAP_LEFT_OF_BELL : 0;
  const bookingCount = alerts.filter((a) => a.type === "booking").length;
  const headerLabel = missedMode
    ? bulkMode || bookingCount >= 3
      ? `${bookingCount} bookings while away`
      : bookingCount === 1
        ? "Booking while you were away"
        : `${bookingCount} bookings while away`
    : bulkMode
      ? `${alerts.length} new · bulk`
      : `${alerts.length} new`;

  return createPortal(
    <div
      className="pointer-events-none fixed top-0 z-[200] flex flex-col items-end gap-2 pt-2"
      style={{ right: panelRight, width: PANEL_WIDTH }}
      aria-live="polite"
      aria-label="Live notifications"
    >
      <div
        className={cn(
          "pointer-events-auto flex h-7 w-full items-center justify-between gap-2 rounded-lg border px-2 shadow-sm backdrop-blur-sm",
          bulkMode || missedMode
            ? "border-amber-500/40 bg-amber-500/10"
            : "border-border/60 bg-card/95",
        )}
      >
        <span
          className={cn(
            "flex items-center gap-1 text-[10px] font-semibold",
            bulkMode || missedMode ? "text-amber-800 dark:text-amber-200" : "text-foreground",
          )}
        >
          {bulkMode ? (
            <BellRing className={cn("h-3 w-3", missedMode ? "text-amber-700" : "text-amber-600")} />
          ) : (
            <Bell className="h-3 w-3 text-primary" />
          )}
          {headerLabel}
        </span>
        <div className="flex gap-0.5">
          <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-primary" asChild>
            <Link to="/admin/bookings">Bookings</Link>
          </Button>
          <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-primary" asChild>
            <Link to="/admin/notifications">All</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-[10px] text-muted-foreground"
            onClick={clear}
          >
            Clear
          </Button>
        </div>
      </div>

      {alerts.map((alert) => (
        <div
          key={alert.alertId}
          className={cn(
            "pointer-events-auto h-[5.75rem] w-full animate-in slide-in-from-top fade-in duration-300",
            bulkMode && "ring-1 ring-amber-500/30 rounded-xl",
          )}
        >
          <NotificationCard
            notification={alert}
            variant="alert"
            onDismiss={() => dismiss(alert.alertId)}
            onMarkRead={() => markRead.mutate(alert.id)}
          />
        </div>
      ))}
    </div>,
    document.body,
  );
}
