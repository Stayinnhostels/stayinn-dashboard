import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import { GlassButton } from "@/components/glass";
import type { RoomOccupant } from "@/types/domain/room.types";

/**
 * Figma 01.05 / 02.05 · Rooms — Delete room. Glass-3 dialog, 440 wide.
 * Warns when guests are staying in the room(s) today. Cancel has default focus.
 */
export function DeleteRoomDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  hostelName,
  occupants,
  pending,
  onConfirm,
  roomCount = 1,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** e.g. "Room 14 · Private double", or "3 rooms selected". */
  subtitle: string;
  hostelName?: string | null;
  occupants: RoomOccupant[];
  pending?: boolean;
  onConfirm: () => void;
  /** More than one room (bulk delete) changes the wording. */
  roomCount?: number;
}) {
  const names = [...new Set(occupants.map((o) => o.guest_name).filter(Boolean))];
  const where = hostelName ? `from ${hostelName}` : "";
  const lead =
    names.length === 0
      ? ""
      : names.length === 1
        ? `${names[0]} is booked ${roomCount > 1 ? "in one of these rooms" : "in this room"} tonight. `
        : names.length === 2
          ? `${names[0]} and ${names[1]} are booked tonight. `
          : `${names[0]}, ${names[1]} and ${names.length - 2} more are booked tonight. `;
  const count = occupants.length;

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="glass-3 fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-[24px] p-6 font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-center gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] border border-danger bg-danger-tint text-danger">
              <Trash2 aria-hidden className="size-5" />
            </span>
            <div className="min-w-0">
              <AlertDialog.Title className="text-hero text-ink">{title}</AlertDialog.Title>
              <p className="truncate text-body text-ink-2">{subtitle}</p>
            </div>
          </div>
          <AlertDialog.Description className="text-body text-ink-2">
            {lead}
            {roomCount > 1
              ? `Deleting them removes ${roomCount} rooms ${where} and cannot be undone.`
              : `Deleting it removes the room ${where} and cannot be undone.`}
          </AlertDialog.Description>
          {count > 0 ? (
            <div className="flex items-center gap-2.5 rounded-[12px] border border-warning bg-warning-tint px-3 py-2.5 text-warning">
              <TriangleAlert aria-hidden className="size-[18px] shrink-0" />
              <p className="text-body font-medium">
                {count} active {count === 1 ? "booking" : "bookings"} will be affected
              </p>
            </div>
          ) : null}
          <div className="flex justify-end gap-2.5 pt-1">
            <AlertDialog.Cancel asChild>
              <GlassButton variant="glass" autoFocus>
                Cancel
              </GlassButton>
            </AlertDialog.Cancel>
            <GlassButton
              variant="danger"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
            >
              {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
              {pending ? "Deleting…" : roomCount > 1 ? `Delete ${roomCount} rooms` : "Delete room"}
            </GlassButton>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
