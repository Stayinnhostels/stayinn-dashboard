import { useQuery } from "@tanstack/react-query";
import { getPlanApi } from "@/api/admin/getPlan.api";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useHostelScope } from "@/lib/use-hostel-scope";

/** Plan name + rooms used vs limit for the selected property (sidebar plan card). */
export function usePlanQuery() {
  const token = useAuthStore((s) => s.token);
  const { hostelId } = useHostelScope();
  return useQuery({
    queryKey: ["admin", "plan", hostelId ?? "default"],
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getPlanApi(token, hostelId ?? undefined);
    },
    enabled: Boolean(token),
    staleTime: 60_000,
    retry: 1,
  });
}
