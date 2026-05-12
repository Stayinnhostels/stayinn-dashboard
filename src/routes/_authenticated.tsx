import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { Loader2 } from "lucide-react";
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
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <Outlet />;
}
