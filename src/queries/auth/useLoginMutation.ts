import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postLoginApi } from "@/api/auth/postLogin.api";
import { useAuthStore } from "@/stores/auth/auth.store";
import { authKeys } from "@/queries/keys/auth.keys";
import { assertSuperAdminConsoleUser, mapLoginUserDtoToAuthUser } from "@/lib/auth-map-user";

export type LoginMutationVariables = {
  email: string;
  password: string;
  remember?: boolean;
};

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: async ({ email, password }: LoginMutationVariables) =>
      postLoginApi({ email, password }),
    onSuccess: (data, variables) => {
      const user = mapLoginUserDtoToAuthUser(data.user);
      assertSuperAdminConsoleUser(user);
      useAuthStore.getState().persistSession({
        user,
        token: data.token,
        refreshToken: data.refreshToken,
        remember: variables.remember ?? true,
      });
      queryClient.setQueryData(authKeys.session(), {
        user,
        token: data.token,
        refreshToken: data.refreshToken,
      });
    },
  });
}
