import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Inbox,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_LEGAL_NAME } from "@/lib/brand-assets";
import { Tag } from "@/components/glass";
import {
  AuthAction,
  AuthBanner,
  AuthCard,
  AuthCheckbox,
  AuthFieldError,
  AuthHeader,
  AuthInput,
  AuthPasswordInput,
  authLinkClass,
  formatClock,
  maskEmail,
  useCountdown,
} from "./auth-ui";

/* ───────────────────────── 17.01–17.05 · Sign in ───────────────────────── */

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(120),
  password: z.string().min(1, "Password is required").max(200),
  remember: z.boolean().optional(),
});
export type SignInValues = z.infer<typeof signInSchema>;

export function SignInCard({
  variant = "default",
  lockedEmail,
  defaultValues,
  banner,
  pending = false,
  validateOnMount = false,
  onSubmit,
  onUseDifferentAccount,
}: {
  /** "expired" = Figma 17.17: email locked, clock badge, "Sign in again". */
  variant?: "default" | "expired";
  lockedEmail?: string;
  defaultValues?: Partial<SignInValues>;
  banner?: React.ReactNode;
  pending?: boolean;
  /** Dev gallery only: show validation errors immediately. */
  validateOnMount?: boolean;
  onSubmit: (values: SignInValues) => void | Promise<void>;
  onUseDifferentAccount?: () => void;
}) {
  const expired = variant === "expired" && !!lockedEmail;
  const {
    register,
    handleSubmit,
    trigger,
    setFocus,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: expired ? lockedEmail : "",
      password: "",
      remember: true,
      ...defaultValues,
    },
  });

  React.useEffect(() => {
    if (validateOnMount) void trigger();
  }, [validateOnMount, trigger]);

  React.useEffect(() => {
    if (expired) setFocus("password");
  }, [expired, setFocus]);

  return (
    <AuthCard>
      {expired ? (
        <AuthHeader
          badge={<Clock />}
          title="You were signed out"
          subtitle="For your safety, we signed you out after a while away."
        />
      ) : (
        <AuthHeader title="Welcome back" subtitle="Sign in to your StayInn dashboard" />
      )}

      {banner ? <AuthBanner>{banner}</AuthBanner> : null}

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        aria-busy={pending}
        className="flex w-full flex-col gap-4"
      >
        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@email.com"
          icon={<Mail />}
          readOnly={expired || pending}
          dimmed={pending}
          error={errors.email?.message}
          trailing={
            expired ? <Lock aria-hidden className="size-4 shrink-0 text-ink-2" /> : undefined
          }
          {...register("email")}
        />
        <AuthPasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          icon={<Lock />}
          readOnly={pending}
          dimmed={pending}
          error={errors.password?.message}
          {...register("password")}
        />

        {!expired && !pending ? (
          <div className="flex w-full items-center justify-between gap-3">
            <AuthCheckbox label="Keep me signed in" {...register("remember")} />
            <Link to="/forgot-password" className={authLinkClass}>
              Forgot password?
            </Link>
          </div>
        ) : null}

        <AuthAction type="submit" disabled={pending} className="disabled:opacity-100">
          {pending ? (
            <>
              <RefreshCw className="animate-spin" /> Signing you in…
            </>
          ) : (
            <>
              <ChevronRight /> {expired ? "Sign in again" : "Sign in"}
            </>
          )}
        </AuthAction>

        {expired && !pending ? (
          <AuthAction variant="ghost" onClick={onUseDifferentAccount}>
            Use a different account
          </AuthAction>
        ) : null}
      </form>
    </AuthCard>
  );
}

/* ───────────────────────── 17.06 · Sign in · success ───────────────────────── */

export function SignInSuccessCard({
  name,
  durationMs = 1200,
}: {
  name: string;
  durationMs?: number;
}) {
  return (
    <AuthCard role="status">
      <AuthHeader
        badge={<Check />}
        badgeTone="success"
        title={name ? `Welcome back, ${name}` : "Welcome back"}
        subtitle="Taking you to your dashboard…"
      />
      <div className="h-1.5 w-full overflow-hidden rounded-[3px] bg-glass-inset">
        <div
          className="animate-gl-progress h-full rounded-[3px] bg-brand"
          style={{ "--gl-progress-ms": `${durationMs}ms` } as React.CSSProperties}
        />
      </div>
    </AuthCard>
  );
}

/* ───────────────────────── 17.07 · Too many attempts ───────────────────────── */

