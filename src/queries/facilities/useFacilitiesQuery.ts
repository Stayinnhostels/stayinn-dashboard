import { useQuery } from "@tanstack/react-query";
import { getFacilitiesApi } from "@/api/facilities";
import { facilityKeys } from "@/queries/keys/facility.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

export function useFacilitiesQuery() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: facilityKeys.list(),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getFacilitiesApi(token);
    },
    enabled: Boolean(token),
  });
}
