import { createFileRoute, Link, Outlet, useMatch, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Trash2, Eye, BedDouble, LayoutGrid, List as ListIcon, Pencil } from "lucide-react";
import { toast } from "sonner";
import { RoomsListSkeleton } from "@/components/admin/rooms-page-skeletons";
import { RoomFormDialog } from "@/components/admin/room-form-dialog";
import type { Room, RoomDraft, RoomStatus } from "@/types/domain/room.types";
import { roomStatusStyles } from "@/types/domain/room.types";
import {
  useRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useDeleteRoomsMutation,
  useBulkRoomStatusMutation,
} from "@/queries/rooms";
import { roomKeys } from "@/queries/keys/room.keys";

export const Route = createFileRoute("/admin/rooms")({ component: RoomsAdminPage });

const PAGE_SIZE = 12;

const statusVariants = roomStatusStyles;

function RoomsAdminPage() {
  const detailMatch = useMatch({ from: "/admin/rooms/$id", shouldThrow: false });
  if (detailMatch) {
    return <Outlet />;
  }
  return <RoomsListPage />;
}

function RoomsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Room | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDelete, setBulkDelete] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(statusFilter !== "all" ? { status: statusFilter as RoomStatus } : {}),
      ...(query.trim() ? { search: query.trim() } : {}),
    }),
    [page, statusFilter, query],
  );

  const { data, isLoading, isError, error } = useRoomsQuery(listParams);
  const rooms = data?.rooms ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  const createRoom = useCreateRoomMutation();
  const updateRoom = useUpdateRoomMutation();
  const deleteRoom = useDeleteRoomMutation();
  const deleteRooms = useDeleteRoomsMutation();
  const bulkStatus = useBulkRoomStatusMutation();

  const saving = createRoom.isPending || updateRoom.isPending;

  function handleSave(values: RoomDraft) {
    if (editing?.id) {
      updateRoom.mutate(
        { id: editing.id, draft: values },
        {
          onSuccess: () => {
            toast.success("Room updated");
            setEditing(null);
            setCreating(false);
          },
          onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
        },
      );
    } else {
      createRoom.mutate(values, {
        onSuccess: async () => {
          setEditing(null);
          setCreating(false);
          setQuery("");
          setStatusFilter("all");
          setPage(1);
          setSelected(new Set());
          await queryClient.invalidateQueries({ queryKey: roomKeys.all });
          navigate({ to: "/admin/rooms", replace: true });
          toast.success("Room created");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Create failed"),
      });
    }
  }

  function handleDelete(ids: string[]) {
    if (ids.length === 1) {
      deleteRoom.mutate(ids[0], {
        onSuccess: () => {
          toast.success("Room deleted");
          setDeleteId(null);
          setBulkDelete(false);
          setSelected(new Set());
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
      });
    } else {
      deleteRooms.mutate(ids, {
        onSuccess: () => {
          toast.success(`${ids.length} rooms deleted`);
          setDeleteId(null);
          setBulkDelete(false);
          setSelected(new Set());
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
      });
    }
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(rooms.map((r) => r.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="rooms-search"
              autoComplete="off"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search rooms…"
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
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
              <TabsTrigger value="grid">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="table">
                <ListIcon className="h-4 w-4" />
              </TabsTrigger>
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
            <Select
              onValueChange={(v) =>
                bulkStatus.mutate(
                  { ids: [...selected], status: v as RoomStatus },
                  {
                    onSuccess: () => {
                      toast.success("Status updated");
                      setSelected(new Set());
                    },
                    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
                  },
                )
              }
            >
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="Set status…" />
              </SelectTrigger>
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
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <RoomsListSkeleton view={view} />
      ) : isError ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load rooms"}
          </CardContent>
        </Card>
      ) : rooms.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-20 text-center">
            <BedDouble className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-3 font-bold">No rooms found</p>
            <p className="text-xs text-muted-foreground">Try clearing filters or add your first room.</p>
            <Button onClick={() => setCreating(true)} className="mt-4 rounded-full">
              <Plus className="h-4 w-4" /> Add room
            </Button>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map((r) => (
            <Card key={r.id} className="overflow-hidden border-border/60 transition-shadow hover:shadow-lg">
              <div className="relative aspect-[4/3] bg-muted">
                {r.images?.[0] ? (
                  <img src={r.images[0]} alt={r.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BedDouble className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute left-2 top-2">
                  <Checkbox
                    checked={selected.has(r.id)}
                    onCheckedChange={(c) => toggleOne(r.id, !!c)}
                    className="bg-background/80"
                  />
                </div>
                <Badge variant="outline" className={`absolute right-2 top-2 capitalize ${statusVariants[r.status]}`}>
                  {r.status}
                </Badge>
              </div>
              <CardContent className="p-4">
                <p className="truncate font-bold tracking-tight" title={r.title}>
                  {r.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.category} · {r.capacity} guests · Order {r.display_order ?? 100}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-extrabold">
                    ${Number(r.price_per_night_usd ?? r.price_per_night).toLocaleString()}{" "}
                    <span className="text-xs font-normal text-muted-foreground">USD</span>
                  </p>
                  <p className="text-sm font-bold text-muted-foreground">
                    Rs {Number(r.price_per_night_pkr ?? r.price_per_night).toLocaleString()}{" "}
                    <span className="text-xs font-normal">PKR</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.beds_available}/{r.beds_total} beds
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link to="/admin/rooms/$id" params={{ id: r.id }}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
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
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selected.size > 0 && selected.size === rooms.length}
                      onCheckedChange={(c) => toggleAll(!!c)}
                    />
                  </TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>USD / PKR</TableHead>
                  <TableHead>Beds</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Checkbox checked={selected.has(r.id)} onCheckedChange={(c) => toggleOne(r.id, !!c)} />
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {r.display_order ?? 100}
                    </TableCell>
                    <TableCell className="max-w-[220px] font-semibold">
                      <span className="block truncate" title={r.title}>
                        {r.title}
                      </span>
                    </TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell className="text-xs">
                      <div>${Number(r.price_per_night_usd ?? r.price_per_night).toLocaleString()}</div>
                      <div className="text-muted-foreground">
                        Rs {Number(r.price_per_night_pkr ?? r.price_per_night).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.beds_available}/{r.beds_total}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${statusVariants[r.status]}`}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="icon" variant="ghost">
                        <Link to="/admin/rooms/$id" params={{ id: r.id }}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditing(r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
            {pagination ? ` · ${pagination.total} rooms` : ""}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <RoomFormDialog
        open={creating || !!editing}
        initial={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
        submitting={saving}
      />

      <AlertDialog
        open={!!deleteId || bulkDelete}
        onOpenChange={(o) => {
          if (!o) {
            setDeleteId(null);
            setBulkDelete(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{bulkDelete ? `Delete ${selected.size} rooms?` : "Delete this room?"}</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(bulkDelete ? [...selected] : deleteId ? [deleteId] : [])}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