export function TooManyAttemptsCard({
  minutes,
  canRetry = false,
  onRetry,
}: {
  minutes: number;
  /** Becomes true once the lock window has passed. */
  canRetry?: boolean;
  onRetry?: () => void;
}) {
  return (
    <AuthCard>
      <Tag tone="warning" showDot>
        Too many attempts
      </Tag>
      <AuthHeader
        title={
          canRetry
            ? "You can try again"
            : `Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}`
        }
        subtitle="For your safety, we paused sign in on this account."
      />
      <AuthAction disabled={!canRetry} onClick={onRetry}>
        Sign in
      </AuthAction>
      <AuthAction variant="glass" asChild>
        <Link to="/forgot-password">
          <KeyRound /> Reset password
        </Link>
      </AuthAction>
    </AuthCard>
  );
}

/* ───────────────────────── 17.08 · Not a staff account ───────────────────────── */

export function NoDashboardAccessCard({ onBack }: { onBack?: () => void }) {
  return (
    <AuthCard>
      <AuthHeader
        badge={<ShieldCheck />}
        badgeTone="neutral"
        title="No dashboard access"
        subtitle="This account can't use the dashboard. Residents sign in on the StayInn app."
      />
      <AuthAction onClick={onBack}>
        <ChevronLeft /> Back to sign in
      </AuthAction>
    </AuthCard>
  );
}

/* ───────────────────────── 17.09 · Forgot password ───────────────────────── */

const emailOnlySchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(120),
});

export function ForgotPasswordCard({
  defaultEmail = "",
  banner,
  pending = false,
  onSubmit,
}: {
  defaultEmail?: string;
  banner?: React.ReactNode;
  pending?: boolean;
  onSubmit: (email: string) => void | Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof emailOnlySchema>>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: defaultEmail },
  });

  return (
    <AuthCard>
      <AuthHeader
        title="Forgot password?"
        subtitle="Enter your email and we'll send you a reset link."
      />
      {banner ? <AuthBanner>{banner}</AuthBanner> : null}
      <form
        noValidate
        onSubmit={handleSubmit((v) => onSubmit(v.email.trim().toLowerCase()))}
        aria-busy={pending}
        className="flex w-full flex-col gap-4"
      >
        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@email.com"
          icon={<Mail />}
          autoFocus
          readOnly={pending}
          dimmed={pending}
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthAction type="submit" disabled={pending} className="disabled:opacity-100">
          {pending ? (
            <>
              <RefreshCw className="animate-spin" /> Sending link…
            </>
          ) : (
            <>
              <Send /> Send reset link
            </>
          )}
        </AuthAction>
        <AuthAction variant="ghost" asChild>
          <Link to="/login">
            <ChevronLeft /> Back to sign in
          </Link>
        </AuthAction>
      </form>
    </AuthCard>
  );
}

/* ───────────────────────── 17.10 · Check your email ───────────────────────── */

export function CheckEmailCard({
  email,
  resendSeconds = 45,
  resending = false,
  onResend,
  onWrongEmail,
}: {
  email: string;
  resendSeconds?: number;
  resending?: boolean;
  onResend?: () => void | Promise<void>;
  onWrongEmail?: () => void;
}) {
  const { left, restart } = useCountdown(resendSeconds);
  return (
    <AuthCard>
      <AuthHeader
        badge={<Inbox />}
        title="Check your email"
        subtitle={`If ${email} has an account, we've sent a reset link.`}
      />
      <AuthAction asChild>
        <a href="mailto:">
          <Mail /> Open email app
        </a>
      </AuthAction>
      <div className="flex w-full items-center justify-between gap-3 whitespace-nowrap">
        {left > 0 || resending ? (
          <p className="text-body text-ink-3" aria-live="polite">
            {resending ? "Sending…" : `Resend link in ${formatClock(left)}`}
          </p>
        ) : (
          <button
            type="button"
            className={authLinkClass}
            onClick={async () => {
              await onResend?.();
              restart();
            }}
          >
            Resend link
          </button>
        )}
        <button type="button" className={authLinkClass} onClick={onWrongEmail}>
          Wrong email?
        </button>
      </div>
    </AuthCard>
  );
}

/* ─────────────── 17.11 · Reset password / 17.16 · Accept invite ─────────────── */

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One number", test: (v: string) => /\d/.test(v) },
  { label: "One letter", test: (v: string) => /[A-Za-z]/.test(v) },
] as const;

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .max(200)
      .refine(
        (v) => PASSWORD_RULES.every((r) => r.test(v)),
        "Use at least 8 characters with a number and a letter",
      ),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });

