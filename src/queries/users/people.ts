import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth/auth.store";
import * as api from "@/api/users/people.api";

const KEY = ["people"] as const;

export function usePeopleQuery(params: api.PeopleParams) {
  const token = useAuthStore((s) => s.token);
  return useQuery({ queryKey: [...KEY, "list", params], queryFn: () => api.getPeopleApi(token as string, params), enabled: Boolean(token), placeholderData: keepPreviousData, staleTime: 15_000 });
}

export function usePersonDetailQuery(id: string) {
  const token = useAuthStore((s) => s.token);
  return useQuery({ queryKey: [...KEY, "detail", id], queryFn: () => api.getPersonDetailApi(token as string, id), enabled: Boolean(token && id) });
}

export function useTeamQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({ queryKey: [...KEY, "team"], queryFn: () => api.getTeamApi(token as string), enabled: Boolean(token) });
}

/** Any account action; refreshes every people query afterwards. */
export function usePeopleAction<V>(fn: (token: string, v: V) => Promise<unknown>) {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: V) => {
      if (!token) throw new Error("You must be signed in");
      return fn(token, v);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEY });
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
