import { useMutation } from "@tanstack/react-query";
import { patchProfileApi, type UpdateProfileInput } from "@/api/auth/patchProfile.api";
import { useAuthStore } from "@/stores/auth/auth.store";

export function useUpdateProfileMutation() {
  const token = useAuthStore((s) => s.token);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => {
      if (!token) throw new Error("You must be signed in");
      return patchProfileApi(token, input);
    },
    onSuccess: (user) => {
      updateUser(user);
    },
  });
}
