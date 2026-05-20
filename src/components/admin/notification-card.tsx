import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getNotificationDisplay } from "@/lib/notification-display";
import type { Notification } from "@/types/domain/notification.types";

const TILE_HEIGHT = "h-[5.75rem]";

type NotificationCardProps = {
  notification: Notification;
  variant?: "tile" | "alert";
  onDismiss?: () => void;
  onMarkRead?: () => void;
  className?: string;
};

export function NotificationCard({
  notification,
  variant = "tile",
  onDismiss,
  onMarkRead,
  className,
}: NotificationCardProps) {
  const isAlert = variant === "alert";
  const d = getNotificationDisplay(notification, { minimal: true });
  const Icon = d.icon;
  const t = d.theme;
  const timeAgo = notification.created_at
    ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
    : "";

  const handleActivate = () => {
    onDismiss?.();
    onMarkRead?.();
  };

  const inner = (
    <div
      className={cn(
        TILE_HEIGHT,
        "relative flex w-full flex-col justify-between overflow-hidden rounded-xl border p-2.5 transition-all hover:shadow-md",
        t.shell,
        notification.read && "opacity-75",
        !notification.read && "ring-1 ring-primary/10",
        className,
      )}
    >
      {!notification.read && (
        <span className={cn("absolute inset-y-2 left-0 w-1 rounded-full", t.unreadBar)} aria-hidden />
      )}

      <div className="flex items-center gap-2 min-h-0">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs",
            t.iconBox,
          )}
        >
          {isAlert ? <Icon className="h-3.5 w-3.5" /> : d.guestInitial}
        </div>
        <p className={cn("min-w-0 flex-1 truncate text-xs font-bold leading-none", t.headline)}>
          {d.headline}
        </p>
        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 rounded-full text-muted-foreground hover:bg-muted"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDismiss();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <p className={cn("truncate text-sm font-semibold leading-tight", t.name)}>{d.guestName}</p>

      <div className="flex items-end justify-between gap-2 min-h-0">
        <p className={cn("min-w-0 flex-1 truncate text-[10px] leading-snug", t.summary)}>
          {d.summaryLine}
        </p>
        {timeAgo && (
          <span className={cn("shrink-0 text-[9px] whitespace-nowrap", t.time)}>{timeAgo}</span>
        )}
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link
        to={notification.link}
        className={cn("block h-[5.75rem] w-full")}
        onClick={handleActivate}
      >
        {inner}
      </Link>
    );
  }

  if (onDismiss) {
    return (
      <button
        type="button"
        className="block h-[5.75rem] w-full cursor-pointer text-left"
        onClick={handleActivate}
      >
        {inner}
      </button>
    );
  }

  return inner;
}
