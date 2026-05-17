import { useQuery } from "@tanstack/react-query";
import { getRoomsApi } from "@/api/rooms";
import { roomKeys } from "@/queries/keys/room.keys";
import type { RoomsListParams } from "@/types/domain/room.types";

export function useRoomsQuery(params: RoomsListParams) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => getRoomsApi(params),
    staleTime: 0,
  });
}
