import * as React from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { House, Lock, Search, TriangleAlert, Wifi, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORT_EMAIL } from "@/lib/brand-assets";
import { useGlassDark } from "@/lib/glass-theme";
import { GlassButton, type GlassButtonProps } from "@/components/glass";

/**
 * Figma "18 · Loader & system pages (loading, 404, errors)".
 * Desktop: 520-wide centred column, 14 gap, 28/34 title, 420 message, 180×40 actions in a row.
 * Mobile: 342 column, 12 gap, 15/20 title, 310 message, full-width 44 actions stacked.
 */

/* ───────────────────────── Loader ───────────────────────── */

/** 96px ring loader (86.4px on mobile): 6px track, 270° brand arc turning, 40px logo mark. */
export function Loader({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("relative size-[86.4px] shrink-0 sm:size-24", className)}
    >
      <div className="absolute top-0 left-0 size-24 origin-top-left scale-90 sm:scale-100">
        <svg viewBox="0 0 96 96" fill="none" className="absolute inset-0 size-full" aria-hidden>
          <circle cx="48" cy="48" r="45" strokeWidth="6" className="stroke-glass-stroke" />
          <circle
            cx="48"
            cy="48"
            r="45"
            strokeWidth="6"
            strokeDasharray="212.06 282.74"
            className="animate-gl-loader stroke-brand"
          />
        </svg>
        <span className="absolute top-7 left-7 flex size-10 items-center justify-center rounded-[11.667px] bg-brand text-on-brand">
          <House aria-hidden className="size-5" />
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────── Float badge ───────────────────────── */

/** Two rings, a 96px brand-tint badge that floats 22px, and a breathing ground shadow. */
export function FloatBadge({ icon, className }: { icon: React.ReactNode; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative h-[187px] w-[170px] shrink-0 sm:h-[220px] sm:w-[200px]", className)}
    >
      <div className="absolute top-0 left-0 h-[220px] w-[200px] origin-top-left scale-[0.85] sm:scale-100">
        <span className="absolute top-0 left-0 size-[200px] rounded-full border-[1.5px] border-glass-stroke" />
        <span className="absolute top-[30px] left-[30px] size-[140px] rounded-full border-[1.5px] border-glass-stroke" />
        <span className="absolute top-[184px] left-0 flex h-2 w-full justify-center">
          <span className="animate-gl-float-shadow h-2 w-11 rounded-[100%] bg-ink opacity-[0.07]" />
        </span>
        <span className="animate-gl-float absolute top-[34px] left-[52px] flex size-24 items-center justify-center rounded-[28px] border border-brand-border bg-brand-tint text-brand-text [&_svg]:size-11">
          {icon}
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────── Layout ───────────────────────── */

function ScreenRoot({
  children,
  dark,
  embedded,
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  /** Fill the parent panel (inside the admin shell) instead of the viewport. */
  embedded?: boolean;
  className?: string;
}) {
  const systemDark = useGlassDark();
  // Embedded screens sit inside the not-yet-migrated (light) admin shell.
  const isDark = embedded ? false : (dark ?? systemDark);
  return (
    <div
      className={cn(
        "flex items-center justify-center px-6 font-geist text-ink",
        embedded ? "min-h-[min(70vh,640px)] py-8" : "glass-root min-h-svh py-10",
        isDark && "dark",
        className,
      )}
    >
      <div className="flex w-full max-w-[342px] flex-col items-center justify-center gap-3 sm:max-w-[520px] sm:gap-3.5">
        {children}
      </div>
    </div>
  );
}

function ScreenTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="w-full text-center text-card-title text-ink sm:text-page-title">{children}</h1>
  );
}

function ScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="w-full max-w-[310px] text-center text-body text-ink-2 sm:max-w-[420px]">
      {children}
    </p>
  );
}

/** Action row. Children are <SystemAction>s. */
function ScreenActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2.5 flex w-full max-w-[310px] flex-col items-stretch gap-3 pt-3 sm:mt-0 sm:w-auto sm:max-w-none sm:flex-row sm:items-start sm:pt-6">
      {children}
    </div>
  );
}

export const SystemAction = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, ...props }, ref) => (
    <GlassButton
      ref={ref}
      className={cn("h-11 w-full sm:h-10 sm:w-[180px]", className)}
      {...props}
    />
  ),
);
SystemAction.displayName = "SystemAction";

export interface SystemScreenProps {
  icon: React.ReactNode;
  code?: string;
  title: React.ReactNode;
  message: React.ReactNode;
  actions?: React.ReactNode;
  dark?: boolean;
  embedded?: boolean;
}

export function SystemScreen({
  icon,
  code,
  title,
  message,
  actions,
  dark,
  embedded,
}: SystemScreenProps) {
  return (
    <ScreenRoot dark={dark} embedded={embedded}>
      <FloatBadge icon={icon} />
      {code ? <p className="w-full text-center text-hero text-brand-text">{code}</p> : null}
      <ScreenTitle>{title}</ScreenTitle>
      <ScreenMessage>{message}</ScreenMessage>
      {actions ? <ScreenActions>{actions}</ScreenActions> : null}
    </ScreenRoot>
  );
}

