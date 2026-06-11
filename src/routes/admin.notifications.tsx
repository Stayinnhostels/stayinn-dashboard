import { createFileRoute } from "@tanstack/react-router";
import { Bell, Trash2 } from "lucide-react";
import { NotificationsGridSkeleton } from "@/components/admin/admin-page-skeletons";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/admin/notification-card";
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from "@/queries/notifications";

export const Route = createFileRoute("/admin/notifications")({ component: NotificationsPage });

function NotificationTile({
  notification,
  onDelete,
  onMarkRead,
}: {
  notification: Parameters<typeof NotificationCard>[0]["notification"];
  onDelete: () => void;
  onMarkRead?: () => void;
}) {
  return (
    <div className="group relative h-[5.75rem]">
      <NotificationCard
        notification={notification}
        variant="tile"
        onMarkRead={onMarkRead}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1.5 top-1.5 h-6 w-6 rounded-full text-primary-foreground/0 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary-foreground hover:bg-white/20"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

function NotificationsPage() {
  const { data, isLoading, isError } = useNotificationsQuery({ limit: 100 });
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();
  const remove = useDeleteNotificationMutation();

  const items = data?.notifications ?? [];
  const unread = data?.unread_count ?? 0;
  const unreadItems = items.filter((n) => !n.read);
  const readItems = items.filter((n) => n.read);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card px-4 py-3 shadow-[var(--shadow-soft)]">
        <p className="text-sm font-bold text-primary">Live alerts</p>
      
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{unread}</span> unread ·{" "}
          <span className="font-bold text-foreground">{items.length}</span> total
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            markAll.mutate(undefined, {
              onSuccess: () => toast.success("All marked as read"),
            })
          }
          disabled={unread === 0 || markAll.isPending}
        >
          Mark all read
        </Button>
      </div>

      {isLoading ? (
        <NotificationsGridSkeleton />
      ) : isError ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-destructive">
            Could not load notifications.
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center">
            <Bell className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 font-bold">No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {unreadItems.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Unread
              </h2>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {unreadItems.map((n) => (
                  <NotificationTile
                    key={n.id}
                    notification={n}
                    onMarkRead={() => markRead.mutate(n.id)}
                    onDelete={() =>
                      remove.mutate(n.id, { onSuccess: () => toast.success("Deleted") })
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {readItems.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Earlier
              </h2>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {readItems.map((n) => (
                  <NotificationTile
                    key={n.id}
                    notification={n}
                    onDelete={() =>
                      remove.mutate(n.id, { onSuccess: () => toast.success("Deleted") })
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
