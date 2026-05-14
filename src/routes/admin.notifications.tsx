import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { notifications as store } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["mock", "notifications"],
    queryFn: async () => [...store].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => { const n = store.find((x) => x.id === id); if (n) n.read = true; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mock"] }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const i = store.findIndex((x) => x.id === id); if (i >= 0) store.splice(i, 1); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mock"] }); toast.success("Deleted"); },
  });
  const markAll = useMutation({
    mutationFn: async () => { store.forEach((n) => { n.read = true; }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mock"] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.filter((i) => !i.read).length} unread</p>
        <Button variant="outline" size="sm" onClick={() => markAll.mutate()}>Mark all read</Button>
      </div>

      {items.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-20 text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 font-bold">No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-0">
            {items.map((n) => (
              <div key={n.id} className={`flex items-start justify-between gap-3 border-b p-4 last:border-b-0 ${!n.read ? "bg-primary/5" : ""}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize text-[10px]">{n.type}</Badge>
                    <p className="font-semibold">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!n.read && <Button size="icon" variant="ghost" onClick={() => markRead.mutate(n.id)}><Check className="h-4 w-4" /></Button>}
                  <Button size="icon" variant="ghost" onClick={() => remove.mutate(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
