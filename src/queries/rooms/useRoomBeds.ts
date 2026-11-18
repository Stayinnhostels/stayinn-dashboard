import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRoomAvailabilityApi, getRoomBedsApi } from "@/api/rooms/roomBeds.api";
import { roomKeys } from "@/queries/keys/room.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

/** Beds, guests and occupancy for the room page (Figma 05). */
export function useRoomBedsQuery(roomId: string, options: { enabled?: boolean } = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: roomKeys.beds(roomId),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getRoomBedsApi(token, roomId);
    },
    enabled: (options.enabled ?? true) && Boolean(token && roomId),
    staleTime: 15_000,
  });
}

/** Free beds per room tonight (walk-in room picker). */
export function useRoomAvailabilityQuery(
  params: { hostel?: string; search?: string },
  options: { enabled?: boolean } = {},
) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: roomKeys.availability(params.hostel, params.search),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getRoomAvailabilityApi(token, params);
    },
    enabled: (options.enabled ?? true) && Boolean(token),
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  });
}
