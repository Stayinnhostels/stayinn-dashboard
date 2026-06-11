import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFacilityApi, patchFacilityApi, postFacilityApi, seedMissingFacilitiesApi } from "@/api/facilities";
import { facilityKeys } from "@/queries/keys/facility.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { FacilityInput, FacilityUpdateInput } from "@/types/domain/facility.types";

export function useCreateFacilityMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: FacilityInput) => {
      if (!token) throw new Error("You must be signed in");
      return postFacilityApi(token, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: facilityKeys.all });
    },
  });
}

export function useUpdateFacilityMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: FacilityUpdateInput }) => {
      if (!token) throw new Error("You must be signed in");
      return patchFacilityApi(token, id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: facilityKeys.all });
    },
  });
}

export function useSeedMissingFacilitiesMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error("You must be signed in");
      return seedMissingFacilitiesApi(token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: facilityKeys.all });
    },
  });
}

export function useDeleteFacilityMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("You must be signed in");
      return deleteFacilityApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: facilityKeys.all });
    },
  });
}
