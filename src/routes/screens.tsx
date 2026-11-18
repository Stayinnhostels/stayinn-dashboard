import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/auth-ui";
import {
  CheckEmailCard,
  ForgotPasswordCard,
  LinkExpiredCard,
  NewPasswordCard,
  NoDashboardAccessCard,
  PasswordUpdatedCard,
  SignedOutCard,
  SignInCard,
  SignInSuccessCard,
  TooManyAttemptsCard,
  VerifyCodeCard,
} from "@/components/auth/auth-cards";
import {
  ErrorScreen,
  LoadingScreen,
  MaintenanceScreen,
  NoAccessScreen,
  NotFoundScreen,
  OfflineScreen,
} from "@/components/system/system-screens";
import { NotFoundView } from "@/components/not-found-view";
import { BookingsPreview, DashboardPreview, NotificationsPreview, RoomsPreview } from "@/components/dev/glass-page-previews";
import { cn } from "@/lib/utils";

/**
 * Development-only gallery of every state from Figma sections 17 (Auth) and 18 (System pages),
 * for checking them against the design. Not available in production builds.
 *   /screens                      → index
 *   /screens?s=17.04&theme=dark   → one state, full page
 */
type ScreenSearch = { s?: string; theme?: "dark" | "light" };

export const Route = createFileRoute("/screens")({
  validateSearch: (search: Record<string, unknown>): ScreenSearch => ({
    // A hand-typed `?s=17.10` arrives as the number 17.1, so put the two decimals back.
    s:
      typeof search.s === "number"
        ? search.s.toFixed(2)
        : typeof search.s === "string"
          ? search.s
          : undefined,
    theme: search.theme === "light" ? "light" : search.theme === "dark" ? "dark" : undefined,
  }),
  component: ScreensPage,
});

const noop = () => {};
const EMAIL = "lina@stayinn.pk";

