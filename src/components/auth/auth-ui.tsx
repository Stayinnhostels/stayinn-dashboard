import * as React from "react";
import { Eye, EyeOff, House, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_LEGAL_NAME, SUPPORT_EMAIL } from "@/lib/brand-assets";
import { useGlassDark } from "@/lib/glass-theme";
import { GlassButton, type GlassButtonProps } from "@/components/glass";

/**
 * Building blocks for Figma "17 · Auth (sign in, recovery, security)".
 * Desktop frame 1440×900: brand (48) + 28 gap + 440 card, centred; footer 44px from the bottom.
 * Mobile frame 390×844: brand top-left (56 top / 24 sides), full-width card, footer 24px from the bottom.
 */

export function AuthShell({
  children,
  dark,
}: {
  children: React.ReactNode;
  /** Force a theme (used by the dev screen gallery). Defaults to the user's theme. */
  dark?: boolean;
}) {
  const systemDark = useGlassDark();
  const isDark = dark ?? systemDark;
  return (
    <div className={cn("glass-root relative flex min-h-svh flex-col", isDark && "dark")}>
      <main className="flex flex-1 flex-col items-start gap-6 px-6 pt-14 pb-16 sm:items-center sm:justify-center sm:gap-7 sm:py-[76px]">
        <AuthBrand />
        {children}
      </main>
      <footer className="pointer-events-none absolute inset-x-0 bottom-6 px-6 text-center sm:bottom-11">
        <p className="pointer-events-auto text-label text-ink-3">
          © {new Date().getFullYear()} {BRAND_LEGAL_NAME} · Need help?{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="rounded-sm outline-none hover:text-ink-2 focus-visible:ring-2 focus-visible:ring-brand-border"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
      </footer>
    </div>
  );
}

export function AuthBrand() {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-brand text-on-brand sm:size-12 sm:rounded-[14px]">
        <House aria-hidden className="size-5 sm:size-6" />
      </span>
      <span className="text-card-title text-ink sm:text-hero">stayinn</span>
    </div>
  );
}

/** Glass/2 card — 440 wide, 32 padding, 28 radius (mobile: full width, 24 padding, 24 radius). */
export const AuthCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "glass-2 flex w-full flex-col items-start gap-4 rounded-[24px] p-6 sm:w-[440px] sm:rounded-[28px] sm:p-8",
        className,
      )}
      {...props}
    />
  ),
);
AuthCard.displayName = "AuthCard";

type BadgeTone = "brand" | "success" | "neutral";

const BADGE_TONE: Record<BadgeTone, string> = {
  brand: "bg-brand-tint text-brand-text",
  success: "bg-success-tint text-success",
  neutral: "bg-glass-inset text-ink-2",
};

/** Card header: optional 56px round badge, 28/34 title, 14/20 subtitle. */
export function AuthHeader({
  title,
  subtitle,
  badge,
  badgeTone = "brand",
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  badgeTone?: BadgeTone;
}) {
  return (
    <div className="flex w-full flex-col items-start gap-1.5">
      {badge ? (
        <span
          aria-hidden
          className={cn(
            "mb-3.5 flex size-14 shrink-0 items-center justify-center rounded-full [&_svg]:size-[26px]",
            BADGE_TONE[badgeTone],
          )}
        >
          {badge}
        </span>
      ) : null}
      <h1 className="w-full text-page-title text-ink">{title}</h1>
      {subtitle ? <p className="w-full text-body text-ink-2">{subtitle}</p> : null}
    </div>
  );
}

/** Inline error under a field / code input (14px alert icon + 12/16 text). */
export function AuthFieldError({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="flex items-center gap-1.5 text-label text-danger">
      <TriangleAlert aria-hidden className="size-3.5 shrink-0" />
      {children}
    </p>
  );
}

/** Error banner at the top of a card (wrong password, server errors). */
export function AuthBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex w-full items-start gap-2.5 rounded-[12px] bg-danger-tint px-3.5 py-3"
    >
      <TriangleAlert aria-hidden className="mt-px size-[18px] shrink-0 text-danger" />
      <p className="min-w-0 flex-1 text-body font-medium text-ink">{children}</p>
    </div>
  );
}

