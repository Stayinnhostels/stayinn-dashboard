import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "@/api/apiFetch";
import { postResetPasswordApi } from "@/api/auth/passwordReset.api";
import { AuthShell } from "@/components/auth/auth-ui";
import {
  LinkExpiredCard,
  NewPasswordCard,
  PasswordUpdatedCard,
} from "@/components/auth/auth-cards";

const TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Reset password — Stay Inn Admin" }] }),
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const tokenOk = !!token && TOKEN_PATTERN.test(token);
  const [state, setState] = useState<"form" | "done" | "expired">(tokenOk ? "form" : "expired");
  const [banner, setBanner] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: postResetPasswordApi });

  const onSubmit = async (password: string) => {
    if (!token) return;
    setBanner(null);
    try {
      await mutation.mutateAsync({ token, password });
      setState("done");
    } catch (e) {
      // 400 = the link is invalid, already used, or older than 30 minutes.
      if (e instanceof ApiError && e.status === 400) setState("expired");
      else if (e instanceof ApiError && e.status === 429) {
        setBanner("Too many attempts. Please wait a while and try again.");
      } else if (e instanceof TypeError) {
        setBanner("We couldn't reach the server. Check your connection and try again.");
      } else {
        setBanner(
          e instanceof Error ? e.message : "We couldn't update your password. Please try again.",
        );
      }
    }
  };

  return (
    <AuthShell>
      {state === "done" ? (
        <PasswordUpdatedCard />
      ) : state === "expired" ? (
        <LinkExpiredCard />
      ) : (
        <NewPasswordCard banner={banner} pending={mutation.isPending} onSubmit={onSubmit} />
      )}
    </AuthShell>
  );
}
