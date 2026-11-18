import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { LoadingScreen } from "@/components/system/system-screens";
import { useAuth } from "@/lib/auth-context";

/**
 * Pathless layout for `/dashboard`. Requires a signed-in user (see `auth-context`).
 */
export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!user) {
      navigate({ to: "/login", replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return <LoadingScreen />;
  }

  return <Outlet />;
}