/* ───────────────────────── 18.01 · Loading ───────────────────────── */

export function LoadingScreen({
  title = "Loading your dashboard",
  message = "Getting your rooms, residents and rent ready. This only takes a moment.",
  dark,
}: {
  title?: React.ReactNode;
  message?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <ScreenRoot dark={dark}>
      <Loader />
      <div aria-hidden className="h-5" />
      <ScreenTitle>{title}</ScreenTitle>
      <ScreenMessage>{message}</ScreenMessage>
    </ScreenRoot>
  );
}

/* ───────────────────────── 18.02 · 404 ───────────────────────── */

export function NotFoundScreen({
  dashboardTo = "/admin",
  dark,
  embedded,
}: {
  dashboardTo?: string;
  dark?: boolean;
  embedded?: boolean;
}) {
  const router = useRouter();
  return (
    <SystemScreen
      dark={dark}
      embedded={embedded}
      icon={<Search />}
      code="404"
      title="We can’t find this page"
      message="The link may be old or typed wrong. Go back to your dashboard to keep working."
      actions={
        <>
          <SystemAction asChild>
            <Link to={dashboardTo}>Go to dashboard</Link>
          </SystemAction>
          <SystemAction variant="glass" onClick={() => router.history.back()}>
            Go back
          </SystemAction>
        </>
      }
    />
  );
}

/* ───────────────────────── 18.03 · 403 ───────────────────────── */

export function NoAccessScreen({
  primary,
  dark,
  embedded,
}: {
  /** Replaces "Go to dashboard" (e.g. when the whole dashboard is off-limits). */
  primary?: React.ReactNode;
  dark?: boolean;
  embedded?: boolean;
}) {
  return (
    <SystemScreen
      dark={dark}
      embedded={embedded}
      icon={<Lock />}
      code="403"
      title="You don’t have access"
      message="Your account can’t open this page. Ask the owner to give you access."
      actions={
        <>
          {primary ?? (
            <SystemAction asChild>
              <Link to="/admin">Go to dashboard</Link>
            </SystemAction>
          )}
          <SystemAction variant="glass" asChild>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("StayInn dashboard access")}`}
            >
              Ask for access
            </a>
          </SystemAction>
        </>
      }
    />
  );
}

/* ───────────────────────── 18.04 · 500 ───────────────────────── */

export function ErrorScreen({
  onRetry,
  dark,
  embedded,
}: {
  onRetry?: () => void;
  dark?: boolean;
  embedded?: boolean;
}) {
  return (
    <SystemScreen
      dark={dark}
      embedded={embedded}
      icon={<TriangleAlert />}
      code="500"
      title="Something went wrong"
      message="It’s on our side, not yours. Please try again in a moment."
      actions={
        <>
          <SystemAction onClick={onRetry ?? (() => window.location.reload())}>
            Try again
          </SystemAction>
          <SystemAction variant="glass" asChild>
            {/* Plain link on purpose: a full reload recovers from a broken app state. */}
            <a href="/admin">Go to dashboard</a>
          </SystemAction>
        </>
      }
    />
  );
}

/* ───────────────────────── 18.05 · Offline ───────────────────────── */

export function OfflineScreen({ onRetry, dark }: { onRetry?: () => void; dark?: boolean }) {
  return (
    <SystemScreen
      dark={dark}
      icon={<Wifi />}
      title="You’re offline"
      message="Check your internet connection. We’ll reconnect by ourselves when it’s back."
      actions={<SystemAction onClick={onRetry}>Try again</SystemAction>}
    />
  );
}

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/**
 * Covers the app with the Offline screen while the browser reports no connection,
 * and removes it by itself when the connection returns. The app stays mounted
 * underneath, so nothing the user was doing is lost.
 */
export function OfflineGate() {
  const online = React.useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
  // "Try again" lets the user dismiss a stale offline signal; any new event resets it.
  const [dismissed, setDismissed] = React.useState(false);
  React.useEffect(() => {
    setDismissed(false);
  }, [online]);

  if (online || dismissed) return null;
  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto"
      role="alertdialog"
      aria-label="You’re offline"
    >
      <OfflineScreen
        onRetry={async () => {
          if (navigator.onLine) return setDismissed(true);
          try {
            // The browser can be wrong about being offline; a real request settles it.
            await fetch(`${window.location.origin}/?ping=${Date.now()}`, {
              method: "HEAD",
              cache: "no-store",
            });
            setDismissed(true);
          } catch {
            /* still offline — keep the screen */
          }
        }}
      />
    </div>
  );
}

/* ───────────────────────── 18.06 · Maintenance ───────────────────────── */

export function MaintenanceScreen({ onRetry, dark }: { onRetry?: () => void; dark?: boolean }) {
  return (
    <SystemScreen
      dark={dark}
      icon={<Wrench />}
      title="We’ll be back soon"
      message="StayInn is getting a quick update. Your data is safe. Please check again in a few minutes."
      actions={
        <SystemAction onClick={onRetry ?? (() => window.location.reload())}>
          Check again
        </SystemAction>
      }
    />
  );
}
