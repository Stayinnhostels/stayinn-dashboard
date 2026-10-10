import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Calendar, CreditCard, LogOut, MapPin, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";

const frontendBase = (import.meta.env.VITE_PUBLIC_FRONTEND_URL as string | undefined)?.replace(/\/$/, "") ?? "";

function marketingHref(path: string) {
  if (!frontendBase) return "#";
  return `${frontendBase}${path.startsWith("/") ? path : `/${path}`}`;
}

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — Stay Inn Hostels" },
      { name: "description", content: "Manage your bookings and account at Stay Inn." },
    ],
  }),
});
function DashboardPage() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-extrabold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground text-sm font-black">
              S
            </div>
            Stay Inn<span className="text-primary">.</span>
            <span className="text-muted-foreground font-medium text-sm ml-2 hidden sm:inline">Account</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button asChild size="sm" variant="outline" className="rounded-full font-semibold">
                <Link to="/admin">
                  <LayoutDashboard className="h-4 w-4" /> Admin
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full font-bold">
              <LogOut className="h-4 w-4" /> Log out
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 pt-12 pb-6">
        <Badge variant="outline" className="rounded-full border-primary/30 text-primary font-bold mb-3">
          DASHBOARD
        </Badge>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Hi, {user?.fullName?.split(" ")[0]} 👋
            </h1>
            <p className="mt-2 text-muted-foreground">Here&apos;s a quick look at your account.</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24 grid gap-6 md:grid-cols-3">
        <Card className="rounded-3xl border-2 p-6">
          <CardContent className="p-0 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-lg">Profile</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>{user?.fullName}</div>
              <div>{user?.email}</div>
              <div className="capitalize">
                Role: <span className="font-semibold text-foreground">{user?.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-2 p-6">
          <CardContent className="p-0 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/30 text-foreground">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-lg">Active bookings</h3>
            <p className="text-3xl font-extrabold">0</p>
            <Button asChild size="sm" variant="outline" className="rounded-full font-bold">
              <a href={marketingHref("/rooms")} rel="noopener noreferrer">
                Browse rooms
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-2 p-6">
          <CardContent className="p-0 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-lg">Payments</h3>
            <p className="text-sm text-muted-foreground">No payments yet. Book your first seat on the main site.</p>
            <Button asChild size="sm" className="rounded-full font-bold shadow-[var(--shadow-soft)]">
              <a href={marketingHref("/booking")} rel="noopener noreferrer">
                Book a seat
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-2 p-6 md:col-span-3 bg-[image:var(--gradient-hero)] text-primary-foreground">
          <CardContent className="p-0 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6" />
              <div>
                <div className="font-extrabold text-lg">Find your next stay</div>
                <div className="text-sm opacity-90">Browse rooms and book on the public Stay Inn site.</div>
              </div>
            </div>
            <Button asChild variant="secondary" className="rounded-full font-bold">
              <a href={marketingHref("/rooms")} rel="noopener noreferrer">
                Explore
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {!frontendBase && (
        <p className="container mx-auto px-4 pb-8 text-center text-xs text-muted-foreground">
          Set <code className="rounded bg-muted px-1">VITE_PUBLIC_FRONTEND_URL</code> so &quot;Browse rooms&quot; links open your Next.js marketing app.
        </p>
      )}
    </div>
  );
}