export interface AuthInputProps extends React.ComponentProps<"input"> {
  label: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  error?: string;
  /** Dimmed while a request is in flight (Figma "signing in"). */
  dimmed?: boolean;
}

/** Field: 12/16 label, 40px input (44px on mobile), 10 radius, glass-inset fill. */
export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon, trailing, error, dimmed, className, id: idProp, readOnly, ...props }, ref) => {
    const autoId = React.useId();
    const id = idProp ?? autoId;
    const errorId = `${id}-error`;
    return (
      <div className="flex w-full flex-col items-start gap-1.5">
        <label htmlFor={id} className="text-label font-medium text-ink-2">
          {label}
        </label>
        <div
          className={cn(
            "flex h-11 w-full items-center gap-2 rounded-[10px] border bg-glass-inset px-3 transition-[border-color,box-shadow,opacity] sm:h-10",
            error
              ? "border-danger"
              : "border-glass-stroke focus-within:border-brand-border focus-within:shadow-[inset_0_0_0_1px_var(--gl-brand-primary-border)]",
            dimmed && "opacity-60",
          )}
        >
          {icon ? (
            <span aria-hidden className="shrink-0 text-ink-2 [&_svg]:size-4">
              {icon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={id}
            readOnly={readOnly}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "h-full min-w-0 flex-1 bg-transparent text-body font-medium outline-none placeholder:text-ink-3",
              readOnly ? "text-ink-2" : "text-ink",
              className,
            )}
            {...props}
          />
          {trailing}
        </div>
        {error ? <AuthFieldError id={errorId}>{error}</AuthFieldError> : null}
      </div>
    );
  },
);
AuthInput.displayName = "AuthInput";

/** Password field with show / hide toggle (eye-off while hidden, eye while visible). */
export const AuthPasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<AuthInputProps, "type" | "trailing">
>(({ disabled, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);
  return (
    <AuthInput
      ref={ref}
      type={visible ? "text" : "password"}
      disabled={disabled}
      trailing={
        <button
          type="button"
          disabled={disabled}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="-mr-1 shrink-0 rounded-md p-1 text-ink-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-4"
        >
          {visible ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
        </button>
      }
      {...props}
    />
  );
});
AuthPasswordInput.displayName = "AuthPasswordInput";

/** 20px checkbox (6 radius, brand fill + 13px check) with its label. */
export const AuthCheckbox = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type"> & { label: React.ReactNode }
>(({ label, className, ...props }, ref) => (
  <label className={cn("flex cursor-pointer items-center gap-2 select-none", className)}>
    <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
    <span
      aria-hidden
      className="flex size-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-ink-3 text-transparent transition-colors peer-checked:border-brand peer-checked:bg-brand peer-checked:text-on-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand-border"
    >
      <svg viewBox="0 0 13 13" className="size-[13px]" fill="none">
        <path
          d="M2.7 6.8 5.2 9.3l5.1-5.4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
    <span className="text-body text-ink-2">{label}</span>
  </label>
));
AuthCheckbox.displayName = "AuthCheckbox";

/** Full-width card action: 40px (44px on mobile). Wraps the Glass button. */
export const AuthAction = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, ...props }, ref) => (
    <GlassButton
      ref={ref}
      className={cn("h-11 w-full disabled:opacity-45 sm:h-10", className)}
      {...props}
    />
  ),
);
AuthAction.displayName = "AuthAction";

/** Brand-coloured text link / button used in card footers ("Forgot password?", "Wrong email?"). */
export const authLinkClass =
  "rounded-sm text-body font-medium whitespace-nowrap text-brand-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-border";

/** Counts down from `seconds` to 0; `restart()` starts over. */
export function useCountdown(seconds: number) {
  const [left, setLeft] = React.useState(seconds);
  React.useEffect(() => {
    if (left <= 0) return;
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);
  const restart = React.useCallback(() => setLeft(seconds), [seconds]);
  return { left, restart };
}

export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** lina@stayinn.pk → l***@stayinn.pk */
export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name[0]}***@${domain}`;
}
