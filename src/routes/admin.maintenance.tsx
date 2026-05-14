import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Wrench, AlertTriangle, CheckCircle2, Clock, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { maintenance as store, rooms as roomStore, getRoom, newId, nowIso, type Maintenance, type MaintenancePriority, type MaintenanceStatus } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/maintenance")({ component: MaintenancePage });

const PRIORITIES: MaintenancePriority[] = ["low", "medium", "high", "urgent"];
const STATUSES: MaintenanceStatus[] = ["open", "in_progress", "resolved", "cancelled"];

const priorityColor: Record<MaintenancePriority, string> = {
  low: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  medium: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  high: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  urgent: "bg-rose-500/15 text-rose-600 border-rose-500/30",
};
const statusColor: Record<MaintenanceStatus, string> = {
  open: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  in_progress: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  resolved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  cancelled: "bg-muted text-muted-foreground",
};

type Draft = Omit<Maintenance, "id" | "created_at">;
const blank: Draft = { room_id: null, title: "", description: "", priority: "medium", status: "open", assignee: "Unassigned" };

function MaintenancePage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | MaintenanceStatus>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Maintenance | null>(null);
  const [draft, setDraft] = useState<Draft>(blank);

  const { data: items = [] } = useQuery({
    queryKey: ["mock", "maintenance"],
    queryFn: async () => [...store].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        Object.assign(editing, draft);
      } else {
        store.unshift({ ...draft, id: newId("m"), created_at: nowIso() });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mock"] }); toast.success("Ticket saved"); setOpen(false); setEditing(null); setDraft(blank); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const i = store.findIndex((x) => x.id === id); if (i >= 0) store.splice(i, 1); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mock"] }); toast.success("Ticket deleted"); },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MaintenanceStatus }) => {
      const m = store.find((x) => x.id === id); if (m) m.status = status;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mock"] }),
  });

  function openCreate() { setEditing(null); setDraft(blank); setOpen(true); }
  function openEdit(m: Maintenance) {
    setEditing(m);
    setDraft({ room_id: m.room_id, title: m.title, description: m.description, priority: m.priority, status: m.status, assignee: m.assignee });
    setOpen(true);
  }

  const filtered = items.filter((m) => filter === "all" || m.status === filter);
  const openCount = items.filter((m) => m.status === "open").length;
  const inProgressCount = items.filter((m) => m.status === "in_progress").length;
  const resolvedCount = items.filter((m) => m.status === "resolved").length;
  const urgentCount = items.filter((m) => m.priority === "urgent" && m.status !== "resolved" && m.status !== "cancelled").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open" value={openCount} icon={Clock} accent="warning" />
        <StatCard label="In progress" value={inProgressCount} icon={Wrench} accent="info" />
        <StatCard label="Resolved" value={resolvedCount} icon={CheckCircle2} accent="success" />
        <StatCard label="Urgent" value={urgentCount} icon={AlertTriangle} accent="warning" />
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
          <Button onClick={openCreate} className="rounded-full font-semibold"><Plus className="h-4 w-4" /> New ticket</Button>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="border-border/60"><CardContent className="py-16 text-center text-sm text-muted-foreground">No tickets here.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => {
            const room = m.room_id ? getRoom(m.room_id) : null;
            return (
              <Card key={m.id} className="border-border/60">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-extrabold tracking-tight">{m.title}</p>
                    <Badge variant="outline" className={`capitalize ${priorityColor[m.priority]}`}>{m.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{m.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{room?.title ?? "Common area"}</span>
                    <span className="font-semibold">{m.assignee}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <Select value={m.status} onValueChange={(v) => setStatus.mutate({ id: m.id, status: v as MaintenanceStatus })}>
                      <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove.mutate(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit ticket" : "New maintenance ticket"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Title</Label><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Description</Label><Textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5"><Label>Room</Label>
                <Select value={draft.room_id ?? "none"} onValueChange={(v) => setDraft({ ...draft, room_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Common area</SelectItem>
                    {roomStore.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Priority</Label>
                <Select value={draft.priority} onValueChange={(v) => setDraft({ ...draft, priority: v as MaintenancePriority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Status</Label>
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as MaintenanceStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Assignee</Label><Input value={draft.assignee} onChange={(e) => setDraft({ ...draft, assignee: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!draft.title}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
