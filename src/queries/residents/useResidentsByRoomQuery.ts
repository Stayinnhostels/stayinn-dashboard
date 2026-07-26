import { useQuery } from "@tanstack/react-query";
import { getResidentsByRoomApi } from "@/api/residents";
import { residentKeys } from "@/queries/keys/resident.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { ResidentsByRoomParams } from "@/types/domain/resident.types";

export function useResidentsByRoomQuery(params: ResidentsByRoomParams = {}) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: residentKeys.byRoom(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view residents by room");
      return getResidentsByRoomApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 30_000,
  });
}
