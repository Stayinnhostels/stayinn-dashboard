import { useQuery } from "@tanstack/react-query";
import { getResidentDetailApi } from "@/api/residents";
import { residentKeys } from "@/queries/keys/resident.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

export function useResidentDetailQuery(bookingId: string | null, month?: string) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: residentKeys.detail(bookingId ?? "", month),
    queryFn: () => {
      if (!token || !bookingId) throw new Error("Missing resident");
      return getResidentDetailApi(token, bookingId, month);
    },
    enabled: Boolean(token && bookingId),
    staleTime: 15_000,
  });
}
