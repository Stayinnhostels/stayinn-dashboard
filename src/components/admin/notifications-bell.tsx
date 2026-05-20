import { Link } from "@tanstack/react-router";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationCard } from "@/components/admin/notification-card";
import {
  useNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/queries/notifications";

export function NotificationsBell() {
  const { data, isLoading } = useNotificationsQuery({ limit: 8 });
  const markAll = useMarkAllNotificationsReadMutation();
  const markRead = useMarkNotificationReadMutation();

  const items = data?.notifications ?? [];
  const unread = data?.unread_count ?? items.filter((i) => !i.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[image:var(--gradient-hero)] px-1 text-[10px] font-bold text-primary-foreground shadow-sm">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-xs font-bold">Notifications</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[10px]"
            onClick={() => markAll.mutate()}
            disabled={unread === 0 || markAll.isPending}
          >
            Mark all read
          </Button>
        </div>
        <div className="max-h-80 space-y-2 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No notifications yet</p>
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
        <Link
          to="/admin/notifications"
          className="block border-t py-2 text-center text-[10px] font-semibold text-primary hover:underline"
        >
          View all
        </Link>
      </PopoverContent>
    </Popover>
  );
}
