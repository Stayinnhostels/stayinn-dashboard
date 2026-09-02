import { useQuery } from "@tanstack/react-query";
import { getHostelsApi } from "@/api/hostels";
import { hostelKeys } from "@/queries/keys/hostel.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

export function useHostelsQuery() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: hostelKeys.list(),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view hostels");
      return getHostelsApi(token);
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}
