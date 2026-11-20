import type { CSSProperties, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Eye, GripVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassButton, GlassIconButton, StatusChip, type StatusChipProps } from "@/components/glass";
import { RoomThumbnail } from "@/components/admin/room-thumbnail";
import type { Room, RoomStatus } from "@/types/domain/room.types";

/** Figma "Room card" (167:1055): 176px photo + status chip, title/meta, price, bed bar, View / Edit / Delete. */

export const ROOM_STATUS_TONE: Record<RoomStatus, StatusChipProps["tone"]> = {
  available: "success",
  full: "brand",
  maintenance: "warning",
  draft: "neutral",
};

export const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  available: "Available",
  full: "Full",
  maintenance: "Maintenance",
  draft: "Draft",
};

/** "Room 14 · Private double" (or just the title when the room has no number). */
export function roomTitle(room: Pick<Room, "room_number" | "title">) {
  if (room.room_number == null) return room.title;
  return room.title ? `Room ${room.room_number} · ${room.title}` : `Room ${room.room_number}`;
}

/** Who is staying: one booking → the guest's name, several → "6 guests". */
export function occupantSummary(room: Pick<Room, "occupants">) {
  const occ = room.occupants ?? [];
  if (occ.length === 0) return null;
  if (occ.length === 1) return occ[0].guest_name;
  const guests = occ.reduce((s, o) => s + (o.seats || 1), 0);
  return `${guests} guests`;
}

/** "No. 14 · Floor 3 · Alex Rivera" */
export function roomMeta(room: Room) {
  const parts: string[] = [];
  if (room.room_number != null) parts.push(`No. ${room.room_number}`);
  if (room.floor != null) parts.push(room.floor === 0 ? "Ground floor" : `Floor ${room.floor}`);
  const who = occupantSummary(room);
  if (room.status === "maintenance") parts.push("Closed for repair");
  else if (who) parts.push(who);
  else if (room.status === "draft") parts.push("Not listed yet");
  else if (room.beds_available > 0) parts.push("Ready for check-in");
  return parts.join(" · ");
}

export function formatUsd(n: number) {
  return `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function RoomCard({
  room,
  onEdit,
  onDelete,
  selected,
  selectable,
  onSelectedChange,
  dragHandle,
  style,
  innerRef,
  dragging,
}: {
  room: Room;
  onEdit: () => void;
  onDelete: () => void;
  selected?: boolean;
  /** Show the selection box all the time (once something is selected). */
  selectable?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  dragHandle?: ReactNode;
  style?: CSSProperties;
  innerRef?: (el: HTMLElement | null) => void;
  dragging?: boolean;
}) {
  const occupied = Math.max(0, room.beds_total - room.beds_available);
  const outOfService = room.status === "maintenance";
  const pctFull = room.beds_total > 0 ? (occupied / room.beds_total) * 100 : 0;

  return (
    <article
      ref={innerRef}
      style={style}
      className={cn(
        "glass-1 group relative flex min-w-0 flex-col overflow-hidden rounded-[20px] font-geist",
        selected && "ring-2 ring-brand-border",
        dragging && "z-10 shadow-glass-3",
      )}
    >
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-glass-inset">
        <RoomThumbnail images={room.images} alt="" className="absolute inset-0" />
        <StatusChip tone={ROOM_STATUS_TONE[room.status]} className="absolute top-3 right-2.5">
          {ROOM_STATUS_LABEL[room.status]}
        </StatusChip>
        {onSelectedChange || dragHandle ? (
          <div
            className={cn(
              "absolute top-2.5 left-2.5 flex items-center gap-1.5 transition-opacity",
              selectable || selected
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
            )}
          >
            {dragHandle}
            {onSelectedChange ? (
              <button
                type="button"
                role="checkbox"
                aria-checked={!!selected}
                aria-label={`Select ${roomTitle(room)}`}
                onClick={() => onSelectedChange(!selected)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-[8px] outline-none focus-visible:ring-2 focus-visible:ring-brand-border",
                  selected ? "bg-brand text-on-brand" : "glass-3 text-transparent",
                )}
              >
                <Check className="size-4" strokeWidth={3} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="truncate text-card-title text-ink">{roomTitle(room)}</h3>
          <p className="truncate text-label text-ink-2">{roomMeta(room) || room.category}</p>
        </div>
        <div className="flex items-center justify-between gap-2 whitespace-nowrap">
          <p className="flex min-w-0 items-baseline gap-1">
            <span className="text-body font-semibold text-ink">
              {formatUsd(room.price_per_night_usd ?? room.price_per_night)}
            </span>
            <span className="truncate text-label font-medium text-ink-3">/ seat / month</span>
          </p>
          <span
            className={cn("text-label font-medium", outOfService ? "text-warning" : "text-ink-2")}
          >
            {outOfService ? "Out of service" : `${room.beds_available} free / ${room.beds_total}`}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Beds occupied"
          aria-valuemin={0}
          aria-valuemax={room.beds_total}
          aria-valuenow={outOfService ? 0 : occupied}
          className="h-1 w-full overflow-hidden rounded-[4px] bg-glass-inset"
        >
          {!outOfService ? (
            <div className="dash-fill h-full rounded-[4px] bg-brand" style={{ width: `${pctFull}%` }} />
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <GlassButton variant="glass" className="min-w-0 flex-1" asChild>
            <Link to="/admin/rooms/$id" params={{ id: room.id }}>
              <Eye /> View
            </Link>
          </GlassButton>
          <GlassIconButton aria-label={`Edit ${roomTitle(room)}`} onClick={onEdit}>
            <Pencil />
          </GlassIconButton>
          <GlassIconButton
            aria-label={`Delete ${roomTitle(room)}`}
            variant="danger"
            onClick={onDelete}
          >
            <Trash2 />
          </GlassIconButton>
        </div>
      </div>
    </article>
  );
}

export function RoomDragHandle(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Drag to reorder"
      className="glass-3 flex size-7 cursor-grab touch-none items-center justify-center rounded-[8px] text-ink-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-border active:cursor-grabbing"
      {...props}
    >
      <GripVertical className="size-4" />
    </button>
  );
}
