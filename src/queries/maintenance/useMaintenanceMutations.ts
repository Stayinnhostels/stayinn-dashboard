import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteMaintenanceApi,
  patchMaintenanceApi,
  postMaintenanceApi,
} from "@/api/maintenance";
import { maintenanceKeys } from "@/queries/keys/maintenance.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { MaintenanceDraft, MaintenanceStatus, MaintenanceTicket } from "@/types/domain/maintenance.types";

type MaintenanceListCache = {
  maintenance: MaintenanceTicket[];
};

function optimisticStatusPatch(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  status: MaintenanceStatus,
) {
  queryClient.setQueriesData<MaintenanceListCache>({ queryKey: maintenanceKeys.all }, (old) => {
    if (!old?.maintenance) return old;
    return {
      ...old,
      maintenance: old.maintenance.map((t) => (t.id === id ? { ...t, status } : t)),
    };
  });
}

export function useCreateMaintenanceMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MaintenanceDraft) => {
      if (!token) throw new Error("You must be signed in");
      return postMaintenanceApi(token, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    },
  });
}

export function useUpdateMaintenanceMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MaintenanceDraft> }) => {
      if (!token) throw new Error("You must be signed in");
      return patchMaintenanceApi(token, id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    },
  });
}

export function useUpdateMaintenanceStatusMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MaintenanceStatus }) => {
      if (!token) throw new Error("You must be signed in");
      return patchMaintenanceApi(token, id, { status });
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: maintenanceKeys.all });
      const previous = queryClient.getQueriesData<MaintenanceListCache>({
        queryKey: maintenanceKeys.all,
      });
      optimisticStatusPatch(queryClient, id, status);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    },
  });
}

export function useDeleteMaintenanceMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("You must be signed in");
      return deleteMaintenanceApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    },
  });
}
