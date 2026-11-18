import { useLayoutEffect, useState, type RefObject } from "react";
import { Link } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { Bell, BellRing, X } from "lucide-react";
import { useMarkNotificationReadMutation } from "@/queries/notifications";
import { AUTO_DISMISS_MS, MISSED_DISMISS_MS, useLiveAlertsStore, type LiveAlert } from "@/stores/notifications/live-alerts.store";
import { getNotificationKind, notificationAgo, notificationDetail } from "@/lib/notification-kind";
import { cn } from "@/lib/utils";

const PANEL_WIDTH = 380;
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

  const amber = bulkMode || missedMode;
  const headerLink = "rounded-[8px] px-2 py-1 text-label font-medium outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border";

  return createPortal(
    <div
      className="pointer-events-none fixed top-0 z-[200] flex max-w-[calc(100vw-24px)] flex-col items-end gap-2 pt-3 font-geist"
      style={{ right: Math.max(12, panelRight), width: PANEL_WIDTH }}
      aria-live="polite"
      aria-label="Live notifications"
    >
      <div className="glass-3 pointer-events-auto flex h-10 w-full items-center gap-2 rounded-[14px] pr-1.5 pl-3 text-ink">
        <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-[8px] [&_svg]:size-3.5", amber ? "bg-warning-tint text-warning" : "bg-brand-tint text-brand-text")}>
          {bulkMode ? <BellRing aria-hidden /> : <Bell aria-hidden />}
        </span>
        <span className="min-w-0 flex-1 truncate text-label font-semibold text-ink">{headerLabel}</span>
        <Link to="/admin/bookings" className={cn(headerLink, "text-brand-text")}>Bookings</Link>
        <Link to="/admin/notifications" className={cn(headerLink, "text-brand-text")}>All</Link>
        <button type="button" onClick={clear} className={cn(headerLink, "cursor-pointer text-ink-2 hover:text-ink")}>Clear</button>
      </div>

      {alerts.map((alert) => (
        <LiveToast key={alert.alertId} alert={alert} onDismiss={() => dismiss(alert.alertId)} onOpen={() => { dismiss(alert.alertId); markRead.mutate(alert.id); }} />
      ))}
    </div>,
    document.body,
  );
}

/** Figma Toast (00 · design system): solid icon tile, title, detail, × and a draining progress bar. */
function LiveToast({ alert, onDismiss, onOpen }: { alert: LiveAlert; onDismiss: () => void; onOpen: () => void }) {
  const kind = getNotificationKind(alert);
  const Icon = kind.icon;
  const detail = notificationDetail(alert);
  const missed = alert.source === "missed";
  const duration = missed ? MISSED_DISMISS_MS : AUTO_DISMISS_MS;
  const tone = kind.urgent ? "bg-danger" : missed ? "bg-warning" : "bg-brand";

  const body = (
    <div className="flex items-start gap-3 px-3.5 py-3">
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-[10px] text-on-brand [&_svg]:size-[18px]", tone)}>
        <Icon aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-body font-semibold text-ink">{alert.title}</p>
        {detail ? <p className="line-clamp-2 text-label font-medium text-ink-2">{detail}</p> : null}
      </div>
      <span className="shrink-0 pt-0.5 text-label font-medium text-brand-text">{missed ? notificationAgo(alert.created_at) : "Now"}</span>
    </div>
  );

  return (
    <div role="status" className="glass-3 group pointer-events-auto relative flex w-full flex-col overflow-hidden rounded-[16px] text-ink animate-in fade-in slide-in-from-top-2 duration-300">
      {alert.link ? (
        <Link to={alert.link} onClick={onOpen} className="block pr-8 outline-none focus-visible:ring-2 focus-visible:ring-brand-border">{body}</Link>
      ) : (
        <button type="button" onClick={onOpen} className="block cursor-pointer pr-8 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-border">{body}</button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="absolute top-2.5 right-2.5 flex size-6 cursor-pointer items-center justify-center rounded-md text-ink-2 outline-none hover:bg-glass-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border"
      >
        <X className="size-4" aria-hidden />
      </button>
      <div className="h-[3px] w-full bg-glass-inset">
        <div className={cn("h-full", kind.urgent ? "bg-danger" : missed ? "bg-warning" : "bg-brand")} style={{ animation: `walkin-toast-progress ${duration}ms linear forwards` }} />
      </div>
    </div>
  );
}
