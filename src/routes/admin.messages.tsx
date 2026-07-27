import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Archive, Check, Mail, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/admin/stat-card";
import { StatCardsRowSkeleton } from "@/components/admin/admin-page-skeletons";
import {
  useContactMessagesQuery,
  useUpdateContactMessageMutation,
} from "@/queries/contact";
import type { ContactMessage, ContactMessageStatus } from "@/types/domain/contact.types";

export const Route = createFileRoute("/admin/messages")({ component: ContactMessagesPage });

const statusBadge: Record<ContactMessageStatus, string> = {
  new: "bg-primary/15 text-primary border-primary/30",
  read: "bg-muted text-muted-foreground border-border",
  archived: "bg-secondary/15 text-secondary border-secondary/30",
};

function ContactMessagesPage() {
  const [filter, setFilter] = useState<"all" | ContactMessageStatus>("new");
  const listParams = filter === "all" ? { limit: 100 } : { status: filter, limit: 100 };

  const { data, isLoading, isError } = useContactMessagesQuery(listParams);
  const updateMessage = useUpdateContactMessageMutation();

  const messages = data?.messages ?? [];
  const stats = data?.stats;

  function setStatus(id: string, status: ContactMessageStatus) {
    updateMessage.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(status === "archived" ? "Archived" : "Updated"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <StatCardsRowSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="New" value={stats?.new ?? 0} icon={MessageSquare} accent="primary" />
          <StatCard label="Read" value={stats?.read ?? 0} icon={Check} accent="info" />
          <StatCard label="Archived" value={stats?.archived ?? 0} icon={Archive} accent="warning" />
          <StatCard label="Total" value={stats?.total ?? 0} icon={Mail} accent="success" />
        </div>
      )}

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="new">New ({stats?.new ?? 0})</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Loading messages…
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-destructive">
            Could not load contact messages.
          </CardContent>
        </Card>
      ) : messages.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 font-bold">No messages</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {messages.map((m) => (
            <MessageCard key={m.id} message={m} onSetStatus={setStatus} updating={updateMessage.isPending} />
          ))}
        </div>
      )}
    </div>
  );
}

function MessageCard({
  message: m,
  onSetStatus,
  updating,
}: {
  message: ContactMessage;
  onSetStatus: (id: string, status: ContactMessageStatus) => void;
  updating: boolean;
}) {
  const timeAgo = m.created_at
    ? formatDistanceToNow(new Date(m.created_at), { addSuffix: true })
    : "";

  return (
    <Card className="border-border/60">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-extrabold">{m.guest_name}</h3>
              <Badge variant="outline" className={`capitalize ${statusBadge[m.status]}`}>
                {m.status}
              </Badge>
            </div>
            {timeAgo ? <p className="mt-1 text-xs text-muted-foreground">{timeAgo}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {m.status === "new" ? (
              <Button size="sm" variant="outline" disabled={updating} onClick={() => onSetStatus(m.id, "read")}>
                <Check className="h-3.5 w-3.5 mr-1" /> Mark read
              </Button>
            ) : null}
            {m.status !== "archived" ? (
              <Button size="sm" variant="outline" disabled={updating} onClick={() => onSetStatus(m.id, "archived")}>
                <Archive className="h-3.5 w-3.5 mr-1" /> Archive
              </Button>
            ) : null}
            <Button asChild size="sm" className="rounded-full font-semibold">
              <a href={`mailto:${encodeURIComponent(m.guest_email)}?subject=${encodeURIComponent(`Re: Your message to Stay Inn`)}`}>
                <Mail className="h-3.5 w-3.5 mr-1" /> Reply
              </a>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <a href={`mailto:${m.guest_email}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
            <Mail className="h-4 w-4" /> {m.guest_email}
          </a>
          {m.guest_phone ? (
            <a href={`tel:${m.guest_phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <Phone className="h-4 w-4" /> {m.guest_phone}
            </a>
          ) : null}
        </div>

        <p className="whitespace-pre-wrap rounded-2xl border bg-muted/30 p-4 text-sm leading-relaxed">{m.message}</p>
      </CardContent>
    </Card>
  );
}
