import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "@/api/apiFetch";
import { postSetPasswordApi } from "@/api/auth/passwordReset.api";
import { AuthShell } from "@/components/auth/auth-ui";
import {
  LinkExpiredCard,
  NewPasswordCard,
  PasswordUpdatedCard,
} from "@/components/auth/auth-cards";

const TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

type InviteSearch = { token?: string; name?: string; role?: string };

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 80) : undefined);

/** Accept invite · set your password (Figma 17.16). `name` / `role` are optional display hints. */
export const Route = createFileRoute("/set-password")({
  validateSearch: (search: Record<string, unknown>): InviteSearch => ({
    token: str(search.token),
    name: str(search.name),
    role: str(search.role),
  }),
  component: SetPasswordPage,
  head: () => ({ meta: [{ title: "Set your password — Stay Inn Admin" }] }),
});

function SetPasswordPage() {
  const { token, name, role } = Route.useSearch();
  const tokenOk = !!token && TOKEN_PATTERN.test(token);
  const [state, setState] = useState<"form" | "done" | "expired">(tokenOk ? "form" : "expired");
  const [banner, setBanner] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: postSetPasswordApi });

  const onSubmit = async (password: string) => {
    if (!token) return;
    setBanner(null);
    try {
      await mutation.mutateAsync({ token, password });
      setState("done");
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) setState("expired");
      else if (e instanceof TypeError) {
        setBanner("We couldn't reach the server. Check your connection and try again.");
      } else {
        setBanner(
          e instanceof Error ? e.message : "We couldn't set your password. Please try again.",
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
        <NewPasswordCard
          variant="invite"
          invite={{ name, role }}
          banner={banner}
          pending={mutation.isPending}
          onSubmit={onSubmit}
        />
      )}
    </AuthShell>
  );
}
