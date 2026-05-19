import { useQuery } from "@tanstack/react-query";
import { getRoomsApi } from "@/api/rooms";
import { roomKeys } from "@/queries/keys/room.keys";
import type { RoomsListParams } from "@/types/domain/room.types";

type UseRoomsQueryOptions = {
  enabled?: boolean;
};

export function useRoomsQuery(params: RoomsListParams, options: UseRoomsQueryOptions = {}) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => getRoomsApi(params),
    staleTime: 30_000,
    enabled: options.enabled ?? true,
  });
}
