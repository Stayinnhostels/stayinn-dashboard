import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoomApi, patchRoomApi, postRoomApi } from "@/api/rooms";
import { roomKeys } from "@/queries/keys/room.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { RoomDraft } from "@/types/domain/room.types";

function useRoomToken() {
  return useAuthStore((s) => s.token);
}

export function useCreateRoomMutation() {
  const token = useRoomToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: RoomDraft) => {
      if (!token) throw new Error("You must be signed in to create a room");
      return postRoomApi(token, draft);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useUpdateRoomMutation() {
  const token = useRoomToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, draft }: { id: string; draft: Partial<RoomDraft> }) => {
      if (!token) throw new Error("You must be signed in to update a room");
      return patchRoomApi(token, id, draft);
    },
    onSuccess: (room, { id }) => {
      queryClient.setQueryData(roomKeys.detail(id), room);
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useDeleteRoomMutation() {
  const token = useRoomToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("You must be signed in to delete a room");
      return deleteRoomApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useDeleteRoomsMutation() {
  const token = useRoomToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!token) throw new Error("You must be signed in to delete rooms");
      await Promise.all(ids.map((id) => deleteRoomApi(token, id)));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useBulkRoomStatusMutation() {
  const token = useRoomToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: RoomDraft["status"] }) => {
      if (!token) throw new Error("You must be signed in to update rooms");
      await Promise.all(ids.map((id) => patchRoomApi(token, id, { status })));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}
