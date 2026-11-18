import { useQuery } from "@tanstack/react-query";
import { getNavCountsApi } from "@/api/admin/getNavCounts.api";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useHostelScope } from "@/lib/use-hostel-scope";

/** Red badge counts for the sidebar. Refreshes every minute and when the tab regains focus. */
export function useNavCountsQuery() {
  const token = useAuthStore((s) => s.token);
  const { hostelId } = useHostelScope();
  return useQuery({
    queryKey: ["admin", "nav-counts", hostelId ?? "all"],
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getNavCountsApi(token, hostelId ?? undefined);
    },
    enabled: Boolean(token),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
