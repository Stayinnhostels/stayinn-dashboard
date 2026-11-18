import { createFileRoute, Outlet, useMatch, useNavigate } from "@tanstack/react-router";
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
import { BedDouble, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, GlassPanel } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { RoomFormDialog } from "@/components/admin/room-form-dialog";
import { DeleteRoomDialog } from "@/components/admin/rooms/delete-room-dialog";
import {
  RoomCard,
  RoomDragHandle,
  ROOM_STATUS_LABEL,
  roomTitle,
} from "@/components/admin/rooms/room-card";
import type { Room, RoomDraft, RoomStatus, RoomStatusCounts } from "@/types/domain/room.types";
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
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/rooms")({
  component: RoomsAdminPage,
  // `?new=1` opens Add room (mobile top-bar "New" menu).
  validateSearch: (search: Record<string, unknown>): { new?: true } =>
    search.new === true || search.new === "1" || search.new === 1 ? { new: true } : {},
});

/**
 * Figma 01.03 / 02.03 · Rooms (+ 01.04 Add room, 01.05 Delete room).
 * Keeps the existing behaviour: search, status filter, drag-to-reorder (display order),
 * multi-select with bulk status / delete.
 */

const ROOMS_FETCH_LIMIT = 150;
type Filter = "all" | RoomStatus;
const FILTERS: Filter[] = ["all", "available", "full", "maintenance", "draft"];

function RoomsAdminPage() {
  const detailMatch = useMatch({ from: "/admin/rooms/$id", shouldThrow: false });
  if (detailMatch) return <Outlet />;
  return <RoomsListPage />;
}

