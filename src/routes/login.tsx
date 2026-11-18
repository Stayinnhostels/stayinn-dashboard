import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ApiError } from "@/api/apiFetch";
import { AuthShell } from "@/components/auth/auth-ui";
import {
  NoDashboardAccessCard,
  SignedOutCard,
  SignInCard,
  SignInSuccessCard,
  TooManyAttemptsCard,
  type SignInValues,
} from "@/components/auth/auth-cards";
import { LoadingScreen } from "@/components/system/system-screens";
import { useAuth } from "@/lib/auth-context";
import { NotConsoleUserError } from "@/lib/auth-map-user";
import { unlockNotificationAudio } from "@/lib/notification-sound";
import { clearSessionEnded, readLastEmail, readSessionEnded } from "@/lib/session-end";
import { useLoginMutation } from "@/queries/auth/useLoginMutation";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Stay Inn Admin" },
      { name: "description", content: "Sign in to the Stay Inn admin and operations console." },
    ],
  }),
});

function postLoginPath() {
  return "/admin";
}

/** How long the "Welcome back" card stays up before the dashboard opens. */
const SUCCESS_REDIRECT_MS = 1200;
/** Matches the API's login rate-limit window (15 minutes). */
const DEFAULT_LOCK_SECONDS = 15 * 60;

type View =
  | { kind: "form" }
  | { kind: "expired"; email: string }
  | { kind: "signed-out" }
  | { kind: "success"; name: string }
  | { kind: "locked"; until: number }
  | { kind: "no-access" };

function initialView(): View {
  const reason = readSessionEnded();
  if (reason === "signed-out") return { kind: "signed-out" };
  if (reason === "expired") {
    const email = readLastEmail();
    if (email) return { kind: "expired", email };
  }
  return { kind: "form" };
}

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const loginMutation = useLoginMutation();
  const [view, setView] = useState<View>(initialView);
  const [banner, setBanner] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  // The session is stored a tick before the success card renders; hold the redirect meanwhile.
  const signingIn = useRef(false);
  const alreadySignedIn = !!user && view.kind !== "success" && !signingIn.current;

  // Already signed in (and not in the middle of the success screen) → straight to the dashboard.
  useLayoutEffect(() => {
    if (alreadySignedIn) {
      navigate({ to: postLoginPath(), replace: true });
    }
  }, [alreadySignedIn, navigate]);

  useEffect(() => {
    if (view.kind !== "success") return;
    const t = window.setTimeout(() => navigate({ to: postLoginPath() }), SUCCESS_REDIRECT_MS);
    return () => window.clearTimeout(t);
  }, [view.kind, navigate]);

  // Tick while locked out so the "Try again in N minutes" title counts down.
  useEffect(() => {
    if (view.kind !== "locked") return;
    const t = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(t);
  }, [view.kind]);

  const showForm = () => {
    clearSessionEnded();
    setBanner(null);
    setView({ kind: "form" });
  };

  const onSubmit = async (values: SignInValues) => {
    setBanner(null);
    signingIn.current = true;
    try {
      // Unlock audio on this click so booking rings work right after login.
      unlockNotificationAudio();
      const data = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
        remember: values.remember,
      });
      const fullName = data.user.name?.trim() ?? "";
      setView({ kind: "success", name: fullName.split(/\s+/)[0] ?? "" });
    } catch (e) {
      signingIn.current = false;
      if (e instanceof NotConsoleUserError || (e instanceof ApiError && e.status === 403)) {
        setView({ kind: "no-access" });
      } else if (e instanceof ApiError && e.status === 429) {
        const seconds = e.retryAfterSeconds ?? DEFAULT_LOCK_SECONDS;
        setNow(Date.now());
        setView({ kind: "locked", until: Date.now() + seconds * 1000 });
      } else if (e instanceof ApiError && e.status === 401) {
        setBanner("That email or password is not right. Try again or reset your password.");
      } else if (e instanceof TypeError) {
        setBanner("We couldn't reach the server. Check your connection and try again.");
      } else {
        setBanner(e instanceof Error ? e.message : "Sign in failed. Please try again.");
      }
    }
  };

  if (alreadySignedIn) {
    return <LoadingScreen />;
  }

  return (
    <AuthShell>
      {view.kind === "success" ? (
        <SignInSuccessCard name={view.name} durationMs={SUCCESS_REDIRECT_MS} />
      ) : view.kind === "locked" ? (
        <TooManyAttemptsCard
          minutes={Math.max(1, Math.ceil((view.until - now) / 60_000))}
          canRetry={now >= view.until}
          onRetry={showForm}
        />
      ) : view.kind === "no-access" ? (
        <NoDashboardAccessCard onBack={showForm} />
      ) : view.kind === "signed-out" ? (
        <SignedOutCard onSignInAgain={showForm} />
      ) : (
        <SignInCard
          key={view.kind}
          variant={view.kind === "expired" ? "expired" : "default"}
          lockedEmail={view.kind === "expired" ? view.email : undefined}
          banner={banner}
          pending={loginMutation.isPending}
          onSubmit={onSubmit}
          onUseDifferentAccount={showForm}
        />
      )}
    </AuthShell>
  );
}
