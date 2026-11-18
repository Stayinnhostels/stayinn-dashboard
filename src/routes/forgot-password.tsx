import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "@/api/apiFetch";
import { postForgotPasswordApi } from "@/api/auth/passwordReset.api";
import { AuthShell } from "@/components/auth/auth-ui";
import { CheckEmailCard, ForgotPasswordCard } from "@/components/auth/auth-cards";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({ meta: [{ title: "Forgot password — Stay Inn Admin" }] }),
});

function errorMessage(e: unknown) {
  if (e instanceof ApiError && e.status === 429) {
    return "Too many reset requests. Please wait a while and try again.";
  }
  if (e instanceof TypeError) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  return e instanceof Error ? e.message : "We couldn't send the link. Please try again.";
}

function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [lastEmail, setLastEmail] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: postForgotPasswordApi });

  const send = async (email: string) => {
    setBanner(null);
    setLastEmail(email);
    try {
      await mutation.mutateAsync(email);
      setSentTo(email);
    } catch (e) {
      setSentTo(null);
      setBanner(errorMessage(e));
    }
  };

  return (
    <AuthShell>
      {sentTo ? (
        <CheckEmailCard
          email={sentTo}
          resending={mutation.isPending}
          onResend={() => send(sentTo)}
          onWrongEmail={() => setSentTo(null)}
        />
      ) : (
        <ForgotPasswordCard
          defaultEmail={lastEmail}
          banner={banner}
          pending={mutation.isPending}
          onSubmit={send}
        />
      )}
    </AuthShell>
  );
}