function SortableRoom({
  room,
  selected,
  selectable,
  onToggle,
  onEdit,
  onDelete,
  canDrag,
}: {
  room: Room;
  selected: boolean;
  selectable: boolean;
  onToggle: (selected: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  canDrag: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: room.id,
    disabled: !canDrag,
  });
  return (
    <RoomCard
      room={room}
      innerRef={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      dragging={isDragging}
      selected={selected}
      selectable={selectable}
      onSelectedChange={onToggle}
      onEdit={onEdit}
      onDelete={onDelete}
      dragHandle={canDrag ? <RoomDragHandle {...attributes} {...listeners} /> : null}
    />
  );
}

function RoomsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hostelId, activeHostel } = useHostelScope();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<Room | null>(null);
  const [creating, setCreating] = useState(false);
  const openNew = Route.useSearch().new === true;
  const navigateRooms = Route.useNavigate();
  useEffect(() => {
    if (!openNew) return;
    setCreating(true);
    void navigateRooms({ search: {}, replace: true });
  }, [openNew, navigateRooms]);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [bulkDelete, setBulkDelete] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [localRooms, setLocalRooms] = useState<Room[] | null>(null);
  const [counts, setCounts] = useState<RoomStatusCounts | null>(null);

  useEffect(() => {
    setLocalRooms(null);
    setSelected(new Set());
  }, [filter, debouncedQuery, hostelId]);

  const listParams = useMemo(
    () => ({
      page: 1,
      limit: ROOMS_FETCH_LIMIT,
      ...(hostelId ? { hostel: hostelId } : {}),
      ...(filter !== "all" ? { status: filter } : {}),
      ...(debouncedQuery ? { search: debouncedQuery } : {}),
    }),
    [hostelId, filter, debouncedQuery],
  );

  const { data, isLoading, isError, error } = useRoomsQuery(listParams, {
    enabled: Boolean(hostelId),
  });
  const serverRooms = useMemo(() => data?.rooms ?? [], [data?.rooms]);
  const rooms = localRooms ?? serverRooms;

  // Keep the last known tab counts while a new filter loads (avoids the numbers flashing to 0).
  useEffect(() => {
    if (data?.status_counts) setCounts(data.status_counts);
  }, [data?.status_counts]);

  const prevServerRoomsRef = useRef(serverRooms);
  if (localRooms && prevServerRoomsRef.current !== serverRooms) setLocalRooms(null);
  prevServerRoomsRef.current = serverRooms;

  const createRoom = useCreateRoomMutation(hostelId);
  const updateRoom = useUpdateRoomMutation();
  const deleteRoom = useDeleteRoomMutation();
  const deleteRooms = useDeleteRoomsMutation();
  const bulkStatus = useBulkRoomStatusMutation();
  const reorderRooms = useReorderRoomsMutation();
  const saving = createRoom.isPending || updateRoom.isPending;

  // Reordering only makes sense on the full, unfiltered list.
  const canDrag = filter === "all" && !debouncedQuery;

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
        const from = list.findIndex((r) => r.id === active.id);
        const to = list.findIndex((r) => r.id === over.id);
        if (from === -1 || to === -1) return list;
        const reordered = arrayMove(list, from, to);
        reorderRooms.mutate(
          reordered.map((r) => r.id),
          {
            onError: () => {
              toast.error("Failed to save order. Refreshing…");
              setLocalRooms(null);
              void queryClient.invalidateQueries({ queryKey: roomKeys.all });
            },
          },
        );
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
          },
          onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
        },
      );
    } else {
      createRoom.mutate(values, {
        onSuccess: async () => {
          setCreating(false);
          setQuery("");
          setFilter("all");
          setSelected(new Set());
          await queryClient.invalidateQueries({ queryKey: roomKeys.all });
          navigate({ to: "/admin/rooms", replace: true });
          toast.success("Room created");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Create failed"),
      });
    }
  }

  function closeDelete() {
    setDeleteTarget(null);
    setBulkDelete(false);
  }

  function confirmDelete() {
    if (bulkDelete) {
      const ids = [...selected];
      deleteRooms.mutate(ids, {
        onSuccess: () => {
          toast.success(`${ids.length} rooms deleted`);
          closeDelete();
          setSelected(new Set());
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
      });
    } else if (deleteTarget) {
      deleteRoom.mutate(deleteTarget.id, {
        onSuccess: () => {
          toast.success("Room deleted");
          closeDelete();
          setSelected((s) => {
            const n = new Set(s);
            n.delete(deleteTarget.id);
            return n;
          });
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
      });
    }
  }

  function toggle(id: string, on: boolean) {
    setSelected((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });
  }

  const total = counts?.all ?? data?.pagination.total ?? rooms.length;
  const available = counts?.available ?? rooms.filter((r) => r.status === "available").length;
  const selectedRooms = rooms.filter((r) => selected.has(r.id));
  const deleteOccupants = bulkDelete
    ? selectedRooms.flatMap((r) => r.occupants ?? [])
    : (deleteTarget?.occupants ?? []);
  const visibleFilters = FILTERS.filter(
    (f) => f !== "draft" || (counts?.draft ?? 0) > 0 || filter === "draft",
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        className="mb-0 md:mb-0"
        title="Rooms"
        subtitle={
          isLoading && !counts
            ? " "
            : `${total} ${total === 1 ? "room" : "rooms"} · ${available} available`
        }
        actions={
          <GlassButton onClick={() => setCreating(true)}>
            <Plus /> Add room
          </GlassButton>
        }
      />

      {/* Toolbar */}
      <div className="glass-2 flex flex-col gap-3 rounded-[18px] p-3 md:flex-row md:items-center md:justify-between">
        <label className="glass-inset flex h-10 w-full items-center gap-2.5 rounded-[12px] px-3.5 md:w-[340px]">
          <Search aria-hidden className="size-4 shrink-0 text-ink-3" />
          <input
            type="search"
            name="rooms-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rooms"
            className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-3"
          />
        </label>
        <div
          role="tablist"
          aria-label="Filter rooms by status"
          className="glass-inset flex gap-1 overflow-x-auto rounded-[14px] p-1"
        >
          {visibleFilters.map((f) => {
            const active = f === filter;
            const n = counts ? counts[f] : null;
            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex h-8 shrink-0 items-center gap-2 rounded-[10px] border px-3 text-body font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-brand-border",
                  active
                    ? "border-brand-border bg-brand-tint text-ink"
                    : "border-transparent text-ink-2 hover:text-ink",
                )}
              >
                {f === "all" ? "All" : ROOM_STATUS_LABEL[f]}
                {n != null ? (
                  <span
                    className={cn(
                      "rounded-full px-[7px] py-px text-label font-medium",
                      active ? "bg-brand text-on-brand" : "bg-glass-inset text-ink-2",
                    )}
                  >
                    {n}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 ? (
        <div className="glass-2 flex flex-wrap items-center gap-3 rounded-[18px] px-4 py-3">
          <p className="text-body font-semibold text-ink">{selected.size} selected</p>
          <select
            aria-label="Set status for selected rooms"
            value=""
            onChange={(e) => {
              const status = e.target.value as RoomStatus;
              if (!status) return;
              bulkStatus.mutate(
                { ids: [...selected], status },
                {
                  onSuccess: () => {
                    toast.success("Status updated");
                    setSelected(new Set());
                  },
                  onError: (err) =>
                    toast.error(err instanceof Error ? err.message : "Update failed"),
                },
              );
            }}
            className="glass-inset h-9 rounded-[10px] px-3 text-body text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
          >
            <option value="">Set status…</option>
            <option value="available">Available</option>
            <option value="full">Full</option>
            <option value="maintenance">Maintenance</option>
            <option value="draft">Draft</option>
          </select>
          <GlassButton variant="danger" size="sm" onClick={() => setBulkDelete(true)}>
            <Trash2 /> Delete selected
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            <X /> Clear
          </GlassButton>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-1 h-[350px] animate-pulse rounded-[20px]" />
          ))}
        </div>
      ) : isError ? (
        <GlassPanel level={1} className="rounded-[20px] py-16 text-center text-body text-danger">
          {error instanceof Error ? error.message : "Failed to load rooms"}
        </GlassPanel>
      ) : rooms.length === 0 ? (
        <GlassPanel
          level={1}
          className="flex flex-col items-center gap-3 rounded-[20px] py-16 text-center"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-brand-tint text-brand-text">
            <BedDouble className="size-6" />
          </span>
          <p className="text-card-title text-ink">
            {debouncedQuery || filter !== "all" ? "No rooms match" : "No rooms yet"}
          </p>
          <p className="max-w-sm text-body text-ink-2">
            {debouncedQuery || filter !== "all"
              ? "Try another search or filter."
              : "Add your first room so guests can be booked into it."}
          </p>
          {debouncedQuery || filter !== "all" ? (
            <GlassButton
              variant="glass"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Clear filters
            </GlassButton>
          ) : (
            <GlassButton onClick={() => setCreating(true)}>
              <Plus /> Add room
            </GlassButton>
          )}
        </GlassPanel>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rooms.map((r) => r.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {rooms.map((r) => (
                <SortableRoom
                  key={r.id}
                  room={r}
                  canDrag={canDrag}
                  selected={selected.has(r.id)}
                  selectable={selected.size > 0}
                  onToggle={(on) => toggle(r.id, on)}
                  onEdit={() => setEditing(r)}
                  onDelete={() => setDeleteTarget(r)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <RoomFormDialog
        open={creating || !!editing}
        initial={editing}
        suggestedRoomNumber={Math.max(100, ...rooms.map((r) => r.room_number ?? 100)) + 1}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
        submitting={saving}
      />

      <DeleteRoomDialog
        open={!!deleteTarget || bulkDelete}
        onOpenChange={(o) => !o && closeDelete()}
        title={bulkDelete ? `Delete ${selected.size} rooms?` : "Delete this room?"}
        subtitle={
          bulkDelete
            ? `${selected.size} rooms selected`
            : deleteTarget
              ? roomTitle(deleteTarget)
              : ""
        }
        hostelName={activeHostel?.name}
        occupants={deleteOccupants}
        pending={deleteRoom.isPending || deleteRooms.isPending}
        onConfirm={confirmDelete}
        roomCount={bulkDelete ? selected.size : 1}
      />
    </div>
  );
}
