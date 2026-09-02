import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchHostelApi, pauseHostelApi, postHostelApi, setDefaultHostelApi } from "@/api/hostels";
import { hostelKeys } from "@/queries/keys/hostel.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { HostelInput } from "@/types/domain/hostel.types";

function useHostelToken() {
  return useAuthStore((s) => s.token);
}

export function useCreateHostelMutation() {
  const token = useHostelToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: HostelInput) => {
      if (!token) throw new Error("You must be signed in to create a hostel");
      return postHostelApi(token, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hostelKeys.all });
    },
  });
}

export function useUpdateHostelMutation() {
  const token = useHostelToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<HostelInput> }) => {
      if (!token) throw new Error("You must be signed in to update a hostel");
      return patchHostelApi(token, id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hostelKeys.all });
    },
  });
}

export function useSetDefaultHostelMutation() {
  const token = useHostelToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("You must be signed in");
      return setDefaultHostelApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hostelKeys.all });
    },
  });
}

export function usePauseHostelMutation() {
  const token = useHostelToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("You must be signed in");
      return pauseHostelApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hostelKeys.all });
    },
  });
}
