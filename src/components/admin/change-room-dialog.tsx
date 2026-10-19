import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransferBookingRoomMutation } from "@/queries/bookings";
import { useRoomsQuery } from "@/queries/rooms";
import { formatRoomLabel } from "@/types/domain/room.types";
import type { BookingStatus } from "@/types/domain/booking.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  currentRoomId: string | null;
  currentRoomTitle?: string | null;
  seatsBooked: number;
  hostelId?: string | null;
  bookingStatus: BookingStatus | string;
};

export function ChangeRoomDialog({
  open,
  onOpenChange,
  bookingId,
  currentRoomId,
  currentRoomTitle,
  seatsBooked,
  hostelId,
  bookingStatus,
}: Props) {
  const transfer = useTransferBookingRoomMutation();
  const bedsNeeded = Math.max(1, Number(seatsBooked) || 1);

  const { data: roomsData, isLoading: roomsLoading } = useRoomsQuery(
    {
      limit: 200,
      ...(hostelId ? { hostel: hostelId } : {}),
    },
    { enabled: open },
  );

  const [roomId, setRoomId] = useState("");

  const blocked = bookingStatus === "cancelled" || bookingStatus === "checked_out";

  const eligibleRooms = useMemo(() => {
    const rooms = roomsData?.rooms ?? [];
    return rooms
      .filter((room) => {
        if (currentRoomId && room.id === currentRoomId) return false;
        if (room.status === "maintenance" || room.status === "draft") return false;
        return room.beds_available >= bedsNeeded;
      })
      .sort((a, b) => {
        const an = a.room_number ?? Number.POSITIVE_INFINITY;
        const bn = b.room_number ?? Number.POSITIVE_INFINITY;
        if (an !== bn) return an - bn;
        return a.title.localeCompare(b.title);
      });
  }, [roomsData?.rooms, currentRoomId, bedsNeeded]);

  useEffect(() => {
    if (!open) return;
    setRoomId("");
  }, [open, bookingId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (blocked) {
      toast.error("This booking is finished — room can't be changed");
      return;
    }
    if (!roomId) {
      toast.error("Pick a room first");
      return;
    }

    transfer.mutate(
      {
        id: bookingId,
        previousRoomId: currentRoomId,
        input: { room_id: roomId },
      },
      {
        onSuccess: (booking) => {
          toast.success(`Moved to ${booking.room_title ?? "new room"}`);
          onOpenChange(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not change room"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change room</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Now in</p>
            <p className="text-sm font-semibold">{currentRoomTitle || "—"}</p>
          </div>

          {blocked ? (
            <p className="text-sm text-rose-600">
              This guest has already checked out or the booking was cancelled.
            </p>
          ) : roomsLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading rooms…
            </p>
          ) : eligibleRooms.length === 0 ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                No other room is free enough.
              </p>
              <p className="mt-1 text-muted-foreground">
                {bedsNeeded === 1
                  ? "Every other room is full right now. Free a bed somewhere, then try again."
                  : `This guest uses ${bedsNeeded} beds, and no other room has that many free. Free some beds, then try again.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="change-room-select">Move to</Label>
              <Select value={roomId} onValueChange={setRoomId}>
                <SelectTrigger id="change-room-select">
                  <SelectValue placeholder="Pick a room" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {formatRoomLabel(room)}
                      {room.beds_available === 1
                        ? " — 1 bed free"
                        : ` — ${room.beds_available} beds free`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={blocked || !roomId || transfer.isPending || eligibleRooms.length === 0}
            >
              {transfer.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