export function NewPasswordCard({
  variant = "reset",
  invite,
  defaultPassword = "",
  banner,
  pending = false,
  onSubmit,
}: {
  /** "invite" = Figma 17.16 (set your password after an invite). */
  variant?: "reset" | "invite";
  invite?: { name?: string; role?: string };
  /** Dev gallery only. */
  defaultPassword?: string;
  banner?: React.ReactNode;
  pending?: boolean;
  onSubmit: (password: string) => void | Promise<void>;
}) {
  const isInvite = variant === "invite";
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: defaultPassword, confirm: "" },
  });
  const password = watch("password") ?? "";
  const showRules = !isInvite || password.length > 0 || isSubmitted;

  return (
    <AuthCard>
      {isInvite ? (
        <AuthHeader
          title="Set your password"
          subtitle={`You've been invited to ${BRAND_LEGAL_NAME}.`}
        />
      ) : (
        <AuthHeader
          title="Set a new password"
          subtitle="Choose something you haven't used before."
        />
      )}

      {banner ? <AuthBanner>{banner}</AuthBanner> : null}

      {isInvite && (invite?.name || invite?.role) ? (
        <dl className="flex w-full flex-col rounded-[12px] bg-glass-inset px-3.5">
          {invite.name ? (
            <div className="flex h-11 items-center justify-between gap-3">
              <dt className="text-body text-ink-2">Name</dt>
              <dd>
                <Tag tone="neutral">{invite.name}</Tag>
              </dd>
            </div>
          ) : null}
          {invite.name && invite.role ? (
            <div aria-hidden className="h-px w-full bg-glass-divider" />
          ) : null}
          {invite.role ? (
            <div className="flex h-11 items-center justify-between gap-3">
              <dt className="text-body text-ink-2">Role</dt>
              <dd>
                <Tag tone="brand">{invite.role}</Tag>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <form
        noValidate
        onSubmit={handleSubmit((v) => onSubmit(v.password))}
        aria-busy={pending}
        className="flex w-full flex-col gap-4"
      >
        <AuthPasswordInput
          label="New password"
          autoComplete="new-password"
          placeholder={isInvite ? "Create a password" : "Enter a new password"}
          icon={<Lock />}
          autoFocus
          readOnly={pending}
          dimmed={pending}
          error={errors.password && !showRules ? errors.password.message : undefined}
          aria-invalid={errors.password ? true : undefined}
          {...register("password")}
        />
        <AuthPasswordInput
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          icon={<Lock />}
          readOnly={pending}
          dimmed={pending}
          error={errors.confirm?.message}
          {...register("confirm")}
        />

        {showRules ? (
          <ul className="flex w-full flex-col gap-2" aria-label="Password rules">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(password);
              const failed = !met && isSubmitted && !!errors.password;
              return (
                <li key={rule.label} className="flex items-center gap-2">
                  <Check
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0",
                      met ? "text-success" : failed ? "text-danger" : "text-ink-3",
                    )}
                  />
                  <span
                    className={cn(
                      "text-body",
                      met ? "text-ink-2" : failed ? "text-danger" : "text-ink-3",
                    )}
                  >
                    {rule.label}
                    <span className="sr-only">{met ? " — done" : " — not yet"}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}

        <AuthAction type="submit" disabled={pending} className="disabled:opacity-100">
          {pending ? (
            <>
              <RefreshCw className="animate-spin" />{" "}
              {isInvite ? "Creating account…" : "Updating password…"}
            </>
          ) : (
            <>
              <Check /> {isInvite ? "Create account" : "Update password"}
            </>
          )}
        </AuthAction>
      </form>
    </AuthCard>
  );
}

/* ───────────────────────── 17.12 · Link expired ───────────────────────── */

export function LinkExpiredCard() {
  return (
    <AuthCard>
      <AuthHeader
        badge={<Clock />}
        title="Link has expired"
        subtitle="For your safety, reset links only work for 30 minutes."
      />
      <AuthAction asChild>
        <Link to="/forgot-password">
          <Send /> Send a new link
        </Link>
      </AuthAction>
      <AuthAction variant="ghost" asChild>
        <Link to="/login">
          <ChevronLeft /> Back to sign in
        </Link>
      </AuthAction>
    </AuthCard>
  );
}

/* ───────────────────────── 17.13 · Password updated ───────────────────────── */

export function PasswordUpdatedCard() {
  return (
    <AuthCard role="status">
      <AuthHeader
        badge={<Check />}
        badgeTone="success"
        title="Password updated"
        subtitle="You can now sign in with your new password."
      />
      <AuthAction asChild>
        <Link to="/login">
          <ChevronRight /> Sign in
        </Link>
      </AuthAction>
    </AuthCard>
  );
}

/* ───────────────────────── 17.18 · Signed out ───────────────────────── */

export function SignedOutCard({ onSignInAgain }: { onSignInAgain?: () => void }) {
  return (
    <AuthCard role="status">
      <AuthHeader
        badge={<Check />}
        title="You've signed out"
        subtitle="See you soon. Your session ended safely."
      />
      <AuthAction onClick={onSignInAgain} autoFocus>
        <ChevronRight /> Sign in again
      </AuthAction>
    </AuthCard>
  );
}

/* ───────────────────────── 17.14–17.15 · Verify code ───────────────────────── */

const CODE_LENGTH = 6;

/**
 * Six-digit code entry. Presentational: the backend has no code endpoint yet,
 * so wire `onVerify` / `onResend` when one exists.
 */
export function VerifyCodeCard({
  email,
  defaultCode = "",
  error,
  pending = false,
  resendSeconds = 30,
  onVerify,
  onResend,
  onUseDifferentMethod,
}: {
  email: string;
  defaultCode?: string;
  error?: React.ReactNode;
  pending?: boolean;
  resendSeconds?: number;
  onVerify?: (code: string) => void | Promise<void>;
  onResend?: () => void | Promise<void>;
  onUseDifferentMethod?: () => void;
}) {
  const [digits, setDigits] = React.useState<string[]>(() =>
    Array.from({ length: CODE_LENGTH }, (_, i) => defaultCode[i] ?? ""),
  );
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const { left, restart } = useCountdown(resendSeconds);
  const code = digits.join("");
  const complete = code.length === CODE_LENGTH;
  const errorId = React.useId();

  const focus = (i: number) => refs.current[Math.max(0, Math.min(CODE_LENGTH - 1, i))]?.focus();

  const fill = (start: number, text: string) => {
    const clean = text.replace(/\D/g, "");
    if (!clean) return;
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < clean.length && start + i < CODE_LENGTH; i++) next[start + i] = clean[i];
      return next;
    });
    focus(start + clean.length);
  };

  return (
    <AuthCard>
      <AuthHeader
        badge={<ShieldCheck />}
        title="Enter your code"
        subtitle={`We sent a 6-digit code to ${maskEmail(email)}`}
      />
      <form
        noValidate
        className="flex w-full flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (complete && !pending) void onVerify?.(code);
        }}
      >
        <div
          role="group"
          aria-label="6-digit code"
          aria-describedby={error ? errorId : undefined}
          className="flex w-full items-center justify-between"
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={CODE_LENGTH}
              aria-label={`Digit ${i + 1}`}
              aria-invalid={error ? true : undefined}
              autoFocus={i === Math.min(defaultCode.length, CODE_LENGTH - 1)}
              readOnly={pending}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => fill(i, e.target.value)}
              onPaste={(e) => {
                e.preventDefault();
                fill(i, e.clipboardData.getData("text"));
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  e.preventDefault();
                  setDigits((prev) => {
                    const next = [...prev];
                    if (next[i]) next[i] = "";
                    else if (i > 0) next[i - 1] = "";
                    return next;
                  });
                  if (!digits[i]) focus(i - 1);
                } else if (e.key === "ArrowLeft") focus(i - 1);
                else if (e.key === "ArrowRight") focus(i + 1);
              }}
              className={cn(
                "h-14 w-10 rounded-[12px] border bg-glass-inset text-center text-hero sm:w-12 text-ink caret-brand outline-none transition-[border-color,box-shadow]",
                error
                  ? "border-danger"
                  : "border-glass-stroke focus:border-brand-border focus:shadow-[inset_0_0_0_1px_var(--gl-brand-primary-border)]",
              )}
            />
          ))}
        </div>
        {error ? <AuthFieldError id={errorId}>{error}</AuthFieldError> : null}
        <AuthAction
          type="submit"
          disabled={pending || !complete}
          className={cn(pending && "disabled:opacity-100")}
        >
          {pending ? (
            <>
              <RefreshCw className="animate-spin" /> Verifying…
            </>
          ) : (
            <>
              <Check /> Verify
            </>
          )}
        </AuthAction>
      </form>
      <div className="flex w-full items-center justify-between gap-3 whitespace-nowrap">
        {left > 0 ? (
          <p className="text-body text-ink-3" aria-live="polite">
            Resend code in {formatClock(left)}
          </p>
        ) : (
          <button
            type="button"
            className={authLinkClass}
            onClick={async () => {
              await onResend?.();
              restart();
            }}
          >
            Resend code
          </button>
        )}
        <button type="button" className={authLinkClass} onClick={onUseDifferentMethod}>
          Use a different method
        </button>
      </div>
    </AuthCard>
  );
}
