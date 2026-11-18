import { useEffect, useState, type ReactElement } from "react";
import { Slot } from "@radix-ui/react-slot";
import { WalkInModal } from "@/components/admin/walk-in/walk-in-modal";
import { AddWalkInMemberModal } from "@/components/admin/walk-in/add-walk-in-member-modal";

/**
 * "Add walk-in member" / "+ New booking": opens the walk-in modal on its room-picker step
 * (Figma 05.11 global entry). After saving it goes to the room page (Figma 05.10).
 */
export function WalkInRoomPicker({
  children,
  defaultOpen = false,
  full = false,
}: {
  children: ReactElement;
  defaultOpen?: boolean;
  /** Bookings page: the full "Add walk-in member" form (Figma 06.12–06.14). */
  full?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);
  return (
    <>
      <Slot onClick={() => setOpen(true)}>{children}</Slot>
      {full ? <AddWalkInMemberModal open={open} onOpenChange={setOpen} /> : <WalkInModal open={open} onOpenChange={setOpen} navigateToRoom />}
    </>
  );
}
