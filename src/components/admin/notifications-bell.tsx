import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { NotificationCard } from "@/components/admin/notification-card";
import {
  useNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/queries/notifications";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function NotificationsBell({ className }: Props) {
  const { data, isLoading } = useNotificationsQuery({ limit: 8 });
  const markAll = useMarkAllNotificationsReadMutation();
  const markRead = useMarkNotificationReadMutation();

  const items = data?.notifications ?? [];
  const unread = data?.unread_count ?? items.filter((i) => !i.read).length;

  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (unread === 0) return;
    let shakeTimeout: number | undefined;
    const interval = window.setInterval(() => {
      setShaking(true);
      shakeTimeout = window.setTimeout(() => setShaking(false), 1500);
    }, 10_000);
    return () => {
      window.clearInterval(interval);
      if (shakeTimeout) window.clearTimeout(shakeTimeout);
      setShaking(false);
    };
  }, [unread]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "relative h-10 w-10 rounded-full border-border bg-background text-muted-foreground shadow-none",
            "hover:bg-muted/50 hover:text-foreground",
            className,
          )}
          aria-label="Notifications"
        >
          <Bell className={cn("h-[18px] w-[18px] stroke-[1.5]", shaking && "animate-bell-shake")} />
          {unread > 0 ? (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 overflow-hidden rounded-xl border-border/60 p-0 shadow-lg"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold tracking-tight">Notifications</p>
            <p className="text-[11px] text-muted-foreground">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-md px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            onClick={() => markAll.mutate()}
            disabled={unread === 0 || markAll.isPending}
          >
            Mark all read
          </Button>
        </div>
        <Separator />
        <div className="max-h-80 space-y-1.5 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center py-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-xs text-muted-foreground">No notifications yet</p>
          ) : (
            items.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                variant="tile"
                onMarkRead={() => markRead.mutate(n.id)}
              />
            ))
          )}
        </div>
        <Separator />
        <Link
          to="/admin/notifications"
          className="block py-2.5 text-center text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          View all
        </Link>
      </PopoverContent>
    </Popover>
  );
}
