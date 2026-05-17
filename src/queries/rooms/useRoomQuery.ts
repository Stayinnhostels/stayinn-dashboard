import { useQuery } from "@tanstack/react-query";
import { getRoomApi } from "@/api/rooms";
import { roomKeys } from "@/queries/keys/room.keys";

export function useRoomQuery(id: string) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => getRoomApi(id),
    enabled: Boolean(id),
    staleTime: 0,
  });
}
