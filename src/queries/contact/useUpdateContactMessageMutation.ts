import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchContactMessageApi } from "@/api/contact";
import { contactMessageKeys } from "@/queries/keys/contact.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { ContactMessageStatus } from "@/types/domain/contact.types";

export function useUpdateContactMessageMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactMessageStatus }) => {
      if (!token) throw new Error("You must be signed in");
      return patchContactMessageApi(token, id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactMessageKeys.all });
    },
  });
}
