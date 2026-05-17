"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatRoomStatus,
  roomStatusStyles,
  ROOM_STATUS_OPTIONS,
  type RoomStatus,
} from "@/types/domain/room.types";

type RoomStatusPickerProps = {
  status: RoomStatus;
  onChange: (status: RoomStatus) => void;
  disabled?: boolean;
  className?: string;
};

export function RoomStatusPicker({ status, onChange, disabled, className }: RoomStatusPickerProps) {
  return (
    <Select
      value={status}
      onValueChange={(value) => onChange(value as RoomStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "h-9 w-fit min-w-[9rem] gap-2 rounded-full border px-3 py-1 text-sm font-semibold capitalize shadow-none focus:ring-2",
          roomStatusStyles[status],
          className,
        )}
        aria-label="Change room status"
      >
        <SelectValue>{formatRoomStatus(status)}</SelectValue>
      </SelectTrigger>
      <SelectContent className="z-[200]">
        {ROOM_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option} value={option} className="capitalize">
            {formatRoomStatus(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
