import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Trash2, Eye, BedDouble, LayoutGrid, List as ListIcon, Pencil } from "lucide-react";
import { toast } from "sonner";
import { RoomFormDialog, type RoomDraft } from "@/components/admin/room-form-dialog";
import { rooms as store, newId, nowIso, type Room, type RoomStatus } from "@/lib/mock-store";

export const Route = createFileRoute("/admin/rooms")({ component: RoomsAdminPage });

const PAGE_SIZE = 12;

const statusVariants: Record<string, string> = {
  available: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  full: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  maintenance: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  draft: "bg-muted text-muted-foreground",
};

function RoomsAdminPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Room | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDelete, setBulkDelete] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: rooms = [] } = useQuery({
    queryKey: ["mock", "rooms"],
    queryFn: async () => [...store].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  });

  const upsert = useMutation({
    mutationFn: async (input: { id?: string; values: RoomDraft }) => {
      if (input.id) {
        const idx = store.findIndex((r) => r.id === input.id);
        if (idx >= 0) store[idx] = { ...store[idx], ...input.values };
      } else {
        store.unshift({ id: newId("r"), created_at: nowIso(), ...input.values });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mock"] });
      toast.success("Room saved");
      setEditing(null); setCreating(false);
    },
  });

  const remove = useMutation({
    mutationFn: async (ids: string[]) => {
      ids.forEach((id) => {
        const i = store.findIndex((r) => r.id === id);
        if (i >= 0) store.splice(i, 1);
      });
    },
    onSuccess: (_, ids) => {
      qc.invalidateQueries({ queryKey: ["mock"] });
      toast.success(`${ids.length} room${ids.length > 1 ? "s" : ""} deleted`);
      setDeleteId(null); setBulkDelete(false); setSelected(new Set());
    },
  });

  const bulkStatus = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: RoomStatus }) => {
      ids.forEach((id) => {
        const r = store.find((x) => x.id === id);
        if (r) r.status = status;
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mock"] });
      toast.success("Status updated");
      setSelected(new Set());
    },
  });

  const filtered = useMemo(() => rooms.filter(
    (r) =>
      (statusFilter === "all" || r.status === statusFilter) &&
      (r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.category.toLowerCase().includes(query.toLowerCase())),
  ), [rooms, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRooms = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleAll(checked: boolean) { setSelected(checked ? new Set(pageRooms.map((r) => r.id)) : new Set()); }
  function toggleOne(id: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(id); else next.delete(id);
    setSelected(next);
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search rooms…" className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "table")}>
            <TabsList>
              <TabsTrigger value="grid"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="table"><ListIcon className="h-4 w-4" /></TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setCreating(true)} className="rounded-full font-semibold">
            <Plus className="h-4 w-4" /> Add room
          </Button>
        </CardContent>
      </Card>

      {selected.size > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center gap-3 p-3">
            <p className="text-sm font-semibold">{selected.size} selected</p>
            <Select onValueChange={(v) => bulkStatus.mutate({ ids: [...selected], status: v as RoomStatus })}>
              <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Set status…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="destructive" size="sm" onClick={() => setBulkDelete(true)}>
              <Trash2 className="h-4 w-4" /> Delete selected
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-20 text-center">
            <BedDouble className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-3 font-bold">No rooms found</p>
            <p className="text-xs text-muted-foreground">Try clearing filters or add your first room.</p>
            <Button onClick={() => setCreating(true)} className="mt-4 rounded-full"><Plus className="h-4 w-4" /> Add room</Button>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageRooms.map((r) => (
            <Card key={r.id} className="overflow-hidden border-border/60 transition-shadow hover:shadow-lg">
              <div className="relative aspect-[4/3] bg-muted">
                {r.images?.[0] ? <img src={r.images[0]} alt={r.title} className="h-full w-full object-cover" /> :
                  <div className="flex h-full items-center justify-center"><BedDouble className="h-12 w-12 text-muted-foreground/40" /></div>}
                <div className="absolute left-2 top-2">
                  <Checkbox checked={selected.has(r.id)} onCheckedChange={(c) => toggleOne(r.id, !!c)} className="bg-background/80" />
                </div>
                <Badge variant="outline" className={`absolute right-2 top-2 capitalize ${statusVariants[r.status]}`}>{r.status}</Badge>
              </div>
              <CardContent className="p-4">
                <p className="font-bold tracking-tight">{r.title}</p>
                <p className="text-xs capitalize text-muted-foreground">{r.category} · {r.capacity} guests</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg font-extrabold">${Number(r.price_per_night).toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/night</span></p>
                  <p className="text-xs text-muted-foreground">{r.beds_available}/{r.beds_total} beds</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1"><Link to="/admin/rooms/$id" params={{ id: r.id }}><Eye className="h-3.5 w-3.5" /> View</Link></Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><Checkbox checked={selected.size > 0 && selected.size === pageRooms.length} onCheckedChange={(c) => toggleAll(!!c)} /></TableHead>
                  <TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead>
                  <TableHead>Beds</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRooms.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell><Checkbox checked={selected.has(r.id)} onCheckedChange={(c) => toggleOne(r.id, !!c)} /></TableCell>
                    <TableCell className="font-semibold">{r.title}</TableCell>
                    <TableCell className="capitalize">{r.category}</TableCell>
                    <TableCell>${Number(r.price_per_night).toLocaleString()}</TableCell>
                    <TableCell>{r.beds_available}/{r.beds_total}</TableCell>
                    <TableCell><Badge variant="outline" className={`capitalize ${statusVariants[r.status]}`}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="icon" variant="ghost"><Link to="/admin/rooms/$id" params={{ id: r.id }}><Eye className="h-4 w-4" /></Link></Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      <RoomFormDialog
        open={creating || !!editing}
        initial={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSubmit={(values) => upsert.mutate({ id: editing?.id, values })}
        submitting={upsert.isPending}
      />

      <AlertDialog open={!!deleteId || bulkDelete} onOpenChange={(o) => { if (!o) { setDeleteId(null); setBulkDelete(false); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{bulkDelete ? `Delete ${selected.size} rooms?` : "Delete this room?"}</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => remove.mutate(bulkDelete ? [...selected] : deleteId ? [deleteId] : [])}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
