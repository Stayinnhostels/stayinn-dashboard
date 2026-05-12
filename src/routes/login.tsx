import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLayoutEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Stay Inn Admin" },
      { name: "description", content: "Sign in to the Stay Inn admin and operations console." },
    ],
  }),
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(120),
  password: z.string().min(6, "At least 6 characters").max(72),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

function postLoginPath(role: string) {
  return role === "admin" || role === "super_admin" ? "/admin" : "/dashboard";
}

function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [showPw, setShowPw] = useState(false);

  useLayoutEffect(() => {
    if (user) {
      navigate({ to: postLoginPath(user.role), replace: true });
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const next = await login(values.email, values.password, values.remember);
      toast.success("Welcome back!");
      navigate({ to: postLoginPath(next.role) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign in failed");
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-primary-foreground bg-[image:var(--gradient-hero)]">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -left-32 h-96 w-96 rounded-full bg-[var(--accent)]/30 blur-3xl" />
        <Link to="/login" className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur font-black">S</div>
          <span className="text-xl font-extrabold tracking-tight">
            Stay Inn<span className="opacity-80">.</span>
          </span>
        </Link>
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">Admin &amp; operations console</h2>
          <p className="text-base text-primary-foreground/90 max-w-md">
            Sign in to manage rooms, bookings, payments, and property settings.
          </p>
        </div>
        <p className="relative z-10 text-xs text-primary-foreground/70">© {new Date().getFullYear()} Stay Inn Hostels</p>
      </aside>

      <main className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
        <div className="lg:hidden mb-8">
          <Link to="/login" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground font-black">
              S
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Stay Inn<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to open the dashboard.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  className="pl-10 h-11 rounded-full"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 rounded-full"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <Checkbox {...register("remember")} defaultChecked />
              <span className="text-muted-foreground">Remember me for 30 days</span>
            </label>

            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full rounded-full font-bold shadow-[var(--shadow-soft)]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
