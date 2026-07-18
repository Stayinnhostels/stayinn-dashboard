import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Compass, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TAB_LOGO_SRC } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

type NotFoundViewProps = {
  /** When true, fills the admin main panel instead of the full viewport. */
  embedded?: boolean;
  dashboardTo?: string;
  secondaryTo?: string;
  secondaryLabel?: string;
};

export function NotFoundView({
  embedded = false,
  dashboardTo = "/admin",
  secondaryTo = "/login",
  secondaryLabel = "Sign in",
}: NotFoundViewProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden px-4",
        embedded ? "min-h-[min(70vh,640px)] py-8" : "min-h-screen bg-muted/30",
      )}
    >
      {!embedded ? (
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,oklch(0.85_0.18_90/0.35),transparent_55%)]" />
      ) : null}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative w-full max-w-lg">
        {!embedded ? (
          <div className="mb-8 flex justify-center">
            <img src={TAB_LOGO_SRC} alt="Stay Inn" className="h-12 w-12 object-contain" />
          </div>
        ) : null}

        <div className="rounded-[2rem] border-2 border-border/60 bg-card p-8 text-center shadow-[var(--shadow-card)] md:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            This page doesn&apos;t exist
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            There is no such page in Stay Inn. The link may be wrong, outdated, or the page may have
            been moved.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="rounded-full font-bold px-7">
              <Link to={dashboardTo}>
                <LayoutDashboard className="h-4 w-4" />
                Go to dashboard
              </Link>
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="rounded-full font-bold px-7 border-2"
              onClick={() => router.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Button>
          </div>

          {!embedded ? (
            <p className="mt-6 text-xs text-muted-foreground">
              Or{" "}
              <Link to={secondaryTo} className="font-semibold text-primary hover:underline">
                {secondaryLabel}
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
