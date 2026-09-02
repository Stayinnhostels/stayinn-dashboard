import { createFileRoute, Link, Outlet, useMatch, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import {
  Plus,
  Search,
  Trash2,
  Eye,
  BedDouble,
  LayoutGrid,
  List as ListIcon,
  Pencil,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { RoomsListSkeleton } from "@/components/admin/rooms-page-skeletons";
import { RoomFormDialog } from "@/components/admin/room-form-dialog";
import { HostelPropertyBadge } from "@/components/admin/hostel-property-badge";
import { RoomThumbnail } from "@/components/admin/room-thumbnail";
import { formatRoomLabel } from "@/types/domain/room.types";
import type { Room, RoomDraft, RoomStatus } from "@/types/domain/room.types";
import { roomStatusStyles } from "@/types/domain/room.types";
import {
  useRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useDeleteRoomsMutation,
  useBulkRoomStatusMutation,
  useReorderRoomsMutation,
} from "@/queries/rooms";
import { roomKeys } from "@/queries/keys/room.keys";
import { useHostelScope } from "@/lib/use-hostel-scope";

export const Route = createFileRoute("/admin/rooms")({ component: RoomsAdminPage });

const ROOMS_FETCH_LIMIT = 500;

const statusVariants = roomStatusStyles;

function DragHandle() {
  return (
    <span className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing">
      <GripVertical className="h-4 w-4" />
    </span>
  );
}

function SortableRoomCard({
  room,
  selected,
  onToggle,
  onEdit,
  onDelete,
}: {
  room: Room;
  selected: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: room.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : undefined,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden border-border/60 transition-shadow hover:shadow-lg ${isDragging ? "shadow-xl ring-2 ring-primary/40" : ""}`}
    >
      <div className="relative aspect-[4/3] bg-muted">
        <RoomThumbnail images={room.images} className="absolute inset-0 h-full w-full" />
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="rounded bg-background/80 p-1 hover:bg-background"
          >
            <DragHandle />
          </button>
          <Checkbox
            checked={selected}
            onCheckedChange={(c) => onToggle(room.id, !!c)}
            className="bg-background/80"
          />
        </div>
        <Badge variant="outline" className={`absolute right-2 top-2 capitalize ${statusVariants[room.status]}`}>
          {room.status}
        </Badge>
      </div>
      <CardContent className="space-y-2 p-4">
        <HostelPropertyBadge
          hostelId={room.hostel_id}
          hostelName={room.hostel_name}
          showAllProperties={false}
          className="max-w-full"
        />
        <p className="truncate font-bold tracking-tight" title={formatRoomLabel(room)}>
          {formatRoomLabel(room)}
        </p>
        <p className="text-xs text-muted-foreground">
          {room.room_number != null ? `No. ${room.room_number} · ` : ""}
          {room.category} · {room.capacity} guests · Order {room.display_order ?? 100}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-extrabold">
            ${Number(room.price_per_night_usd ?? room.price_per_night).toLocaleString()}{" "}
            <span className="text-xs font-normal text-muted-foreground">USD</span>
          </p>
          <p className="text-sm font-bold text-muted-foreground">
            Rs {Number(room.price_per_night_pkr ?? room.price_per_night).toLocaleString()}{" "}
            <span className="text-xs font-normal">PKR</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {room.beds_available}/{room.beds_total} beds
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to="/admin/rooms/$id" params={{ id: room.id }}>
              <Eye className="h-3.5 w-3.5" /> View
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(room)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(room.id)}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SortableRoomRow({
  room,
  selected,
  onToggle,
  onEdit,
  onDelete,
}: {
  room: Room;
  selected: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: room.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : undefined,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-muted/50" : ""}>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="rounded p-0.5 hover:bg-muted"
          >
            <DragHandle />
          </button>
          <Checkbox checked={selected} onCheckedChange={(c) => onToggle(room.id, !!c)} />
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm text-muted-foreground">
        {room.display_order ?? 100}
      </TableCell>
      <TableCell className="font-mono text-sm font-semibold">
        {room.room_number ?? "—"}
      </TableCell>
      <TableCell className="max-w-[220px] font-semibold">
        <span className="block truncate" title={formatRoomLabel(room)}>
          {room.title}
        </span>
      </TableCell>
      <TableCell>
        <HostelPropertyBadge hostelId={room.hostel_id} hostelName={room.hostel_name} showAllProperties={false} />
      </TableCell>
      <TableCell>{room.category}</TableCell>
      <TableCell className="text-xs">
        <div>${Number(room.price_per_night_usd ?? room.price_per_night).toLocaleString()}</div>
        <div className="text-muted-foreground">
          Rs {Number(room.price_per_night_pkr ?? room.price_per_night).toLocaleString()}
        </div>
      </TableCell>
      <TableCell>
        {room.beds_available}/{room.beds_total}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={`capitalize ${statusVariants[room.status]}`}>
          {room.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button asChild size="icon" variant="ghost">
          <Link to="/admin/rooms/$id" params={{ id: room.id }}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onEdit(room)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDelete(room.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

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
  const { hostelId } = useHostelScope();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [editing, setEditing] = useState<Room | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDelete, setBulkDelete] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [localRooms, setLocalRooms] = useState<Room[] | null>(null);

  useEffect(() => {
    setLocalRooms(null);
    setSelected(new Set());
  }, [statusFilter, query]);

  const listParams = useMemo(
    () => ({
      page: 1,
      limit: ROOMS_FETCH_LIMIT,
      ...(statusFilter !== "all" ? { status: statusFilter as RoomStatus } : {}),
      ...(query.trim() ? { search: query.trim() } : {}),
    }),
    [statusFilter, query],
  );

  const { data, isLoading, isError, error } = useRoomsQuery(listParams);
  const serverRooms = data?.rooms ?? [];
  const rooms = localRooms ?? serverRooms;

  const prevServerRoomsRef = useRef(serverRooms);
  if (localRooms && prevServerRoomsRef.current !== serverRooms) {
    setLocalRooms(null);
  }
  prevServerRoomsRef.current = serverRooms;

  const createRoom = useCreateRoomMutation(hostelId);
  const updateRoom = useUpdateRoomMutation();
  const deleteRoom = useDeleteRoomMutation();
  const deleteRooms = useDeleteRoomsMutation();
  const bulkStatus = useBulkRoomStatusMutation();
  const reorderRooms = useReorderRoomsMutation();

  const saving = createRoom.isPending || updateRoom.isPending;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setLocalRooms((prev) => {
        const list = prev ?? serverRooms;
        const oldIndex = list.findIndex((r) => r.id === active.id);
        const newIndex = list.findIndex((r) => r.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return list;
        const reordered = arrayMove(list, oldIndex, newIndex);

        const orderedIds = reordered.map((r) => r.id);
        reorderRooms.mutate(orderedIds, {
          onError: () => {
            toast.error("Failed to save order. Refreshing…");
            setLocalRooms(null);
            void queryClient.invalidateQueries({ queryKey: roomKeys.all });
          },
        });

        return reordered;
      });
    },
    [serverRooms, reorderRooms, queryClient],
  );

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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rooms…"
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            <Button onClick={() => setCreating(true)} className="mt-4 rounded-full">
              <Plus className="h-4 w-4" /> Add room
            </Button>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rooms.map((r) => r.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rooms.map((r) => (
                <SortableRoomCard
                  key={r.id}
                  room={r}
                  selected={selected.has(r.id)}
                  onToggle={toggleOne}
                  onEdit={setEditing}
                  onDelete={setDeleteId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={rooms.map((r) => r.id)} strategy={rectSortingStrategy}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14" />
                      <TableHead>Order</TableHead>
                      <TableHead>No.</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>USD / PKR</TableHead>
                      <TableHead>Beds</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((r) => (
                      <SortableRoomRow
                        key={r.id}
                        room={r}
                        selected={selected.has(r.id)}
                        onToggle={toggleOne}
                        onEdit={setEditing}
                        onDelete={setDeleteId}
                      />
                    ))}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}

      <RoomFormDialog
        open={creating || !!editing}
        initial={editing}
        suggestedRoomNumber={
          Math.max(
            100,
            ...rooms.map((r) => (r.room_number != null ? r.room_number : 100)),
          ) + 1
        }
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
