import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatCard } from "@/components/admin/stat-card";
import {
  Plus,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Pencil,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useMaintenanceQuery,
  useCreateMaintenanceMutation,
  useUpdateMaintenanceMutation,
  useUpdateMaintenanceStatusMutation,
  useDeleteMaintenanceMutation,
} from "@/queries/maintenance";
import { useRoomsQuery } from "@/queries/rooms";
import type {
  MaintenancePriority,
  MaintenanceStatus,
  MaintenanceTicket,
  MaintenanceDraft,
} from "@/types/domain/maintenance.types";

export const Route = createFileRoute("/admin/maintenance")({ component: MaintenancePage });

const PRIORITIES: MaintenancePriority[] = ["low", "medium", "high", "urgent"];
const STATUSES: MaintenanceStatus[] = ["open", "in_progress", "resolved", "cancelled"];

const priorityColor: Record<MaintenancePriority, string> = {
  low: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  medium: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  high: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  urgent: "bg-rose-500/15 text-rose-600 border-rose-500/30",
};

const blank: MaintenanceDraft = {
  room_id: null,
  title: "",
  description: "",
  priority: "medium",
  status: "open",
  assignee: "Unassigned",
};

function MaintenancePage() {
  const [filter, setFilter] = useState<"all" | MaintenanceStatus>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceTicket | null>(null);
  const [draft, setDraft] = useState<MaintenanceDraft>(blank);

  const listParams = filter === "all" ? {} : { status: filter };
  const { data, isLoading, isError } = useMaintenanceQuery(listParams);
  const { data: roomsData } = useRoomsQuery({ limit: 100 }, { enabled: open });

  const createTicket = useCreateMaintenanceMutation();
  const updateTicket = useUpdateMaintenanceMutation();
  const setStatus = useUpdateMaintenanceStatusMutation();
  const remove = useDeleteMaintenanceMutation();

  const items = data?.maintenance ?? [];
  const stats = data?.stats;
  const rooms = roomsData?.rooms ?? [];

  function openCreate() {
    setEditing(null);
    setDraft(blank);
    setOpen(true);
  }

  function openEdit(m: MaintenanceTicket) {
    setEditing(m);
    setDraft({
      room_id: m.room_id,
      title: m.title,
      description: m.description,
      priority: m.priority,
      status: m.status,
      assignee: m.assignee,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!draft.title.trim()) return;

    const payload: MaintenanceDraft = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      assignee: draft.assignee.trim() || "Unassigned",
    };

    if (editing) {
      updateTicket.mutate(
        { id: editing.id, input: payload },
        {
          onSuccess: () => {
            toast.success("Ticket updated");
            setOpen(false);
            setEditing(null);
            setDraft(blank);
          },
          onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
        },
      );
    } else {
      createTicket.mutate(payload, {
        onSuccess: () => {
          toast.success("Ticket created");
          setOpen(false);
          setDraft(blank);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Create failed"),
      });
    }
  }

  const saving = createTicket.isPending || updateTicket.isPending;

  function isSyncedRoomPlaceholder(m: MaintenanceTicket) {
    return m.source === "room_status" || m.id.startsWith("room-status-");
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Track room issues and common-area repairs. When you set a room to{" "}
        <span className="font-medium text-foreground">maintenance</span> in Room Management, an open
        ticket is created here automatically.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Open" value={stats?.open ?? 0} icon={Clock} accent="warning" />
        <StatCard label="In progress" value={stats?.in_progress ?? 0} icon={Wrench} accent="info" />
        <StatCard
          label="Rooms offline"
          value={stats?.rooms_in_maintenance ?? 0}
          icon={Wrench}
          accent="warning"
        />
        <StatCard label="Resolved" value={stats?.resolved ?? 0} icon={CheckCircle2} accent="success" />
        <StatCard label="Urgent" value={stats?.urgent ?? 0} icon={AlertTriangle} accent="warning" />
      </div>

      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="flex-1">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={openCreate} className="rounded-full font-semibold">
            <Plus className="h-4 w-4" /> New ticket
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="border-border/60">
          <CardContent className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading tickets…
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-destructive">
            Could not load maintenance tickets.
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No tickets here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((m) => (
            <Card key={m.id} className="border-border/60">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <p className="font-extrabold tracking-tight">{m.title}</p>
                    {m.title.startsWith("Room offline:") || m.source === "room_status" ? (
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        From room status
                      </Badge>
                    ) : null}
                  </div>
                  <Badge variant="outline" className={`shrink-0 capitalize ${priorityColor[m.priority]}`}>
                    {m.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{m.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{m.room_title ?? "Common area"}</span>
                  <span className="font-semibold">{m.assignee}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <Select
                    value={m.status}
                    onValueChange={(v) =>
                      setStatus.mutate(
                        { id: m.id, status: v as MaintenanceStatus },
                        {
                          onError: (err) =>
                            toast.error(err instanceof Error ? err.message : "Status update failed"),
                        },
                      )
                    }
                    disabled={setStatus.isPending || isSyncedRoomPlaceholder(m)}
                  >
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(m)}
                      disabled={isSyncedRoomPlaceholder(m)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        remove.mutate(m.id, {
                          onSuccess: () => toast.success("Ticket deleted"),
                          onError: (err) =>
                            toast.error(err instanceof Error ? err.message : "Delete failed"),
                        })
                      }
                      disabled={remove.isPending || isSyncedRoomPlaceholder(m)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit ticket" : "New maintenance ticket"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Title</Label>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Room</Label>
                <Select
                  value={draft.room_id ?? "none"}
                  onValueChange={(v) => setDraft({ ...draft, room_id: v === "none" ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Common area</SelectItem>
                    {rooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Priority</Label>
                <Select
                  value={draft.priority}
                  onValueChange={(v) => setDraft({ ...draft, priority: v as MaintenancePriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select
                  value={draft.status}
                  onValueChange={(v) => setDraft({ ...draft, status: v as MaintenanceStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Assignee</Label>
                <Input
                  value={draft.assignee}
                  onChange={(e) => setDraft({ ...draft, assignee: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!draft.title.trim() || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
