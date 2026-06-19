import { useQuery } from "@tanstack/react-query";
import { getContactMessagesApi } from "@/api/contact";
import { contactMessageKeys } from "@/queries/keys/contact.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { ContactMessageListParams } from "@/types/domain/contact.types";

export function useContactMessagesQuery(params: ContactMessageListParams = {}) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: contactMessageKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view messages");
      return getContactMessagesApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 15_000,
  });
}
