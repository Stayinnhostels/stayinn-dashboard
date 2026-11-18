import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check, Loader2 } from "lucide-react";
import { GlassButton } from "@/components/glass";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationItem } from "@/components/glass";
import { useNotificationActions } from "@/components/admin/notifications/notification-row";
import { getNotificationKind, notificationAgo, notificationDetail } from "@/lib/notification-kind";
import {
  useNotificationsQuery,
  useMarkAllNotificationsReadMutation,
} from "@/queries/notifications";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/domain/notification.types";

type Props = {
  className?: string;
};

export function NotificationsBell({ className }: Props) {
  const { data, isLoading } = useNotificationsQuery({ limit: 8 });
  const markAll = useMarkAllNotificationsReadMutation();
  const actions = useNotificationActions();
  const [open, setOpen] = useState(false);

  const items = data?.notifications ?? [];
  const unread = data?.unread_count ?? items.filter((i) => !i.read).length;

  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (unread === 0) return;
    let shakeTimeout: number | undefined;
    const interval = window.setInterval(() => {
      setShaking(true);
      shakeTimeout = window.setTimeout(() => setShaking(false), 3000);
    }, 10_000);
    return () => {
      window.clearInterval(interval);
      if (shakeTimeout) window.clearTimeout(shakeTimeout);
      setShaking(false);
    };
  }, [unread]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "glass-2 relative flex size-10 shrink-0 items-center justify-center rounded-[12px] text-ink outline-none",
            "hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border data-[state=open]:bg-glass-inset",
            className,
          )}
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell aria-hidden className={cn("size-[18px]", shaking && "animate-bell-shake")} />
          {unread > 0 ? (
            <span
              aria-hidden
              className="absolute top-[7px] left-[25px] size-[9px] rounded-full border-[1.5px] border-base bg-danger-solid"
            />
          ) : null}
        </button>
      </PopoverTrigger>
      {/* Figma "Notifications panel" (181:5601): glass-3, 360 wide, 12 padding, 4 gap */}
      <PopoverContent
        align="end"
        sideOffset={10}
        className="glass-3 flex w-[360px] max-w-[calc(100vw-32px)] flex-col gap-1 overflow-hidden rounded-[20px] border-glass-stroke p-3 font-geist text-ink shadow-none"
      >
        <NotificationsPanelBody
          items={items}
          unread={unread}
          isLoading={isLoading}
          markAllDisabled={unread === 0 || markAll.isPending}
          onMarkAll={() => markAll.mutate()}
          onOpenItem={(n) => {
            setOpen(false);
            actions.open(n);
          }}
          onViewAll={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Contents of the Figma "Notifications panel" — header, up to 8 rows, footer. */
export function NotificationsPanelBody({
  items,
  unread,
  isLoading,
  markAllDisabled,
  onMarkAll,
  onOpenItem,
  onViewAll,
}: {
  items: Notification[];
  unread: number;
  isLoading?: boolean;
  markAllDisabled?: boolean;
  onMarkAll: () => void;
  onOpenItem: (n: Notification) => void;
  onViewAll?: () => void;
}) {
  return (
    <>
    <div className="flex items-center justify-between px-1 pt-1 pb-2">
      <p className="text-card-title text-ink">Notifications</p>
      {unread > 0 ? (
        <span className="rounded-full border border-danger bg-danger-tint px-2 py-0.5 text-label font-medium text-danger">
          {unread} new
        </span>
      ) : (
        <span className="text-label text-ink-3">All caught up</span>
      )}
    </div>
    <div className="flex max-h-[320px] flex-col gap-1 overflow-y-auto">
      {isLoading ? (
        <div className="flex justify-center py-10 text-ink-3">
          <Loader2 className="size-4 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-label text-ink-3">No notifications yet</p>
      ) : (
        items.map((n) => {
          const kind = getNotificationKind(n);
          const Icon = kind.icon;
          return (
            <NotificationItem
              key={n.id}
              icon={<Icon aria-hidden />}
              iconClassName={kind.urgent ? "bg-danger-tint text-danger" : undefined}
              title={n.title}
              detail={notificationDetail(n)}
              time={notificationAgo(n.created_at)}
              unread={!n.read}
              onClick={() => onOpenItem(n)}
            />
          );
        })
      )}
    </div>
    <div className="flex items-center justify-between border-t border-glass-divider px-1 pt-2">
      <GlassButton
        variant="ghost"
        size="sm"
        onClick={onMarkAll}
        disabled={markAllDisabled}
      >
        <Check /> Mark all read
      </GlassButton>
      <GlassButton variant="glass" size="sm" asChild>
        <Link to="/admin/notifications" onClick={onViewAll}>
          View all
        </Link>
      </GlassButton>
    </div>
    </>
  );
}