const SCREENS: { id: string; name: string; render: (dark: boolean) => React.ReactNode }[] = [
  {
    id: "17.01",
    name: "Sign in · default",
    render: (d) => (
      <AuthShell dark={d}>
        <SignInCard onSubmit={noop} />
      </AuthShell>
    ),
  },
  {
    id: "17.02",
    name: "Sign in · typing",
    render: (d) => (
      <AuthShell dark={d}>
        <SignInCard defaultValues={{ email: EMAIL, password: "my-password-1" }} onSubmit={noop} />
      </AuthShell>
    ),
  },
  {
    id: "17.03",
    name: "Sign in · field errors",
    render: (d) => (
      <AuthShell dark={d}>
        <SignInCard defaultValues={{ email: "lina@stayinn" }} validateOnMount onSubmit={noop} />
      </AuthShell>
    ),
  },
  {
    id: "17.04",
    name: "Sign in · wrong password",
    render: (d) => (
      <AuthShell dark={d}>
        <SignInCard
          defaultValues={{ email: EMAIL, password: "0123456789" }}
          banner="That email or password is not right. Try again or reset your password."
          onSubmit={noop}
        />
      </AuthShell>
    ),
  },
  {
    id: "17.05",
    name: "Sign in · signing in",
    render: (d) => (
      <AuthShell dark={d}>
        <SignInCard
          defaultValues={{ email: EMAIL, password: "0123456789" }}
          pending
          onSubmit={noop}
        />
      </AuthShell>
    ),
  },
  {
    id: "17.06",
    name: "Sign in · success",
    render: (d) => (
      <AuthShell dark={d}>
        <SignInSuccessCard name="Lina" durationMs={4000} />
      </AuthShell>
    ),
  },
  {
    id: "17.07",
    name: "Sign in · too many attempts",
    render: (d) => (
      <AuthShell dark={d}>
        <TooManyAttemptsCard minutes={15} />
      </AuthShell>
    ),
  },
  {
    id: "17.08",
    name: "Sign in · not a staff account",
    render: (d) => (
      <AuthShell dark={d}>
        <NoDashboardAccessCard />
      </AuthShell>
    ),
  },
  {
    id: "17.09",
    name: "Forgot password · enter email",
    render: (d) => (
      <AuthShell dark={d}>
        <ForgotPasswordCard onSubmit={noop} />
      </AuthShell>
    ),
  },
  {
    id: "17.10",
    name: "Forgot password · check your email",
    render: (d) => (
      <AuthShell dark={d}>
        <CheckEmailCard email={EMAIL} />
      </AuthShell>
    ),
  },
  {
    id: "17.11",
    name: "Reset password · new password",
    render: (d) => (
      <AuthShell dark={d}>
        <NewPasswordCard defaultPassword="0123456789" onSubmit={noop} />
      </AuthShell>
    ),
  },
  {
    id: "17.12",
    name: "Reset password · link expired",
    render: (d) => (
      <AuthShell dark={d}>
        <LinkExpiredCard />
      </AuthShell>
    ),
  },
  {
    id: "17.13",
    name: "Reset password · done",
    render: (d) => (
      <AuthShell dark={d}>
        <PasswordUpdatedCard />
      </AuthShell>
    ),
  },
  {
    id: "17.14",
    name: "Verify code · enter 6 digits",
    render: (d) => (
      <AuthShell dark={d}>
        <VerifyCodeCard email={EMAIL} defaultCode="482" />
      </AuthShell>
    ),
  },
  {
    id: "17.15",
    name: "Verify code · wrong code",
    render: (d) => (
      <AuthShell dark={d}>
        <VerifyCodeCard
          email={EMAIL}
          defaultCode="482915"
          error="That code is not right. You have 2 tries left."
        />
      </AuthShell>
    ),
  },
  {
    id: "17.16",
    name: "Accept invite · set your password",
    render: (d) => (
      <AuthShell dark={d}>
        <NewPasswordCard
          variant="invite"
          invite={{ name: "Lina Costa", role: "Hostel manager" }}
          onSubmit={noop}
        />
      </AuthShell>
    ),
  },
  {
    id: "17.17",
    name: "Session expired",
    render: (d) => (
      <AuthShell dark={d}>
        <SignInCard variant="expired" lockedEmail={EMAIL} onSubmit={noop} />
      </AuthShell>
    ),
  },
  {
    id: "17.18",
    name: "Signed out",
    render: (d) => (
      <AuthShell dark={d}>
        <SignedOutCard />
      </AuthShell>
    ),
  },
  {
    id: "01.01",
    name: "Dashboard · charts with sample data",
    render: (d) => (
      <div className={cn("glass-root min-h-svh", d && "dark")}>
        <DashboardPreview />
      </div>
    ),
  },
  {
    id: "01.03",
    name: "Rooms · cards with sample data",
    render: (d) => (
      <div className={cn("glass-root min-h-svh", d && "dark")}>
        <RoomsPreview />
      </div>
    ),
  },
  {
    id: "01.04",
    name: "Rooms · Add room",
    render: (d) => (
      <div className={cn("glass-root min-h-svh", d && "dark")}>
        <RoomsPreview dialog="add" />
      </div>
    ),
  },
  {
    id: "01.05",
    name: "Rooms · Delete room",
    render: (d) => (
      <div className={cn("glass-root min-h-svh", d && "dark")}>
        <RoomsPreview dialog="delete" />
      </div>
    ),
  },
  {
    id: "06.02",
    name: "Bookings · table with sample data",
    render: (d) => (
      <div className={cn("glass-root min-h-svh", d && "dark")}>
        <BookingsPreview layout="table" />
      </div>
    ),
  },
  {
    id: "06.04",
    name: "Bookings · cards with sample data",
    render: (d) => (
      <div className={cn("glass-root min-h-svh", d && "dark")}>
        <BookingsPreview layout="cards" />
      </div>
    ),
  },
  {
    id: "16.01",
    name: "Notifications · sample data",
    render: (d) => (
      <div className={cn("glass-root min-h-svh", d && "dark")}>
        <NotificationsPreview />
      </div>
    ),
  },
  {
    id: "16.00",
    name: "Notifications panel (top bar)",
    render: (d) => (
      <div className={cn("glass-root min-h-svh", d && "dark")}>
        <NotificationsPreview panel />
      </div>
    ),
  },
  { id: "18.01", name: "Loading", render: (d) => <LoadingScreen dark={d} /> },
  { id: "18.02", name: "404 · Page not found", render: (d) => <NotFoundScreen dark={d} /> },
  { id: "18.03", name: "403 · No access", render: (d) => <NoAccessScreen dark={d} /> },
  {
    id: "18.04",
    name: "500 · Something went wrong",
    render: (d) => <ErrorScreen dark={d} onRetry={noop} />,
  },
  { id: "18.05", name: "Offline", render: (d) => <OfflineScreen dark={d} /> },
  {
    id: "18.06",
    name: "Maintenance",
    render: (d) => <MaintenanceScreen dark={d} onRetry={noop} />,
  },
];

function ScreensPage() {
  const { s, theme } = Route.useSearch();
  if (!import.meta.env.DEV) return <NotFoundView />;

  const screen = SCREENS.find((x) => x.id === s);
  if (screen) return <>{screen.render(theme === "dark")}</>;

  return (
    <div className="glass-root min-h-svh px-6 py-12">
      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        <div>
          <h1 className="text-page-title">Screens · Auth &amp; system pages</h1>
          <p className="mt-1 text-body text-ink-2">
            Development preview of Figma sections 17 and 18. Open a state in either theme.
          </p>
        </div>
        <ul className="glass-2 divide-y divide-glass-divider rounded-[20px] px-5">
          {SCREENS.map((x) => (
            <li key={x.id} className="flex items-center justify-between gap-4 py-3">
              <span className="min-w-0 truncate text-body font-medium">
                <span className="mr-2 text-ink-3">{x.id}</span>
                {x.name}
              </span>
              <span className="flex shrink-0 gap-4 text-body font-medium text-brand-text">
                <Link to="/screens" search={{ s: x.id, theme: "dark" }} className="hover:underline">
                  Dark
                </Link>
                <Link
                  to="/screens"
                  search={{ s: x.id, theme: "light" }}
                  className="hover:underline"
                >
                  Light
                </Link>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
