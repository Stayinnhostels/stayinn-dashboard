import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { notifications as store } from "@/lib/mock-store";

export function NotificationsBell() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["mock", "notifications-bell"],
    enabled: !!user,
    queryFn: async () => [...store].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8),
  });

  const unread = items.filter((i) => !i.read).length;

  function markAllRead() {
    store.forEach((n) => { n.read = true; });
    qc.invalidateQueries({ queryKey: ["mock"] });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <p className="text-sm font-bold">Notifications</p>
          <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unread === 0}>Mark all read</Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">No notifications yet</p>
          ) : items.map((n) => (
            <div key={n.id} className={`border-b p-3 text-sm last:border-b-0 ${!n.read ? "bg-primary/5" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{n.title}</p>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </span>
              </div>
              {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
            </div>
          ))}
        </div>
        <Link to="/admin/notifications" className="block border-t p-2 text-center text-xs font-semibold text-primary hover:bg-muted">
          View all
        </Link>
      </PopoverContent>
    </Popover>
  );
}
