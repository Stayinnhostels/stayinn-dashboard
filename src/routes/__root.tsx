import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter, HeadContent } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { NotFoundView } from "@/components/not-found-view";
import { ErrorScreen, MaintenanceScreen, OfflineGate } from "@/components/system/system-screens";
import { appEnv } from "@/config/env";
import { AuthProvider } from "@/lib/auth-context";
import { TAB_LOGO_SRC } from "@/lib/brand-assets";
import { hydrateDashboardThemeFromStorage } from "@/lib/dashboard-theme-storage";

if (typeof window !== "undefined") {
  hydrateDashboardThemeFromStorage();
}

function NotFoundComponent() {
  return <NotFoundView />;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <ErrorScreen
      onRetry={() => {
        router.invalidate();
        reset();
      }}
    />
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { title: "Stay Inn — Admin" },
      { name: "description", content: "Stay Inn property admin and operations dashboard." },
      { name: "author", content: "Stay Inn" },
      { property: "og:title", content: "Stay Inn — Admin" },
      { property: "og:description", content: "Property admin and operations dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@StayInnHostels" },
    ],
    links: [
      {
        rel: "icon",
        href: TAB_LOGO_SRC,
        type: "image/png",
      },
      {
        rel: "apple-touch-icon",
        href: TAB_LOGO_SRC,
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  if (appEnv.maintenanceMode) {
    return (
      <>
        <HeadContent />
        <MaintenanceScreen />
      </>
    );
  }

  return (
    <>
      <HeadContent />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Outlet />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
      <OfflineGate />
    </>
  );
}
